/**
 * Product save queue — Step 2.4.3.
 *
 * Pure, framework-agnostic single-flight save scheduler.
 * At most one mutation is active at a time. Edits during an active save
 * are queued and flushed after the current request completes.
 *
 * No React, no browser, no Prisma dependency.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; type: 'validation' | 'error' | 'conflict' | 'duplicate' | 'forbidden' };

export type MutationFn<T> = (snapshot: T, token: string) => Promise<SaveResult>;

export type QueueState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';

export interface SaveQueueController<T> {
  /** Current queue state */
  getState(): QueueState;
  /** Schedule a save for the given snapshot. Debounced by the configured delay. */
  schedule(snapshot: T): void;
  /** Flush immediately (manual save). Uses latest snapshot. */
  flush(): void;
  /** Report that current form equals baseline (not dirty). */
  markClean(): void;
  /** Reset after conflict resolution (e.g., page reload). */
  reset(newToken: string): void;
  /** Destroy timers. */
  dispose(): void;
}

export interface SaveQueueOptions<T> {
  /** Initial concurrency token (updatedAt). */
  initialToken: string;
  /** Debounce delay in ms. */
  debounceMs: number;
  /** Called to perform the actual mutation. */
  mutate: MutationFn<T>;
  /** Called when queue state changes. */
  onStateChange: (state: QueueState) => void;
  /** Called with the new token after a successful save. */
  onTokenUpdate: (token: string) => void;
  /** Called when an error result is received. */
  onError?: (result: SaveResult & { ok: false }) => void;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createSaveQueue<T>(opts: SaveQueueOptions<T>): SaveQueueController<T> {
  let state: QueueState = 'idle';
  let token = opts.initialToken;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inflight = false;
  let pendingSnapshot: T | null = null;
  let latestSnapshot: T | null = null;
  let disposed = false;

  function setState(next: QueueState) {
    if (state !== next) {
      state = next;
      opts.onStateChange(next);
    }
  }

  async function executeSave() {
    if (inflight || disposed) {
      // Already in flight — mark pending
      if (latestSnapshot !== null) pendingSnapshot = latestSnapshot;
      return;
    }
    const snapshot = latestSnapshot;
    if (snapshot === null) return;

    inflight = true;
    pendingSnapshot = null;
    setState('saving');

    const result = await opts.mutate(snapshot, token);

    inflight = false;

    if (disposed) return;

    if (result.ok) {
      token = result.updatedAt;
      opts.onTokenUpdate(token);
      latestSnapshot = null;
      setState('saved');
    } else if (result.type === 'conflict') {
      setState('conflict');
      opts.onError?.(result);
      return; // Do NOT auto-retry on conflict
    } else {
      setState('error');
      opts.onError?.(result);
      return; // Do NOT auto-retry on validation/error
    }

    // If pending edits arrived during save, flush them
    if (pendingSnapshot !== null) {
      latestSnapshot = pendingSnapshot;
      pendingSnapshot = null;
      setState('dirty');
      executeSave();
    }
  }

  return {
    getState() {
      return state;
    },

    schedule(snapshot: T) {
      latestSnapshot = snapshot;
      if (inflight) {
        pendingSnapshot = snapshot;
        return;
      }
      setState('dirty');
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        executeSave();
      }, opts.debounceMs);
    },

    flush() {
      if (latestSnapshot === null && pendingSnapshot === null) return;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (pendingSnapshot !== null) latestSnapshot = pendingSnapshot;
      executeSave();
    },

    markClean() {
      latestSnapshot = null;
      pendingSnapshot = null;
      if (state === 'dirty') setState('idle');
    },

    reset(newToken: string) {
      token = newToken;
      latestSnapshot = null;
      pendingSnapshot = null;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      setState('idle');
    },

    dispose() {
      disposed = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
