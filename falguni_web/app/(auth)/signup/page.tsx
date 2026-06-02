'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createUserDoc = async (uid: string, name: string, emailAddr: string, phoneNum: string) => {
    await setDoc(doc(db, 'users', uid), {
      fullname: name,
      email: emailAddr,
      phone: phoneNum,
      wallet: 0,
      deliveryAddress: '',
      createdAt: serverTimestamp(),
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: fullname });
      await createUserDoc(user.uid, fullname, email, phone);
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
      await createUserDoc(user.uid, user.displayName ?? '', user.email ?? '', '');
      router.push('/');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--color-bg)] py-8">
      <Link href="/" className="mb-8 text-center">
        <p className="text-[var(--color-gold)] font-black text-3xl tracking-tight">Falguni</p>
        <p className="text-[var(--color-fg-muted)] text-sm">Gruh Udhyog</p>
      </Link>

      <div className="w-full max-w-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[var(--color-fg)] mb-1">Create Account</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mb-6">Join us to start shopping</p>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <Field label="Full Name" type="text" value={fullname} onChange={setFullname} placeholder="Your full name" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 XXXXXXXXXX" />
          <div>
            <label className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full px-3 py-2.5 pr-10 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] transition"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)]">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-brown-dark)] text-white font-bold rounded-2xl hover:bg-[var(--color-gold)] hover:text-black transition disabled:opacity-60 text-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-fg-muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3 flex items-center justify-center gap-2 border border-[var(--color-border)] rounded-2xl text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface)] transition disabled:opacity-60"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <p className="text-center text-sm text-[var(--color-fg-muted)] mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-gold)] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required
        className="w-full px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] transition"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
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
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
