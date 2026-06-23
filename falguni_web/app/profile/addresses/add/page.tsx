'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, MapPin, Check, LocateFixed, Search, Home, Navigation, AlertCircle, Plus, Minus, Compass } from 'lucide-react';
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
    } catch (e) { console.error(e); }
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
      navigator.geolocation.getCurrentPosition(pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current!.panTo(loc);
        mapRef.current!.setZoom(18);
        mapRef.current!.setTilt(45);
      });
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
      console.error(err);
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
      <div className="relative overflow-hidden flex flex-col md:block" style={{ height: 'calc(100vh - 72px)', background: '#2B1B17' }}>

        {/* ── 3D Map ── */}
        <div className="relative md:absolute inset-0 z-0 h-[45vh] md:h-auto w-full flex-shrink-0">
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

          {/* ── Centre pin — gold diamond ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center" style={{ marginTop: '-40px' }}>
              {/* Diamond-head pin */}
              <div className="flex items-center justify-center"
                style={{
                  width: 50, height: 50,
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  background: 'linear-gradient(135deg, #E8C84A 0%, #D4AF37 60%, #A88520 100%)',
                  boxShadow: '0 6px 24px rgba(212,175,55,0.6), 0 2px 6px rgba(0,0,0,0.4)',
                  border: '2.5px solid rgba(255,255,255,0.92)',
                }}
              >
                <MapPin size={20} style={{ transform: 'rotate(45deg)', color: '#2B1B17', fill: '#2B1B17' }} />
              </div>
              {/* Oval shadow */}
              <div style={{ width: 16, height: 5, borderRadius: '50%', marginTop: 4, background: 'rgba(0,0,0,0.2)', filter: 'blur(3px)' }} />
              {/* Pulse ring */}
              <div className="absolute rounded-full animate-ping"
                style={{ width: 18, height: 18, top: 46, background: 'rgba(212,175,55,0.28)' }} />
            </div>
          </div>

          {/* ── Right-side controls ── */}
          <div className="absolute right-5 bottom-10 z-20 flex flex-col items-center gap-3">

            {/* + / − zoom card */}
            <div className="flex flex-col overflow-hidden"
              style={{
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(36,20,10,0.88)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
              }}
            >
              <button type="button" onClick={handleZoomIn}
                className="flex items-center justify-center transition-all"
                style={{ width: 44, height: 44, color: '#F0EDE8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#D4AF37'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#F0EDE8'; }}
              >
                <Plus size={17} strokeWidth={2} />
              </button>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <button type="button" onClick={handleZoomOut}
                className="flex items-center justify-center transition-all"
                style={{ width: 44, height: 44, color: '#F0EDE8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#D4AF37'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#F0EDE8'; }}
              >
                <Minus size={17} strokeWidth={2} />
              </button>
            </div>

            {/* Compass — reset 3D north */}
            <button type="button" onClick={handleResetTilt} title="Reset 3D view"
              className="flex items-center justify-center transition-all"
              style={{
                width: 44, height: 44, borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(36,20,10,0.88)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                color: 'rgba(212,175,55,0.65)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#D4AF37'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,175,55,0.65)'; }}
            >
              <Compass size={17} strokeWidth={1.5} />
            </button>

            {/* Locate me */}
            <button type="button" onClick={handleLocateMe} title="Go to my location"
              className="flex items-center justify-center transition-all"
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #D4AF37 0%, #F0CF6B 50%, #B8952A 100%)',
                boxShadow: '0 6px 20px rgba(212,175,55,0.42)',
                color: '#2B1B17',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(212,175,55,0.58)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(212,175,55,0.42)'}
            >
              <LocateFixed size={17} strokeWidth={2} />
            </button>
          </div>

          {/* 3D hint badge */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(36,20,10,0.72)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.18)' }}
          >
            <p className="text-[9px] font-bold tracking-[0.35em] uppercase whitespace-nowrap" style={{ color: 'rgba(212,175,55,0.65)' }}>
              3D · Scroll to zoom · Drag to explore
            </p>
          </div>

          {/* Panel-edge vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(36,20,10,0.9) 0%, rgba(36,20,10,0.3) 36%, transparent 52%)' }}
          />
        </div>

        {/* ── Left panel ── */}
        <div className="relative md:absolute md:top-0 md:bottom-0 md:left-0 z-20 w-full md:w-[400px] flex flex-col flex-1 pointer-events-none">
          <div className="flex-1 md:m-5 flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden pointer-events-auto -mt-5 md:mt-0"
            style={{
              /* Warm #5C4033 surface — matches home/product card surfaces */
              background: 'rgba(58,36,26,0.96)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >

            {/* ── Header ── */}
            <div className="flex-shrink-0 px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Back */}
              <Link href="/profile/addresses"
                className="inline-flex items-center gap-2 mb-5 group transition-colors"
                style={{ color: 'rgba(212,175,55,0.7)' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(212,175,55,0.7)'}
              >
                <ArrowLeft size={15} />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Back</span>
              </Link>

              <h1 className="font-serif text-white text-2xl leading-tight mb-0.5">Add New Address</h1>
              <p className="text-xs" style={{ color: '#9A8878' }}>Search or drag the map to pin your location</p>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4"
              style={{ scrollbarWidth: 'none' }}
            >

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 leading-snug">{error}</p>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <p className="text-xs text-white/40 mb-1.5">Search location</p>
                <div className="relative">
                  <input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    disabled={!ready}
                    placeholder="Area, street or landmark…"
                    className="w-full text-sm text-white outline-none transition-all placeholder:text-white/20"
                    style={{
                      background: '#2B1B17',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 14,
                      padding: '12px 14px 12px 38px',
                    }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.55)'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.2)'}
                  />
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/25" />
                </div>

                {status === 'OK' && (
                  <ul className="absolute top-full left-0 right-0 mt-1.5 overflow-hidden rounded-2xl z-50"
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
                        className="flex items-start gap-3 cursor-pointer transition-all px-4 py-3"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLLIElement).style.background = 'rgba(212,175,55,0.07)'}
                        onMouseLeave={e => (e.currentTarget as HTMLLIElement).style.background = 'transparent'}
                      >
                        <MapPin size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
                        <span className="text-sm leading-snug" style={{ color: '#F0EDE8' }}>
                          {suggestion.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ── Pinned Address — large, unmissable ── */}
              <div className="rounded-2xl overflow-hidden"
                style={{
                  border: address ? '1.5px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: address ? 'rgba(212,175,55,0.06)' : 'rgba(43,27,23,0.5)',
                  transition: 'all 0.3s',
                }}
              >
                {/* Label row */}
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: address ? '1px solid rgba(212,175,55,0.15)' : '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: address ? '#D4AF37' : 'rgba(255,255,255,0.08)' }}
                    >
                      <MapPin size={11} style={{ color: address ? '#2B1B17' : '#9A8878', fill: address ? '#2B1B17' : 'none' }} />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.25em] uppercase"
                      style={{ color: address ? '#D4AF37' : '#9A8878' }}
                    >
                      {address ? 'Delivery Location' : 'No location pinned yet'}
                    </span>
                  </div>
                  {isLoadingAddress && (
                    <div className="w-3.5 h-3.5 rounded-full border-[1.5px] animate-spin flex-shrink-0"
                      style={{ borderColor: 'rgba(212,175,55,0.25)', borderTopColor: '#D4AF37' }}
                    />
                  )}
                </div>

                {/* Address text — the main hero of this section */}
                <div className="px-4 py-4">
                  {address ? (
                    <p className="text-[15px] font-medium leading-relaxed" style={{ color: '#F0EDE8' }}>
                      {address}
                    </p>
                  ) : (
                    <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(154,136,120,0.5)' }}>
                      Move the map pin or use search above — your address will appear here automatically.
                    </p>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <form id="address-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <FormField
                  label="House / Flat No."
                  value={houseNumber}
                  onChange={setHouseNumber}
                  placeholder="e.g. Apt 4B, House 23"
                  required
                />
                <FormField
                  label="Zip Code / Landmark"
                  value={closestBusStop}
                  onChange={setClosestBusStop}
                  placeholder="e.g. 380015 or Near Bus Stand"
                  required
                />
              </form>

            </div>

            {/* ── Save button ── */}
            <div className="flex-shrink-0 px-5 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <button
                form="address-form"
                type="submit"
                disabled={isSubmitting || !address}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold tracking-[0.2em] uppercase text-sm transition-all disabled:opacity-40"
                style={{
                  padding: '14px 0',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F0CF6B 50%, #B8952A 100%)',
                  color: '#2B1B17',
                  boxShadow: (!isSubmitting && address) ? '0 6px 24px rgba(212,175,55,0.3)' : 'none',
                }}
                onMouseEnter={e => { if (!isSubmitting && address) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 32px rgba(212,175,55,0.45)'; }}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = (!isSubmitting && address) ? '0 6px 24px rgba(212,175,55,0.3)' : 'none'}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(43,27,23,0.25)', borderTopColor: '#2B1B17' }} />
                ) : (
                  <><Check size={15} strokeWidth={2.5} /> Save Address</>
                )}
              </button>
            </div>

          </div>
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
        className="w-full text-sm text-white outline-none transition-all placeholder:text-white/20"
        style={{
          background: '#2B1B17',
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
