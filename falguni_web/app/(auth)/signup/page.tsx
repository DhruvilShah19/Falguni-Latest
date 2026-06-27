'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Mail, Lock, Eye, EyeOff, Phone, ChevronLeft, Check, X, Apple } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

const kGold   = 'var(--color-gold)';
const kBgTop  = 'var(--color-bg)';
const kBgMid  = 'var(--color-bg)';

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
    <div
      className="min-h-dvh w-full flex items-start justify-center px-6 py-10"
      style={{ background: `linear-gradient(180deg, ${kBgTop} 0%, ${kBgMid} 50%, ${kBgTop} 100%)` }}
    >
      <div className="w-full max-w-sm">

        {/* Back button */}
        <div className="absolute top-6 left-4 md:left-6 z-10">
          <BackButton />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[var(--color-fg)] mb-2">Create Account</h1>
        <p className="text-base mb-10" style={{ color: 'var(--color-fg-muted)' }}>
          Sign up to get started
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 border border-red-500/30"
            style={{ background: 'rgba(255,80,80,0.08)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          {/* Full name */}
          <AppField
            type="text" placeholder="Full name" value={fullname} onChange={setFullname}
            icon={<User size={20} color={kGold} />}
          />

          {/* Email */}
          <AppField
            type="email" placeholder="Email" value={email} onChange={setEmail}
            icon={<Mail size={20} color={kGold} />}
          />

          {/* Phone with country code */}
          <div className="flex gap-2">
            {/* Country picker */}
            <select
              value={countryCode}
              onChange={e => setCountry(e.target.value)}
              className="h-[54px] px-3 rounded-xl text-[var(--color-fg)] text-sm outline-none appearance-none cursor-pointer transition-all flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--color-fg)',
                minWidth: 80,
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = kGold; }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              <option value="+91"  style={{ background: '#2B1B17' }}>+91 🇮🇳</option>
              <option value="+1"   style={{ background: '#2B1B17' }}>+1 🇺🇸</option>
              <option value="+44"  style={{ background: '#2B1B17' }}>+44 🇬🇧</option>
              <option value="+61"  style={{ background: '#2B1B17' }}>+61 🇦🇺</option>
              <option value="+971" style={{ background: '#2B1B17' }}>+971 🇦🇪</option>
            </select>

            {/* Phone number */}
            <AppField
              type="tel" placeholder="Mobile number" value={phone} onChange={setPhone}
              icon={<Phone size={20} color={kGold} />}
            />
          </div>

          {/* Password */}
          <AppField
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            icon={<Lock size={20} color={kGold} />}
            suffix={
              <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass
                  ? <EyeOff size={18} style={{ color: 'var(--color-fg-muted)' }} />
                  : <Eye    size={18} style={{ color: 'var(--color-fg-muted)' }} />
                }
              </button>
            }
          />

          {/* Password strength — shown when user starts typing */}
          {password.length > 0 && (
            <div className="flex flex-col gap-1.5 px-1">
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
            className="w-full h-[50px] rounded-xl font-bold text-base tracking-widest uppercase transition hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: kGold, color: kBgTop, letterSpacing: '0.08em' }}
          >
            {loading ? 'Creating account...' : 'SIGN UP'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Google & Apple */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-14 h-14 rounded-full flex items-center justify-center border transition hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            title="Sign in with Google"
          >
            <GoogleIcon />
          </button>
          
          <button
            onClick={handleApple}
            disabled={loading}
            className="w-14 h-14 rounded-full flex items-center justify-center border transition hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            title="Sign in with Apple"
          >
            <Apple size={26} color="var(--color-fg)" />
          </button>
        </div>

        {/* Sign in */}
        <div className="flex items-center justify-center gap-1 mt-10">
          <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            Already have an account?
          </span>
          <Link href="/login"
            className="text-sm font-bold hover:opacity-80 transition"
            style={{ color: kGold }}>
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
        className="w-full h-[54px] pl-12 pr-12 rounded-xl text-[var(--color-fg)] text-sm outline-none transition-all placeholder:text-white/30"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-fg)' }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
        onBlur={e  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      />
      {suffix && <span className="absolute right-4 flex items-center">{suffix}</span>}
    </div>
  );
}

/* ── Password strength row ── */
function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: ok ? 'rgba(212,175,55,0.2)' : 'var(--color-border)' }}>
        {ok
          ? <Check size={10} color="#D4AF37" strokeWidth={3} />
          : <X     size={10} color="var(--color-fg-muted)" strokeWidth={3} />
        }
      </div>
      <span className="text-xs" style={{ color: ok ? '#D4AF37' : 'var(--color-fg-muted)' }}>
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
