'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Truck, Store, Clock, Phone, User } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AddressModal, { ExtendedAddress } from './AddressModal';
import StorePickupCard, { type PickupStoreInfo } from '@/components/cart/StorePickupCard';

interface Props {
  userId: string;
  userDoc: any;
  isPickup: boolean;
  onFulfillmentChange: (isPickup: boolean) => void;
  selectedAddressId: string | null;
  onSelectAddress: (address: ExtendedAddress) => void;
  pickupContact: { name: string; phone: string };
  onPickupContactChange: (contact: { name: string; phone: string }) => void;
  onPickupStoreChange?: (store: PickupStoreInfo) => void;
}

export default function DeliveryAddressSection({
  userId,
  userDoc,
  isPickup,
  onFulfillmentChange,
  selectedAddressId,
  onSelectAddress,
  pickupContact,
  onPickupContactChange,
  onPickupStoreChange,
}: Props) {
  const [addresses, setAddresses] = useState<ExtendedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ExtendedAddress | null>(null);

  // 1. Subscribe to Firestore saved addresses
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      collection(db, 'users', userId, 'DeliveryAddress'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          ...d.data(),
          uid: d.id,
        })) as ExtendedAddress[];

        if (list.length === 0 && (userDoc?.DeliveryAddress || userDoc?.deliveryAddress)) {
          const fallback: ExtendedAddress = {
            uid: 'profile_default',
            id: userDoc?.DeliveryAddressID || 'profile_default',
            fullName: userDoc?.fullname || (userDoc as any)?.FullName || (userDoc as any)?.name || 'Primary Customer',
            phone: userDoc?.phone || (userDoc as any)?.Phone || '',
            tag: 'Home',
            houseNumber: userDoc?.HouseNumber || '',
            address: userDoc?.DeliveryAddress || userDoc?.deliveryAddress || '',
            closestbusStop: (userDoc as any)?.ClosestBustStop || userDoc?.closestbusStop || '',
          };
          setAddresses([fallback]);
          if (!selectedAddressId) {
            onSelectAddress(fallback);
          }
        } else {
          setAddresses(list);
          if (list.length > 0) {
            const found = list.find((a) => a.uid === selectedAddressId || a.id === selectedAddressId);
            if (found) {
              onSelectAddress(found);
            } else if (!selectedAddressId) {
              onSelectAddress(list[0]);
            }
          }
        }
        setLoading(false);
      },
      (err) => {
        console.warn('DeliveryAddress listener warning:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId, userDoc, selectedAddressId, onSelectAddress]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: ExtendedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSaved = (addr: ExtendedAddress) => {
    onSelectAddress(addr);
  };

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ── Fulfillment Method Segmented Toggle ── */}
      <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#EFE6DC] mb-5 w-full max-w-sm">
        <button
          type="button"
          onClick={() => onFulfillmentChange(false)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            !isPickup
              ? 'bg-[#733617] text-white shadow-xs'
              : 'text-[#8A796F] hover:text-[#2D1508]'
          }`}
        >
          <Truck size={14} />
          <span>Home Delivery</span>
        </button>
        <button
          type="button"
          onClick={() => onFulfillmentChange(true)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            isPickup
              ? 'bg-[#733617] text-white shadow-xs'
              : 'text-[#8A796F] hover:text-[#2D1508]'
          }`}
        >
          <Store size={14} />
          <span>Store Pickup (Free)</span>
        </button>
      </div>

      {/* ── Condition 1: Store Pickup View ── */}
      {isPickup ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFE6DC]">
            <Store className="w-4 h-4 text-[#733617]" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#2D1508]">
              1. Flagship Store Pickup
            </h2>
          </div>

          <StorePickupCard onStoreLoaded={onPickupStoreChange} />

          {/* Contact details for pickup notification & handover */}
          <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-4 mt-4">
            <h3 className="text-xs font-bold text-[#2D1508] mb-3 flex items-center gap-1.5">
              <Clock size={13} className="text-[#733617]" />
              <span>Contact Person for Store Pickup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#65544A] mb-1 flex items-center gap-1">
                  <User size={12} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={pickupContact.name}
                  onChange={(e) =>
                    onPickupContactChange({ ...pickupContact, name: e.target.value })
                  }
                  placeholder="e.g. Het Zaveri"
                  className="w-full bg-white border border-[#EFE6DC] focus:border-[#733617] rounded-lg px-3 py-2 text-xs text-[#2D1508] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#65544A] mb-1 flex items-center gap-1">
                  <Phone size={12} />
                  <span>Mobile Number (for SMS code)</span>
                </label>
                <input
                  type="tel"
                  value={pickupContact.phone}
                  onChange={(e) =>
                    onPickupContactChange({ ...pickupContact, phone: e.target.value })
                  }
                  placeholder="e.g. 9826543210"
                  className="w-full bg-white border border-[#EFE6DC] focus:border-[#733617] rounded-lg px-3 py-2 text-xs text-[#2D1508] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Condition 2: Home Delivery Address Selection ── */
        <div className="animate-fade-in">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EFE6DC]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#733617]" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#2D1508]">
                1. Delivery Address
              </h2>
            </div>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-bold text-[#733617] hover:text-[#5A290F] transition inline-flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Address Cards List */}
          {loading ? (
            <div className="py-6 text-center text-xs text-[#8A796F]">
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-[#8A796F] mb-3">No saved addresses found.</p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-[#733617] text-white text-xs font-bold uppercase tracking-wider"
              >
                + Add Delivery Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected =
                  addr.uid === selectedAddressId || addr.id === selectedAddressId;
                const fullAddressText = [
                  addr.houseNumber,
                  addr.address || (addr as any).Addresses,
                  addr.closestbusStop ? `Near ${addr.closestbusStop}` : '',
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div
                    key={addr.uid || addr.id}
                    onClick={() => onSelectAddress(addr)}
                    className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#733617] bg-white shadow-xs'
                        : 'border-[#EFE6DC] bg-white hover:border-[#DBCFC4]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio Indicator */}
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#733617] bg-white'
                              : 'border-[#DBCFC4] bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#733617]" />
                          )}
                        </div>
                      </div>

                      {/* Address Content */}
                      <div className="flex-1 min-w-0 pr-12 sm:pr-14">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs sm:text-sm text-[#2D1508]">
                            {addr.fullName || userDoc?.fullname || 'Recipient'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617]">
                            {addr.tag || 'Home'}
                          </span>
                        </div>

                        <p className="text-xs text-[#65544A] leading-relaxed line-clamp-2">
                          {fullAddressText}
                        </p>

                        {addr.phone && (
                          <p className="text-xs font-medium text-[#2D1508] mt-1">
                            {addr.phone}
                          </p>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={(e) => handleOpenEdit(addr, e)}
                        className="absolute right-4 top-4 px-2.5 py-1 rounded border border-[#EFE6DC] text-[10px] font-bold uppercase tracking-wider text-[#733617] hover:bg-[#FAF7F2] hover:border-[#733617] transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Dashed Action */}
              <button
                onClick={handleOpenAdd}
                className="w-full py-3 px-4 border border-dashed border-[#DBCFC4] rounded-xl text-xs font-bold text-[#733617] hover:bg-[#FAF7F2] hover:border-[#733617] transition flex items-center justify-center gap-1.5 mt-3"
              >
                <MapPin size={13} />
                <span>+ Add New Address</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        initialAddress={editingAddress}
        onSaved={handleSaved}
      />
    </div>
  );
}
