import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const SHOP_LINKS = [
  ['All Products', '/products'],
  ['Categories', '/categories'],
  ['Bestsellers', '/products?sort=bestseller'],
  ['Combos & Gifts', '/categories/COMBOS%20%26%20GIFT%20PACKS'],
  ['Offers & Coupons', '/coupon'],
  ['New Arrivals', '/products?sort=new'],
];

const HELP_LINKS = [
  ['Our Story', '/our-story'],
  ['Help & FAQ', '/faq'],
  ['Delivery Charges', '/delivery-charges'],
  ['Refer & Earn', '/referral-page'],
  ['Track Order', '/orders'],
  ['Store & Contact', '/contact'],
];

const ACCOUNT_LINKS = [
  ['My Profile', '/profile'],
  ['My Orders', '/orders'],
  ['Favourites', '/favorites'],
  ['Addresses', '/profile/addresses'],
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#241208] text-[#D9CBC4] border-t border-[#3D2214]">
      {/* ── Main Footer Grid ── */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-8 pt-14 md:pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Col 1: Brand Info & Socials (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
            <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105">
              <div className="relative h-14 w-36">
                <Image
                  src="/falguni-logo-transparent.png"
                  alt="Falguni Gruh Udhyog"
                  fill
                  sizes="144px"
                  unoptimized
                  className="object-contain object-left filter brightness-200 contrast-125"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-[#BFAEA5] max-w-sm mb-6">
              Authentic homemade snacks & sweets made with love, tradition and the finest ingredients.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#733617] flex items-center justify-center text-[#F5EBE1] transition-all hover:scale-110"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#733617] flex items-center justify-center text-[#F5EBE1] transition-all hover:scale-110"
              >
                <Facebook size={17} />
              </a>
              <a
                href="https://wa.me/919825382002"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center text-[#F5EBE1] transition-all hover:scale-110"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: SHOP (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F5EBE1] mb-5">
              SHOP
            </h4>
            <ul className="flex flex-col gap-3">
              {SHOP_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-[#BFAEA5] hover:text-[#F5EBE1] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: HELP (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F5EBE1] mb-5">
              HELP
            </h4>
            <ul className="flex flex-col gap-3">
              {HELP_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-[#BFAEA5] hover:text-[#F5EBE1] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: ACCOUNT (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F5EBE1] mb-5">
              ACCOUNT
            </h4>
            <ul className="flex flex-col gap-3">
              {ACCOUNT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-[#BFAEA5] hover:text-[#F5EBE1] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: STORE (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F5EBE1] mb-5">
              STORE
            </h4>
            <p className="text-sm text-[#F5EBE1] font-semibold mb-1">
              Falguni Gruh Udhyog
            </p>
            <p className="text-xs text-[#BFAEA5] mb-4">
              Vastrapur, Ahmedabad
            </p>
            <a
              href="tel:+919825382002"
              className="text-sm text-[#F5EBE1] font-medium hover:text-[#D49B4B] transition-colors mb-4 inline-flex items-center gap-1.5"
            >
              <Phone size={14} className="text-[#D49B4B]" />
              +91 98253 82002
            </a>
            <a
              href="https://www.google.com/maps/place/Falguni+Gruh+Udhyog+(Vastrapur)/@23.035607,72.5251858,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#D49B4B] hover:text-[#F5EBE1] transition-colors"
            >
              GET DIRECTIONS →
            </a>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-[#341B0E] bg-[#1B0B04]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E8E84]">
          <p>© {new Date().getFullYear()} Falguni Gruh Udhyog. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms-and-conditions" className="hover:text-[#F5EBE1] transition-colors">
              Terms & Conditions
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/privacy-policy" className="hover:text-[#F5EBE1] transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
