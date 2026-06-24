'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Compass, Crosshair, Navigation, Search, Check, Save, ArrowLeft, Building2, MapPin, Map as MapIcon, Type, Phone, Home, Plus, Minus, LocateFixed, AlertCircle } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import Link from 'next/link';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const GOOGLE_API_KEY = 'AIzaSyCIG4hrwrTleFvlUvNuf9fD3PEqUH3Q2dI';
const libraries: ('places' | 'geometry' | 'drawing' | 'visualization')[] = ['places'];
const placesRequestOptions = { componentRestrictions: { country: 'in' } };

// ── Premium 3D-optimised map style — warm cream base, gold accents ──
// Tuned for tilt/45° 3D view: buildings get a distinct warm fill so they
// read clearly when extruded; roads are crisp white; water is champagne.
const goldenMapStyle = [
  // Base land
  { elementType: 'geometry',           stylers: [{ color: '#F2ECE0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F2ECE0' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#2B1B17' }] },

  // City/locality names → gold
  { featureType: 'administrative.locality',
    elementType: 'labels.text.fill', stylers: [{ color: '#C9A227' }] },
  { featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill', stylers: [{ color: '#9A8878' }] },

  // Hide clutter
  { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road',    elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  // Roads
  { featureType: 'road',          elementType: 'geometry',        stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road',          elementType: 'geometry.stroke', stylers: [{ color: '#E0CFBA' }] },
  { featureType: 'road',          elementType: 'labels.text.fill',stylers: [{ color: '#7A5C20' }] },
  { featureType: 'road.arterial', elementType: 'geometry',        stylers: [{ color: '#F8F2E8' }] },

  // Highways → signature gold
  { featureType: 'road.highway', elementType: 'geometry',         stylers: [{ color: '#D4AF37' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke',  stylers: [{ color: '#A88520' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#B8952A' }] },

  // Water — champagne
  { featureType: 'water', elementType: 'geometry',             stylers: [{ color: '#DDD0BC' }] },
  { featureType: 'water', elementType: 'labels.text.fill',     stylers: [{ color: '#C9A227' }] },
  { featureType: 'water', elementType: 'labels.text.stroke',   stylers: [{ color: '#DDD0BC' }] },

  // Natural landscape — slightly greener-cream
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#EBE5D5' }] },

  // ── 3D BUILDINGS — warm tan so they extrude visually ──
  // When tilt is active, Google renders building footprints as 3D blocks;
  // landscape.man_made controls their face colour.
  { featureType: 'landscape.man_made', elementType: 'geometry.fill',   stylers: [{ color: '#E0D5C2' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke',  stylers: [{ color: '#C9A227', lightness: 60 }] },
];

const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad

export default function AddAddressPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();

  const [address, setAddress]             = useState('');
  const [houseNumber, setHouseNumber]     = useState('');
  const [closestBusStop, setClosestBusStop] = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [error, setError]                 = useState('');
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries });

  const { ready, value, suggestions: { status, data }, setValue, clearSuggestions, init } =
    usePlacesAutocomplete({ requestOptions: placesRequestOptions, debounce: 300, initOnMount: false });

  useEffect(() => { if (isLoaded) init(); }, [isLoaded, init]);
  useEffect(() => { if (!loading && !firebaseUser) router.push('/login'); }, [firebaseUser, loading, router]);
  useEffect(() => {
    if (navigator.geolocation && isLoaded) {
      navigator.geolocation.getCurrentPosition(pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (mapRef.current) { mapRef.current.panTo(loc); mapRef.current.setZoom(18); }
      });
    }
  }, [isLoaded]);

  const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    setValue(suggestion.description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: suggestion.description });
      const { lat, lng } = await getLatLng(results[0]);
      setAddress(suggestion.description);
      if (mapRef.current) { mapRef.current.panTo({ lat, lng }); mapRef.current.setZoom(18); }
    } catch (e) {
      // Ignore geocode errors silently instead of breaking UI
    }
  };

  const handleIdle = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    if (!center) return;
    setIsLoadingAddress(true);
    new google.maps.Geocoder().geocode({ location: { lat: center.lat(), lng: center.lng() } }, (results, status) => {
      setIsLoadingAddress(false);
      if (status === 'OK' && results?.[0]) setAddress(results[0].formatted_address);
    });
  }, []);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          mapRef.current!.panTo(loc);
          mapRef.current!.setZoom(18);
          mapRef.current!.setTilt(45);
        },
        err => {
          // Geolocation error
          alert('Unable to retrieve your location. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleZoomIn  = () => { if (mapRef.current) mapRef.current.setZoom(Math.min((mapRef.current.getZoom() ?? 15) + 1, 21)); };
  const handleZoomOut = () => { if (mapRef.current) mapRef.current.setZoom(Math.max((mapRef.current.getZoom() ?? 15) - 1, 3));  };
  const handleResetTilt = () => { if (mapRef.current) { mapRef.current.setTilt(45); mapRef.current.setHeading(0); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDoc?.uid) return;
    if (!address) { setError('Please pin a location on the map first.'); return; }
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
          <p className="text-sm" style={{ color: '#9A8878' }}>Search or drag the map to pin your location</p>
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
            <div className="relative">
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                disabled={!ready}
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

            {status === 'OK' && (
              <ul className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl"
                style={{
                  background: 'rgba(50,30,18,0.98)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {data.map(suggestion => (
                  <li key={suggestion.place_id} onClick={() => handleSelect(suggestion)}
                    className="flex items-start gap-3 cursor-pointer transition-all px-4 py-3.5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLLIElement).style.background = 'rgba(212,175,55,0.07)'}
                    onMouseLeave={e => (e.currentTarget as HTMLLIElement).style.background = 'transparent'}
                  >
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <span className="text-sm leading-snug" style={{ color: '#F0EDE8' }}>
                      {suggestion.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Embedded Map ── */}
          <div className="relative w-full h-[350px] rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/10 z-0 bg-[#2B1B17]">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={DEFAULT_CENTER}
              zoom={17}
              options={{
                disableDefaultUI: true,
                zoomControl: false,
                scrollwheel: true,
                gestureHandling: 'greedy',
                tilt: 45,
                heading: 0,
                mapTypeId: 'roadmap',
                isFractionalZoomEnabled: true,
                styles: goldenMapStyle,
              }}
              onLoad={map => {
                mapRef.current = map;
                map.setTilt(45);
              }}
              onIdle={handleIdle}
            />

            {/* Centre pin */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center" style={{ marginTop: '-40px' }}>
                <div className="flex items-center justify-center"
                  style={{
                    width: 44, height: 44,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    background: 'linear-gradient(135deg, #E8C84A 0%, #D4AF37 60%, #A88520 100%)',
                    boxShadow: '0 6px 24px rgba(212,175,55,0.6), 0 2px 6px rgba(0,0,0,0.4)',
                    border: '2px solid rgba(255,255,255,0.9)',
                  }}
                >
                  <MapPin size={18} style={{ transform: 'rotate(45deg)', color: '#2B1B17', fill: '#2B1B17' }} />
                </div>
                <div style={{ width: 14, height: 4, borderRadius: '50%', marginTop: 4, background: 'rgba(0,0,0,0.2)', filter: 'blur(2px)' }} />
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute right-3 bottom-4 z-20 flex flex-col items-center gap-2 pointer-events-auto">
              {/* Zoom */}
              <div className="flex flex-col overflow-hidden rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                <button type="button" onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center text-white/80 active:bg-white/10"><Plus size={16} /></button>
                <div className="h-[1px] bg-white/10" />
                <button type="button" onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center text-white/80 active:bg-white/10"><Minus size={16} /></button>
              </div>
              {/* Compass */}
              <button type="button" onClick={handleResetTilt} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/80 active:bg-white/10">
                <Compass size={16} />
              </button>
              {/* Locate Me */}
              <button type="button" onClick={handleLocateMe} className="w-10 h-10 flex items-center justify-center rounded-xl text-black shadow-lg"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F0CF6B 50%, #B8952A 100%)' }}
              >
                <LocateFixed size={16} />
              </button>
            </div>
            
            {/* 3D hint badge */}
            <div className="absolute bottom-4 left-3 z-10 pointer-events-none rounded-full bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5">
              <p className="text-[9px] font-bold tracking-widest uppercase text-[#D4AF37]">3D map</p>
            </div>
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
                  {address ? 'Delivery Location' : 'No location pinned'}
                </span>
              </div>
              {isLoadingAddress && <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin border-[#D4AF37]/30 border-t-[#D4AF37]" />}
            </div>
            {address ? (
              <p className="text-[15px] font-medium leading-relaxed text-[#F0EDE8]">{address}</p>
            ) : (
              <p className="text-sm italic text-[#9A8878]">Move the map pin to select your delivery address.</p>
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
