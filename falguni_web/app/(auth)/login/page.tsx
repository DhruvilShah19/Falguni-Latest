'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, Eye, EyeOff, Apple } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

const kGold = 'var(--color-gold)';
const kBgTop = 'var(--color-bg)';
const kBgMid = 'var(--color-bg)';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleApple = async () => {
    setLoading(true); setError('');
    try {
      await signInWithPopup(auth, new OAuthProvider('apple.com'));
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center px-6 py-10"
      style={{ background: `linear-gradient(180deg, ${kBgTop} 0%, ${kBgMid} 50%, ${kBgTop} 100%)` }}
    >
      <div className="absolute top-6 left-4 md:left-6 z-10">
        <BackButton />
      </div>
      <div className="w-full max-w-sm">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[var(--color-fg)] mb-2">Welcome Back</h1>
        <p className="text-base mb-10" style={{ color: 'var(--color-fg-muted)' }}>
          Sign in to continue
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 border border-red-500/30"
            style={{ background: 'rgba(255,80,80,0.08)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email */}
          <AppField
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            icon={<Mail size={20} color={kGold} />}
          />

          {/* Password */}
          <div className="relative">
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
          </div>

          {/* Forgot password */}
          <div className="flex justify-end -mt-2">
            <Link href="/forgot-password"
              className="text-sm font-semibold hover:opacity-80 transition"
              style={{ color: kGold }}>
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] rounded-xl font-bold text-base tracking-widest uppercase transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: kGold, color: kBgTop, letterSpacing: '0.1em' }}
          >
            {loading ? 'Signing in...' : 'LOGIN'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        <div className="flex justify-center gap-6">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-14 h-14 rounded-full flex items-center justify-center border transition hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <GoogleIcon />
          </button>

          {/* Apple */}
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

        {/* Sign up */}
        <div className="flex items-center justify-center gap-1 mt-10">
          <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            Don&apos;t have an account?
          </span>
          <Link href="/signup"
            className="text-sm font-bold hover:opacity-80 transition"
            style={{ color: kGold }}>
            Sign Up
          </Link>
        </div>

        {/* Guest */}
        <div className="flex justify-center mt-3">
          <Link href="/"
            className="text-sm hover:opacity-70 transition"
            style={{ color: 'var(--color-fg-muted)' }}>
            Continue as Guest
          </Link>
        </div>

      </div>
    </div>
  );
}

/* ── Shared input component ── */
function AppField({
  type, placeholder, value, onChange, icon, suffix,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 pointer-events-none flex items-center">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full h-[54px] pl-12 pr-12 rounded-xl text-[var(--color-fg)] text-sm outline-none transition-all placeholder:text-white/30"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--color-fg)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
        onBlur={e  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        // Placeholder color via inline CSS var trick not possible — handled globally below
      />
      {suffix && (
        <span className="absolute right-4 flex items-center">{suffix}</span>
      )}
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
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password.',
    'auth/invalid-credential':  'Invalid email or password.',
    'auth/too-many-requests':   'Too many attempts. Try again later.',
    'auth/invalid-email':       'Please enter a valid email.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
