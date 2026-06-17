'use client';
import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Globe, Navigation, Youtube, Instagram, Smartphone, ArrowRight, Link2 } from 'lucide-react';
import { SiSwiggy, SiFlipkart } from 'react-icons/si';
import { FaAmazon } from 'react-icons/fa';
import PageShell from '@/components/layout/PageShell';

export default function ContactPage() {
  return (
    <PageShell>
      <div className="min-h-screen bg-[#1A110D] flex flex-col pb-[140px] relative overflow-hidden">
        
        {/* Ambient Background Glow (Minimal) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

        {/* ── Ultra Premium Hero ── */}
        <div className="relative w-full pt-32 pb-16 px-6 z-10 flex flex-col items-center">
           <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 flex items-center justify-center gap-4 sm:gap-6 w-full max-w-sm">
             <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
             GET IN TOUCH
             <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
           </span>
           <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight text-center leading-tight drop-shadow-[0_0_20px_rgba(212,175,55,0.1)] italic">
             Contact Us
           </h1>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 relative z-10 flex flex-col gap-12 sm:gap-16">
          
          {/* ── Main Contact & Map Section (Minimal Grid) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Contact Info Card Minimal */}
            <div className="lg:col-span-5 flex flex-col justify-center bg-gradient-to-br from-white/[0.03] to-transparent border border-[#D4AF37]/10 rounded-[32px] p-8 sm:p-10 backdrop-blur-sm">
              <h2 className="text-3xl sm:text-4xl font-serif italic text-white mb-2">Falguni Gruh Udhyog</h2>
              <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-10">Gourmet Grocery Store</p>

              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm sm:text-base font-bold mb-1">Located in: Hirak Centre</p>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-sm">
                      Shop No 1, Hirak Complex, opposite Shakti Enclave, Nehru Park, Mahavir Nagar society, Vastrapur, Ahmedabad, Gujarat 380015
                    </p>
                    <a href="https://maps.app.goo.gl/PzS4L4kGZ2F3G1D66" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                      <Navigation size={14} /> Get Directions
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone size={20} className="text-[#D4AF37] flex-shrink-0" />
                  <a href="tel:+919825382002" className="text-white text-lg sm:text-xl font-serif hover:text-[#D4AF37] transition-colors">+91 98253 82002</a>
                </div>

                <div className="flex items-start gap-4">
                  <Clock size={20} className="text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-white text-sm sm:text-base font-bold mb-1">10 AM – 9 PM</span>
                    <span className="text-white/50 text-xs sm:text-sm">Store Hours</span>
                    <span className="text-[#D4AF37] text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-2 bg-[#D4AF37]/10 px-2.5 py-1 rounded-md inline-block w-max">Pickup: 9 AM – 5 PM</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Globe size={20} className="text-[#D4AF37] flex-shrink-0" />
                  <Link href="/" className="text-white text-sm hover:text-[#D4AF37] transition-colors">falgunigruhudhyog.in</Link>
                </div>
              </div>
              
              {/* Minimal Popular Times */}
              <div className="mt-10 pt-8 border-t border-white/5 relative z-10 w-full">
                <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2"><Clock size={16} className="text-[#D4AF37]" /> Popular times</h3>
                <div className="flex items-end gap-1.5 sm:gap-2 h-12 w-full opacity-90">
                  <div className="flex-1 bg-white/10 rounded-sm h-[20%] relative group hover:bg-white/20 transition-colors"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-white/10 px-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">10 AM</div></div>
                  <div className="flex-1 bg-white/10 rounded-sm h-[30%] relative group hover:bg-white/20 transition-colors"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-white/10 px-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">12 PM</div></div>
                  <div className="flex-1 bg-white/10 rounded-sm h-[40%] relative group hover:bg-white/20 transition-colors"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-white/10 px-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">2 PM</div></div>
                  <div className="flex-1 bg-white/10 rounded-sm h-[60%] relative group hover:bg-white/20 transition-colors"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-white/10 px-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">4 PM</div></div>
                  <div className="flex-1 bg-[#D4AF37]/80 rounded-sm h-[100%] relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-[#D4AF37]/20 px-1 rounded text-[9px] text-[#D4AF37] opacity-100 whitespace-nowrap z-10 font-bold">6 PM</div></div>
                  <div className="flex-1 bg-white/10 rounded-sm h-[80%] relative group hover:bg-white/20 transition-colors"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-white/10 px-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">8 PM</div></div>
                  <div className="flex-1 bg-white/10 rounded-sm h-[20%] relative group hover:bg-white/20 transition-colors"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A110D] border border-white/10 px-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">9 PM</div></div>
                </div>
                <div className="flex justify-between text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-2 px-1 w-full">
                  <span>10 AM</span>
                  <span>1 PM</span>
                  <span>4 PM</span>
                  <span>7 PM</span>
                  <span>9 PM</span>
                </div>
                <p className="text-[#D4AF37]/80 text-[10px] sm:text-[11px] mt-4 flex items-center gap-1.5 font-medium"><Clock size={12} /> People typically spend 15 min here</p>
              </div>

            </div>

            {/* Right: Map Embed */}
            <div className="lg:col-span-7 rounded-[32px] overflow-hidden border border-white/5 min-h-[400px] sm:min-h-[500px] lg:min-h-full w-full relative bg-black">
              <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none mix-blend-overlay z-10" />
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5977934446096!2d72.5270146!3d23.0385315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84cb95555555%3A0xcabf35b44df0e104!2sFalguni%20Gruh%20Udhyog%20(Vastrapur)!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(85%) grayscale(20%)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Falguni Gruh Udhyog Location"
                className="absolute inset-0 w-full h-full"
              />
            </div>

          </div>

          {/* ── App Promotion Section (Minimal) ── */}
          <div className="w-full bg-gradient-to-r from-white/[0.02] to-transparent border border-[#D4AF37]/10 rounded-[32px] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-white text-2xl sm:text-3xl font-serif italic mb-3">Order Anywhere, Anytime</h3>
              <p className="text-white/60 text-sm max-w-md leading-relaxed">Download our official app for the fastest checkout, exclusive app-only discounts, and real-time order tracking.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Link href="#" className="flex items-center justify-center sm:justify-start gap-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 px-6 py-3 rounded-2xl transition-colors w-full sm:w-auto">
                <Smartphone size={24} className="text-white" />
                <div className="flex flex-col text-left">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Download on the</span>
                  <span className="text-white font-bold text-sm">App Store</span>
                </div>
              </Link>
              <Link href="#" className="flex items-center justify-center sm:justify-start gap-4 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 px-6 py-3 rounded-2xl transition-colors w-full sm:w-auto">
                <Smartphone size={24} className="text-[#D4AF37]" />
                <div className="flex flex-col text-left">
                  <span className="text-[#D4AF37]/60 text-[10px] font-bold uppercase tracking-widest">GET IT ON</span>
                  <span className="text-[#D4AF37] font-bold text-sm">Google Play</span>
                </div>
              </Link>
            </div>
          </div>

          {/* ── Social Media Highlights (Minimal) ── */}
          <div className="w-full pb-6">
            <div className="flex items-center gap-4 sm:gap-6 mb-8 w-full max-w-2xl mx-auto">
               <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
               <h3 className="text-white font-serif italic text-2xl tracking-tight">Connect With Us</h3>
               <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Instagram Card Minimal */}
              <a href="https://instagram.com/falgunigruhudhyogindia" target="_blank" rel="noopener noreferrer" className="rounded-[24px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] p-6 hover:border-pink-500/30 transition-colors flex flex-col justify-between min-h-[160px]">
                <div className="flex items-start justify-between w-full mb-4">
                  <Instagram size={24} className="text-pink-500" />
                  <div className="bg-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Follow</span>
                    <ArrowRight size={12} className="text-white/70" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold mb-1">@falgunigruhudhyogindia</h4>
                  <p className="text-white/50 text-xs sm:text-sm">Watch our latest reels, behind-the-scenes, and fresh snack drops daily!</p>
                </div>
              </a>

              {/* YouTube Card Minimal */}
              <a href="https://youtube.com/@FalguniGruhUdgyogvastrapur" target="_blank" rel="noopener noreferrer" className="rounded-[24px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] p-6 hover:border-[#FF0000]/30 transition-colors flex flex-col justify-between min-h-[160px]">
                <div className="flex items-start justify-between w-full mb-4">
                  <Youtube size={28} className="text-[#FF0000]" />
                  <div className="bg-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Subscribe</span>
                    <ArrowRight size={12} className="text-white/70" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold mb-1 break-all">@FalguniGruhUdgyogvastrapur</h4>
                  <p className="text-white/50 text-xs sm:text-sm">Join us for long-form content, recipe secrets, and our gourmet journey.</p>
                </div>
              </a>

            </div>
          </div>

          {/* ── Featured Video Moments Minimal ── */}
          <div className="w-full pb-8">
            <div className="flex items-center gap-4 sm:gap-6 mb-8 w-full max-w-2xl mx-auto">
               <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
               <h3 className="text-white font-serif italic text-2xl tracking-tight">Featured Moments</h3>
               <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.05] p-4">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Instagram size={14} className="text-[#D4AF37]" />
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Latest Reel</span>
                </div>
                <div className="relative w-full rounded-xl overflow-hidden bg-white/5 aspect-[9/16]">
                   <iframe src="https://www.instagram.com/p/DW5SLoGkidG/embed" width="100%" height="100%" frameBorder="0" scrolling="no" className="absolute inset-0"></iframe>
                </div>
              </div>

              <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.05] p-4">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Youtube size={14} className="text-[#D4AF37]" />
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Our App</span>
                </div>
                <div className="relative w-full rounded-xl overflow-hidden bg-white/5 aspect-[9/16]">
                   <iframe src="https://www.youtube.com/embed/ZUnVB_55NAs" width="100%" height="100%" frameBorder="0" allowFullScreen className="absolute inset-0"></iframe>
                </div>
              </div>

              <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.05] p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Youtube size={14} className="text-[#D4AF37]" />
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Experience</span>
                </div>
                <div className="relative w-full rounded-xl overflow-hidden bg-white/5 aspect-[9/16] lg:aspect-[9/16] sm:aspect-video">
                   <iframe src="https://www.youtube.com/embed/mPpjd_owlO0" width="100%" height="100%" frameBorder="0" allowFullScreen className="absolute inset-0"></iframe>
                </div>
              </div>

            </div>
          </div>

          {/* ── Also Available On (Minimal) ── */}
          <div className="w-full flex flex-col items-center pb-12">
            <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center">Also Available On</h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              
              <a href="https://www.swiggy.com/instamart/search?custom_back=true&query=Falguni+Gruh+Udhyog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 hover:border-[#FC8019]/40 bg-white/[0.03] transition-colors">
                <SiSwiggy size={14} className="text-[#FC8019]" />
                <span className="text-white/80 text-xs font-bold">Swiggy Instamart</span>
              </a>

              <a href="https://www.flipkart.com/food-products/namkeen/falguni-gruh-udhyog~brand/pr?sid=eat,0we&marketplace=FLIPKART" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 hover:border-[#2874F0]/40 bg-white/[0.03] transition-colors">
                <SiFlipkart size={14} className="text-[#2874F0]" />
                <span className="text-white/80 text-xs font-bold">Flipkart</span>
              </a>

              <a href="https://www.amazon.in/s?k=FGU&ref=bl_dp_s_web_0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 hover:border-[#FF9900]/40 bg-white/[0.03] transition-colors">
                <FaAmazon size={14} className="text-[#FF9900]" />
                <span className="text-white/80 text-xs font-bold">Amazon</span>
              </a>

              <a href="https://taplink.cc/falgunigruhudhyog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 hover:border-indigo-400/40 bg-white/[0.03] transition-colors">
                <Link2 size={14} className="text-indigo-400" />
                <span className="text-white/80 text-xs font-bold">Taplink</span>
              </a>

            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
