'use client';

import React, { useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { MapPin, Search, Loader2, Navigation, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

// Single source of truth in .env.local (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
// Note: NEXT_PUBLIC_ vars still ship in the client bundle -- this only
// centralizes the key for easier rotation, it does not hide it. Actual
// protection is the HTTP referrer restriction set on the key in Cloud Console.
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const libraries: ('places')[] = ['places'];

// ── Helper to calculate distance locally (Haversine formula) ──
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Studio Falguni Location
const STUDIO_FALGUNI_LATLNG = { lat: 23.0360, lng: 72.5294 }; // Falguni Gruh Udhyog (Vastrapur)

export type DeliveryTier = 'Hyperlocal' | 'Intercity' | 'Interstate' | 'PAN India';

export interface DeliveryDetails {
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  distanceText: string;
  durationText: string;
  durationSeconds: number;
  fee: number;
  tier: DeliveryTier;
}

interface DeliveryAddressInputProps {
  onDeliveryCalculated: (details: DeliveryDetails | null) => void;
  defaultAddress?: string;
}

export default function DeliveryAddressInput({ onDeliveryCalculated, defaultAddress }: DeliveryAddressInputProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries });
  const { subTotal, items, totalWeightKg } = useCartStore(); // select items to force re-render when cart changes
  const cartSubTotal = subTotal();
  const weight = totalWeightKg();
  
  const { ready, value, suggestions: { status, data }, setValue, clearSuggestions, init } =
    usePlacesAutocomplete({ requestOptions: { componentRestrictions: { country: 'in' } }, debounce: 300, initOnMount: false });

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [activeDetails, setActiveDetails] = useState<DeliveryDetails | null>(null);

  const hasAutoCalculatedRef = React.useRef(false);

  useEffect(() => {
    if (isLoaded) init();
  }, [isLoaded, init]);

  const calculateForAddressString = async (addressString: string) => {
    setCalculating(true);
    setError('');

    try {
      const results = await getGeocode({ address: addressString });
      const { lat, lng } = await getLatLng(results[0]);

      const distanceKm = getDistanceFromLatLonInKm(STUDIO_FALGUNI_LATLNG.lat, STUDIO_FALGUNI_LATLNG.lng, lat, lng);
      
      const distanceText = `${distanceKm.toFixed(1)} km`;
      const durationSeconds = distanceKm * 150; // Estimate 2.5 minutes per km driving in city traffic
      const durationText = `${Math.round(durationSeconds / 60)} mins`;

      // Determine Tier and Fee
      let fee = 0;
      let tier: DeliveryTier = 'Hyperlocal';

      if (distanceKm <= 5) {
        tier = 'Hyperlocal';
        fee = (cartSubTotal >= 400) ? 0 : 50;
      } else if (distanceKm <= 10) {
        tier = 'Intercity';
        fee = (cartSubTotal >= 1200) ? 0 : 100;
      } else if (distanceKm <= 15) {
        tier = 'Interstate';
        fee = (cartSubTotal >= 1800) ? 0 : 150;
      } else {
        const isGujarat = addressString.toLowerCase().includes('gujarat');
        if (isGujarat) {
          tier = 'Intercity';
          fee = (cartSubTotal >= 2000) ? 0 : Math.ceil(weight) * 40;
        } else {
          tier = 'PAN India';
          fee = (cartSubTotal >= 3500) ? 0 : Math.ceil(weight) * 100;
        }
      }

      const details: DeliveryDetails = {
        address: addressString,
        lat,
        lng,
        distanceKm,
        distanceText,
        durationText,
        durationSeconds,
        fee,
        tier
      };

      setCalculating(false);
      setActiveDetails(details);
      onDeliveryCalculated(details);

    } catch (err) {
      console.error("Error formatting address: ", err);
      setError('Failed to locate address.');
      setCalculating(false);
      onDeliveryCalculated(null);
      setActiveDetails(null);
    }
  };

  // Recalculate fee dynamically if cart subtotal changes while an address is selected
  useEffect(() => {
    if (activeDetails) {
      const distanceKm = activeDetails.distanceKm;
      let newFee = 0;
      let newTier = activeDetails.tier;

      if (distanceKm <= 5) {
        newTier = 'Hyperlocal';
        newFee = (cartSubTotal >= 400) ? 0 : 50;
      } else if (distanceKm <= 10) {
        newTier = 'Intercity';
        newFee = (cartSubTotal >= 1200) ? 0 : 100;
      } else if (distanceKm <= 15) {
        newTier = 'Interstate';
        newFee = (cartSubTotal >= 1800) ? 0 : 150;
      } else {
        const isGujarat = activeDetails.address.toLowerCase().includes('gujarat');
        if (isGujarat) {
          newTier = 'Intercity';
          newFee = (cartSubTotal >= 2000) ? 0 : Math.ceil(weight) * 40;
        } else {
          newTier = 'PAN India';
          newFee = (cartSubTotal >= 3500) ? 0 : Math.ceil(weight) * 100;
        }
      }

      if (activeDetails.fee !== newFee) {
        const updatedDetails = { ...activeDetails, fee: newFee, tier: newTier };
        setActiveDetails(updatedDetails);
        onDeliveryCalculated(updatedDetails);
      }
    }
  }, [cartSubTotal]);

  // Pre-fill default address (if exists from user profile)
  // and automatically calculate it so the user doesn't have to search again.
  useEffect(() => {
    if (isLoaded && defaultAddress && !hasAutoCalculatedRef.current) {
      hasAutoCalculatedRef.current = true;
      setValue(defaultAddress, false);
      calculateForAddressString(defaultAddress);
    }
  }, [isLoaded, defaultAddress]);

  const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    setValue(suggestion.description, false);
    clearSuggestions();
    await calculateForAddressString(suggestion.description);
  };

  if (!isLoaded) return <div className="animate-pulse h-12 bg-white/5 rounded-xl" />;

  return (
    <div className="w-full mt-4 bg-black/20 border border-[#D4AF37]/20 p-4 md:p-6 rounded-[20px] shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
      
      <h3 className="text-[#D4AF37] font-bold text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
        <Navigation size={16} /> Delivery Destination
      </h3>

      <div className="relative z-10">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (activeDetails) {
                setActiveDetails(null);
                onDeliveryCalculated(null);
              }
            }}
            disabled={!ready || calculating}
            placeholder="Search your delivery address..."
            className="w-full bg-white/[0.03] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl py-3 md:py-4 pl-11 pr-4 text-white text-sm outline-none transition-colors"
          />
          {calculating && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] animate-spin" />}
        </div>

        {/* Dropdown Suggestions */}
        {status === "OK" && (
          <ul className="absolute z-50 w-full mt-2 bg-[#2B1B17] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
            {data.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-white/5 last:border-0 flex items-start gap-3 transition-colors"
              >
                <MapPin size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-xs md:text-sm leading-snug">{suggestion.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

                                    {/* Result Display */}
      {activeDetails && (
        <div className="mt-5 animate-fade-up">
          <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[20px] md:rounded-[24px] p-4 md:p-6 backdrop-blur-sm flex flex-col items-center transition-all">
            
            {/* Info Box (Full Width) */}
            <div className="w-full max-w-lg flex flex-col justify-center py-2 md:py-4 mx-auto">
              
              <div className="flex flex-col gap-1 mb-5">
                <span className="inline-block w-max text-[#D4AF37] font-black text-[10px] uppercase tracking-widest bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2.5 py-1 rounded-md mb-2 shadow-sm">
                  {activeDetails.tier} Delivery
                </span>
                <p className="text-white/50 text-xs md:text-sm font-medium leading-relaxed pr-4 mt-2">
                  {activeDetails.address}
                </p>
              </div>

              {/* Minimal metrics row */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                  <div className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><Navigation size={10} /> Distance</div>
                  <div className="text-white font-medium text-xs">{activeDetails.distanceText}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                  <div className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><Clock size={10} /> ETA</div>
                  <div className="text-white font-medium text-xs">
                    {activeDetails.tier === 'Hyperlocal' ? `~${Math.round((activeDetails.durationSeconds / 60) + 30)} mins` :
                     activeDetails.tier === 'Intercity' ? `~${Math.max(1, Math.round((activeDetails.durationSeconds / 3600) + 1))} hrs` :
                     '2-3 Days'}
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

              <div className="flex items-end justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Delivery Fee</span>
                  <div className="flex items-center gap-2 text-green-400/80">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Safe Pack</span>
                  </div>
                </div>
                
                {activeDetails.fee === 0 ? (
                  <span className="text-green-400 font-black text-2xl tracking-tight uppercase drop-shadow-md">Free</span>
                ) : (
                  <span className="text-[#D4AF37] font-black text-2xl tracking-tight drop-shadow-md">₹{activeDetails.fee}</span>
                )}
              </div>

              {/* Premium Free Shipping Call to Action */}
              <div className="mt-5 bg-[#1A110D]/90 border border-[#D4AF37]/30 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group shadow-[0_4px_20px_rgba(212,175,55,0.08)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {activeDetails.fee === 0 ? (
                  <div className="flex items-center gap-3 text-[#D4AF37] z-10 relative">
                    <CheckCircle2 size={20} className="flex-shrink-0 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] text-[#F2D06B]" />
                    <span className="text-sm font-black uppercase tracking-widest text-[#F2D06B]">You've unlocked Free Delivery!</span>
                  </div>
                ) : (
                  <div className="z-10 relative">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
                      <span className="text-white/90 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                        <div className="flex-1">
                          Add <span className="text-[#F2D06B] font-black tracking-wide drop-shadow-sm">₹{Math.max(0, (activeDetails.tier === 'Hyperlocal' ? 100 : activeDetails.tier === 'Intercity' ? 500 : activeDetails.tier === 'Interstate' ? 2000 : 5000) - cartSubTotal).toFixed(2)}</span> more for Free Delivery
                        </div>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#1A110D] h-2.5 rounded-full overflow-hidden mt-2 border border-white/5 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.6)] transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${Math.min(100, (cartSubTotal / (activeDetails.tier === 'Hyperlocal' ? 100 : activeDetails.tier === 'Intercity' ? 500 : activeDetails.tier === 'Interstate' ? 2000 : 5000)) * 100)}%` 
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
