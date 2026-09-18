'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Mail, Lock, Eye, EyeOff, Phone, Check, X, Apple } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

/* ── Password strength rules (mirrors Flutter's FlutterPwValidator) ── */
function getStrength(pw: string) {
  return {
    minLength:   pw.length >= 8,
    hasUpper:    /[A-Z]/.test(pw),
    hasNumber:   /[0-9]/.test(pw),
    hasSpecial:  /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [fullname, setFullname]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [countryCode, setCountry] = useState('+91');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const strength = getStrength(password);
  const isPasswordOk = Object.values(strength).every(Boolean);

  const createUserDoc = async (uid: string) => {
    await setDoc(doc(db, 'users', uid), {
      fullname, email,
      phone: `${countryCode}${phone}`,
      deliveryAddress: '',
      referralCode: '',
      awardReferral: false,
      personalReferralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: serverTimestamp(),
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordOk) { setError('Please meet all password requirements.'); return; }
    setLoading(true); setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: fullname });
      await createUserDoc(user.uid);
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      // Create user doc if new
      await setDoc(doc(db, 'users', user.uid), {
        fullname: user.displayName || 'Guest User',
        email: user.email,
        phone: user.phoneNumber || '',
        createdAt: serverTimestamp(),
        loyaltyPoints: 0,
      }, { merge: true });
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleApple = async () => {
    setLoading(true); setError('');
    try {
      const { user } = await signInWithPopup(auth, new OAuthProvider('apple.com'));
      // Create user doc if new
      await setDoc(doc(db, 'users', user.uid), {
        fullname: user.displayName || 'Guest User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: serverTimestamp(),
        loyaltyPoints: 0,
      }, { merge: true });
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh w-full flex items-start justify-center px-4 py-12 bg-[var(--color-bg)]">
      <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-3xl p-8 md:p-10 shadow-sm">

        {/* Back button */}
        <div className="absolute top-6 left-4 md:left-6 z-10">
          <BackButton />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-serif font-bold text-[#2D1508] mb-1">Create Account</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mb-8">
          Sign up for a new Falguni account
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* Full name */}
          <AppField
            type="text" placeholder="Full name" value={fullname} onChange={setFullname}
            icon={<User size={18} className="text-[#733617]" />}
          />

          {/* Email */}
          <AppField
            type="email" placeholder="Email Address" value={email} onChange={setEmail}
            icon={<Mail size={18} className="text-[#733617]" />}
          />

          {/* Phone with country code */}
          <div className="flex gap-2">
            {/* Country picker */}
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

            {/* Phone number */}
            <AppField
              type="tel" placeholder="Mobile number" value={phone} onChange={setPhone}
              icon={<Phone size={18} className="text-[#733617]" />}
            />
          </div>

          {/* Password */}
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

          {/* Password strength — shown when user starts typing */}
          {password.length > 0 && (
            <div className="flex flex-col gap-1 px-1">
              <StrengthRow ok={strength.minLength}  label="At least 8 characters" />
              <StrengthRow ok={strength.hasUpper}   label="1 uppercase letter" />
              <StrengthRow ok={strength.hasNumber}  label="1 number" />
              <StrengthRow ok={strength.hasSpecial} label="1 special character" />
            </div>
          )}

          {/* Sign up button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] rounded-xl font-bold text-sm tracking-wider uppercase transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? 'Creating account...' : 'SIGN UP'}
          </button>
        </form>

        {/* Divider */}
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

        {/* Sign in */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <span className="text-sm text-[var(--color-fg-muted)]">
            Already have an account?
          </span>
          <Link href="/login"
            className="text-sm font-bold text-[#733617] hover:underline">
            Sign In
          </Link>
        </div>
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

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email':        'Please enter a valid email.',
    'auth/weak-password':        'Password must be at least 6 characters.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
