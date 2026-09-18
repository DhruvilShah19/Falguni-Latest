'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Navigation, ShieldCheck, Phone, AlertCircle } from 'lucide-react';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PickupStoreInfo {
  title: string;
  address: string;
  phone: string;
  operatingHours: string;
  isOpen: boolean;
  lat?: number;
  long?: number;
}

const DEFAULT_STORE: PickupStoreInfo = {
  title: 'Falguni Gruh Udhyog - Vastrapur Flagship',
  address:
    'Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad, Gujarat 380015',
  phone: '+91 98253 82002',
  operatingHours: '9:00 AM – 9:00 PM (Everyday)',
  isOpen: true,
  lat: 23.036,
  long: 72.5294,
};

// Standard public Google Maps embed: $0 billing cost, 0 API quota limitations
const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5977934446096!2d72.5270146!3d23.0385315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84cb95555555%3A0xcabf35b44df0e104!2sFalguni%20Gruh%20Udhyog%20(Vastrapur)!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

const DIRECTIONS_URL = 'https://maps.app.goo.gl/PzS4L4kGZ2F3G1D66';

interface StorePickupCardProps {
  onStoreLoaded?: (store: PickupStoreInfo) => void;
}

export default function StorePickupCard({ onStoreLoaded }: StorePickupCardProps) {
  const [store, setStore] = useState<PickupStoreInfo>(DEFAULT_STORE);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAdminStoreConfig() {
      try {
        // 1. Fetch admin-configured Pickup Addresses from Firestore
        const pSnap = await getDocs(collection(db, 'Pickup Addresses'));
        let selected = DEFAULT_STORE;

        if (!pSnap.empty) {
          const list = pSnap.docs.map((d) => d.data());
          // Prefer default pickup address, or fallback to first
          const found = list.find((item: any) => item.isDefault === true) || list[0];
          if (found) {
            selected = {
              title: found.title || DEFAULT_STORE.title,
              address: found.address || DEFAULT_STORE.address,
              phone: found.phone || DEFAULT_STORE.phone,
              operatingHours: found.operatingHours || DEFAULT_STORE.operatingHours,
              isOpen: true,
              lat: found.lat ?? DEFAULT_STORE.lat,
              long: found.long ?? DEFAULT_STORE.long,
            };
          }
        }

        // 2. Fetch Store Status from Store Settings
        try {
          const statusSnap = await getDoc(doc(db, 'Store Settings', 'Store Status'));
          if (statusSnap.exists()) {
            const sData = statusSnap.data();
            if (typeof sData?.isOpen === 'boolean') {
              selected.isOpen = sData.isOpen;
            }
            if (sData?.openTime && sData?.closeTime) {
              selected.operatingHours = `${sData.openTime} – ${sData.closeTime} (Everyday)`;
            }
          }
        } catch {
          // Keep defaults if status collection unreadable
        }

        if (mounted) {
          setStore(selected);
          setLoading(false);
          onStoreLoaded?.(selected);
        }
      } catch (err) {
        console.warn('[StorePickupCard] Using fallback store config:', err);
        if (mounted) {
          setLoading(false);
          onStoreLoaded?.(DEFAULT_STORE);
        }
      }
    }

    loadAdminStoreConfig();

    return () => {
      mounted = false;
    };
  }, [onStoreLoaded]);

  return (
    <div className="mt-5 animate-fade-up">
      <div className="bg-white border border-[var(--color-border)] rounded-[20px] md:rounded-[24px] p-4 md:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all">
        {/* Left: Map Box (50%) - $0 Free Public Embed */}
        <div className="w-full h-48 md:h-auto md:min-h-[200px] rounded-[14px] overflow-hidden relative border border-[var(--color-border)] bg-[#F5EBE1] group">
          <iframe
            title={`${store.title} Location`}
            src={GOOGLE_MAPS_EMBED_URL}
            width="100%"
            height="100%"
            style={{
              border: 0,
            }}
            loading="lazy"
            allowFullScreen={true}
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Open in Maps Overlay */}
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs z-20"
          >
            <div className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md">
              <Navigation size={16} /> Get Directions
            </div>
          </a>
        </div>

        {/* Right: Info Box (50%) - Admin dynamic data */}
        <div className="w-full flex flex-col justify-center py-2 md:py-4">
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-max text-[var(--color-primary)] font-black text-[10px] uppercase tracking-widest bg-[#F5EBE1] border border-[var(--color-border)] px-2.5 py-1 rounded-md shadow-xs">
                Free In-Store Pickup
              </span>
              {!store.isOpen && (
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <AlertCircle size={10} /> Currently Closed
                </span>
              )}
            </div>

            <h4 className="font-serif font-bold text-[#2D1508] text-sm md:text-base mt-2">
              {store.title}
            </h4>

            <p className="text-[var(--color-fg-muted)] text-xs md:text-sm font-medium leading-relaxed pr-2 mt-1">
              {store.address}
            </p>

            {store.phone && (
              <p className="text-xs text-[#733617] font-semibold flex items-center gap-1.5 mt-1">
                <Phone size={11} /> {store.phone}
              </p>
            )}
          </div>

          {/* Minimal metrics row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 flex flex-col justify-center">
              <div className="text-[var(--color-fg-muted)] text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                <Clock size={10} className="text-[var(--color-primary)]" /> Hours
              </div>
              <div className="text-[var(--color-fg)] font-medium text-[10px] md:text-xs">
                {store.operatingHours}
              </div>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 flex flex-col justify-center">
              <div className="text-[var(--color-fg-muted)] text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck size={10} className="text-[var(--color-primary)]" /> Handover
              </div>
              <div className="text-[var(--color-fg)] font-medium text-[10px] md:text-xs">
                No wait lines.
                <br />
                Direct handover.
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-[var(--color-border)] my-1" />

          <div className="flex items-end justify-between mt-3">
            <div className="flex flex-col">
              <span className="text-[var(--color-fg-muted)] font-bold text-[9px] uppercase tracking-widest mb-1">
                Fulfillment Status
              </span>
              <span
                className={`font-bold text-xs flex items-center gap-1 ${
                  store.isOpen ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                <ShieldCheck size={12} />{' '}
                {store.isOpen ? 'Ready for Pickup (2-4 hrs)' : 'Pickup on Reopening'}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[var(--color-fg-muted)] font-bold text-[9px] uppercase tracking-widest mb-1">
                Pickup Fee
              </span>
              <span className="text-[var(--color-primary)] font-black text-xl">FREE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
