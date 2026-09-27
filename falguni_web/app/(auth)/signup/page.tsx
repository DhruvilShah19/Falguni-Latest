'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  updateProfile,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Phone, Check, X, Apple, Smartphone, KeyRound } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

declare global {
  interface Window {
    recaptchaVerifierSignup: any;
    confirmationResultSignup: any;
    grecaptcha: any;
  }
}

/* ── Password strength rules (mirrors Flutter's FlutterPwValidator) ── */
function getStrength(pw: string) {
  return {
    minLength:   pw.length >= 8,
    hasUpper:    /[A-Z]/.test(pw),
    hasNumber:   /[0-9]/.test(pw),
    hasSpecial:  /[!@#$%^&*(),.?":{}|<>]/.test(pw)
  };
}

export default function SignupPage() {
  const router = useRouter();

  // Auth Methods
  const [signupMethod, setSignupMethod] = useState<'phone' | 'email'>('phone');

  // Shared
  const [fullname, setFullName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Email States
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [countryCode, setCountry] = useState('+91');
  const [emailPhone, setEmailPhone] = useState('');
  
  // Phone OTP States
  const [phoneOnly, setPhoneOnly] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const strength = getStrength(password);
  const pwValid = Object.values(strength).every(Boolean);

  // Setup reCAPTCHA
  useEffect(() => {
    if (signupMethod === 'phone') {
      if (!window.recaptchaVerifierSignup) {
        window.recaptchaVerifierSignup = new RecaptchaVerifier(auth, 'recaptcha-container-signup', {
          size: 'invisible'
        });
      }
    }
  }, [signupMethod]);

  const ensureUserDoc = async (user: User, method: string) => {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    // If it exists, we don't want to overwrite unless necessary, but this is a sign up page.
    if (!snap.exists()) {
      let docPhone = '';
      if (method === 'email') docPhone = `${countryCode}${emailPhone}`;
      if (method === 'phone') docPhone = phoneOnly;
      if (method === 'google' || method === 'apple') docPhone = user.phoneNumber || '';

      await setDoc(userRef, {
        fullname: user.displayName || fullname || 'Guest User',
        email: user.email || (method === 'email' ? email : ''),
        phone: docPhone,
        wallet: 0,
        tokenID: '',
        loyaltyPoints: 0,
        referralCode: '',
        awardReferral: false,
        personalReferralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullname });
      await ensureUserDoc(cred.user, 'email');
      router.push('/');
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phoneOnly || phoneOnly.length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +91).');
      return;
    }
    
    let formattedPhone = phoneOnly;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }

    setLoading(true); setError('');
    try {
      const appVerifier = window.recaptchaVerifierSignup;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResultSignup = confirmationResult;
      setOtpSent(true);
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      setError(friendlyError(err));
      if (window.recaptchaVerifierSignup) {
        window.recaptchaVerifierSignup.render().then((widgetId: any) => {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }

    setLoading(true); setError('');
    try {
      const result = await window.confirmationResultSignup.confirm(otp);
      if (fullname && !result.user.displayName) {
        await updateProfile(result.user, { displayName: fullname });
      }
      await ensureUserDoc(result.user, 'phone');
      router.push('/');
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDoc(cred.user, 'google');
      router.push('/');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };

  const handleApple = async () => {
    setLoading(true); setError('');
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDoc(cred.user, 'apple');
      router.push('/');
    } catch (err: any) {
      console.error('Apple Sign-In Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <div className="absolute top-6 left-4 md:left-6 z-10">
        <BackButton />
      </div>
      <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-3xl p-8 md:p-10 shadow-sm">

        {/* Heading */}
        <h1 className="text-3xl font-serif font-bold text-[#2D1508] mb-1">Create Account</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mb-6">
          Join Falguni to start shopping
        </p>

        {/* Auth Toggle */}
        {!otpSent && (
          <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#EFE6DC] mb-6 w-full">
            <button
              type="button"
              onClick={() => { setSignupMethod('phone'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                signupMethod === 'phone'
                  ? 'bg-[#733617] text-white shadow-xs'
                  : 'text-[#8A796F] hover:text-[#2D1508]'
              }`}
            >
              <Smartphone size={14} />
              <span>Phone</span>
            </button>
            <button
              type="button"
              onClick={() => { setSignupMethod('email'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                signupMethod === 'email'
                  ? 'bg-[#733617] text-white shadow-xs'
                  : 'text-[#8A796F] hover:text-[#2D1508]'
              }`}
            >
              <Mail size={14} />
              <span>Email</span>
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <div id="recaptcha-container-signup"></div>

        {/* Form State */}
        {signupMethod === 'phone' ? (
          !otpSent ? (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <AppField
                type="text" placeholder="Full Name" value={fullname} onChange={setFullName}
                icon={<UserIcon size={18} className="text-[#733617]" />}
              />
              <AppField
                type="tel" placeholder="Phone Number (e.g. +91 9876543210)" value={phoneOnly} onChange={setPhoneOnly}
                icon={<Smartphone size={18} className="text-[#733617]" />}
              />
              <button
                type="submit"
                disabled={loading || phoneOnly.length < 5 || !fullname}
                className="w-full h-[48px] rounded-xl font-bold text-sm tracking-wider uppercase transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
              >
                {loading ? 'Sending OTP...' : 'GET OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4 animate-fade-in">
              <div className="text-center mb-2">
                <p className="text-xs text-[#8A796F]">OTP sent to <span className="font-bold text-[#2D1508]">{phoneOnly}</span></p>
                <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-[#733617] hover:underline mt-1 font-semibold">Change Number</button>
              </div>
              <AppField
                type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={setOtp}
                icon={<KeyRound size={18} className="text-[#733617]" />}
              />
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full h-[48px] rounded-xl font-bold text-sm tracking-wider uppercase transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
              >
                {loading ? 'Verifying...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
            <AppField
              type="text" placeholder="Full Name" value={fullname} onChange={setFullName}
              icon={<UserIcon size={18} className="text-[#733617]" />}
            />
            <AppField
              type="email" placeholder="Email Address" value={email} onChange={setEmail}
              icon={<Mail size={18} className="text-[#733617]" />}
            />
            
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={e => setCountry(e.target.value)}
                className="h-[50px] px-3 rounded-xl text-[#2D1508] bg-[#FAF7F2] border border-[var(--color-border)] text-sm outline-none cursor-pointer transition-all flex-shrink-0 focus:border-[#733617] focus:bg-white"
                style={{ minWidth: 80 }}
              >
                <option value="+91">+91 🇮🇳</option>
                <option value="+1">+1 🇺🇸</option>
                <option value="+44">+44 🇬🇧</option>
                <option value="+61">+61 🇦🇺</option>
                <option value="+971">+971 🇦🇪</option>
              </select>
              <AppField
                type="tel" placeholder="Mobile number" value={emailPhone} onChange={setEmailPhone}
                icon={<Phone size={18} className="text-[#733617]" />}
              />
            </div>

            <AppField
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              icon={<Lock size={18} className="text-[#733617]" />}
              suffix={
                <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1} className="text-[var(--color-fg-muted)] hover:text-[#2D1508]">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {password.length > 0 && (
              <div className="flex flex-col gap-1 px-1">
                <StrengthRow ok={strength.minLength}  label="At least 8 characters" />
                <StrengthRow ok={strength.hasUpper}   label="1 uppercase letter" />
                <StrengthRow ok={strength.hasNumber}  label="1 number" />
                <StrengthRow ok={strength.hasSpecial} label="1 special character" />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pwValid}
              className="w-full h-[48px] rounded-xl font-bold text-sm tracking-wider uppercase transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
            >
              {loading ? 'Creating account...' : 'SIGN UP'}
            </button>
          </form>
        )}

        {/* Divider */}
        {!otpSent && (
          <>
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-fg-muted)] font-medium">Or continue with</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            {/* Google & Apple */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[#FAF7F2] hover:bg-white hover:border-[#733617]/30 transition shadow-sm disabled:opacity-40"
                title="Sign in with Google"
              >
                <GoogleIcon />
              </button>
              
              <button
                onClick={handleApple}
                disabled={loading}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[#FAF7F2] hover:bg-white hover:border-[#733617]/30 transition shadow-sm disabled:opacity-40"
                title="Sign in with Apple"
              >
                <Apple size={22} className="text-[#2D1508]" />
              </button>
            </div>
          </>
        )}

        {/* Sign in */}
        {!otpSent && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <span className="text-sm text-[var(--color-fg-muted)]">
              Already have an account?
            </span>
            <Link href="/login"
              className="text-sm font-bold text-[#733617] hover:underline">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shared input ── */
function AppField({ type, placeholder, value, onChange, icon, suffix }: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode; suffix?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center flex-1">
      <span className="absolute left-4 pointer-events-none flex items-center">{icon}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full h-[50px] pl-11 pr-11 rounded-xl text-[#2D1508] text-sm outline-none transition-all placeholder:[var(--color-fg-muted)]/50 bg-[#FAF7F2] border border-[var(--color-border)] focus:border-[#733617] focus:bg-white"
      />
      {suffix && <span className="absolute right-4 flex items-center">{suffix}</span>}
    </div>
  );
}

/* ── Password strength row ── */
function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
        {ok
          ? <Check size={10} strokeWidth={3} />
          : <X size={10} strokeWidth={3} />
        }
      </div>
      <span className={`text-xs ${ok ? 'text-emerald-700 font-medium' : 'text-[var(--color-fg-muted)]'}`}>
        {label}
      </span>
    </div>
  );
}

/* ── Google icon ── */
function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function friendlyError(err: any): string {
  const code = typeof err === 'string' ? err : err?.code || '';
  const message = typeof err === 'object' ? err?.message : '';

  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/unauthorized-domain': `This deployment domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is not authorized in Firebase Console > Authentication > Settings > Authorized domains.`,
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console (Authentication > Sign-in method).',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled before completing.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email using a different sign-in method.',
    'auth/invalid-phone-number': 'Invalid phone number. Ensure you included the country code (e.g. +91).',
    'auth/invalid-verification-code': 'Invalid OTP entered. Please try again.',
    'auth/code-expired': 'The OTP has expired. Please request a new one.',
  };

  if (map[code]) return map[code];
  if (message && !message.includes('Firebase:')) return message;
  return 'Something went wrong. Please try again.';
}
