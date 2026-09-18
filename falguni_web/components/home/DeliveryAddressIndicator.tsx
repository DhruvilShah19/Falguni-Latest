'use client';

import Link from 'next/link';
import { MapPin, ChevronRight, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function DeliveryAddressIndicator() {
  const { userDoc, loading, firebaseUser } = useAuthStore();

  // If still checking auth state, show a subtle pulse skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-5 pt-4 md:pt-6 mb-2">
        <div className="h-14 w-full md:w-80 rounded-full bg-white/[0.02] border border-white/5 animate-pulse" />
      </div>
    );
  }

  // If not logged in, we prompt them to set location (which will route them to login)
  const hasAddress = userDoc && userDoc.DeliveryAddress;
  const href = firebaseUser 
    ? (hasAddress ? "/profile/addresses" : "/profile/addresses/add")
    : "/login";
  
  return (
    <div className="max-w-7xl mx-auto w-full px-5 pt-4 md:pt-6 mb-2 animate-fade-in">
      <Link 
        href={href}
        className="inline-flex items-center gap-3.5 bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all rounded-full py-1.5 pl-2 pr-4 md:pr-5 shadow-xs group max-w-full md:max-w-lg"
      >
        <div className="w-9 h-9 rounded-full bg-[#F5EBE1] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)] transition-colors">
          <MapPin size={15} className="text-[var(--color-primary)] group-hover:text-white transition-colors" />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 py-0.5">
          <span className="text-[var(--color-primary)] text-[9px] font-bold tracking-wider uppercase">
            {hasAddress ? "Delivering To" : "Delivery Location"}
          </span>
          <span className="text-[var(--color-fg)] text-xs md:text-sm font-medium truncate leading-tight group-hover:text-[var(--color-primary)] transition-colors">
            {hasAddress ? (
              <>{userDoc.HouseNumber ? `${userDoc.HouseNumber}, ` : ''}{userDoc.DeliveryAddress}</>
            ) : (
              "Tap to set your address"
            )}
          </span>
        </div>

        <div className="w-6 h-6 rounded-full bg-[#F5EBE1] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)] transition-colors ml-1">
          {hasAddress ? (
            <ChevronRight size={13} className="text-[var(--color-fg-muted)] group-hover:text-white transition-colors" />
          ) : (
            <Plus size={13} className="text-[var(--color-primary)] group-hover:text-white transition-colors" />
          )}
        </div>
      </Link>
    </div>
  );
}
