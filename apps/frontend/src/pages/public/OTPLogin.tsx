import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Phone, Users, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const OTPLogin: React.FC = () => {
  const [role, setRole] = useState<'farmer' | 'officer' | 'admin'>('farmer');
  const [phone, setPhone] = useState('9876543201'); // Default to demo farmer Gurpreet
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(true);

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

    // Auto-focus next input
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
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
      login(user, token);
      toast.success(`Welcome, ${user.name}!`);

      // Role-based redirect
      if (user.role === 'admin') {
        navigate('/admin/analytics');
      } else if (user.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP. Use 123456 for demo.');
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Visual Farmer Avatar Badge */}
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
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="relative z-10 text-xs text-gray-400">
          © 2026 Department of Consumer Affairs, Government of India.
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Card */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-farmborder/80 dark:border-gray-800 shadow-xl">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="font-heading text-3xl font-bold text-text-primary dark:text-white">
              Welcome to KrishiSeva
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              {step === 1 ? 'Select your role and enter mobile number' : `Enter 6-digit OTP sent to +91 ${phone}`}
            </p>
          </div>

          {/* STEP 1: Role Selection & Phone */}
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Role Toggle Pills */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                  Choose your role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('farmer')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
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
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
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
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
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

              {/* Phone Input */}
              <Input
                label="Mobile Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                prefixText="+91"
                placeholder="9876543201"
                required
              />

              {/* Submit Button */}
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

              {/* Demo Credentials Helper Card */}
              {showDemoHint && (
                <div className="p-4 rounded-xl bg-gold-pale dark:bg-gray-800/80 border border-gold/40 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-earth-brown dark:text-gold-light">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Demo Login Accounts
                    </span>
                    <span className="text-[10px] uppercase font-mono">OTP: 123456</span>
                  </div>
                  <div className="space-y-1 text-text-muted text-[11px]">
                    <p>🧑🌾 <strong>Farmer:</strong> 9876543201 (Gurpreet Singh)</p>
                    <p>👮 <strong>Officer:</strong> 9999900002 (Rajesh Kumar)</p>
                    <p>🏛️ <strong>Admin:</strong> 9999900001 (DoCA Admin)</p>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* STEP 2: 6-Digit OTP */
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

              {/* Countdown & Resend */}
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

              {/* Verify Button */}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
