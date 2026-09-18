'use client';

import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AddressModel } from '@/types';

export interface ExtendedAddress extends AddressModel {
  fullName?: string;
  phone?: string;
  tag?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialAddress?: ExtendedAddress | null;
  onSaved: (address: ExtendedAddress) => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  userId,
  initialAddress,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState(initialAddress?.fullName || '');
  const [phone, setPhone] = useState(initialAddress?.phone || '');
  const [tag, setTag] = useState(initialAddress?.tag || 'Home');
  const [houseNumber, setHouseNumber] = useState(initialAddress?.houseNumber || '');
  const [streetAddress, setStreetAddress] = useState(
    initialAddress?.address || initialAddress?.Addresses || ''
  );
  const [closestBusStop, setClosestBusStop] = useState(initialAddress?.closestbusStop || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim()) {
      setError('Please provide a delivery address.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const generatedId =
        initialAddress?.id || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const payload: Record<string, any> = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        tag: tag.trim() || 'Home',
        houseNumber: houseNumber.trim(),
        Addresses: streetAddress.trim(),
        address: streetAddress.trim(),
        closestbusStop: closestBusStop.trim(),
        id: generatedId,
        updatedAt: new Date(),
      };

      if (initialAddress?.uid) {
        // Edit existing
        await updateDoc(
          doc(db, 'users', userId, 'DeliveryAddress', initialAddress.uid),
          payload
        );
        onSaved({ ...payload, uid: initialAddress.uid } as ExtendedAddress);
      } else {
        // Add new
        payload.createdAt = new Date();
        const docRef = await addDoc(
          collection(db, 'users', userId, 'DeliveryAddress'),
          payload
        );
        onSaved({ ...payload, uid: docRef.id } as ExtendedAddress);
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving address:', err);
      setError(err?.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#EFE6DC] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE6DC] bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#733617]" />
            <h3 className="font-serif text-lg font-bold text-[#2D1508]">
              {initialAddress ? 'Edit Delivery Address' : 'Add New Address'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A796F] hover:text-[#2D1508] transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D1508] mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Het Zaveri"
                className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1508] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1508] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98265 43210"
                className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1508] outline-none transition"
              />
            </div>
          </div>

          {/* Tag Pills */}
          <div>
            <label className="block text-xs font-bold text-[#2D1508] mb-1.5">
              Address Label
            </label>
            <div className="flex gap-2">
              {['Home', 'Office', 'Other'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    tag === t
                      ? 'bg-[#733617] text-white shadow-xs'
                      : 'bg-[#FAF7F2] border border-[#EFE6DC] text-[#65544A] hover:border-[#733617]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* House / Flat / Society */}
          <div>
            <label className="block text-xs font-bold text-[#2D1508] mb-1">
              Flat, House no., Building, Society
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="e.g. 12, Shivalik Park Society"
              className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1508] outline-none transition"
            />
          </div>

          {/* Street Address / Area / City */}
          <div>
            <label className="block text-xs font-bold text-[#2D1508] mb-1">
              Area, Street, City, Pincode
            </label>
            <textarea
              rows={2}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="e.g. Vastrapur, Ahmedabad - 380015, Gujarat, India"
              className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1508] outline-none transition resize-none"
            />
          </div>

          {/* Landmark / Closest Bus Stop */}
          <div>
            <label className="block text-xs font-bold text-[#2D1508] mb-1">
              Landmark / Closest Landmark (Optional)
            </label>
            <input
              type="text"
              value={closestBusStop}
              onChange={(e) => setClosestBusStop(e.target.value)}
              placeholder="e.g. Near IIM Ahmedabad"
              className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1508] outline-none transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#EFE6DC] text-xs font-bold uppercase text-[#65544A] hover:bg-[#FAF7F2] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : initialAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
