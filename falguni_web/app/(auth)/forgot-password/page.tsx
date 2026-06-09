'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, ChevronLeft } from 'lucide-react';

const kGold  = 'var(--color-gold)';
const kBgTop = 'var(--color-bg)';
const kBgMid = 'var(--color-bg)';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center px-6"
      style={{ background: `linear-gradient(180deg, ${kBgTop} 0%, ${kBgMid} 50%, ${kBgTop} 100%)` }}
    >
      <div className="w-full max-w-sm">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full mb-8 hover:opacity-70 transition text-[var(--color-fg)]"
        >
          <ChevronLeft size={22} />
        </button>

        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="text-6xl mb-5">📧</div>
            <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-3">Check your email</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg-muted)' }}>
              We sent a password reset link to
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: kGold }}>{email}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-10 w-full h-[50px] rounded-xl font-bold text-base uppercase tracking-wider transition hover:opacity-90"
              style={{ background: kGold, color: kBgTop }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 className="text-3xl font-bold text-[var(--color-fg)] mb-2">Forgot Password?</h1>
            <p className="text-base mb-10" style={{ color: 'var(--color-fg-muted)' }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 border border-red-500/30"
                style={{ background: 'rgba(255,80,80,0.08)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-5">
              {/* Email field */}
              <div className="relative flex items-center">
                <span className="absolute left-4 pointer-events-none">
                  <Mail size={20} color={kGold} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full h-[54px] pl-12 pr-4 rounded-xl text-[var(--color-fg)] text-sm outline-none transition-all"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = kGold; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-xl font-bold text-base uppercase tracking-wider transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: kGold, color: kBgTop, letterSpacing: '0.08em' }}
              >
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
