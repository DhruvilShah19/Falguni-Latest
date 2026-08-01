'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Search, Loader2, Navigation, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import {
  STUDIO_FALGUNI_LATLNG,
  getRoadDistanceEstimateKm,
  calculateDeliveryFee,
  getFreeDeliveryThreshold,
  type DeliveryTier,
  type DeliveryDetails,
} from '@/lib/deliveryPricing';

// Re-exported so existing imports of `DeliveryDetails`/`DeliveryTier` from
// this component file keep working -- the canonical definitions now live in
// @/lib/deliveryPricing, shared with the cart store and the server order route.
export type { DeliveryTier, DeliveryDetails };

// Single source of truth in .env.local (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
// Note: NEXT_PUBLIC_ vars still ship in the client bundle -- this only
// centralizes the key for easier rotation, it does not hide it. Actual
// protection is the HTTP referrer restriction set on the key in Cloud Console.
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const libraries: ('places')[] = ['places'];

interface DeliveryAddressInputProps {
  onDeliveryCalculated: (details: DeliveryDetails | null) => void;
  defaultAddress?: string;
}

export default function DeliveryAddressInput({ onDeliveryCalculated, defaultAddress }: DeliveryAddressInputProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries });
  const { subTotal, items, totalWeightKg } = useCartStore(); // select items to force re-render when cart changes
  const cartSubTotal = subTotal();
  const weight = totalWeightKg();

  // ── New Places API (AutocompleteSuggestion) with session tokens ──
  // Google bills a whole typing session as ONE cheap "Place Details" call
  // when it ends in a selection, instead of billing every keystroke's
  // Autocomplete request separately like the old AutocompleteService did.
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [activeDetails, setActiveDetails] = useState<DeliveryDetails | null>(null);

  const hasAutoCalculatedRef = React.useRef(false);

  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  };

  const fetchSuggestions = async (input: string) => {
    if (!isLoaded || !input) {
      setSuggestions([]);
      return;
    }
    try {
      const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: getSessionToken(),
        includedRegionCodes: ['in'],
      });
      setSuggestions(results.filter((s) => s.placePrediction));
    } catch (err) {
      console.error('Autocomplete error: ', err);
      setSuggestions([]);
    }
  };

  const computeDeliveryDetails = (addressString: string, lat: number, lng: number) => {
    const distanceKm = getRoadDistanceEstimateKm(STUDIO_FALGUNI_LATLNG.lat, STUDIO_FALGUNI_LATLNG.lng, lat, lng);

    const distanceText = `${distanceKm.toFixed(1)} km`;
    const durationSeconds = distanceKm * 150; // Estimate 2.5 minutes per km driving in city traffic
    const durationText = `${Math.round(durationSeconds / 60)} mins`;

    const { tier, fee } = calculateDeliveryFee(distanceKm, addressString, cartSubTotal, weight);

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
  };

  // Recalculate fee dynamically if cart subtotal changes while an address is selected
  useEffect(() => {
    if (activeDetails) {
      const { tier: newTier, fee: newFee } = calculateDeliveryFee(activeDetails.distanceKm, activeDetails.address, cartSubTotal, weight);
      if (activeDetails.fee !== newFee) {
        const updatedDetails = { ...activeDetails, fee: newFee, tier: newTier };
        setActiveDetails(updatedDetails);
        onDeliveryCalculated(updatedDetails);
      }
    }
  }, [cartSubTotal]);

  // Pre-fill default address (if exists from user profile) and automatically
  // calculate it so the user doesn't have to search again. This is a single,
  // one-off lookup (not a typing session), so it uses the plain Geocoding
  // API directly rather than spinning up an Autocomplete session for it --
  // cheaper and simpler for a lookup that isn't interactive.
  useEffect(() => {
    if (isLoaded && defaultAddress && !hasAutoCalculatedRef.current) {
      hasAutoCalculatedRef.current = true;
      setValue(defaultAddress);
      setCalculating(true);
      setError('');
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: defaultAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          computeDeliveryDetails(defaultAddress, loc.lat(), loc.lng());
        } else {
          setCalculating(false);
          setError('Failed to locate address.');
          onDeliveryCalculated(null);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, defaultAddress]);

  const handleInputChange = (val: string) => {
    setValue(val);
    if (activeDetails) {
      setActiveDetails(null);
      onDeliveryCalculated(null);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;

    setValue(prediction.text.text);
    setSuggestions([]);
    setCalculating(true);
    setError('');

    try {
      const place = prediction.toPlace();
      // Passing the session token here is what terminates the session at
      // the cheap "Place Details Essentials" tier and bundles every
      // keystroke's Autocomplete request into that one charge.
      await place.fetchFields({ fields: ['formattedAddress', 'location'], sessionToken: sessionTokenRef.current ?? undefined });
      // Session is done -- start a fresh one for the next search.
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

      const lat = place.location?.lat();
      const lng = place.location?.lng();
      const addressString = place.formattedAddress ?? prediction.text.text;

      if (lat == null || lng == null) throw new Error('Place has no location');
      computeDeliveryDetails(addressString, lat, lng);
    } catch (err) {
      console.error('Error resolving place: ', err);
      setError('Failed to locate address.');
      setCalculating(false);
      onDeliveryCalculated(null);
      setActiveDetails(null);
    }
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
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={calculating}
            placeholder="Search your delivery address..."
            className="w-full bg-white/[0.03] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl py-3 md:py-4 pl-11 pr-4 text-white text-sm outline-none transition-colors"
          />
          {calculating && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] animate-spin" />}
        </div>

        {/* Dropdown Suggestions */}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-2 bg-[#2B1B17] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.placePrediction!.placeId}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-white/5 last:border-0 flex items-start gap-3 transition-colors"
              >
                <MapPin size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-xs md:text-sm leading-snug">{suggestion.placePrediction!.text.text}</span>
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
                {activeDetails.tier === 'Hyperlocal' && (
                  <span className="inline-flex items-center gap-1.5 text-white/60 text-[10px] md:text-xs font-medium">
                    <Clock size={11} className="text-[#D4AF37]/70 flex-shrink-0" />
                    Delivery hours: 11 AM – 8 PM
                  </span>
                )}
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
                          Add <span className="text-[#F2D06B] font-black tracking-wide drop-shadow-sm">₹{Math.max(0, getFreeDeliveryThreshold(activeDetails.tier) - cartSubTotal).toFixed(2)}</span> more for Free Delivery
                        </div>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#1A110D] h-2.5 rounded-full overflow-hidden mt-2 border border-white/5 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.6)] transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, (cartSubTotal / getFreeDeliveryThreshold(activeDetails.tier)) * 100)}%`
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
