'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Upload, Package, MapPin, User, Scale, AlignLeft, Check, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddCourierPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();
  
  // Form State
  const [sendersAddress, setSendersAddress] = useState(userDoc?.deliveryAddress || '');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [parcelName, setParcelName] = useState('');
  const [weight, setWeight] = useState('');
  const [parcelDescription, setParcelDescription] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const calculateDistance = () => {
    // In a real app with Google Maps, we would calculate actual distance.
    // For now, we mock a random distance between 2 and 20 km.
    return Math.floor(Math.random() * 18) + 2;
  };

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

      // 2. Fetch Pricing Logic
      const kgStatusDoc = await getDoc(doc(db, 'Courier System', 'Kg Courier'));
      const detailsDoc = await getDoc(doc(db, 'Courier System', 'Courier Details'));
      
      const kgStatus = kgStatusDoc.exists() ? kgStatusDoc.data()?.['Kg Courier'] : false;
      const kgPrice = detailsDoc.exists() ? detailsDoc.data()?.kg : 0;
      const kmPrice = detailsDoc.exists() ? detailsDoc.data()?.km : 0;
      const commKg = detailsDoc.exists() ? detailsDoc.data()?.deliveryCommissionKg : 0;
      const commKm = detailsDoc.exists() ? detailsDoc.data()?.deliveryCommissionKm : 0;

      const distanceKm = calculateDistance();
      const w = parseFloat(weight) || 1;
      
      const finalPrice = kgStatus ? (w * kgPrice) : (distanceKm * kmPrice);
      const commission = kgStatus ? commKg : commKm;

      // 3. Get Parcel ID from Admin
      const adminDocRef = doc(db, 'Admin', 'Admin');
      const adminDoc = await getDoc(adminDocRef);
      const currentParcelID = adminDoc.exists() ? adminDoc.data()?.ParcelID : 1000;

      // 4. Assign Random Driver
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      let assignedDriver = { id: '', fullname: '', phone: '', address: '' };
      
      if (!driversSnapshot.empty) {
        const drivers = driversSnapshot.docs.map(d => ({ ...d.data(), docId: d.id }));
        const randomIdx = Math.floor(Math.random() * drivers.length);
        const selected = drivers[randomIdx];
        assignedDriver = {
          id: selected.id || selected.docId,
          fullname: selected.fullname || 'Assigned Rider',
          phone: selected.phone || '',
          address: selected.address || ''
        };
      }

      // 5. Create Courier Document
      const courierData = {
        comission: commission,
        deliveryBoyID: assignedDriver.id,
        deliveryBoysName: assignedDriver.fullname,
        deliveryBoysPhone: assignedDriver.phone,
        deliveryBoysAddress: assignedDriver.address,
        deliveryDate: '', // Filled when delivered
        km: distanceKm,
        parcelDescription,
        parcelID: currentParcelID,
        parcelImage,
        parcelName,
        price: finalPrice,
        recipientAddress,
        recipientName,
        recipientPhone,
        sendersAddress,
        sendersName: userDoc.fullname,
        sendersPhone: userDoc.phone || '',
        status: false,
        userUID: userDoc.uid,
        weight: w,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'Courier'), courierData);

      // 6. Update Admin ParcelID
      if (adminDoc.exists()) {
        await updateDoc(adminDocRef, { ParcelID: currentParcelID + 1 });
      }

      router.push('/courier');

    } catch (err: any) {
      console.error("Error creating shipment:", err);
      setError("Failed to create shipment. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading || !firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#2B1B17] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-[140px] relative">
        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 pt-16 md:pt-20">
          
          {/* Header */}
          <div className="flex items-center gap-6 mb-10">
            <Link href="/courier" className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all group">
              <ArrowLeft size={18} className="text-white/60 group-hover:text-[#D4AF37] transition-colors" />
            </Link>
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-serif italic tracking-wide">Initiate Shipment</h1>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">LOGISTICS</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <SectionTitle text="Locations" />
                
                <InputField 
                  icon={MapPin} 
                  label="Sender Address" 
                  value={sendersAddress} 
                  onChange={setSendersAddress} 
                  required 
                />
                
                <InputField 
                  icon={MapPin} 
                  label="Recipient Address" 
                  value={recipientAddress} 
                  onChange={setRecipientAddress} 
                  required 
                />

                <div className="my-2" />
                <SectionTitle text="Recipient Info" />

                <InputField 
                  icon={User} 
                  label="Recipient Name" 
                  value={recipientName} 
                  onChange={setRecipientName} 
                  required 
                />
                
                <InputField 
                  icon={User} 
                  label="Recipient Phone" 
                  value={recipientPhone} 
                  onChange={setRecipientPhone} 
                  type="tel"
                  required 
                />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <SectionTitle text="Parcel Details" />
                
                <InputField 
                  icon={Package} 
                  label="Parcel Name" 
                  value={parcelName} 
                  onChange={setParcelName} 
                  required 
                />
                
                <InputField 
                  icon={Scale} 
                  label="Weight (Kg)" 
                  value={weight} 
                  onChange={setWeight} 
                  type="number"
                  step="0.1"
                  required 
                />

                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-xs tracking-wider uppercase ml-1 flex items-center gap-2">
                    <AlignLeft size={14} /> Description
                  </label>
                  <textarea
                    required
                    value={parcelDescription}
                    onChange={(e) => setParcelDescription(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all resize-none h-28 text-sm"
                    placeholder="Enter parcel contents and instructions..."
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-white/40 text-xs tracking-wider uppercase ml-1 flex items-center gap-2">
                    <ImageIcon size={14} /> Parcel Image (Optional)
                  </label>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/50 hover:bg-white/[0.02] transition-all relative overflow-hidden group"
                  >
                    {imagePreview ? (
                      <>
                        <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold tracking-widest text-[10px] uppercase bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all">
                          <Upload size={18} />
                        </div>
                        <span className="text-white/40 text-xs font-light group-hover:text-[#D4AF37] transition-colors">Click to upload photo</span>
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

            {/* Footer / Submit */}
            <div className="mt-12 pt-8 border-t border-white/[0.05] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-[#D4AF37] text-[#2B1B17] px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-[#2B1B17] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#2B1B17]/20 border-t-[#2B1B17] rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    Confirm Shipment
                    <Check size={16} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </PageShell>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <h3 className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] opacity-80 border-b border-[#D4AF37]/10 pb-2 mb-2">
      {text}
    </h3>
  );
}

function InputField({ 
  icon: Icon, 
  label, 
  value, 
  onChange, 
  required = false, 
  type = "text",
  step
}: { 
  icon: any; 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  required?: boolean;
  type?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/40 text-[10px] tracking-wider uppercase ml-1 flex items-center gap-2">
        <Icon size={12} className="text-[#D4AF37]/60" /> {label}
      </label>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all text-sm font-light"
      />
    </div>
  );
}
