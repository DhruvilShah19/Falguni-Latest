'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteUser, signOut, updateProfile } from 'firebase/auth';
import { db, storage, auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, User, Mail, Phone, Camera, MapPin, 
  Trash2, Check, AlertTriangle, Sparkles, CheckCircle2, 
  AlertCircle, ChevronRight, Lock, ShieldCheck
} from 'lucide-react';
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
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form fields when auth is ready
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/profile/edit');
    } else if (firebaseUser) {
      const initialName = userDoc?.fullname || firebaseUser.displayName || '';
      setFullname(initialName);

      // Clean phone number (strip +91 prefix for the input)
      const rawPhone = userDoc?.phone || firebaseUser.phoneNumber || '';
      setPhone(rawPhone.replace(/^\+91/, '').replace(/\s+/g, ''));

      setEmail(firebaseUser.email || '');
      setImagePreview(userDoc?.userPic || firebaseUser.photoURL || '');
    }
  }, [firebaseUser, userDoc, loading, router]);

  // Dismiss status messages after 5 seconds
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ text: 'Image size should be less than 5MB.', type: 'error' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      let finalPicUrl = imagePreview;

      // Upload new image if selected
      if (imageFile) {
        try {
          const storageRef = ref(storage, `profile_images/${firebaseUser.uid}_${Date.now()}`);
          const snapshot = await uploadBytes(storageRef, imageFile);
          finalPicUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadErr) {
          console.warn('Storage upload warning:', uploadErr);
          // If storage upload fails, proceed without blocking profile details update
        }
      }

      // Format Indian phone number
      const cleanPhone = phone.trim().replace(/\D/g, '');
      const formattedPhone = cleanPhone ? `+91${cleanPhone.slice(-10)}` : '';

      // Update Firestore user document
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        fullname: fullname.trim(),
        phone: formattedPhone,
        userPic: finalPicUrl,
        photoUrl: finalPicUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Update Firebase Auth profile if possible
      try {
        await updateProfile(firebaseUser, {
          displayName: fullname.trim(),
          photoURL: finalPicUrl || undefined,
        });
      } catch (authProfileErr) {
        console.warn('Auth updateProfile warning:', authProfileErr);
      }

      setStatusMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsSubmitting(false);

      // Smooth transition back to profile after brief confirmation
      setTimeout(() => {
        router.push('/profile');
      }, 1200);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setStatusMessage({ 
        text: err?.message || 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
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
      console.error('Error deleting account:', err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setStatusMessage({
        text: 'Failed to delete account. For security, please log out and log in again before deleting.',
        type: 'error',
      });
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

  const defaultAddress = userDoc?.deliveryAddress || userDoc?.DeliveryAddress || 'No default address set';
  const userInitials = (fullname || firebaseUser.displayName || 'Friend')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'FP';

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          {/* ── 1. Breadcrumbs (Standard Left-Aligned) ── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-4 sm:mb-6 font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <Link href="/profile" className="hover:text-[#733617] transition-colors">
              My Account
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">
              Edit Profile
            </span>
          </nav>

          {/* ── 2. Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              
              <div className="flex items-start sm:items-center gap-4">
                <Link
                  href="/profile"
                  aria-label="Back to My Account"
                  className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center hover:bg-white text-[#733617] transition-all shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-[#733617]"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </Link>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[10px] font-bold uppercase tracking-[0.15em] text-[#733617] mb-1">
                    <Sparkles size={11} className="text-[#C88A2C]" aria-hidden="true" />
                    <span>Falguni Parivar • વ્યક્તિગત વિગત</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] tracking-tight">
                    Edit Profile Details
                  </h1>
                  <p className="text-xs sm:text-sm text-[#65544A] mt-0.5 leading-relaxed">
                    Update your personal details, contact information, and delivery profile.
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5DCD3] bg-[#FAF7F2] hover:bg-[#EFE6DC] text-xs font-bold text-[#2D1508] transition-colors shrink-0 self-start sm:self-auto"
              >
                Cancel
              </Link>
            </div>
          </header>

          {/* ── 3. Status Notification Banner ── */}
          {statusMessage && (
            <div className={`p-4 rounded-xl border mb-6 flex items-center gap-3 text-xs sm:text-sm font-medium animate-fade-in ${
              statusMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ── 4. Main Edit Profile Form Card ── */}
          <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              
              {/* Profile Avatar Frame */}
              <div className="flex flex-col items-center justify-center pb-6 border-b border-[#EFE6DC]">
                <div className="relative group mb-3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#EFE6DC] bg-[#FAF7F2] flex items-center justify-center shadow-xs cursor-pointer group-hover:border-[#733617] transition-all relative"
                  >
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        alt={fullname || 'Profile photo'} 
                        fill 
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover" 
                      />
                    ) : (
                      <span className="text-[#733617] font-serif text-3xl font-bold">
                        {userInitials}
                      </span>
                    )}

                    {/* Camera Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white">
                      <Camera size={22} />
                      <span className="text-[9px] font-bold uppercase tracking-wider mt-1">Change</span>
                    </div>
                  </div>

                  {/* Camera Action Badge */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload new profile picture"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#733617] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#5A290F] transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#733617] hover:underline"
                  >
                    Upload Photo
                  </button>
                  {imagePreview && (
                    <>
                      <span className="text-[#B5A599] text-xs">•</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove Photo
                      </button>
                    </>
                  )}
                </div>

                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 gap-5">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullname" className="text-[#65544A] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <User size={13} className="text-[#733617]" /> Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-4 py-3 text-[#2D1508] text-sm focus:outline-none focus:border-[#733617] focus:bg-white focus:ring-2 focus:ring-[#733617]/10 transition-all placeholder-[#9E8E84]"
                  />
                </div>

                {/* Email Address (Read-Only) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="email" className="text-[#65544A] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <Mail size={13} className="text-[#733617]" /> Email Address
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Verified Login
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    readOnly
                    value={email || 'No email associated'}
                    className="w-full bg-[#F5EBE1]/60 border border-[#EFE6DC] rounded-xl px-4 py-3 text-[#65544A] cursor-not-allowed text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#8A796F] ml-1">
                    Your email is tied to your login authentication credentials and cannot be changed here.
                  </p>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-[#65544A] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Phone size={13} className="text-[#733617]" /> Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#733617] text-sm font-bold pointer-events-none">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl pl-13 pr-4 py-3 text-[#2D1508] text-sm focus:outline-none focus:border-[#733617] focus:bg-white focus:ring-2 focus:ring-[#733617]/10 transition-all placeholder-[#9E8E84]"
                    />
                  </div>
                  <p className="text-[11px] text-[#8A796F] ml-1">
                    Used for order dispatch notifications, WhatsApp tracking updates, and delivery confirmations.
                  </p>
                </div>

                {/* Default Delivery Address Card */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-[#65544A] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#733617]" /> Default Delivery Address
                  </label>
                  <Link 
                    href="/profile/addresses" 
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl p-4 flex items-center justify-between hover:border-[#733617] hover:bg-[#F5EBE1]/40 transition-all group shadow-2xs"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0 mt-0.5">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-[#2D1508] block truncate">
                          {defaultAddress}
                        </span>
                        <span className="text-[11px] text-[#8A796F] block mt-0.5">
                          Click to manage your saved delivery addresses
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#733617] shrink-0">
                      <span>Manage</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#EFE6DC] flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  href="/profile"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E5DCD3] text-[#65544A] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-colors text-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ── 5. Account Security Trust Strip ── */}
          <div className="bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 flex items-center gap-4 mb-8 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2D1508]">Your Privacy & Data are Protected</h4>
              <p className="text-[11px] text-[#65544A] mt-0.5">
                Your contact details are encrypted and never shared with third-party marketers.
              </p>
            </div>
          </div>

          {/* ── 6. Danger Zone (Delete Account) ── */}
          <div className="bg-white border border-red-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={14} className="text-red-600" /> Danger Zone
                </h3>
                <p className="text-xs text-[#65544A] max-w-md leading-relaxed">
                  Permanently delete your Falguni account, order history, saved addresses, and reward profile.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold uppercase tracking-wider text-[11px] hover:bg-red-100 transition-colors shrink-0 self-start sm:self-auto cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto p-4 rounded-xl border border-red-300 bg-red-50 flex flex-col gap-3 text-center sm:text-left animate-fade-in">
                  <p className="text-red-800 text-xs font-semibold leading-snug">
                    Are you sure? This action cannot be reversed.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 rounded-lg bg-white border border-[#E5DCD3] text-xs font-semibold text-[#2D1508] hover:bg-[#FAF7F2] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}

