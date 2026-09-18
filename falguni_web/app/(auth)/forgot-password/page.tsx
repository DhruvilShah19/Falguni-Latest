'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail } from 'lucide-react';

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
    <div className="min-h-dvh w-full flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <div className="absolute top-6 left-4 md:left-6 z-10">
        <BackButton />
      </div>
      <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-3xl p-8 md:p-10 shadow-sm">

        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-serif font-bold text-[#2D1508] mb-2">Check your email</h1>
            <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
              We sent a password reset link to
            </p>
            <p className="text-sm font-bold mt-1 text-[#733617]">{email}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-8 w-full h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider transition bg-[#733617] text-white hover:bg-[#5C2B12] shadow-sm"
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 className="text-3xl font-serif font-bold text-[#2D1508] mb-1">Forgot Password?</h1>
            <p className="text-sm text-[var(--color-fg-muted)] mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              {/* Email field */}
              <div className="relative flex items-center">
                <span className="absolute left-4 pointer-events-none">
                  <Mail size={18} className="text-[#733617]" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full h-[50px] pl-11 pr-4 rounded-xl text-[#2D1508] text-sm outline-none transition-all placeholder:[var(--color-fg-muted)]/50 bg-[#FAF7F2] border border-[var(--color-border)] focus:border-[#733617] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 shadow-sm mt-2"
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
