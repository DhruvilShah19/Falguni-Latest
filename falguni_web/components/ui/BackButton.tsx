'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label, className = '' }: BackButtonProps) {
  const router = useRouter();

  const baseClass = label
    ? `pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all group text-xs font-semibold ${className}`
    : `pointer-events-auto inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all group ${className}`;

  const icon = (
    <>
      <ArrowLeft size={18} className="md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
      {label && <span>{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {icon}
      </Link>
    );
  }

  return (
    <button onClick={() => router.back()} className={baseClass}>
      {icon}
    </button>
  );
}
