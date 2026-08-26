'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

/**
 * Admin sign-out — Step 2.3.1.
 *
 * Server action invoked from the profile menu in `AdminShell`. Invalidates the
 * Better Auth session server-side, then returns the operator to the sign-in
 * screen. No client token handling, no secrets in the bundle.
 */
export async function adminSignOut(): Promise<void> {
  const requestHeaders = await headers();
  await auth.api.signOut({ headers: requestHeaders });
  redirect('/sign-in');
}
