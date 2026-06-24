'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteUser, signOut } from 'firebase/auth';
import { db, storage, auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, User, Mail, Phone, Camera, MapPin, Trash2, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EditProfilePage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();
  
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    } else if (userDoc && firebaseUser) {
      setFullname(userDoc.fullname || '');
      setPhone(userDoc.phone || '');
      setEmail(firebaseUser.email || '');
      setImagePreview(userDoc.userPic || firebaseUser.photoURL || '');
    }
  }, [firebaseUser, userDoc, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userDoc) return;
    
    setIsSubmitting(true);

    try {
      let finalPicUrl = userDoc.userPic || '';

      if (imageFile) {
        const storageRef = ref(storage, `profile_images/${firebaseUser.uid}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalPicUrl = await getDownloadURL(snapshot.ref);
      }

      const formattedPhone = phone.startsWith('+') ? phone : (phone ? `+91${phone}` : '');

      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        fullname,
        phone: formattedPhone,
        userPic: finalPicUrl,
        photoUrl: finalPicUrl // Keep sync with flutter app fields if needed
      });

      // Reload window to sync auth store
      window.location.href = '/profile';

    } catch (err: any) {
      console.error("Error updating profile:", err);
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return;
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid));
      await deleteUser(firebaseUser);
      await signOut(auth);
      window.location.href = '/';
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      alert("Failed to delete account. You may need to log in again to verify your identity.");
    }
  };

  if (loading || !firebaseUser || !userDoc) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#2B1B17] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const defaultAddress = userDoc.deliveryAddress || userDoc.address || "Select Address";

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-[140px] relative">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 pt-16 md:pt-20">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
              <Link href="/profile" className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all group">
                <ArrowLeft size={18} className="text-white/60 group-hover:text-[#D4AF37] transition-colors" />
              </Link>
              <div>
                <h1 className="text-white text-2xl md:text-3xl font-serif italic tracking-wide">Edit Profile</h1>
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">PERSONAL DETAILS</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />

            <form onSubmit={handleSave} className="relative z-10 flex flex-col gap-8">
              
              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 rounded-full overflow-hidden border border-white/10 bg-[#2F2525] flex items-center justify-center shadow-2xl transition-all group-hover:border-[#D4AF37]/50">
                    {imagePreview ? (
                      <Image src={imagePreview} alt={fullname} fill className="object-cover" />
                    ) : (
                      <span className="text-[#D4AF37] text-4xl font-light tracking-widest">
                        {fullname.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg border-4 border-[#2B1B17]">
                    <Camera size={16} className="text-[#2B1B17]" strokeWidth={2.5} />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-[10px] tracking-wider uppercase ml-1 flex items-center gap-2">
                    <User size={12} className="text-[#D4AF37]/60" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/[0.07] border border-white/15 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.1] transition-all text-sm font-light placeholder:text-white/30"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-[10px] tracking-wider uppercase ml-1 flex items-center gap-2">
                    <Mail size={12} className="text-[#D4AF37]/60" /> Email Address
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white/50 cursor-not-allowed transition-all text-sm font-light"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-[10px] tracking-wider uppercase ml-1 flex items-center gap-2">
                    <Phone size={12} className="text-[#D4AF37]/60" /> Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-sm">+91</span>
                    <input
                      type="tel"
                      required
                      value={phone.replace(/^\+91/, '')}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="XXXXX XXXXX"
                      maxLength={10}
                      className="w-full bg-white/[0.07] border border-white/15 rounded-2xl pl-14 pr-5 py-4 text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.1] transition-all text-sm font-light placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Default Address Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-[10px] tracking-wider uppercase ml-1 flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]/60" /> Default Address
                  </label>
                  <Link href="/profile/addresses" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.05] hover:border-[#D4AF37]/30 transition-all group">
                    <span className="text-white/80 text-sm font-light truncate max-w-[80%]">{defaultAddress}</span>
                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                  </Link>
                </div>

              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D4AF37] text-[#2B1B17] px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-[#2B1B17] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-[#2B1B17]/20 border-t-[#2B1B17] rounded-full animate-spin" />
                  ) : (
                    <>
                      Save Changes
                      <Check size={16} strokeWidth={3} />
                    </>
                  )}
                </button>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-8 py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                    Delete My Account
                  </button>
                ) : (
                  <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col gap-4 items-center text-center animate-fade-in">
                    <AlertTriangle size={24} className="text-red-400" />
                    <p className="text-red-300 text-xs leading-relaxed max-w-sm">
                      Are you sure you want to delete your account? This action is permanent and cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
