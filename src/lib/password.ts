// Single source of truth for password rules on the frontend.
// The hard requirement here MUST mirror the backend Zod schema in
// zero-ai/src/modules/auth/schemas.ts so users never pass client-side
// validation only to be rejected by the server (or vice versa).

export interface PasswordCheck {
  ok: boolean;
  message?: string;
}

// Hard gate applied to account creation and password resets:
// at least 8 characters, at least one letter, at least one number.
export function validatePassword(pw: string): PasswordCheck {
  if (pw.length < 8) return { ok: false, message: 'Password must be at least 8 characters.' };
  if (!/[a-zA-Z]/.test(pw)) return { ok: false, message: 'Password must contain at least one letter.' };
  if (!/[0-9]/.test(pw)) return { ok: false, message: 'Password must contain at least one number.' };
  return { ok: true };
}

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

// Softer, encouraging meter shown while typing. Independent of the hard
// gate above — a password can meet the requirement (Good) but the meter
// still nudges toward Strong by rewarding length + symbols.
export function passwordStrength(pw: string): StrengthResult {
  if (!pw) return { score: 0, label: 'Too short' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12 && score === 4) score = 4;

  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const labels: StrengthResult['label'][] = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score: clamped, label: labels[clamped] };
}
