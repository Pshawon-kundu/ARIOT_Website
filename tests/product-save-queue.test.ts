/**
 * tests/product-save-queue.test.ts — Step 2.4.3 save-queue verification.
 *
 * Tests the pure single-flight save scheduler without React or browser.
 * Uses controlled promises to prove request ordering.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-save-queue.test.ts
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  createSaveQueue,
  type SaveResult,
  type MutationFn,
} from '../lib/admin/product-save-queue.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

type Snapshot = { value: string };

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function createTestMutation() {
  const calls: Array<{
    snapshot: Snapshot;
    token: string;
    deferred: ReturnType<typeof deferred<SaveResult>>;
  }> = [];
  const mutate: MutationFn<Snapshot> = (snapshot, token) => {
    const d = deferred<SaveResult>();
    calls.push({ snapshot, token, deferred: d });
    return d.promise;
  };
  return { mutate, calls };
}

// Fake timers
let timers: Array<{ fn: () => void; delay: number; id: number }> = [];
let timerCounter = 0;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;

function useFakeTimers() {
  timers = [];
  timerCounter = 0;
  (globalThis as unknown as Record<string, unknown>).setTimeout = (
    fn: () => void,
    delay: number,
  ) => {
    const id = ++timerCounter;
    timers.push({ fn, delay, id });
    return id;
  };
  (globalThis as unknown as Record<string, unknown>).clearTimeout = (id: number) => {
    timers = timers.filter((t) => t.id !== id);
  };
}

function advanceTimers() {
  const pending = [...timers];
  timers = [];
  for (const t of pending) t.fn();
}

function restoreTimers() {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SaveQueue', () => {
  beforeEach(() => {
    useFakeTimers();
  });
  afterEach(() => {
    restoreTimers();
  });

  it('one edit produces one debounced save', () => {
    const { mutate, calls } = createTestMutation();
    const states: string[] = [];
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: (s) => states.push(s),
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    assert.strictEqual(calls.length, 0);
    advanceTimers();
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].snapshot.value, 'A');
    q.dispose();
  });

  it('rapid edits before debounce produce one save with latest snapshot', () => {
    const { mutate, calls } = createTestMutation();
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    q.schedule({ value: 'B' });
    q.schedule({ value: 'C' });
    advanceTimers();
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].snapshot.value, 'C');
    q.dispose();
  });

  it('edit during in-flight queues a second save after first completes', async () => {
    const { mutate, calls } = createTestMutation();
    const tokens: string[] = [];
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: (t) => tokens.push(t),
    });
    q.schedule({ value: 'A' });
    advanceTimers(); // Fires first save
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].token, 'T0');

    // Edit during in-flight
    q.schedule({ value: 'B' });
    assert.strictEqual(calls.length, 1); // Still one request

    // Resolve first
    calls[0].deferred.resolve({ ok: true, updatedAt: 'T1' });
    await Promise.resolve(); // Let microtask flush
    await Promise.resolve();

    assert.strictEqual(calls.length, 2);
    assert.strictEqual(calls[1].snapshot.value, 'B');
    assert.strictEqual(calls[1].token, 'T1'); // Uses new token!
    q.dispose();
  });

  it('second request uses updatedAt from first success', async () => {
    const { mutate, calls } = createTestMutation();
    const tokens: string[] = [];
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: (t) => tokens.push(t),
    });
    q.schedule({ value: 'X' });
    advanceTimers();
    q.schedule({ value: 'Y' });
    calls[0].deferred.resolve({ ok: true, updatedAt: 'T1' });
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(calls[1].token, 'T1');
    calls[1].deferred.resolve({ ok: true, updatedAt: 'T2' });
    await Promise.resolve();
    assert.deepStrictEqual(tokens, ['T1', 'T2']);
    q.dispose();
  });

  it('multiple edits during in-flight collapse to latest', async () => {
    const { mutate, calls } = createTestMutation();
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    advanceTimers();
    q.schedule({ value: 'B' });
    q.schedule({ value: 'C' });
    q.schedule({ value: 'D' });
    calls[0].deferred.resolve({ ok: true, updatedAt: 'T1' });
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(calls.length, 2);
    assert.strictEqual(calls[1].snapshot.value, 'D'); // Latest wins
    q.dispose();
  });

  it('manual Save does not create a parallel request during in-flight', async () => {
    const { mutate, calls } = createTestMutation();
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    advanceTimers(); // First fires
    q.schedule({ value: 'B' });
    q.flush(); // Manual save during in-flight
    assert.strictEqual(calls.length, 1); // Still only one request
    calls[0].deferred.resolve({ ok: true, updatedAt: 'T1' });
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(calls.length, 2); // Pending flushed after first completes
    q.dispose();
  });

  it('conflict stops automatic retry', async () => {
    const { mutate, calls } = createTestMutation();
    const states: string[] = [];
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: (s) => states.push(s),
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    advanceTimers();
    q.schedule({ value: 'B' }); // queued during in-flight
    calls[0].deferred.resolve({ ok: false, type: 'conflict' });
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(calls.length, 1); // No second request
    assert.ok(states.includes('conflict'));
    q.dispose();
  });

  it('validation failure does not auto-retry', async () => {
    const { mutate, calls } = createTestMutation();
    const states: string[] = [];
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: (s) => states.push(s),
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    advanceTimers();
    calls[0].deferred.resolve({ ok: false, type: 'validation' });
    await Promise.resolve();
    assert.strictEqual(calls.length, 1);
    assert.ok(states.includes('error'));
    q.dispose();
  });

  it('markClean prevents save when form returns to baseline', () => {
    const { mutate, calls } = createTestMutation();
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    q.markClean(); // Form reverted to baseline
    advanceTimers();
    assert.strictEqual(calls.length, 0);
    q.dispose();
  });

  it('successful save transitions to saved state', async () => {
    const { mutate, calls } = createTestMutation();
    const states: string[] = [];
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: (s) => states.push(s),
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    advanceTimers();
    calls[0].deferred.resolve({ ok: true, updatedAt: 'T1' });
    await Promise.resolve();
    assert.ok(states.includes('saved'));
    q.dispose();
  });

  it('dispose cancels pending timer', () => {
    const { mutate, calls } = createTestMutation();
    const q = createSaveQueue<Snapshot>({
      initialToken: 'T0',
      debounceMs: 1000,
      mutate,
      onStateChange: () => {},
      onTokenUpdate: () => {},
    });
    q.schedule({ value: 'A' });
    q.dispose();
    advanceTimers();
    assert.strictEqual(calls.length, 0);
  });
});
