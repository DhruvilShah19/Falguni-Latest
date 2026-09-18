'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, Eye, EyeOff, Apple } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
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
      console.error('Email login error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
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
      await signInWithPopup(auth, provider);
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
        <h1 className="text-3xl font-serif font-bold text-[#2D1508] mb-1">Welcome Back</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mb-8">
          Sign in to your Falguni account
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <AppField
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={setEmail}
            icon={<Mail size={18} className="text-[#733617]" />}
          />

          {/* Password */}
          <div className="relative">
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
          </div>

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <Link href="/forgot-password"
              className="text-xs font-bold text-[#733617] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] rounded-xl font-bold text-sm tracking-wider uppercase transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 shadow-sm mt-2"
          >
            {loading ? 'Signing in...' : 'LOGIN'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-fg-muted)] font-medium">Or continue with</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <div className="flex justify-center gap-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[#FAF7F2] hover:bg-white hover:border-[#733617]/30 transition shadow-sm disabled:opacity-40"
          >
            <GoogleIcon />
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={loading}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[#FAF7F2] hover:bg-white hover:border-[#733617]/30 transition shadow-sm disabled:opacity-40"
            title="Sign in with Apple"
          >
            <Apple size={22} className="text-[#2D1508]" />
          </button>
        </div>

        {/* Sign up */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <span className="text-sm text-[var(--color-fg-muted)]">
            Don&apos;t have an account?
          </span>
          <Link href="/signup"
            className="text-sm font-bold text-[#733617] hover:underline">
            Sign Up
          </Link>
        </div>

        {/* Guest */}
        <div className="flex justify-center mt-3">
          <Link href="/"
            className="text-xs text-[var(--color-fg-muted)] hover:text-[#2D1508] transition">
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
        className="w-full h-[50px] pl-11 pr-11 rounded-xl text-[#2D1508] text-sm outline-none transition-all placeholder:[var(--color-fg-muted)]/50 bg-[#FAF7F2] border border-[var(--color-border)] focus:border-[#733617] focus:bg-white"
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

function friendlyError(err: any): string {
  const code = typeof err === 'string' ? err : err?.code || '';
  const message = typeof err === 'object' ? err?.message : '';

  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/unauthorized-domain': `This deployment domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is not authorized in Firebase Console > Authentication > Settings > Authorized domains.`,
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console (Authentication > Sign-in method).',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled before completing.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email using a different sign-in method.',
  };

  if (map[code]) return map[code];
  if (message && !message.includes('Firebase:')) return message;
  return 'Something went wrong. Please try again.';
}
