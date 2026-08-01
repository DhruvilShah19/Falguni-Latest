'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Navigation, Search, Check, ArrowLeft, MapPin, LocateFixed, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useJsApiLoader } from '@react-google-maps/api';

// Single source of truth in .env.local (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const libraries: ('places')[] = ['places'];

export default function AddAddressPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();

  const [address, setAddress]             = useState('');
  const [houseNumber, setHouseNumber]     = useState('');
  const [closestBusStop, setClosestBusStop] = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [error, setError]                 = useState('');

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries });

  // ── New Places API (AutocompleteSuggestion) with session tokens ──
  // Bundles a whole typing session into ONE cheap "Place Details" charge
  // when it ends in a selection, instead of billing every keystroke's
  // Autocomplete request separately like the old AutocompleteService did.
  // The terminating call also returns lat/lng directly, so no separate
  // Geocoding API call is needed for a selected suggestion.
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  };

  useEffect(() => { if (!loading && !firebaseUser) router.push('/login'); }, [firebaseUser, loading, router]);

  const handleInputChange = (val: string) => {
    setValue(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      if (!isLoaded || !val) { setSuggestions([]); return; }
      try {
        const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: val,
          sessionToken: getSessionToken(),
          includedRegionCodes: ['in'],
        });
        setSuggestions(results.filter(s => s.placePrediction));
      } catch (e) {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    setValue(prediction.text.text);
    setSuggestions([]);
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress'], sessionToken: sessionTokenRef.current ?? undefined });
      // Session complete -- start a fresh one for the next search.
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      setAddress(place.formattedAddress ?? prediction.text.text);
    } catch (e) {
      // Ignore errors silently instead of breaking UI
    }
  };

  // "Locate Me" -- a single one-shot reverse-geocode of the device's current
  // position, rather than a live draggable map. No map means no per-pixel
  // idle events and no continuous Geocoding cost; this is one bounded call
  // per explicit button press.
  const handleLocateMe = () => {
    if (!navigator.geolocation || !isLoaded) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingAddress(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        new google.maps.Geocoder().geocode({ location: loc }, (results, status) => {
          setIsLoadingAddress(false);
          if (status === 'OK' && results?.[0]) {
            setAddress(results[0].formatted_address);
            setValue(results[0].formatted_address);
          } else {
            setError('Could not resolve your current location to an address.');
          }
        });
      },
      () => {
        setIsLoadingAddress(false);
        alert('Unable to retrieve your location. Please check browser permissions.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDoc?.uid) return;
    if (!address) { setError('Please search for and select your delivery address first.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const generatedId = address + houseNumber + closestBusStop;
      const newAddress = { Addresses: address, houseNumber, closestbusStop: closestBusStop, id: generatedId };
      await addDoc(collection(db, 'users', userDoc.uid, 'DeliveryAddress'), newAddress);
      await updateDoc(doc(db, 'users', userDoc.uid), {
        DeliveryAddress: address, HouseNumber: houseNumber,
        ClosestBustStop: closestBusStop, DeliveryAddressID: generatedId,
      });
      router.push('/profile/addresses');
    } catch (err: any) {
      setError('Failed to save address. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading || !firebaseUser || !isLoaded) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#2B1B17' }}>
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

        {/* ── Header ── */}
        <div className="px-5 pt-28 md:pt-36 pb-6 relative z-10 max-w-4xl mx-auto w-full">
          <Link href="/profile/addresses"
            className="inline-flex items-center gap-2 mb-6 group transition-colors"
            style={{ color: 'rgba(212,175,55,0.7)' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(212,175,55,0.7)'}
          >
            <ArrowLeft size={15} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Back</span>
          </Link>

          <h1 className="font-serif text-3xl leading-tight mb-1 text-white">Add Address</h1>
          <p className="text-sm" style={{ color: '#9A8878' }}>Search for your delivery address</p>
        </div>

        <div className="px-5 flex flex-col gap-6 relative z-10 max-w-4xl mx-auto w-full">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 leading-snug">{error}</p>
            </div>
          )}

          {/* ── Search ── */}
          <div className="relative z-50">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={value}
                  onChange={e => handleInputChange(e.target.value)}
                  disabled={!isLoaded}
                  placeholder="Search area, street or landmark…"
                  className="w-full text-sm text-white outline-none transition-all placeholder:text-white/30 shadow-lg"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: 16,
                    padding: '14px 14px 14px 42px',
                  }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.7)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.3)'}
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4AF37]" />
              </div>

              {/* Locate Me -- one-shot reverse geocode, no live map needed */}
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={!isLoaded || isLoadingAddress}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-black shadow-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F0CF6B 50%, #B8952A 100%)' }}
                title="Use my current location"
              >
                <LocateFixed size={18} />
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl"
                style={{
                  background: 'rgba(50,30,18,0.98)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {suggestions.map(suggestion => (
                  <li key={suggestion.placePrediction!.placeId} onClick={() => handleSelect(suggestion)}
                    className="flex items-start gap-3 cursor-pointer transition-all px-4 py-3.5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLLIElement).style.background = 'rgba(212,175,55,0.07)'}
                    onMouseLeave={e => (e.currentTarget as HTMLLIElement).style.background = 'transparent'}
                  >
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <span className="text-sm leading-snug" style={{ color: '#F0EDE8' }}>
                      {suggestion.placePrediction!.text.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Pinned Address Display ── */}
          <div className="rounded-2xl overflow-hidden p-4"
            style={{
              border: address ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: address ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: address ? '#D4AF37' : '#9A8878' }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: address ? '#D4AF37' : '#9A8878' }}>
                  {address ? 'Delivery Location' : 'No address selected'}
                </span>
              </div>
              {isLoadingAddress && <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin border-[#D4AF37]/30 border-t-[#D4AF37]" />}
            </div>
            {address ? (
              <p className="text-[15px] font-medium leading-relaxed text-[#F0EDE8]">{address}</p>
            ) : (
              <p className="text-sm italic text-[#9A8878]">Search above or tap the locate button to set your delivery address.</p>
            )}
          </div>

          {/* ── Form Fields ── */}
          <form id="address-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="House / Flat No." value={houseNumber} onChange={setHouseNumber} placeholder="e.g. Apt 4B, House 23" required />
            <FormField label="Zip Code / Landmark" value={closestBusStop} onChange={setClosestBusStop} placeholder="e.g. Near Bus Stand" required />
          </form>

          {/* ── Save Button ── */}
          <button
            form="address-form"
            type="submit"
            disabled={isSubmitting || !address}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold tracking-[0.2em] uppercase text-sm transition-all disabled:opacity-40 mt-4"
            style={{
              padding: '16px 0',
              background: 'linear-gradient(135deg, #D4AF37 0%, #F0CF6B 50%, #B8952A 100%)',
              color: '#2B1B17',
              boxShadow: (!isSubmitting && address) ? '0 8px 24px rgba(212,175,55,0.35)' : 'none',
            }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 rounded-full border-2 animate-spin border-black/20 border-t-black" />
            ) : (
              <><Check size={16} strokeWidth={2.5} /> Save Address</>
            )}
          </button>

        </div>
      </div>
    </PageShell>
  );
}

/* ── Shared small components ── */

function FieldLabel({ label }: { label: string }) {
  return <p className="text-xs text-white/40 mb-1.5">{label}</p>;
}

function FormField({ label, value, onChange, placeholder, required }: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <input
        type="text"
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-white outline-none transition-all placeholder:text-white/30"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 14,
          padding: '12px 14px',
        }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.55)'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.2)'}
      />
    </div>
  );
}
