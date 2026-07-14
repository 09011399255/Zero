// Shared formatter for auth-flow errors (login, signup, forgot/reset password,
// resend verification). The backend applies one rate limiter to every auth
// route (10 requests / 15 min) and replies 429 with code 'RATE_LIMITED' plus a
// Retry-After header, captured as err.retryAfter (seconds) by api.ts request().

interface AuthErrorLike {
  code?: string;
  message?: string;
  retryAfter?: number;
}

export function formatAuthError(err: AuthErrorLike, fallback: string): string {
  if (err?.code === 'RATE_LIMITED') {
    const secs = err.retryAfter;
    if (secs && secs > 0) {
      const mins = Math.ceil(secs / 60);
      return mins > 1
        ? `Too many attempts. Please try again in about ${mins} minutes.`
        : `Too many attempts. Please try again in about a minute.`;
    }
    return err.message || 'Too many attempts. Please wait a few minutes and try again.';
  }
  return err?.message || fallback;
}
