import React from 'react';

export function AllProductsIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="6.8" height="6.8" rx="1.6" />
      <rect x="13.7" y="3.5" width="6.8" height="6.8" rx="1.6" />
      <rect x="13.7" y="13.7" width="6.8" height="6.8" rx="1.6" />
      <rect x="3.5" y="13.7" width="6.8" height="6.8" rx="1.6" />
    </svg>
  );
}

export function KhakhraIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer crispy round khakhra */}
      <circle cx="12" cy="12" r="9" />
      {/* Roasted dots and roasted indentations */}
      <circle cx="9" cy="9" r="0.8" fill={color} />
      <circle cx="15" cy="9" r="0.8" fill={color} />
      <circle cx="12" cy="12" r="0.8" fill={color} />
      <circle cx="9" cy="15" r="0.8" fill={color} />
      <circle cx="15" cy="15" r="0.8" fill={color} />
      <circle cx="12" cy="8" r="0.6" fill={color} />
      <circle cx="8" cy="12" r="0.6" fill={color} />
      <circle cx="16" cy="12" r="0.6" fill={color} />
      <circle cx="12" cy="16" r="0.6" fill={color} />
    </svg>
  );
}

export function NamkeenIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Snack bowl */}
      <path d="M4 11c0 5 3.5 8 8 8s8-3 8-8H4z" />
      <line x1="9" y1="19" x2="15" y2="19" />
      {/* Crispy mixture snacks inside */}
      <path d="M8 8c1-2 2-2 3-1s2 2 3 1" />
      <path d="M12 6c.5-1.5 1.5-1.5 2.5-1" />
      <circle cx="9.5" cy="5.5" r="0.8" fill={color} />
      <circle cx="14.5" cy="6.5" r="0.8" fill={color} />
    </svg>
  );
}

export function FarsanIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Savory samosa / farsan shape */}
      <polygon points="12,3 21,18 3,18" />
      <path d="M7 18c1.5-2 3-3 5-3s3.5 1 5 3" />
      <circle cx="12" cy="10" r="1" fill={color} />
    </svg>
  );
}

export function MukhvasIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Cluster of seeds / aniseed mukhvas */}
      <ellipse cx="12" cy="12" rx="2" ry="4" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="2" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="2" ry="4" transform="rotate(120 12 12)" />
      <circle cx="6" cy="6" r="0.8" fill={color} />
      <circle cx="18" cy="6" r="0.8" fill={color} />
      <circle cx="6" cy="18" r="0.8" fill={color} />
      <circle cx="18" cy="18" r="0.8" fill={color} />
    </svg>
  );
}

export function PicklesIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Traditional Pickle Jar with cloth cover & lid */}
      <path d="M8 3h8v2H8z" />
      <path d="M7 5h10v2H7z" />
      <path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" />
      {/* Jar label outline */}
      <rect x="9" y="10" width="6" height="6" rx="1" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

export function SweetsIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Three sweet ladoos arranged in pyramid */}
      <circle cx="8" cy="15" r="4.5" />
      <circle cx="16" cy="15" r="4.5" />
      <circle cx="12" cy="8" r="4.5" />
      {/* Garnish dots on top */}
      <circle cx="12" cy="6" r="0.7" fill={color} />
      <circle cx="8" cy="13" r="0.7" fill={color} />
      <circle cx="16" cy="13" r="0.7" fill={color} />
    </svg>
  );
}

export function BakeryIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Bakery cupcake */}
      <path d="M5 10c0-3.5 3-6 7-6s7 2.5 7 6H5z" />
      <path d="M6 10l1.5 10a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1L18 10" />
      <line x1="9" y1="14" x2="9.5" y2="19" />
      <line x1="12" y1="14" x2="12" y2="19" />
      <line x1="15" y1="14" x2="14.5" y2="19" />
    </svg>
  );
}

export function PapadIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Papad round disc with cracked speckled texture */}
      <circle cx="12" cy="12" r="9" strokeDasharray="5 1.5" />
      <circle cx="8" cy="10" r="0.8" fill={color} />
      <circle cx="15" cy="8" r="0.8" fill={color} />
      <circle cx="11" cy="14" r="0.8" fill={color} />
      <circle cx="16" cy="14" r="0.8" fill={color} />
      <circle cx="13" cy="10" r="0.6" fill={color} />
      <circle cx="7" cy="14" r="0.6" fill={color} />
    </svg>
  );
}

export function ComboPacksIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Gift box with ribbon */}
      <polyline points="19 12 19 21 5 21 5 12" />
      <rect x="3" y="7" width="18" height="5" rx="1" />
      <line x1="12" y1="21" x2="12" y2="7" />
      <path d="M12 7H8a2 2 0 0 1 0-4C11 3 12 7 12 7z" />
      <path d="M12 7h4a2 2 0 0 0 0-4C13 3 12 7 12 7z" />
    </svg>
  );
}

export const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string; color?: string }>> = {
  'all': AllProductsIcon,
  'khakhra': KhakhraIcon,
  'namkeen': NamkeenIcon,
  'farsan': FarsanIcon,
  'mukhvas': MukhvasIcon,
  'mukhwas': MukhvasIcon,
  'pickle': PicklesIcon,
  'pickles': PicklesIcon,
  'sweet': SweetsIcon,
  'sweets': SweetsIcon,
  'bakery': BakeryIcon,
  'papad': PapadIcon,
  'combo': ComboPacksIcon,
  'combos': ComboPacksIcon,
  'combo packs': ComboPacksIcon,
};
