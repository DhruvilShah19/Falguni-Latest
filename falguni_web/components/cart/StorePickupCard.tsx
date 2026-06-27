'use client';

import React from 'react';
import { MapPin, Clock, Navigation, ShieldCheck } from 'lucide-react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';

const GOOGLE_API_KEY = 'AIzaSyCIG4hrwrTleFvlUvNuf9fD3PEqUH3Q2dI';
const libraries: ("places")[] = ["places"];

const STUDIO_FALGUNI_LATLNG = { lat: 23.0360, lng: 72.5294 }; // Falguni Gruh Udhyog (Vastrapur)

export default function StorePickupCard() {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries });

  return (
    <div className="mt-5 animate-fade-up">
      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[20px] md:rounded-[24px] p-4 md:p-6 backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all">
        
        {/* Left: Map Box (50%) */}
        <div className="w-full h-48 md:h-auto md:min-h-[200px] rounded-[14px] overflow-hidden relative border border-white/5 bg-black shadow-inner group">
          <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none mix-blend-overlay z-10" />
          
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ 
                width: '100%', 
                height: '100%',
                filter: 'invert(90%) hue-rotate(180deg) contrast(85%) grayscale(20%)'
              }}
              center={STUDIO_FALGUNI_LATLNG}
              zoom={15}
              options={{
                disableDefaultUI: true,
                gestureHandling: 'cooperative',
                backgroundColor: '#000000',
              }}
            >
              <MarkerF position={STUDIO_FALGUNI_LATLNG} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-white/5 animate-pulse" />
          )}

          {/* Soft vignette around the map */}
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-10" />
          
          {/* Open in Maps Overlay */}
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${STUDIO_FALGUNI_LATLNG.lat},${STUDIO_FALGUNI_LATLNG.lng}`}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm z-20"
          >
            <div className="bg-[#D4AF37] text-[#1A110D] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Navigation size={16} /> Get Directions
            </div>
          </a>
        </div>

        {/* Right: Info Box (50%) */}
        <div className="w-full flex flex-col justify-center py-2 md:py-4">
          
          <div className="flex flex-col gap-1 mb-5">
            <span className="inline-block w-max text-[#D4AF37] font-black text-[10px] uppercase tracking-widest bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2.5 py-1 rounded-md mb-2 shadow-sm">
              Free In-Store Pickup
            </span>
            <p className="text-white/50 text-xs md:text-sm font-medium leading-relaxed pr-4 mt-2">
              Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad, Gujarat 380015, India
            </p>
          </div>

          {/* Minimal metrics row */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
              <div className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><Clock size={10} /> Hours</div>
              <div className="text-white font-medium text-[10px] md:text-xs">9:00 AM - 9:00 PM<br/>(Everyday)</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
              <div className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><ShieldCheck size={10} /> Handover</div>
              <div className="text-white font-medium text-[10px] md:text-xs">No wait lines.<br/>Direct handover.</div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

          <div className="flex items-end justify-between mt-4">
             <div className="flex flex-col">
               <span className="text-white/40 font-bold text-[9px] uppercase tracking-widest mb-1">Status</span>
               <span className="text-green-400 font-bold text-xs flex items-center gap-1"><ShieldCheck size={12} /> Ready for Pickup</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-white/40 font-bold text-[9px] uppercase tracking-widest mb-1">Pickup Fee</span>
               <span className="text-[#D4AF37] font-black text-xl">FREE</span>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
