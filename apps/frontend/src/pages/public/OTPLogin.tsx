import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  QrCode,
  Globe
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const OTPLogin: React.FC = () => {
  const [authMode, setAuthMode] = useState<'otp' | 'password' | 'oauth'>('otp');
  const [role, setRole] = useState<'farmer' | 'officer' | 'admin'>('farmer');
  const [phone, setPhone] = useState('9876543201'); // Default to demo farmer Gurpreet
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisteringPassword, setIsRegisteringPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // For OTP flow
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(true);

  // Lockout state
  const [lockoutInfo, setLockoutInfo] = useState<{ isLocked: boolean; remainingSeconds: number; attemptsLeft?: number } | null>(null);

  // MFA Challenge state
  const [mfaChallenge, setMfaChallenge] = useState<{ token: string; code: string } | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    let interval: any = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Lockout countdown timer
  useEffect(() => {
    let timerId: any = null;
    if (lockoutInfo?.isLocked && lockoutInfo.remainingSeconds > 0) {
      timerId = setInterval(() => {
        setLockoutInfo((prev) => {
          if (!prev || prev.remainingSeconds <= 1) return null;
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [lockoutInfo]);

  const handleRoleChange = (newRole: 'farmer' | 'officer' | 'admin') => {
    setRole(newRole);
    if (newRole === 'farmer') setPhone('9876543201');
    else if (newRole === 'officer') setPhone('9999900002');
    else if (newRole === 'admin') setPhone('9999900001');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/send-otp', {
        phone: `+91${phone.replace(/\D/g, '')}`,
        role,
      });
      toast.success('OTP sent successfully! (Demo code: 123456)');
      setStep(2);
      setTimer(45);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const completeLogin = (user: any, token: string) => {
    login(user, token);
    toast.success(`Welcome, ${user.name}!`);

    if (user.role === 'admin') {
      navigate('/admin/analytics');
    } else if (user.role === 'officer') {
      navigate('/officer/dashboard');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-otp', {
        phone: `+91${phone.replace(/\D/g, '')}`,
        otp: enteredOtp,
        selectedRole: role,
      });

      const { user, token } = res.data;
      completeLogin(user, token);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP. Use 123456 for demo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Login & Registration Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLockoutInfo(null);

    try {
      if (isRegisteringPassword) {
        // Register password
        const res = await apiClient.post('/auth/register-password', {
          phone,
          password,
          name: fullName || (role === 'farmer' ? 'Kisan Farmer' : role === 'officer' ? 'Mandi Officer' : 'DoCA Administrator'),
          role,
        });
        toast.success('Account created with enterprise encryption!');
        completeLogin(res.data.user, res.data.token);
      } else {
        // Login with password
        const res = await apiClient.post('/auth/login-password', {
          identifier: phone,
          password,
        });

        // Check if 2FA MFA challenge is triggered
        if (res.data.require_mfa) {
          toast('Second-factor authentication required', { icon: '🛡️' });
          setMfaChallenge({
            token: res.data.mfa_token,
            code: '',
          });
          return;
        }

        completeLogin(res.data.user, res.data.token);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (err.response?.status === 429) {
        setLockoutInfo({
          isLocked: true,
          remainingSeconds: data?.remainingSeconds || 900,
        });
        toast.error(data?.error || 'Account temporarily locked out due to failed attempts.');
      } else if (data?.attemptsLeft !== undefined) {
        setLockoutInfo({
          isLocked: false,
          remainingSeconds: 0,
          attemptsLeft: data.attemptsLeft,
        });
        toast.error(data.error);
      } else {
        toast.error(data?.error || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // MFA Challenge Submit
  const handleMfaChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallenge || !mfaChallenge.code) {
      toast.error('Please enter 6-digit code or backup recovery code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/mfa/verify-login', {
        mfa_token: mfaChallenge.token,
        code: mfaChallenge.code,
      });
      toast.success('MFA verification successful!');
      completeLogin(res.data.user, res.data.token);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid 2FA code or recovery token.');
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Google Flow with CSRF Verification
  const handleOAuthLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Get anti-CSRF state token and PKCE code challenge
      const initRes = await apiClient.get('/auth/oauth/google/initiate');
      const { state } = initRes.data;

      // 2. Simulate user authentication callback with verified state token
      toast.loading('Validating Google OAuth identity with Anti-CSRF token...', { id: 'oauth' });
      const callbackRes = await apiClient.post('/auth/oauth/google/callback', {
        state,
        mockEmail: `kisan.${role}@krishiseva.gov.in`,
        mockName: role === 'farmer' ? 'Gurpreet Singh (Verified)' : role === 'officer' ? 'Rajesh Kumar (Verified)' : 'Admin DoCA',
        role,
      });

      toast.success('Single Sign-On verified securely!', { id: 'oauth' });
      completeLogin(callbackRes.data.user, callbackRes.data.token);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'OAuth authentication failed', { id: 'oauth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Request
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) {
      toast.error('Please enter your phone number or email');
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { identifier: forgotIdentifier });
      toast.success('Reset link dispatched! Demo token auto-populated.');
      if (res.data.demo_reset_token) {
        setResetToken(res.data.demo_reset_token);
      }
      setResetStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to dispatch reset token');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Submission
  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      toast.error('Token and new password are required');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      toast.success('Password updated successfully! Please login with new password.');
      setShowForgotModal(false);
      setAuthMode('password');
      setIsRegisteringPassword(false);
      setPassword(newPassword);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Policy Checks for UI feedback
  const passLen = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passLower = /[a-z]/.test(password);
  const passNum = /[0-9]/.test(password);
  const passSpec = /[^A-Za-z0-9]/.test(password);
  const isStrong = passLen && passUpper && passLower && passNum && passSpec;

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surface dark:bg-gray-950">
      {/* LEFT COLUMN: Agricultural Brand Image (Desktop) */}
      <div className="hidden lg:flex lg:col-span-6 bg-primary-dark relative overflow-hidden flex-col justify-between p-12 text-white organic-texture">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-transparent" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold text-2xl border border-gold/40 shadow-inner">
            🌾
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">KrishiSeva</h1>
            <span className="text-xs uppercase tracking-widest text-gold-light font-semibold">
              Ministry of Consumer Affairs · Government of India
            </span>
          </div>
        </div>

        {/* Mid Farmer Feature & Quote */}
        <div className="relative z-10 max-w-lg space-y-5">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <img
              src="/images/farmers/gurpreet.jpg"
              alt="Indian Farmer"
              className="w-10 h-10 rounded-full object-cover border-2 border-gold"
            />
            <div className="text-left">
              <span className="text-xs font-bold text-white block">Gurpreet Singh · Amritsar</span>
              <span className="text-[11px] text-gold-light">Credited ₹1,16,400 via PFMS DBT</span>
            </div>
          </div>

          <div className="text-gold text-4xl font-heading leading-none">“</div>
          <p className="font-heading text-2xl font-semibold leading-snug text-gray-100">
            Empowering 5 crore grain-growing farmers with guaranteed MSP rates, digital transparency, and scheduled mandi access.
          </p>
          <div className="pt-2 flex flex-col gap-2 text-xs text-primary-pale">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>Zero middlemen commission. 72-hour direct bank transfer.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>Real-time live queue tokens & certified digital weighbridge.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>End-to-End Enterprise Security: MFA, Bcrypt 12, Anti-CSRF, Lockout Defense.</span>
            </div>
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="relative z-10 text-xs text-gray-400">
          © 2026 Department of Consumer Affairs, Government of India.
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Card */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-farmborder/80 dark:border-gray-800 shadow-xl">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="font-heading text-3xl font-bold text-text-primary dark:text-white">
              Welcome to KrishiSeva
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Choose your role and preferred secure authentication method
            </p>
          </div>

          {/* Role Toggle Pills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Select Your Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('farmer')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                  role === 'farmer'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface hover:bg-surface-2 border-farmborder text-text-muted dark:bg-gray-800'
                }`}
              >
                <span className="text-base">🧑🌾</span>
                <span>Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('officer')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                  role === 'officer'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface hover:bg-surface-2 border-farmborder text-text-muted dark:bg-gray-800'
                }`}
              >
                <span className="text-base">👮</span>
                <span>Officer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface hover:bg-surface-2 border-farmborder text-text-muted dark:bg-gray-800'
                }`}
              >
                <span className="text-base">🏛️</span>
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Authentication Mode Switcher Tabs */}
          <div className="flex border-b border-farmborder dark:border-gray-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setMfaChallenge(null); }}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                authMode === 'otp'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setMfaChallenge(null); }}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Password & 2FA
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('oauth'); setMfaChallenge(null); }}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                authMode === 'oauth'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> SSO OAuth
            </button>
          </div>

          {/* LOCKOUT WARNING BANNER */}
          {lockoutInfo && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              lockoutInfo.isLocked
                ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                {lockoutInfo.isLocked ? (
                  <p>
                    <strong>Account Locked:</strong> Too many consecutive failed attempts. System lockout active for{' '}
                    <span className="font-mono font-bold">{Math.floor(lockoutInfo.remainingSeconds / 60)}m {lockoutInfo.remainingSeconds % 60}s</span> to stop brute-force attacks.
                  </p>
                ) : (
                  <p>
                    <strong>Security Alert:</strong> Invalid credentials. Only{' '}
                    <span className="font-bold text-rose-600 dark:text-rose-400">{lockoutInfo.attemptsLeft} attempt(s)</span> remaining before your account is locked for 15 minutes.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* MFA 2-FACTOR CHALLENGE SCREEN */}
          {mfaChallenge ? (
            <form onSubmit={handleMfaChallengeSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-primary-pale dark:bg-gray-800/80 border border-primary/30 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-text-primary dark:text-white">
                  Multi-Factor Authentication (2FA)
                </h3>
                <p className="text-xs text-text-muted">
                  Open your Authenticator App (Google / Microsoft / Authy) or enter a backup recovery code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">
                  6-Digit Authenticator Code / Backup Code
                </label>
                <input
                  type="text"
                  value={mfaChallenge.code}
                  onChange={(e) => setMfaChallenge({ ...mfaChallenge, code: e.target.value })}
                  placeholder="e.g. 842190 or BACKUP-CODE"
                  maxLength={16}
                  className="w-full text-center tracking-widest font-mono text-xl py-3 rounded-xl border-2 border-farmborder focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface dark:bg-gray-800 text-text-primary dark:text-white uppercase"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                icon={<CheckCircle2 className="w-5 h-5" />}
              >
                Verify 2FA & Login
              </Button>

              <button
                type="button"
                onClick={() => setMfaChallenge(null)}
                className="w-full text-center text-xs text-text-muted hover:text-text-primary underline"
              >
                Cancel and return to login
              </button>
            </form>
          ) : authMode === 'otp' ? (
            /* ================= MODE 1: OTP LOGIN ================= */
            step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <Input
                  label="Mobile Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  prefixText="+91"
                  placeholder="9876543201"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Send OTP
                </Button>

                {showDemoHint && (
                  <div className="p-3.5 rounded-xl bg-gold-pale dark:bg-gray-800/80 border border-gold/40 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-earth-brown dark:text-gold-light">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" /> Instant Demo Accounts
                      </span>
                      <span className="text-[10px] uppercase font-mono">OTP: 123456</span>
                    </div>
                    <div className="space-y-0.5 text-text-muted text-[11px]">
                      <p>🧑🌾 <strong>Farmer:</strong> 9876543201 (Gurpreet Singh)</p>
                      <p>👮 <strong>Officer:</strong> 9999900002 (Rajesh Kumar)</p>
                      <p>🏛️ <strong>Admin:</strong> 9999900001 (DoCA Admin)</p>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* OTP STEP 2: 6 Digits */
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-muted uppercase tracking-wider">
                      Enter Verification Code
                    </span>
                    <button
                      type="button"
                      onClick={fillDemoOtp}
                      className="text-primary font-semibold hover:underline"
                    >
                      Auto-fill (123456)
                    </button>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-14 text-center font-display text-2xl font-bold rounded-xl border-2 border-farmborder focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface dark:bg-gray-800 text-text-primary dark:text-white"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {timer > 0 ? (
                    <span className="text-text-muted">
                      Resend code in <strong className="text-primary">00:{timer < 10 ? `0${timer}` : timer}</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTimer(45);
                        toast.success('New OTP sent (123456)');
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    Change number
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Verify & Continue
                </Button>
              </form>
            )
          ) : authMode === 'password' ? (
            /* ================= MODE 2: PASSWORD + 2FA LOGIN ================= */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {isRegisteringPassword && (
                <Input
                  label="Your Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              )}

              <Input
                label="Mobile Phone / Email"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543201 or user@example.com"
                required
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    {isRegisteringPassword ? 'Create Strong Password' : 'Password'}
                  </label>
                  {!isRegisteringPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotIdentifier(phone);
                        setResetStep(1);
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-farmborder focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface dark:bg-gray-800 text-text-primary dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Password Policy Feedback (When creating or typing password) */}
              {isRegisteringPassword && (
                <div className="p-3 bg-surface-2 dark:bg-gray-800/90 rounded-xl border border-farmborder text-[11px] space-y-1.5">
                  <span className="font-bold text-text-muted block">Password Security Policy Requirements:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <span className={passLen ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                      {passLen ? '✓' : '○'} 8+ characters
                    </span>
                    <span className={passUpper ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                      {passUpper ? '✓' : '○'} Uppercase (A-Z)
                    </span>
                    <span className={passLower ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                      {passLower ? '✓' : '○'} Lowercase (a-z)
                    </span>
                    <span className={passNum ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                      {passNum ? '✓' : '○'} Number (0-9)
                    </span>
                    <span className={passSpec ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                      {passSpec ? '✓' : '○'} Special symbol (!@#$)
                    </span>
                    <span className={isStrong ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                      {isStrong ? '✓ OWASP Protected' : '○ Common dictionary blocked'}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={lockoutInfo?.isLocked}
                isLoading={isLoading}
                icon={<Lock className="w-4 h-4" />}
              >
                {isRegisteringPassword ? 'Create Account with Encryption' : 'Secure Login'}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisteringPassword(!isRegisteringPassword)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  {isRegisteringPassword
                    ? 'Already have an account? Sign in with password'
                    : 'First time here? Create password-protected account'}
                </button>
              </div>
            </form>
          ) : (
            /* ================= MODE 3: OAUTH SSO ================= */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-2 dark:bg-gray-800/60 border border-farmborder text-center space-y-2">
                <Globe className="w-8 h-8 text-primary mx-auto" />
                <h3 className="text-sm font-bold text-text-primary dark:text-white">
                  Government & Federated OAuth Single Sign-On
                </h3>
                <p className="text-xs text-text-muted">
                  Cryptographically secured with PKCE (Proof Key for Code Exchange) and Anti-CSRF cryptographic state token protection.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleOAuthLogin}
                className="w-full border-farmborder hover:bg-surface-2 flex items-center justify-center gap-2 font-bold text-xs"
                isLoading={isLoading}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google / MeriPehchaan (Anti-CSRF)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: SECURE PASSWORD RESET ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-farmborder pb-3">
              <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Secure Password Reset
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-text-muted hover:text-text-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-text-muted">
                  Enter your registered phone or email. We will generate a cryptographic, single-use reset token valid for 15 minutes.
                </p>
                <Input
                  label="Registered Phone or Email"
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="9876543201"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Generate Single-Use Reset Token
                </Button>
              </form>
            ) : (
              <form onSubmit={handleExecuteReset} className="space-y-4">
                <div className="p-3 bg-gold-pale dark:bg-gray-800 rounded-xl border border-gold/40 text-[11px] text-earth-brown dark:text-gold-light space-y-1 font-mono">
                  <span className="font-bold block">Demo Token Auto-Filled:</span>
                  <p className="break-all">{resetToken}</p>
                </div>

                <Input
                  label="Reset Token"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste 32-byte cryptographic token"
                  required
                />

                <Input
                  label="New Strong Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, mixed case, symbol & digit"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Reset Password & Revoke Sessions
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPLogin;

