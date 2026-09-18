'use client';

import {
  AllProductsIcon,
  KhakhraIcon,
  NamkeenIcon,
  FarsanIcon,
  MukhvasIcon,
  PicklesIcon,
  SweetsIcon,
  BakeryIcon,
  PapadIcon,
  ComboPacksIcon,
} from './CategoryIcons';

export interface CategoryItem {
  id: string;
  name: string;
  icon: React.FC<{ className?: string; color?: string }>;
  matchKeyword?: string;
}

export const TOP_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Products', icon: AllProductsIcon },
  { id: 'khakhra', name: 'Khakhra', icon: KhakhraIcon, matchKeyword: 'khakhra' },
  { id: 'bhakhri', name: 'Bhakhri', icon: BakeryIcon, matchKeyword: 'bhakhri' },
  { id: 'groundnut-oil-products', name: 'Groundnut Oil', icon: FarsanIcon, matchKeyword: 'groundnut' },
  { id: 'namkeen', name: 'Namkeen', icon: NamkeenIcon, matchKeyword: 'namkeen' },
  { id: 'farsan', name: 'Farsan', icon: FarsanIcon, matchKeyword: 'farsan' },
  { id: 'mukhvas', name: 'Mukhvas', icon: MukhvasIcon, matchKeyword: 'mukhva' },
  { id: 'pickles', name: 'Pickles', icon: PicklesIcon, matchKeyword: 'pickle' },
  { id: 'sweets', name: 'Sweets', icon: SweetsIcon, matchKeyword: 'sweet' },
  { id: 'bakery', name: 'Bakery', icon: BakeryIcon, matchKeyword: 'bakery' },
  { id: 'papad', name: 'Papad', icon: PapadIcon, matchKeyword: 'papad' },
  { id: 'combos', name: 'Combo Packs', icon: ComboPacksIcon, matchKeyword: 'combo' },
];

interface ShopCategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function ShopCategoryBar({
  selectedCategory,
  onSelectCategory,
}: ShopCategoryBarProps) {
  return (
    <div className="w-full mb-6 sm:mb-8">
      <div className="flex lg:grid lg:grid-cols-10 items-center gap-2 sm:gap-2.5 lg:gap-3 overflow-x-auto pb-2.5 pt-1.5 px-1 sm:px-1.5 scrollbar-none scroll-smooth">
        {TOP_CATEGORIES.map(cat => {
          const isSelected =
            selectedCategory === cat.id ||
            (!selectedCategory && cat.id === 'all');
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex flex-col items-center justify-center p-2 sm:p-2.5 min-w-[88px] sm:min-w-[98px] lg:min-w-0 h-[80px] sm:h-[86px] rounded-xl transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'border-[#733617] bg-[#FDF4ED] shadow-xs'
                  : 'border-[#EFE6DC] bg-white hover:border-[#733617]/40 hover:bg-[#FAF7F2] shadow-2xs'
              }`}
            >
              <div className="mb-1.5 transition-transform duration-200 group-hover:scale-105">
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  color={isSelected ? '#733617' : '#8A796F'}
                />
              </div>
              <span
                className={`text-[11px] sm:text-xs text-center font-semibold tracking-tight transition-colors truncate w-full px-0.5 ${
                  isSelected ? 'text-[#733617]' : 'text-[#4A3B32]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
