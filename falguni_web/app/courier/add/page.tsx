'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, Upload, Package, MapPin, User, Scale, 
  AlignLeft, Check, Image as ImageIcon, Phone, 
  ShieldCheck, Clock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import AddressAutocompleteField from '@/components/ui/AddressAutocompleteField';

type PlanType = 'local' | 'gujarat' | 'panindia';

interface PlanConfig {
  id: PlanType;
  name: string;
  badge: string;
  transit: string;
  basePrice: number;
  perKgRate: number;
  packaging: string;
}

const PLANS: Record<PlanType, PlanConfig> = {
  local: {
    id: 'local',
    name: 'City Express',
    badge: '⚡ Same Day (2-4 hrs)',
    transit: '2 – 4 Hours',
    basePrice: 49,
    perKgRate: 20,
    packaging: 'Insulated moisture-lock bag',
  },
  gujarat: {
    id: 'gujarat',
    name: 'Gujarat Regional',
    badge: '✨ Next Day (24-48 hrs)',
    transit: '24 – 48 Hours',
    basePrice: 89,
    perKgRate: 40,
    packaging: 'Shock-resistant mithai box',
  },
  panindia: {
    id: 'panindia',
    name: 'Pan-India Interstate',
    badge: '🇮🇳 Express (2-4 days)',
    transit: '2 – 4 Business Days',
    basePrice: 149,
    perKgRate: 65,
    packaging: 'Vacuum-sealed + corrugated box',
  },
};

function AddCourierContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, userDoc, loading } = useAuthStore();
  
  // Plan & Weight from Query Params or Defaults
  const initialPlan = (searchParams.get('plan') as PlanType) || 'gujarat';
  const initialWeight = searchParams.get('weight') || '1';

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    PLANS[initialPlan] ? initialPlan : 'gujarat'
  );
  
  // Form State
  const [sendersName, setSendersName] = useState(userDoc?.fullname || '');
  const [sendersPhone, setSendersPhone] = useState(userDoc?.phone || '');
  const [sendersAddress, setSendersAddress] = useState(userDoc?.deliveryAddress || '');

  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [parcelName, setParcelName] = useState('');
  const [weight, setWeight] = useState(initialWeight);
  const [parcelDescription, setParcelDescription] = useState('');
  const [isFragileFood, setIsFragileFood] = useState(true);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [adminKgRate, setAdminKgRate] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    } else if (userDoc) {
      if (!sendersName) setSendersName(userDoc.fullname || '');
      if (!sendersPhone) setSendersPhone(userDoc.phone || '');
      if (!sendersAddress) setSendersAddress(userDoc.deliveryAddress || '');
    }
  }, [firebaseUser, userDoc, loading, router, sendersName, sendersPhone, sendersAddress]);

  // Fetch live pricing settings from Admin Firestore
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const detailsDoc = await getDoc(doc(db, 'Courier System', 'Courier Details'));
        if (detailsDoc.exists() && detailsDoc.data()?.kg) {
          setAdminKgRate(Number(detailsDoc.data()?.kg));
        }
      } catch (e) {
        console.warn('Could not read admin courier pricing:', e);
      }
    };
    fetchPricing();
  }, []);

  const handleUseDefaultAddress = () => {
    if (userDoc) {
      setSendersName(userDoc.fullname || '');
      setSendersPhone(userDoc.phone || '');
      setSendersAddress(userDoc.deliveryAddress || '');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Price Calculation
  const priceDetails = useMemo(() => {
    const plan = PLANS[selectedPlan];
    const w = Math.max(0.1, parseFloat(weight) || 1);
    const kgRate = adminKgRate && selectedPlan === 'gujarat' ? adminKgRate : plan.perKgRate;
    const baseFreight = plan.basePrice;
    const weightAddon = Math.round(Math.max(0, w - 0.5) * kgRate);
    const finalTotal = baseFreight + weightAddon;

    return {
      plan,
      weightNum: w,
      baseFreight,
      weightAddon,
      finalTotal,
    };
  }, [selectedPlan, weight, adminKgRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userDoc) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Upload Image if exists
      let parcelImage = '';
      if (imageFile) {
        const storageRef = ref(storage, `courier_images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        parcelImage = await getDownloadURL(snapshot.ref);
      }

      // 2. Fetch Pricing & Commission Logic
      const detailsDoc = await getDoc(doc(db, 'Courier System', 'Courier Details'));
      const commKg = detailsDoc.exists() ? (Number(detailsDoc.data()?.deliveryCommissionKg) || 15) : 15;

      const distanceKm = selectedPlan === 'local' ? 8 : selectedPlan === 'gujarat' ? 120 : 650;
      const w = priceDetails.weightNum;
      const finalPrice = priceDetails.finalTotal;

      // 3. Get Parcel ID from Admin
      const adminDocRef = doc(db, 'Admin', 'Admin');
      const adminDoc = await getDoc(adminDocRef);
      const currentParcelID = adminDoc.exists() ? (Number(adminDoc.data()?.ParcelID) || 1000) : 1000;

      // 4. Assign Driver if available
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      let assignedDriver = { id: '', fullname: '', phone: '', address: '' };
      
      if (!driversSnapshot.empty) {
        const drivers = driversSnapshot.docs.map(d => ({ ...(d.data() as any), docId: d.id }));
        const randomIdx = Math.floor(Math.random() * drivers.length);
        const selected = drivers[randomIdx];
        assignedDriver = {
          id: selected.id || selected.docId || '',
          fullname: selected.fullname || 'Falguni Delivery Associate',
          phone: selected.phone || '',
          address: selected.address || ''
        };
      }

      // 5. Create Courier Document matching Flutter Admin App schema
      const courierData = {
        comission: commKg,
        deliveryBoyID: assignedDriver.id,
        deliveryBoysName: assignedDriver.fullname,
        deliveryBoysPhone: assignedDriver.phone,
        deliveryBoysAddress: assignedDriver.address,
        deliveryDate: '', // Filled upon delivery
        km: distanceKm,
        parcelDescription: `${isFragileFood ? '[FRAGILE FOOD PACKAGING] ' : ''}${parcelDescription}`.trim(),
        parcelID: currentParcelID,
        parcelImage,
        parcelName: parcelName || `${priceDetails.plan.name} Consignment`,
        price: finalPrice,
        recipientAddress,
        recipientName,
        recipientPhone,
        sendersAddress,
        sendersName: sendersName || userDoc.fullname || 'Falguni Customer',
        sendersPhone: sendersPhone || userDoc.phone || '',
        status: false,
        userUID: userDoc.uid,
        weight: w,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'Courier'), courierData);

      // 6. Increment Admin ParcelID
      if (adminDoc.exists()) {
        await updateDoc(adminDocRef, { ParcelID: currentParcelID + 1 });
      }

      // Redirect to courier dashboard
      router.push('/courier');

    } catch (err: any) {
      console.error("Error creating shipment:", err);
      setError("Failed to book shipment. Please verify your details and try again.");
      setIsSubmitting(false);
    }
  };

  if (loading || !firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Breadcrumbs ── */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <Link href="/courier" className="hover:text-[#733617] transition-colors">
              Express Shipping
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <span className="text-[#733617] font-semibold">Book a Shipment</span>
          </nav>

          {/* ── 2. Top Header Banner Card ── */}
          <div className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <Link 
                  href="/courier" 
                  className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center hover:bg-white text-[#733617] transition-all shadow-xs shrink-0"
                  title="Back to Express Shipping"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#733617] mb-1">
                    Falguni Shipping Services • Doorstep Dispatch
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] tracking-tight">
                    Book a Shipment
                  </h1>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-xs text-[#65544A] self-start sm:self-auto">
                <ShieldCheck size={14} className="text-[#733617]" />
                <span className="font-medium">Direct Doorstep Pickup &amp; Express Handling</span>
              </div>
            </div>
          </div>

          {/* ── Plan Selector Header Bar ── */}
          <div className="bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D1508]">
                1. Select Shipping Plan
              </span>
              <span className="text-[11px] text-[#733617] font-semibold">
                {priceDetails.plan.transit}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(PLANS) as PlanType[]).map((pKey) => {
                const p = PLANS[pKey];
                const isSelected = selectedPlan === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setSelectedPlan(pKey)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#733617] bg-[#FAF7F2] shadow-xs' 
                        : 'border-[#EFE6DC] bg-white hover:border-[#733617]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#733617]' : 'text-[#2D1508]'}`}>
                        {p.name}
                      </span>
                      <span className="font-serif font-bold text-xs text-[#733617]">
                        from ₹{p.basePrice}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#2D1508]/60">{p.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* ── LEFT 2 COLUMNS: Form Inputs ── */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* SENDER DETAILS */}
                <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FAF7F2]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] flex items-center justify-center text-[11px] font-bold">
                        A
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#2D1508]">
                        Pickup Origin (Sender)
                      </h3>
                    </div>

                    {userDoc?.deliveryAddress && (
                      <button
                        type="button"
                        onClick={handleUseDefaultAddress}
                        className="text-[11px] font-bold text-[#733617] hover:underline cursor-pointer"
                      >
                        Autofill My Address
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        icon={User}
                        label="Sender Full Name"
                        value={sendersName}
                        onChange={setSendersName}
                        required
                        placeholder="Your full name"
                      />
                      <InputField
                        icon={Phone}
                        label="Sender Phone"
                        value={sendersPhone}
                        onChange={setSendersPhone}
                        required
                        type="tel"
                        placeholder="Mobile for pickup OTP"
                      />
                    </div>

                    <AddressAutocompleteField
                      icon={MapPin}
                      label="Pickup Doorstep Address"
                      value={sendersAddress}
                      onChange={setSendersAddress}
                      placeholder="Flat, House no., Street, Area in Ahmedabad..."
                      required
                    />
                  </div>
                </div>

                {/* RECIPIENT DETAILS */}
                <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FAF7F2]">
                    <div className="w-6 h-6 rounded-full bg-[#733617] text-white flex items-center justify-center text-[11px] font-bold">
                      B
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#2D1508]">
                      Delivery Destination (Recipient)
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        icon={User}
                        label="Recipient Name"
                        value={recipientName}
                        onChange={setRecipientName}
                        required
                        placeholder="Receiver's name"
                      />
                      <InputField
                        icon={Phone}
                        label="Recipient Phone"
                        value={recipientPhone}
                        onChange={setRecipientPhone}
                        required
                        type="tel"
                        placeholder="Receiver's contact number"
                      />
                    </div>

                    <AddressAutocompleteField
                      icon={MapPin}
                      label="Recipient Delivery Address"
                      value={recipientAddress}
                      onChange={setRecipientAddress}
                      placeholder="Destination street, society, city, pincode..."
                      required
                    />
                  </div>
                </div>

                {/* PARCEL SPECIFICATIONS */}
                <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FAF7F2]">
                    <Package size={18} className="text-[#733617]" />
                    <h3 className="font-serif font-bold text-base text-[#2D1508]">
                      Parcel Specifications
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <InputField
                      icon={Package}
                      label="Parcel Contents / Title"
                      value={parcelName}
                      onChange={setParcelName}
                      placeholder="e.g. Kaju Katli Box, Dryfruit Kachori, Festive Hamper"
                      required
                    />

                    {/* Weight selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
                          <Scale size={13} className="text-[#733617]" /> Package Weight
                        </label>
                        <span className="text-xs font-bold text-[#733617]">{weight} kg</span>
                      </div>

                      <div className="flex items-center gap-2 mb-2.5">
                        {['0.5', '1', '2', '5', '10'].map((wStr) => (
                          <button
                            key={wStr}
                            type="button"
                            onClick={() => setWeight(wStr)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              weight === wStr
                                ? 'bg-[#733617] text-white border-[#733617]'
                                : 'bg-white border-[#EFE6DC] text-[#2D1508] hover:border-[#733617]/40'
                            }`}
                          >
                            {wStr} kg
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 bg-[#FAF7F2] rounded-xl px-3 py-2 border border-[#EFE6DC]">
                        <span className="text-xs text-[#2D1508]/60">Custom Weight:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="50"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-[#2D1508] focus:outline-none"
                          placeholder="e.g. 1.5"
                          required
                        />
                        <span className="text-xs font-bold text-[#2D1508]/60">KG</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
                        <AlignLeft size={13} className="text-[#733617]" /> Instructions & Note
                      </label>
                      <textarea
                        required
                        value={parcelDescription}
                        onChange={(e) => setParcelDescription(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-3.5 text-xs text-[#2D1508] placeholder-[#2D1508]/40 focus:outline-none focus:border-[#733617] focus:bg-white transition-all resize-none h-24"
                        placeholder="Mention any delivery timing requests, gate codes, or item handling instructions..."
                      />
                    </div>

                    {/* Delicate Food Checkbox */}
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFragileFood}
                        onChange={(e) => setIsFragileFood(e.target.checked)}
                        className="w-4 h-4 text-[#733617] rounded border-[#EFE6DC] focus:ring-[#733617]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#2D1508] block">Delicate Sweets / Farsan Handling</span>
                        <span className="text-[11px] text-[#2D1508]/60 block">We apply upright labels and food-safe cushioning.</span>
                      </div>
                    </label>

                    {/* Parcel Photo Upload Dropzone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
                        <ImageIcon size={13} className="text-[#733617]" /> Parcel Photo (Optional)
                      </label>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-28 border-2 border-dashed border-[#EFE6DC] bg-[#FAF7F2] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#733617]/50 hover:bg-white transition-all relative overflow-hidden group"
                      >
                        {imagePreview ? (
                          <>
                            <Image 
                              src={imagePreview} 
                              alt="Parcel preview" 
                              fill 
                              className="object-cover opacity-85 group-hover:opacity-60 transition-opacity" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                              <span className="text-white font-bold text-[10px] uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-lg">
                                Change Photo
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-center px-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shadow-xs">
                              <Upload size={15} />
                            </div>
                            <span className="text-xs font-semibold text-[#2D1508]/80">Upload package photo</span>
                            <span className="text-[10px] text-[#2D1508]/50">Helps delivery rider identify the parcel</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden" 
                        />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* ── RIGHT COLUMN: Sticky Order Summary & Booking CTA ── */}
              <div className="lg:col-span-1 lg:sticky lg:top-28 flex flex-col gap-4">
                
                <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#733617] mb-1">
                    Booking Summary
                  </div>
                  
                  <h3 className="font-serif text-xl font-bold text-[#2D1508] mb-4">
                    {priceDetails.plan.name}
                  </h3>

                  {/* Route Summary */}
                  <div className="bg-[#FAF7F2] rounded-xl p-3 border border-[#EFE6DC] text-xs mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#2D1508]">
                      <span className="w-4 h-4 rounded-full bg-[#EFE6DC] text-[#733617] flex items-center justify-center text-[9px] font-bold">A</span>
                      <span className="truncate">{sendersAddress || 'Pickup address not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#2D1508]">
                      <span className="w-4 h-4 rounded-full bg-[#733617] text-white flex items-center justify-center text-[9px] font-bold">B</span>
                      <span className="truncate">{recipientAddress || 'Destination address not set'}</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="flex flex-col gap-2.5 pb-4 border-b border-[#EFE6DC] text-xs">
                    <div className="flex items-center justify-between text-[#2D1508]">
                      <span className="text-[#2D1508]/70">Base Freight:</span>
                      <span className="font-semibold">₹{priceDetails.baseFreight}</span>
                    </div>

                    {priceDetails.weightAddon > 0 && (
                      <div className="flex items-center justify-between text-[#2D1508]">
                        <span className="text-[#2D1508]/70">Weight ({priceDetails.weightNum} kg):</span>
                        <span className="font-semibold">+₹{priceDetails.weightAddon}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[#2D1508]">
                      <span className="text-[#2D1508]/70">Protective Packaging:</span>
                      <span className="font-bold text-emerald-700">₹0 (Free)</span>
                    </div>

                    <div className="flex items-center justify-between text-[#2D1508]">
                      <span className="text-[#2D1508]/70">Doorstep Pickup:</span>
                      <span className="font-bold text-emerald-700">Included</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-baseline justify-between pt-4 mb-5">
                    <span className="font-serif font-bold text-sm text-[#2D1508]">Total Payable</span>
                    <span className="font-serif text-2xl font-bold text-[#733617]">
                      ₹{priceDetails.finalTotal}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#733617] hover:bg-[#5C2B12] text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Securing Consignment...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Dispatch</span>
                        <Check size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[#2D1508]/50 text-center mt-3">
                    By booking, you confirm parcel does not contain prohibited flammable substances.
                  </p>
                </div>

                {/* Trust Strip */}
                <div className="bg-[#F5EBE1]/60 border border-[#EFE6DC] rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#2D1508]">
                    <ShieldCheck size={15} className="text-[#733617] flex-shrink-0" />
                    <span>Food-grade sealed protection guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#2D1508]">
                    <Clock size={15} className="text-[#733617] flex-shrink-0" />
                    <span>Transit: <strong>{priceDetails.plan.transit}</strong></span>
                  </div>
                </div>

              </div>

            </div>
          </form>

        </div>
      </div>
    </PageShell>
  );
}

export default function AddCourierPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    }>
      <AddCourierContent />
    </Suspense>
  );
}

function InputField({ 
  icon: Icon, 
  label, 
  value, 
  onChange, 
  required = false, 
  type = "text",
  placeholder,
}: { 
  icon: any; 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-[#2D1508] flex items-center gap-1.5">
        <Icon size={13} className="text-[#733617]" /> {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl px-4 py-3 text-xs text-[#2D1508] placeholder-[#2D1508]/40 focus:outline-none focus:border-[#733617] focus:bg-white transition-all"
      />
    </div>
  );
}

