import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import logoBlue from '../../assets/logo-blue.svg';

interface VerifyEmailPageProps {
  verificationState: 'loading' | 'success' | 'expired' | 'invalid' | 'missing';
  onboardingEmail: string;
  setOnboardingEmail: (v: string) => void;
  resendCooldown: number;
  onResendVerification: (email: string) => void;
  onContinueAfterSuccess: () => void;
  onBackToLogin: () => void;
}

export function VerifyEmailPage({
  verificationState,
  onboardingEmail,
  setOnboardingEmail,
  resendCooldown,
  onResendVerification,
  onContinueAfterSuccess,
  onBackToLogin,
}: VerifyEmailPageProps) {
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

      {verificationState === 'loading' && (
        <div className="text-center py-6 space-y-4">
          <RefreshCw className="animate-spin text-brand-500 mx-auto" size={32} />
          <p className="text-sm font-medium text-text-secondary">Verifying your email... Please wait.</p>
        </div>
      )}

      {verificationState === 'success' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-successBg text-status-success rounded-full flex items-center justify-center mx-auto border border-status-success/20 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Email Verified!</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Email verified! You can now continue setting up your clinic.
            </p>
          </div>
          <button
            type="button"
            onClick={onContinueAfterSuccess}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
          >
            Continue to Setup
          </button>
        </div>
      )}

      {verificationState === 'expired' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">This link has expired.</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              The email verification link has expired. You can request a new verification email below.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5 flex flex-col text-left">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={onboardingEmail}
                onChange={(e) => setOnboardingEmail(e.target.value)}
                placeholder="name@clinic.com"
                className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
              />
            </div>
            <button
              type="button"
              disabled={resendCooldown > 0 || !onboardingEmail.trim()}
              onClick={() => onResendVerification(onboardingEmail)}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
            >
              {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend email"}
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      {verificationState === 'invalid' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">This verification link isn't valid.</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This verification link isn't valid. It may be broken or tampered with. Please log in and request a fresh verification link from your settings.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
          >
            Back to Login
          </button>
        </div>
      )}

      {verificationState === 'missing' && (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Missing Verification Token</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No verification token was provided in the link. Please check your email again or return to sign up.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}
