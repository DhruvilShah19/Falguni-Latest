'use client';

import { useRef, useState, type ElementType } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

// Same Places AutocompleteSuggestion + session-token pattern used in
// app/profile/addresses/add/page.tsx, pulled out into a reusable field so
// any other plain address <input> in the app (like courier/add) can get
// live suggestions without re-implementing the Places wiring each time.
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const libraries: ('places')[] = ['places'];

interface AddressAutocompleteFieldProps {
  icon: ElementType;
  label: string;
  value: string;
  onChange: (address: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function AddressAutocompleteField({
  icon: Icon,
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Search address…',
}: AddressAutocompleteFieldProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries });
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  };

  const handleInputChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!isLoaded || !val) {
        setSuggestions([]);
        return;
      }
      try {
        const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: val,
          sessionToken: getSessionToken(),
          includedRegionCodes: ['in'],
        });
        setSuggestions(results.filter((s) => s.placePrediction));
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    setSuggestions([]);
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress'], sessionToken: sessionTokenRef.current ?? undefined });
      // Session complete -- start a fresh one for the next search.
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      onChange(place.formattedAddress ?? prediction.text.text);
    } catch {
      onChange(prediction.text.text);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-white/40 text-[10px] tracking-wider uppercase ml-1 flex items-center gap-2">
        <Icon size={12} className="text-[#D4AF37]/60" /> {label}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        disabled={!isLoaded}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all text-sm font-light"
      />
      {suggestions.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(50,30,18,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.placePrediction!.placeId}
              onClick={() => handleSelect(suggestion)}
              className="flex items-start gap-3 cursor-pointer transition-all px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <MapPin size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
              <span className="text-sm leading-snug" style={{ color: '#F0EDE8' }}>
                {suggestion.placePrediction!.text.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
