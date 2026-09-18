'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Search, Check, ArrowLeft, MapPin, LocateFixed, 
  AlertCircle, ShieldCheck, Truck, Home, Navigation,
  Sparkles, CheckCircle2, X
} from 'lucide-react';
import Link from 'next/link';

interface PlaceSuggestion {
  id: string;
  title: string;
  fullAddress: string;
  landmark: string;
  pincode: string;
}

export default function AddAddressPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();

  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [closestBusStop, setClosestBusStop] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState<number>(-1);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/profile/addresses/add'); 
    }
  }, [firebaseUser, loading, router]);

  const handleInputChange = (val: string) => {
    setValue(val);
    setFocusedSuggestionIndex(-1);
    setError('');

    // If user types, also allow it as the address directly
    if (!address || address !== val) {
      setAddress(val);
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places-autocomplete?q=${encodeURIComponent(val.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions([]);
          }
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (s: PlaceSuggestion) => {
    setValue(s.fullAddress);
    setAddress(s.fullAddress);
    setSuggestions([]);
    setFocusedSuggestionIndex(-1);
    setError('');
    setSuccessInfo('Location selected from suggestions.');
    
    // Auto-fill landmark if available and empty
    if (s.landmark && !closestBusStop) {
      setClosestBusStop(s.landmark);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedSuggestionIndex >= 0 && suggestions[focusedSuggestionIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[focusedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setFocusedSuggestionIndex(-1);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingAddress(true);
    setError('');
    setSuccessInfo('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
          const data = await res.json();

          if (data.success && data.address) {
            setAddress(data.address);
            setValue(data.address);
            setSuggestions([]);
            setSuccessInfo('Location detected from GPS!');

            if (data.landmark && !closestBusStop) {
              setClosestBusStop(data.landmark);
            }
          } else {
            setError('Could not detect your exact street address. Please type it in the search box.');
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setError('Failed to reach location service. Please type your address manually.');
        } finally {
          setIsLoadingAddress(false);
        }
      },
      (geoError) => {
        setIsLoadingAddress(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location access was denied. Please allow location permissions in your browser or type your address manually.');
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError('Location information is unavailable. Please type your address manually.');
        } else if (geoError.code === geoError.TIMEOUT) {
          setError('Location request timed out. Please try again or type your address.');
        } else {
          setError('Could not retrieve your location. Please type your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (!uid) {
      setError('Please log in to save your address.');
      return;
    }

    const finalAddress = (address || value).trim();
    if (!finalAddress) { 
      setError('Please provide your street or area address.'); 
      inputRef.current?.focus();
      return; 
    }

    if (!houseNumber.trim()) {
      setError('Please enter your Flat / House number / Society name.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const generatedId = finalAddress + houseNumber.trim() + closestBusStop.trim();
      const newAddress = { 
        Addresses: finalAddress, 
        address: finalAddress,
        houseNumber: houseNumber.trim(), 
        HouseNumber: houseNumber.trim(),
        closestbusStop: closestBusStop.trim(), 
        ClosestBustStop: closestBusStop.trim(),
        id: generatedId 
      };
      
      await addDoc(collection(db, 'users', uid, 'DeliveryAddress'), newAddress);
      
      // Update user profile default delivery address safely (creates user doc if missing)
      await setDoc(doc(db, 'users', uid), {
        DeliveryAddress: finalAddress, 
        HouseNumber: houseNumber.trim(),
        ClosestBustStop: closestBusStop.trim(), 
        DeliveryAddressID: generatedId,
        uid,
      }, { merge: true });

      router.push('/profile/addresses');
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  if (loading || !firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const effectiveAddress = (address || value).trim();

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Breadcrumbs ── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link 
              href="/" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Home
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <Link 
              href="/profile" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              My Account
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <Link 
              href="/profile/addresses" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Saved Addresses
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">Add Address</span>
          </nav>

          {/* ── 2. Top Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <Link
                  href="/profile/addresses"
                  aria-label="Back to Saved Addresses"
                  className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center hover:bg-white text-[#733617] transition-all shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </Link>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[10px] font-bold uppercase tracking-[0.15em] text-[#733617] mb-1.5">
                    <Sparkles size={11} className="text-[#C88A2C]" aria-hidden="true" />
                    <span>Falguni Parivar • નવું સરનામું</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] tracking-tight">
                    Add New Delivery Address
                  </h1>
                  <p className="text-xs sm:text-sm text-[#65544A] mt-1 leading-relaxed">
                    Enter your doorstep address details for prompt sweets &amp; snacks deliveries.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-xs text-[#65544A] self-start sm:self-auto">
                <ShieldCheck size={14} className="text-[#733617]" aria-hidden="true" />
                <span>Encrypted &amp; Secure Delivery Info</span>
              </div>
            </div>
          </header>

          {/* ── Alerts ── */}
          {error && (
            <div 
              role="alert" 
              className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
            >
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div 
              role="status" 
              className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{successInfo}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSuccessInfo('')}
                aria-label="Dismiss message"
                className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-md"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── 3. Main Form Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* ── LEFT 2 COLUMNS: Form ── */}
            <main className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Step 1: Area Search & GPS */}
              <section className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FAF7F2]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] flex items-center justify-center text-[11px] font-bold">
                      1
                    </div>
                    <h2 className="font-serif font-bold text-base text-[#2D1508]">
                      Search Area, Society or Street
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#733617] font-semibold">Step 1 of 2</span>
                </div>

                <div className="flex flex-col gap-3 relative">
                  <label htmlFor="address-search-input" className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
                    <Search size={13} className="text-[#733617]" aria-hidden="true" />
                    Area / Street / Society / City
                  </label>

                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="address-search-input"
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={suggestions.length > 0}
                        aria-controls="address-suggestions-list"
                        value={value}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type area name (e.g. Navrangpura, Prahlad Nagar, Ambawadi...)"
                        className="w-full text-xs sm:text-sm text-[#2D1508] bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] focus:bg-white rounded-xl py-3 pl-10 pr-4 outline-hidden transition-all placeholder:text-[#2D1508]/40 focus-visible:ring-2 focus-visible:ring-[#733617]"
                      />
                      <Search 
                        size={16} 
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#733617]" 
                        aria-hidden="true" 
                      />
                      {isSearching && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-[#733617]/30 border-t-[#733617] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Locate Me Button */}
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      disabled={isLoadingAddress}
                      aria-label="Detect my current location with GPS"
                      title="Detect my current location with GPS"
                      className="h-11 px-3 sm:px-4 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[#EFE6DC] text-[#733617] flex items-center gap-2 text-xs font-bold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isLoadingAddress ? (
                        <div className="w-4 h-4 border-2 border-[#733617]/30 border-t-[#733617] rounded-full animate-spin" aria-hidden="true" />
                      ) : (
                        <LocateFixed size={16} aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">Use My Location</span>
                    </button>
                  </div>

                  {/* Suggestions List */}
                  {suggestions.length > 0 && (
                    <ul 
                      id="address-suggestions-list"
                      role="listbox"
                      aria-label="Address suggestions"
                      className="absolute top-full left-0 right-0 mt-1 overflow-hidden rounded-xl bg-white border border-[#EFE6DC] shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-[#FAF7F2]"
                    >
                      {suggestions.map((s, index) => {
                        const isFocused = index === focusedSuggestionIndex;
                        return (
                          <li
                            id={`suggestion-${index}`}
                            key={s.id || index}
                            role="option"
                            aria-selected={isFocused}
                            onClick={() => handleSelectSuggestion(s)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer text-left transition-colors ${
                              isFocused ? 'bg-[#FAF7F2] text-[#733617]' : 'hover:bg-[#FAF7F2] text-[#2D1508]'
                            }`}
                          >
                            <MapPin size={15} className="text-[#733617] shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-[#2D1508]">
                                {s.title}
                              </p>
                              <p className="text-[11px] text-[#65544A] truncate">
                                {s.fullAddress}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Selected Address Preview Card */}
                  <div 
                    aria-live="polite" 
                    className={`mt-2 p-4 rounded-xl border transition-all ${
                      effectiveAddress 
                        ? 'bg-[#FAF7F2] border-[#EFE6DC]' 
                        : 'bg-neutral-50/70 border-dashed border-[#EFE6DC]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#733617] mb-1">
                      <MapPin size={12} aria-hidden="true" />
                      <span>{effectiveAddress ? 'Selected Street / Area' : 'No Location Selected'}</span>
                    </div>
                    {effectiveAddress ? (
                      <p className="text-xs sm:text-sm font-medium text-[#2D1508] leading-relaxed break-words">
                        {effectiveAddress}
                      </p>
                    ) : (
                      <p className="text-xs text-[#8A796F] italic">
                        Type your area name above or tap "Use My Location" to detect it automatically.
                      </p>
                    )}
                  </div>

                </div>
              </section>

              {/* Step 2: House No & Landmark Details */}
              <section className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FAF7F2]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] flex items-center justify-center text-[11px] font-bold">
                      2
                    </div>
                    <h2 className="font-serif font-bold text-base text-[#2D1508]">
                      House / Flat &amp; Landmark Details
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#733617] font-semibold">Step 2 of 2</span>
                </div>

                <form id="address-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                  
                  {/* House / Flat Number */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="house-number" className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
                      <Home size={13} className="text-[#733617]" aria-hidden="true" />
                      <span>Flat / House No. / Floor / Society Name *</span>
                    </label>
                    <input
                      id="house-number"
                      type="text"
                      required
                      aria-required="true"
                      value={houseNumber}
                      onChange={e => setHouseNumber(e.target.value)}
                      placeholder="e.g. B-402 Shivalik Residency, 4th Floor"
                      className="w-full text-xs sm:text-sm text-[#2D1508] bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] focus:bg-white rounded-xl py-3 px-4 outline-hidden transition-all placeholder:text-[#2D1508]/40 focus-visible:ring-2 focus-visible:ring-[#733617]"
                    />
                  </div>

                  {/* Landmark / Closest Stop */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="landmark-input" className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
                      <Navigation size={13} className="text-[#733617]" aria-hidden="true" />
                      <span>Landmark / Nearby Stop / Pincode</span>
                    </label>
                    <input
                      id="landmark-input"
                      type="text"
                      value={closestBusStop}
                      onChange={e => setClosestBusStop(e.target.value)}
                      placeholder="e.g. Near Iscon Temple, Opp. BRTS Stop"
                      className="w-full text-xs sm:text-sm text-[#2D1508] bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] focus:bg-white rounded-xl py-3 px-4 outline-hidden transition-all placeholder:text-[#2D1508]/40 focus-visible:ring-2 focus-visible:ring-[#733617]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !effectiveAddress}
                    aria-busy={isSubmitting}
                    className="mt-2 w-full py-3.5 px-6 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:ring-offset-2 focus-visible:outline-hidden"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        <span>Saving Delivery Address...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                        <span>Save &amp; Set as Delivery Address</span>
                      </>
                    )}
                  </button>

                </form>
              </section>

            </main>

            {/* ── RIGHT COLUMN: Assurance & Tips ── */}
            <aside aria-label="Address tips" className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
              
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-[#2D1508]">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                    <Home size={15} aria-hidden="true" />
                  </div>
                  <h3 className="font-serif font-bold text-sm">Accurate Address Tip</h3>
                </div>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  Adding your apartment or flat number along with a recognizable nearby landmark helps our delivery rider arrive swiftly without calling you for directions.
                </p>
              </div>

              <div className="bg-[#F5EBE1]/60 border border-[#EFE6DC] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D1508]">
                  <Truck size={15} className="text-[#733617] shrink-0" aria-hidden="true" />
                  <span>Doorstep Delivery Guaranteed</span>
                </div>
                <p className="text-[11px] text-[#65544A] leading-relaxed">
                  We deliver fresh sweets &amp; snacks across Ahmedabad, Gujarat, and nationwide in tamper-evident sealed packaging.
                </p>
              </div>

              <Link
                href="/profile/addresses"
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#EFE6DC] hover:border-[#733617]/40 text-[#733617] text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                Cancel &amp; Return
              </Link>

            </aside>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
