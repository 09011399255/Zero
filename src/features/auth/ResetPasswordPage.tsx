import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../api';
import logoBlue from '../../assets/logo-blue.svg';

type ResetPasswordState = 'form' | 'submitting' | 'success' | 'invalid' | 'expired' | 'missing';

interface ResetPasswordPageProps {
  resetPasswordState: ResetPasswordState;
  setResetPasswordState: (state: ResetPasswordState) => void;
  resetPasswordToken: string | null;
  resetPasswordValue: string;
  setResetPasswordValue: (v: string) => void;
  resetPasswordConfirm: string;
  setResetPasswordConfirm: (v: string) => void;
  resetPasswordError: string | null;
  setResetPasswordError: (v: string | null) => void;
  onBackToLogin: () => void;
}

export function ResetPasswordPage({
  resetPasswordState,
  setResetPasswordState,
  resetPasswordToken,
  resetPasswordValue,
  setResetPasswordValue,
  resetPasswordConfirm,
  setResetPasswordConfirm,
  resetPasswordError,
  setResetPasswordError,
  onBackToLogin,
}: ResetPasswordPageProps) {
  return (
    <div className="w-full max-w-md bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
          <div className="h-4 w-px bg-brand-200"></div>
          <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
            Clinic OS
          </span>
        </div>
      </div>

      {resetPasswordState === 'missing' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Missing Reset Token</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No reset token was provided in the link. Please check your email again or request a new one.
            </p>
          </div>
          <button type="button" onClick={onBackToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
            Back to Login
          </button>
        </div>
      )}

      {resetPasswordState === 'invalid' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">This reset link isn't valid.</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              It may be broken or already used. Please request a fresh password reset link.
            </p>
          </div>
          <button type="button" onClick={onBackToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
            Back to Login
          </button>
        </div>
      )}

      {resetPasswordState === 'expired' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">This link has expired.</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Password reset links expire after 1 hour. Please request a new one from the login screen.
            </p>
          </div>
          <button type="button" onClick={onBackToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
            Back to Login
          </button>
        </div>
      )}

      {resetPasswordState === 'success' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-successBg text-status-success rounded-full flex items-center justify-center mx-auto border border-status-success/20 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Password updated</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your password has been reset successfully. Log in with your new password.
            </p>
          </div>
          <button type="button" onClick={onBackToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
            Back to Login
          </button>
        </div>
      )}

      {(resetPasswordState === 'form' || resetPasswordState === 'submitting') && (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setResetPasswordError(null);

            if (resetPasswordValue.length < 8) {
              setResetPasswordError('Password must be at least 8 characters.');
              return;
            }
            if (resetPasswordValue !== resetPasswordConfirm) {
              setResetPasswordError('Passwords do not match.');
              return;
            }
            if (!resetPasswordToken) {
              setResetPasswordState('missing');
              return;
            }

            try {
              setResetPasswordState('submitting');
              await api.auth.resetPassword({ token: resetPasswordToken, password: resetPasswordValue });
              setResetPasswordState('success');
            } catch (err: any) {
              if (err.code === 'TOKEN_EXPIRED') {
                setResetPasswordState('expired');
              } else if (err.code === 'INVALID_TOKEN') {
                setResetPasswordState('invalid');
              } else {
                setResetPasswordState('form');
                setResetPasswordError(err.message || 'Could not reset password. Please try again.');
              }
            }
          }}
        >
          <div className="text-center space-y-2 pb-2">
            <h3 className="text-base font-bold text-text-primary">Set a new password</h3>
            <p className="text-xs text-text-secondary">Choose a new password for your account.</p>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={resetPasswordValue}
              onChange={(e) => setResetPasswordValue(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              value={resetPasswordConfirm}
              onChange={(e) => setResetPasswordConfirm(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {resetPasswordError && (
            <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span>{resetPasswordError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={resetPasswordState === 'submitting'}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
          >
            {resetPasswordState === 'submitting' ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
