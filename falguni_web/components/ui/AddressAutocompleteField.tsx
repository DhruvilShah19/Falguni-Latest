'use client';

import { useRef, useState, type ElementType } from 'react';
import { MapPin } from 'lucide-react';

interface PlaceSuggestion {
  id: string;
  title: string;
  fullAddress: string;
  landmark: string;
  pincode: string;
}

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
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
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
        console.warn('Address search failed:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelect = (suggestion: PlaceSuggestion) => {
    setSuggestions([]);
    onChange(suggestion.fullAddress);
  };

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
        <Icon size={13} className="text-[#733617]" aria-hidden="true" /> {label}
      </label>
      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl px-4 py-3 text-xs text-[#2D1508] placeholder-[#2D1508]/40 focus:outline-hidden focus:border-[#733617] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#733617] transition-all"
        />
        {isSearching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-3.5 h-3.5 border-2 border-[#733617]/30 border-t-[#733617] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden rounded-xl bg-white border border-[#EFE6DC] shadow-xl max-h-56 overflow-y-auto divide-y divide-[#FAF7F2]"
        >
          {suggestions.map((suggestion, idx) => (
            <li
              key={suggestion.id || idx}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(suggestion)}
              className="flex items-start gap-3 cursor-pointer transition-colors px-4 py-2.5 hover:bg-[#FAF7F2] text-left"
            >
              <MapPin size={14} className="flex-shrink-0 mt-0.5 text-[#733617]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#2D1508]">{suggestion.title}</p>
                <p className="text-[10px] text-[#65544A] truncate">{suggestion.fullAddress}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
