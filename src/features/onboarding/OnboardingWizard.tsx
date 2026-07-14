import { AlertTriangle, CheckCircle2, ChevronLeft, Clock, Mail, RefreshCw, X } from 'lucide-react';
import { api } from '../../api';
import logoBlue from '../../assets/logo-blue.svg';
import { PasswordInput } from '../../components/shared/PasswordInput';
import { validatePassword } from '../../lib/password';

const PRESET_SERVICES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Physiotherapy',
  'Dental',
  'Mental Health/Psychiatry',
  'Nutrition',
  'General Practice',
  'Gynecology',
  'Orthopedics',
  'ENT',
  'Ophthalmology',
  'Urology',
  'Oncology'
];

const PRESET_ROLES = [
  'Lead Physician',
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Physiotherapist',
  'Dentist',
  'Psychiatrist',
  'Gynecologist',
  'Orthopedic Surgeon',
  'Ophthalmologist'
];

interface PreviewMessage {
  sender: 'ai' | 'patient';
  text: string;
  time: string;
}

interface OnboardingWizardProps {
  isTransitioningStep: boolean;
  transitionStatusIndex: number;
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  isVerificationPending: boolean;
  setIsVerificationPending: (v: boolean) => void;
  onboardingEmail: string;
  setOnboardingEmail: (v: string) => void;
  resendCooldown: number;
  onResendVerification: (email: string) => void;
  onboardingAuthMode: 'signup' | 'login' | 'forgot';
  setOnboardingAuthMode: (mode: 'signup' | 'login' | 'forgot') => void;
  onboardingAdminName: string;
  setOnboardingAdminName: (v: string) => void;
  onboardingPassword: string;
  setOnboardingPassword: (v: string) => void;
  forgotPasswordEmail: string;
  setForgotPasswordEmail: (v: string) => void;
  forgotPasswordSent: boolean;
  setForgotPasswordSent: (v: boolean) => void;
  forgotPasswordError: string | null;
  setForgotPasswordError: (v: string | null) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  signUpError: string | null;
  setSignUpError: (v: string | null) => void;
  setClinicId: (id: string) => void;
  loginError: string | null;
  setLoginError: (v: string | null) => void;
  onCheckSession: () => Promise<void>;
  setIsOnboarded: (v: boolean) => void;
  onboardingClinicName: string;
  setOnboardingClinicName: (v: string) => void;
  selectedServices: string[];
  setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
  serviceSearch: string;
  setServiceSearch: (v: string) => void;
  isServiceDropdownOpen: boolean;
  setIsServiceDropdownOpen: (v: boolean) => void;
  onboardingAddress: string;
  setOnboardingAddress: (v: string) => void;
  selectedDays: string[];
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
  openTime: string;
  setOpenTime: (v: string) => void;
  closeTime: string;
  setCloseTime: (v: string) => void;
  onboardingDoctorName: string;
  setOnboardingDoctorName: (v: string) => void;
  selectedDoctorRoles: string[];
  setSelectedDoctorRoles: React.Dispatch<React.SetStateAction<string[]>>;
  doctorRoleSearch: string;
  setDoctorRoleSearch: (v: string) => void;
  isDoctorRoleDropdownOpen: boolean;
  setIsDoctorRoleDropdownOpen: (v: boolean) => void;
  onboardingDoctorEmail: string;
  setOnboardingDoctorEmail: (v: string) => void;
  onStartTransitionToStep5: () => void;
  previewMessages: PreviewMessage[];
  previewTyping: boolean;
  setCurrentRoute: (route: string) => void;
}

export function OnboardingWizard({
  isTransitioningStep,
  transitionStatusIndex,
  onboardingStep,
  setOnboardingStep,
  isVerificationPending,
  setIsVerificationPending,
  onboardingEmail,
  setOnboardingEmail,
  resendCooldown,
  onResendVerification,
  onboardingAuthMode,
  setOnboardingAuthMode,
  onboardingAdminName,
  setOnboardingAdminName,
  onboardingPassword,
  setOnboardingPassword,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  forgotPasswordSent,
  setForgotPasswordSent,
  forgotPasswordError,
  setForgotPasswordError,
  isLoading,
  setIsLoading,
  signUpError,
  setSignUpError,
  setClinicId,
  loginError,
  setLoginError,
  onCheckSession,
  setIsOnboarded,
  onboardingClinicName,
  setOnboardingClinicName,
  selectedServices,
  setSelectedServices,
  serviceSearch,
  setServiceSearch,
  isServiceDropdownOpen,
  setIsServiceDropdownOpen,
  onboardingAddress,
  setOnboardingAddress,
  selectedDays,
  setSelectedDays,
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime,
  onboardingDoctorName,
  setOnboardingDoctorName,
  selectedDoctorRoles,
  setSelectedDoctorRoles,
  doctorRoleSearch,
  setDoctorRoleSearch,
  isDoctorRoleDropdownOpen,
  setIsDoctorRoleDropdownOpen,
  onboardingDoctorEmail,
  setOnboardingDoctorEmail,
  onStartTransitionToStep5,
  previewMessages,
  previewTyping,
  setCurrentRoute,
}: OnboardingWizardProps) {
  if (isTransitioningStep) {
    const statusTexts = [
      "Reading your clinic's services...",
      `Preparing Zero for ${onboardingClinicName || 'your clinic'}...`,
      "Almost ready..."
    ];
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-[460px] bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 w-full animate-fade-in space-y-8">
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Layered Pulsing Glow Rings */}
          <span className="animate-ring-1 absolute inline-flex h-full w-full rounded-full bg-ai-500/10"></span>
          <span className="animate-ring-2 absolute inline-flex h-full w-full rounded-full bg-ai-500/10" style={{ animationDelay: '1.1s' }}></span>
          <span className="animate-ring-3 absolute inline-flex h-full w-full rounded-full bg-ai-500/10" style={{ animationDelay: '2.2s' }}></span>

          {/* Pulsing Orb Center */}
          <div className="animate-orb-glow relative inline-flex rounded-full h-20 w-20 bg-gradient-to-tr from-ai-500 to-ai-600 shadow-xl items-center justify-center text-white text-lg font-bold select-none z-10">
            Zero
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">Configuring Clinic Assistant</h3>
          <p className="text-xs text-text-muted animate-pulse font-medium">{statusTexts[transitionStatusIndex]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[460px] w-full mx-auto pb-16 pt-8 animate-fade-in font-sans text-xs relative">
      {/* Back Button (except Step 1 and 5) */}
      {onboardingStep > 1 && onboardingStep < 5 && (
        <button
          onClick={() => setOnboardingStep(prev => prev - 1)}
          className="absolute -top-4 left-0 flex items-center gap-1 text-text-secondary hover:text-text-primary text-[11px] font-bold transition duration-150"
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}

      {/* Step Indicator dots */}
      {!isVerificationPending && (
        <div className="flex justify-center items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                stepNum === onboardingStep
                  ? 'w-8 bg-brand-500'
                  : stepNum < onboardingStep
                  ? 'w-2 bg-brand-200'
                  : 'w-2 bg-surface-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* STEP 1: ACCOUNT SETUP */}
      {onboardingStep === 1 && (
        <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
          {isVerificationPending ? (
            <div className="space-y-6 text-center py-4 animate-fade-in">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
                <div className="h-4 w-px bg-brand-200"></div>
                <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
                  Clinic OS
                </span>
              </div>
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto border border-brand-100 shadow-sm animate-pulse">
                <Mail size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-text-primary">Check your email</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  We sent a verification link to <span className="font-semibold text-text-primary">{onboardingEmail}</span>. Please click the link in that email to verify your account.
                </p>
              </div>
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={() => onResendVerification(onboardingEmail)}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
                >
                  {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend email"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsVerificationPending(false)}
                  className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
                >
                  Back to Sign Up
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
                  <div className="h-4 w-px bg-brand-200"></div>
                  <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
                    Clinic OS
                  </span>
                </div>
                <h2 className="text-lg font-bold text-text-primary">Welcome to Zero Clinic OS</h2>
                <p className="text-text-secondary">Let's set up your clinic's AI patient operator in minutes.</p>
              </div>

              {/* Sign Up / Log In Toggle */}
              {onboardingAuthMode !== 'forgot' && (
              <div className="flex bg-surface-subtle p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setOnboardingAuthMode('signup');
                setOnboardingAdminName('');
                setOnboardingEmail('');
                setOnboardingPassword('');
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition duration-150 ${
                onboardingAuthMode === 'signup'
                  ? 'bg-surface-base text-brand-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setOnboardingAuthMode('login');
                setOnboardingAdminName('');
                setOnboardingEmail('');
                setOnboardingPassword('');
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition duration-150 ${
                onboardingAuthMode === 'login'
                  ? 'bg-surface-base text-brand-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Log In
            </button>
          </div>
          )}

          {onboardingAuthMode === 'forgot' ? (
            <form
              key="forgot-password-form"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setIsLoading(true);
                  setForgotPasswordError(null);
                  await api.auth.forgotPassword({ email: forgotPasswordEmail });
                  setForgotPasswordSent(true);
                } catch (err: any) {
                  setForgotPasswordError(err.message || "Could not send reset email. Please try again.");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 pb-1">
                <h3 className="text-sm font-bold text-text-primary">Reset your password</h3>
                <p className="text-[11px] text-text-secondary">
                  {forgotPasswordSent
                    ? "If an account exists for that email, we've sent a reset link."
                    : "Enter your work email and we'll send you a reset link."}
                </p>
              </div>

              {!forgotPasswordSent && (
                <>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Work Email</label>
                    <input
                      key="forgot-email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      placeholder="e.g. admin@yourclinic.com"
                      className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {forgotPasswordError && (
                    <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      <span>{forgotPasswordError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setOnboardingAuthMode('login');
                  setForgotPasswordEmail('');
                  setForgotPasswordSent(false);
                  setForgotPasswordError(null);
                }}
                className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
              >
                Back to Login
              </button>
            </form>
          ) : onboardingAuthMode === 'signup' ? (
            <form
              key="signup-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const pwCheck = validatePassword(onboardingPassword);
                if (!pwCheck.ok) {
                  setSignUpError(pwCheck.message || "Please choose a stronger password.");
                  return;
                }
                try {
                  setIsLoading(true);
                  setSignUpError(null);
                  const res = await api.auth.register({
                    fullName: onboardingAdminName,
                    email: onboardingEmail,
                    password: onboardingPassword,
                    clinicName: onboardingClinicName.trim() || "New Clinic",
                  });
                  localStorage.setItem("zero_token", res.token);
                  const cId = res.clinic?.id || res.staff?.clinicId;
                  if (cId) {
                    localStorage.setItem("zero_clinic_id", cId);
                    setClinicId(cId);
                  }
                  setIsVerificationPending(true);
                } catch (err: any) {
                  setSignUpError(err.message || "Registration failed. Please try again.");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Admin Full Name <span className="text-status-danger">*</span></label>
                <input
                  key="signup-name"
                  type="text"
                  value={onboardingAdminName}
                  onChange={(e) => setOnboardingAdminName(e.target.value)}
                  required
                  placeholder="e.g. Sarah Sedai"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Work Email <span className="text-status-danger">*</span></label>
                <input
                  key="signup-email"
                  type="email"
                  value={onboardingEmail}
                  onChange={(e) => setOnboardingEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@yourclinic.com"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password <span className="text-status-danger">*</span></label>
                <PasswordInput
                  value={onboardingPassword}
                  onChange={setOnboardingPassword}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  showStrength
                />
                <p className="text-[10px] text-text-muted">At least 8 characters, including a letter and a number.</p>
              </div>

              {signUpError && (
                <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          ) : (
            <form
              key="login-form"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setIsLoading(true);
                  setLoginError(null);
                  const res = await api.auth.login({
                    email: onboardingEmail,
                    password: onboardingPassword,
                  });
                  localStorage.setItem("zero_token", res.token);
                  await onCheckSession();
                } catch (err: any) {
                  setLoginError(err.message || "Invalid email or password.");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email <span className="text-status-danger">*</span></label>
                <input
                  key="login-email"
                  type="email"
                  value={onboardingEmail}
                  onChange={(e) => setOnboardingEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@yourclinic.com"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password <span className="text-status-danger">*</span></label>
                <PasswordInput
                  value={onboardingPassword}
                  onChange={setOnboardingPassword}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingAuthMode('forgot');
                    setForgotPasswordEmail(onboardingEmail);
                    setForgotPasswordSent(false);
                    setForgotPasswordError(null);
                    setLoginError(null);
                  }}
                  className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition duration-150"
                >
                  Forgot password?
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Logging In...</span>
                  </>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </form>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-surface-border/40"></div>
            <span className="flex-shrink mx-4 text-text-muted text-[10px] font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-surface-border/40"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onboardingAuthMode === 'login') {
                if (!onboardingAdminName.trim()) {
                  setOnboardingAdminName('Apex Clinic Admin');
                }
                setIsOnboarded(true);
              } else {
                setOnboardingStep(2);
              }
            }}
            className="w-full py-3 bg-surface-base hover:bg-surface-subtle border border-surface-border rounded-xl font-bold text-text-primary transition duration-150 text-xs flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.77 15.485 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.743-.08-1.302-.178-1.782h-10.615z" />
            </svg>
            Continue with Google
          </button>
        </>
      )}
    </div>
  )}

      {/* STEP 2: CLINIC INFO */}
      {onboardingStep === 2 && (
        <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-text-primary">Clinic Details</h2>
            <p className="text-text-secondary">Provide details to train your AI operator on your services and hours.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOnboardingStep(3);
            }}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Name</label>
                <input
                  type="text"
                  value={onboardingClinicName}
                  onChange={(e) => setOnboardingClinicName(e.target.value)}
                  required
                  placeholder="e.g. Apex Family Clinic"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                />
              </div>

              {/* Services Offered Searchable Tag Selector */}
              <div className="space-y-1.5 flex flex-col relative">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Services Offered</label>

                {/* Selected Tags Display */}
                {selectedServices.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {selectedServices.map(service => (
                      <span
                        key={service}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => setSelectedServices(prev => prev.filter(s => s !== service))}
                          className="text-brand-500 hover:text-brand-700 focus:outline-none"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input Field */}
                <div className="relative">
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setIsServiceDropdownOpen(true);
                    }}
                    onFocus={() => setIsServiceDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsServiceDropdownOpen(false), 200)}
                    placeholder={selectedServices.length === 0 ? "Search or type services..." : "Add another service..."}
                    className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />

                  {/* Dropdown Menu */}
                  {isServiceDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1.5 bg-surface-base border border-surface-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {(() => {
                        const filtered = PRESET_SERVICES.filter(
                          s => s.toLowerCase().includes(serviceSearch.toLowerCase()) && !selectedServices.includes(s)
                        );

                        return (
                          <div className="py-1">
                            {filtered.map(service => (
                              <button
                                key={service}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedServices(prev => [...prev, service]);
                                  setServiceSearch('');
                                  setIsServiceDropdownOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-subtle font-medium transition duration-150"
                              >
                                {service}
                              </button>
                            ))}

                            {/* Custom option */}
                            {serviceSearch.trim() && !PRESET_SERVICES.some(s => s.toLowerCase() === serviceSearch.trim().toLowerCase()) && !selectedServices.some(s => s.toLowerCase() === serviceSearch.trim().toLowerCase()) && (
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedServices(prev => [...prev, serviceSearch.trim()]);
                                  setServiceSearch('');
                                  setIsServiceDropdownOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-brand-600 hover:bg-brand-50/50 font-semibold border-t border-surface-border/40 transition duration-150"
                              >
                                Add "{serviceSearch.trim()}" as a custom service
                              </button>
                            )}

                            {filtered.length === 0 && !serviceSearch.trim() && (
                              <div className="px-3.5 py-2 text-xs text-text-muted text-center font-medium">
                                All preset services selected
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Address</label>
                <input
                  type="text"
                  value={onboardingAddress}
                  onChange={(e) => setOnboardingAddress(e.target.value)}
                  required
                  placeholder="e.g. 123 Eldene Way, Suite 400, Apex City"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                />
              </div>

              {/* Structured Operating Hours Picker */}
              <div className="space-y-2 flex flex-col border border-surface-border/30 bg-surface-subtle/50 p-4 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-brand-500" />
                  <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Operating Hours</span>
                </div>

                {/* Day range chips */}
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDays(prev => prev.filter(d => d !== day));
                          } else {
                            setSelectedDays(prev => [...prev, day]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition duration-150 ${
                          isSelected
                            ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                            : 'bg-surface-base border-surface-border text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Time range selectors */}
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Opens At</span>
                    <select
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="p-2.5 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Closes At</span>
                    <select
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="p-2.5 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {['3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
            >
              Continue
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: CONNECT WHATSAPP */}
      {onboardingStep === 3 && (
        <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-text-primary">Connect WhatsApp Business API</h2>
            <p className="text-text-secondary">Deploy Zero directly onto your official business number.</p>
          </div>

          {/* Honest Status Pattern */}
          <div className="p-4 bg-status-warningBg border border-status-warning/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-status-warning flex items-center gap-1.5">
                <Clock size={14} /> Verification Pending
              </span>
              <span className="text-[10px] font-bold text-text-muted bg-surface-base px-2 py-0.5 rounded-md border border-surface-border/30">Meta API Review</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Once verified, your patients will be able to book, get reminders, and reach your clinic 24/7 — right from WhatsApp, with no app to download.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Meta Integration Steps</h4>
            <div className="space-y-2 bg-surface-subtle p-4 rounded-xl">
              <div className="flex items-center gap-2.5 text-text-secondary">
                <CheckCircle2 size={14} className="text-status-success" />
                <span className="line-through font-medium text-text-muted">Create Meta Developer Account</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <CheckCircle2 size={14} className="text-status-success" />
                <span className="line-through font-medium text-text-muted">Link Business Manager Portfolio</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Clock size={14} className="text-status-warning animate-pulse" />
                <span className="font-bold text-text-primary">Meta Business Verification (In Review)</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-muted">
                <div className="w-3.5 h-3.5 rounded-full border border-surface-border flex items-center justify-center text-[8px] font-bold">4</div>
                <span>Phone Number Registration</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-50/50 border border-brand-100 p-4 rounded-xl flex gap-3">
            <span className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[10px] text-brand-600 font-bold flex-shrink-0">i</span>
            <p className="text-[11px] text-brand-700 leading-relaxed">
              <strong>Sandbox active:</strong> While Meta verifies your business details, we have pre-configured a Sandbox environment so you can experience Zero's patient interaction immediately.
            </p>
          </div>

          <button
            onClick={() => setOnboardingStep(4)}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
          >
            Continue to Staff Setup
          </button>
        </div>
      )}

      {/* STEP 4: ADD STAFF / DOCTORS */}
      {onboardingStep === 4 && (
        <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-text-primary">Practitioner Profiles</h2>
            <p className="text-text-secondary">Add at least one doctor to help Zero schedule appointments correctly.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onStartTransitionToStep5();
            }}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor Name</label>
                <input
                  type="text"
                  value={onboardingDoctorName}
                  onChange={(e) => setOnboardingDoctorName(e.target.value)}
                  required
                  placeholder="e.g. Dr. Lan Mandragoran"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                />
              </div>

              {/* Doctor Roles Searchable Tag Selector */}
              <div className="space-y-1.5 flex flex-col relative">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Role / Specialization</label>

                {/* Selected Tags Display */}
                {selectedDoctorRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {selectedDoctorRoles.map(role => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => setSelectedDoctorRoles(prev => prev.filter(r => r !== role))}
                          className="text-brand-500 hover:text-brand-700 focus:outline-none"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input Field */}
                <div className="relative">
                  <input
                    type="text"
                    value={doctorRoleSearch}
                    onChange={(e) => {
                      setDoctorRoleSearch(e.target.value);
                      setIsDoctorRoleDropdownOpen(true);
                    }}
                    onFocus={() => setIsDoctorRoleDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDoctorRoleDropdownOpen(false), 200)}
                    placeholder={selectedDoctorRoles.length === 0 ? "Search or type specialization..." : "Add another..."}
                    className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />

                  {/* Dropdown Menu */}
                  {isDoctorRoleDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1.5 bg-surface-base border border-surface-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {(() => {
                        const filtered = PRESET_ROLES.filter(
                          r => r.toLowerCase().includes(doctorRoleSearch.toLowerCase()) && !selectedDoctorRoles.includes(r)
                        );

                        return (
                          <div className="py-1">
                            {filtered.map(role => (
                              <button
                                key={role}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedDoctorRoles(prev => [...prev, role]);
                                  setDoctorRoleSearch('');
                                  setIsDoctorRoleDropdownOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-subtle font-medium transition duration-150"
                              >
                                {role}
                              </button>
                            ))}

                            {/* Custom option */}
                            {doctorRoleSearch.trim() && !PRESET_ROLES.some(r => r.toLowerCase() === doctorRoleSearch.trim().toLowerCase()) && !selectedDoctorRoles.some(r => r.toLowerCase() === doctorRoleSearch.trim().toLowerCase()) && (
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedDoctorRoles(prev => [...prev, doctorRoleSearch.trim()]);
                                  setDoctorRoleSearch('');
                                  setIsDoctorRoleDropdownOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-brand-600 hover:bg-brand-50/50 font-semibold border-t border-surface-border/40 transition duration-150"
                              >
                                Add "{doctorRoleSearch.trim()}" as a custom role
                              </button>
                            )}

                            {filtered.length === 0 && !doctorRoleSearch.trim() && (
                              <div className="px-3.5 py-2 text-xs text-text-muted text-center font-medium">
                                All preset roles selected
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={onboardingDoctorEmail}
                  onChange={(e) => setOnboardingDoctorEmail(e.target.value)}
                  required
                  placeholder="e.g. lan.m@apexfamily.com"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
            >
              Continue to Preview
            </button>
          </form>
        </div>
      )}

      {/* STEP 5: SIMULATED PREVIEW */}
      {onboardingStep === 5 && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-text-primary">Zero is Ready</h2>
            <p className="text-text-secondary">Here is how Zero interacts with a patient booking at your clinic in real time.</p>
          </div>

          {/* Chat preview card (Ask Super AI Card-shaped representation) */}
          <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-6 space-y-4 w-full relative overflow-hidden">
            {/* Simple Agent Header (Christian/Agent Header-shaped representation) */}
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border/40">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ai-500 to-ai-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                Z
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-text-primary text-xs">Zero AI</span>
                  <span className="w-2 h-2 rounded-full bg-status-success"></span>
                </div>
                <span className="text-[10px] text-text-muted">WhatsApp Care Operator</span>
              </div>
            </div>

            {/* Message List */}
            <div className="space-y-3.5 min-h-[220px] flex flex-col justify-end">
              {previewMessages.map((msg, index) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[80%] ${
                      isAI ? 'self-start items-start' : 'self-end items-end'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 text-xs leading-relaxed ${
                        isAI
                          ? 'bg-ai-50/70 text-ai-900 border border-ai-100/50 rounded-2xl rounded-tl-none font-medium'
                          : 'bg-surface-subtle/70 text-text-primary border border-surface-border/20 rounded-2xl rounded-tr-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-text-muted mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}

              {/* Bouncing Dots typing indicator */}
              {previewTyping && (
                <div className="flex gap-1.5 items-center bg-ai-50/40 border border-ai-100/30 px-4 py-3 rounded-2xl w-fit max-w-[70%] text-text-secondary self-start rounded-tl-none">
                  <span className="w-1.5 h-1.5 bg-ai-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-ai-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-ai-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-4 max-w-sm mx-auto">
            <p className="text-[13px] text-text-primary font-bold">
              This is Zero, working for {onboardingClinicName.trim() || 'your clinic'}.
            </p>
            <button
              onClick={async () => {
                try {
                  await api.clinic.completeOnboarding();
                } catch (err) {
                  console.error('Failed to mark onboarding complete:', err);
                }
                setIsOnboarded(true);
                setCurrentRoute('dashboard');
              }}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
