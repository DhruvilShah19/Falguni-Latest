'use client';
import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(err.code === 'auth/user-not-found' ? 'No account found with this email.' : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--color-bg)]">
      <Link href="/" className="mb-8 text-center">
        <p className="text-[var(--color-gold)] font-black text-3xl tracking-tight">Falguni</p>
        <p className="text-[var(--color-fg-muted)] text-sm">Gruh Udhyog</p>
      </Link>

      <div className="w-full max-w-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm">
        <Link href="/login" className="flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-5 transition">
          <ChevronLeft size={15} /> Back to Sign In
        </Link>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-xl font-bold text-[var(--color-fg)] mb-2">Check your email</h1>
            <p className="text-sm text-[var(--color-fg-muted)]">
              We sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[var(--color-fg)] mb-1">Forgot Password?</h1>
            <p className="text-sm text-[var(--color-fg-muted)] mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="w-full px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--color-brown-dark)] text-white font-bold rounded-2xl hover:bg-[var(--color-gold)] hover:text-black transition disabled:opacity-60 text-sm"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
