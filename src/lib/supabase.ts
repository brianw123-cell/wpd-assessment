import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.local.example.'
  );
}

// This app has its own dedicated Supabase project (wpd-assessment).
// The `assessments` table lives in the public schema.
// RLS rules:
// - anon can INSERT (start a new assessment)
// - anon can UPDATE any row (they need the row's UUID, which is only issued
//   to the browser that created it — practically unguessable)
// - anon CANNOT SELECT (protects captured lead data)
// - authenticated users (Brian, via /admin) CAN SELECT
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Per-attempt session id, stored in sessionStorage so a page reload can
// resume the same partial submission.
export function getOrCreateSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  const KEY = 'wpd_assessment_session_id';
  try {
    let existing = window.sessionStorage.getItem(KEY);
    if (!existing) {
      existing = crypto.randomUUID();
      window.sessionStorage.setItem(KEY, existing);
    }
    return existing;
  } catch {
    return null;
  }
}

// Also track the row id (not just the session id) so we know which DB row
// to update as the user progresses. Separate from session_id because sessionStorage
// lookups on hot paths deserve to be cheap.
export function getRowId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem('wpd_assessment_row_id');
  } catch {
    return null;
  }
}

export function setRowId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem('wpd_assessment_row_id', id);
  } catch {
    /* ignore */
  }
}

export function clearAssessmentSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem('wpd_assessment_session_id');
    window.sessionStorage.removeItem('wpd_assessment_row_id');
  } catch {
    /* ignore */
  }
}
