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
        className="inline-flex items-center gap-4 bg-gradient-to-r from-white/[0.03] to-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:from-[#D4AF37]/10 hover:to-transparent transition-all rounded-full py-2 pl-2 pr-4 md:pr-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group max-w-full md:max-w-lg"
      >
        <div className="w-10 h-10 rounded-full bg-[#2B1B17] border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
          <MapPin size={16} className="text-[#D4AF37]" />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 py-1">
          <span className="text-[#D4AF37]/80 text-[8px] font-bold tracking-[0.2em] uppercase mb-0.5">
            {hasAddress ? "Delivering To" : "Delivery Location"}
          </span>
          <span className="text-white text-sm md:text-base font-serif truncate leading-tight group-hover:text-[#D4AF37] transition-colors">
            {hasAddress ? (
              <>{userDoc.HouseNumber ? `${userDoc.HouseNumber}, ` : ''}{userDoc.DeliveryAddress}</>
            ) : (
              "Tap to set your address"
            )}
          </span>
        </div>

        <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/20 transition-all ml-2">
          {hasAddress ? (
            <ChevronRight size={14} className="text-white/60 group-hover:text-[#D4AF37]" />
          ) : (
            <Plus size={14} className="text-[#D4AF37]" />
          )}
        </div>
      </Link>
    </div>
  );
}
