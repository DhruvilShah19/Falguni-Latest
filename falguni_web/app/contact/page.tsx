'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Globe, 
  Navigation, 
  Youtube, 
  Instagram, 
  Smartphone, 
  ArrowRight, 
  Link2, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  MessageSquare,
  Gift
} from 'lucide-react';
import { SiSwiggy, SiFlipkart } from 'react-icons/si';
import { FaAmazon, FaWhatsapp } from 'react-icons/fa';
import PageShell from '@/components/layout/PageShell';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 sm:pb-28">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Contact Us</span>
          </nav>

          {/* Hero Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EBE1] via-[#FAF7F2] to-[#EFE6DC] border border-[#EFE6DC] p-6 sm:p-10 mb-10 shadow-xs">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[#EFE6DC]">
                <Sparkles size={13} className="text-[#733617]" />
                <span>સંપર્ક કરો • GET IN TOUCH</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2D1508] tracking-tight mb-3">
                Visit Our Store & Connect
              </h1>
              <p className="text-sm sm:text-base text-[#733617]/85 leading-relaxed">
                Whether you wish to place a festival bulk order, plan bespoke corporate gift hampers, or simply stop by for freshly prepared Gujarati farsan, we are delighted to assist you.
              </p>
            </div>

            {/* Decorative background embellishment */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 rounded-full bg-[#733617]/5 pointer-events-none blur-2xl" />
          </div>

          <div className="space-y-12 sm:space-y-16">
            
            {/* ── Main Contact & Map Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              
              {/* Flagship Store Info Card */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-[#EFE6DC] rounded-3xl p-7 sm:p-9 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[#733617] text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
                    <span>FLAGSHIP BOUTIQUE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] mb-1">
                    Falguni Gruh Udhyog
                  </h2>
                  <p className="text-[#733617]/80 font-medium text-xs uppercase tracking-wider mb-6">
                    Authentic Gujarati Snacks & Delicacies
                  </p>

                  <div className="flex flex-col gap-5 text-sm">
                    {/* Location */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] flex-shrink-0 mt-0.5">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[#2D1508] font-bold mb-1">Hirak Centre, Vastrapur</p>
                        <p className="text-[#733617]/80 text-xs sm:text-sm leading-relaxed">
                          Shop No. 1, Hirak Complex, opposite Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad, Gujarat 380015
                        </p>
                        <div className="flex items-center gap-4 mt-2.5">
                          <a 
                            href="https://maps.app.goo.gl/PzS4L4kGZ2F3G1D66" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-[#733617] text-xs font-bold uppercase tracking-wider hover:underline"
                          >
                            <Navigation size={13} /> Get Directions
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Phone & WhatsApp */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] flex-shrink-0 mt-0.5">
                        <Phone size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#733617]/70 text-[11px] font-bold uppercase tracking-wider">Direct Customer Line</span>
                        <a 
                          href="tel:+919825382002" 
                          className="text-[#2D1508] text-lg font-serif font-bold hover:text-[#733617] transition-colors"
                        >
                          +91 98253 82002
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <a 
                            href="https://api.whatsapp.com/send?phone=919825382002&text=Hello%20Falguni%20Gruh%20Udhyog" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                          >
                            <FaWhatsapp size={13} /> Chat on WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Timings */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] flex-shrink-0 mt-0.5">
                        <Clock size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#2D1508] font-bold mb-0.5">10:00 AM – 9:00 PM</span>
                        <span className="text-[#733617]/70 text-xs">Open 7 Days a Week</span>
                        <span className="text-[#733617] text-[11px] font-bold uppercase tracking-wider mt-2 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EFE6DC] inline-block w-max">
                          Self-Pickup: 9:00 AM – 5:00 PM
                        </span>
                      </div>
                    </div>

                    {/* Official Website */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] flex-shrink-0">
                        <Globe size={18} />
                      </div>
                      <Link 
                        href="/" 
                        className="text-[#2D1508] text-sm font-semibold hover:text-[#733617] transition-colors"
                      >
                        falgunigruhudhyog.in
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Popular Times Widget */}
                <div className="mt-8 pt-6 border-t border-[#EFE6DC] w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#2D1508] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-[#733617]" /> Popular Visiting Times
                    </h3>
                    <span className="text-[10px] text-[#733617]/70 font-medium">Peak: 6 PM - 8 PM</span>
                  </div>
                  <div className="flex items-end gap-1.5 sm:gap-2 h-12 w-full bg-[#FAF7F2] p-2 rounded-xl border border-[#EFE6DC]">
                    <div className="flex-1 bg-[#EFE6DC] hover:bg-[#733617]/30 rounded-sm h-[20%] transition-colors" title="10 AM" />
                    <div className="flex-1 bg-[#EFE6DC] hover:bg-[#733617]/30 rounded-sm h-[35%] transition-colors" title="12 PM" />
                    <div className="flex-1 bg-[#EFE6DC] hover:bg-[#733617]/30 rounded-sm h-[45%] transition-colors" title="2 PM" />
                    <div className="flex-1 bg-[#EFE6DC] hover:bg-[#733617]/30 rounded-sm h-[65%] transition-colors" title="4 PM" />
                    <div className="flex-1 bg-[#733617] rounded-sm h-[100%]" title="7 PM (Peak)" />
                    <div className="flex-1 bg-[#733617]/70 hover:bg-[#733617] rounded-sm h-[80%] transition-colors" title="8 PM" />
                    <div className="flex-1 bg-[#EFE6DC] hover:bg-[#733617]/30 rounded-sm h-[25%] transition-colors" title="9 PM" />
                  </div>
                  <div className="flex justify-between text-[#733617]/60 text-[9px] font-bold uppercase tracking-wider mt-2 px-1">
                    <span>10 AM</span>
                    <span>1 PM</span>
                    <span>4 PM</span>
                    <span>7 PM</span>
                    <span>9 PM</span>
                  </div>
                </div>

              </div>

              {/* Google Maps Interactive Frame */}
              <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#EFE6DC] min-h-[420px] sm:min-h-[500px] lg:min-h-full w-full relative bg-[#F5EBE1] shadow-xs">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5977934446096!2d72.5270146!3d23.0385315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84cb95555555%3A0xcabf35b44df0e104!2sFalguni%20Gruh%20Udhyog%20(Vastrapur)!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Falguni Gruh Udhyog Vastrapur Location"
                  className="absolute inset-0 w-full h-full"
                />
              </div>

            </div>

            {/* ── Contact Inquiry & Corporate Gifting Form ── */}
            <div className="bg-white border border-[#EFE6DC] rounded-3xl p-7 sm:p-10 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Left Description */}
                <div className="lg:col-span-5">
                  <div className="inline-flex items-center gap-1.5 text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-2 bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFE6DC]">
                    <MessageSquare size={13} />
                    <span>DIRECT INQUIRY</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] mt-2 mb-3">
                    Send Us a Message
                  </h3>
                  <p className="text-sm text-[#733617]/85 leading-relaxed mb-6">
                    Looking for corporate festive gifting, custom sweet assortments, bulk namkeen orders, or international shipping inquiries? Fill out this quick form and our Vastrapur concierge team will get back to you within 24 hours.
                  </p>

                  <div className="space-y-3.5 text-xs text-[#733617]/90">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC]">
                      <Gift size={16} className="text-[#733617] flex-shrink-0" />
                      <span>Custom corporate branding & gift packaging available</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC]">
                      <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                      <span>Freshly made batches dispatched on the day of delivery</span>
                    </div>
                  </div>
                </div>

                {/* Right Form */}
                <div className="lg:col-span-7">
                  {submitted ? (
                    <div className="p-8 sm:p-10 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                        <CheckCircle2 size={28} />
                      </div>
                      <h4 className="text-xl font-serif font-bold text-[#2D1508] mb-2">Message Received!</h4>
                      <p className="text-xs sm:text-sm text-[#733617]/85 max-w-md mb-6 leading-relaxed">
                        Thank you for reaching out, <strong>{formData.name}</strong>. Our team will review your message and contact you at {formData.phone || formData.email} shortly.
                      </p>
                      <button
                        onClick={handleReset}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#733617] hover:bg-[#5c2b12] text-white transition-colors cursor-pointer"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#733617] mb-1.5">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Patel"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-sm text-[#2D1508] placeholder-[#733617]/40 focus:outline-none focus:border-[#733617] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#733617] mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 98250 12345"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-sm text-[#2D1508] placeholder-[#733617]/40 focus:outline-none focus:border-[#733617] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#733617] mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="name@domain.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-sm text-[#2D1508] placeholder-[#733617]/40 focus:outline-none focus:border-[#733617] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#733617] mb-1.5">
                            Inquiry Purpose
                          </label>
                          <select
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-sm text-[#2D1508] focus:outline-none focus:border-[#733617] transition-colors"
                          >
                            <option value="General Inquiry">General Store Inquiry</option>
                            <option value="Corporate Gifting">Corporate & Festive Gifting</option>
                            <option value="Bulk Order">Bulk Farsan & Sweets Order</option>
                            <option value="International Shipment">International Dispatch Query</option>
                            <option value="Feedback">Customer Feedback</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#733617] mb-1.5">
                          Your Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tell us about your requirements, preferred delivery dates, or any special preferences..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-sm text-[#2D1508] placeholder-[#733617]/40 focus:outline-none focus:border-[#733617] transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#733617] hover:bg-[#5c2b12] text-white flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer disabled:opacity-70"
                      >
                        {submitting ? (
                          <span>Sending Inquiry...</span>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Submit Message</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>

            {/* ── App Promotion Banner ── */}
            <div className="w-full bg-gradient-to-r from-[#F5EBE1] to-[#FAF7F2] border border-[#EFE6DC] rounded-3xl p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#733617] mb-1">
                  OFFICIAL MOBILE EXPERIENCE
                </span>
                <h3 className="text-[#2D1508] text-2xl sm:text-3xl font-serif font-bold mb-2">
                  Order Anywhere, Anytime
                </h3>
                <p className="text-[#733617]/80 text-xs sm:text-sm max-w-md leading-relaxed">
                  Download our official app for instant order tracking, mobile-exclusive festive offers, and one-tap reordering of your favorite snacks.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Link 
                  href="#" 
                  className="flex items-center justify-center sm:justify-start gap-3 bg-[#2D1508] text-white hover:bg-[#733617] px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto shadow-xs"
                >
                  <Smartphone size={22} />
                  <div className="flex flex-col text-left">
                    <span className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Download on the</span>
                    <span className="text-white font-bold text-xs">App Store</span>
                  </div>
                </Link>
                <Link 
                  href="#" 
                  className="flex items-center justify-center sm:justify-start gap-3 bg-[#733617] text-white hover:bg-[#5c2b12] px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto shadow-xs"
                >
                  <Smartphone size={22} />
                  <div className="flex flex-col text-left">
                    <span className="text-white/60 text-[9px] font-bold uppercase tracking-wider">GET IT ON</span>
                    <span className="text-white font-bold text-xs">Google Play</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* ── Social Media Highlights ── */}
            <div className="w-full">
              <div className="flex items-center gap-4 sm:gap-6 mb-8 w-full max-w-2xl mx-auto">
                 <span className="flex-1 h-px bg-[#EFE6DC]" />
                 <h3 className="text-[#2D1508] font-serif font-bold text-2xl">Connect With Our Family</h3>
                 <span className="flex-1 h-px bg-[#EFE6DC]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Instagram Card */}
                <a 
                  href="https://instagram.com/falgunigruhudhyogindia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="rounded-3xl bg-white border border-[#EFE6DC] p-6 sm:p-7 hover:border-pink-500/50 hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] shadow-xs group"
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Instagram size={24} />
                    </div>
                    <div className="bg-[#FAF7F2] text-[#733617] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-[#EFE6DC]">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Follow</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#2D1508] text-base font-bold mb-1">@falgunigruhudhyogindia</h4>
                    <p className="text-[#733617]/75 text-xs leading-relaxed">
                      Watch our daily farsan prep, festival snack releases, and behind-the-scenes moments from Vastrapur!
                    </p>
                  </div>
                </a>

                {/* YouTube Card */}
                <a 
                  href="https://youtube.com/@FalguniGruhUdgyogvastrapur" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="rounded-3xl bg-white border border-[#EFE6DC] p-6 sm:p-7 hover:border-red-500/50 hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] shadow-xs group"
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Youtube size={26} />
                    </div>
                    <div className="bg-[#FAF7F2] text-[#733617] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-[#EFE6DC]">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Subscribe</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#2D1508] text-base font-bold mb-1 break-all">@FalguniGruhUdgyogvastrapur</h4>
                    <p className="text-[#733617]/75 text-xs leading-relaxed">
                      Watch our culinary heritage documentaries, recipe guides, and culinary stories from Gujarat.
                    </p>
                  </div>
                </a>

              </div>
            </div>

            {/* ── Featured Video Moments ── */}
            <div className="w-full">
              <div className="flex items-center gap-4 sm:gap-6 mb-8 w-full max-w-2xl mx-auto">
                 <span className="flex-1 h-px bg-[#EFE6DC]" />
                 <h3 className="text-[#2D1508] font-serif font-bold text-2xl">Featured Moments</h3>
                 <span className="flex-1 h-px bg-[#EFE6DC]" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="rounded-3xl bg-white border border-[#EFE6DC] p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Instagram size={14} className="text-[#733617]" />
                    <span className="text-[#2D1508] font-bold text-xs uppercase tracking-wider">Latest Reel</span>
                  </div>
                  <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-100 aspect-[9/16]">
                     <iframe src="https://www.instagram.com/p/DW5SLoGkidG/embed" width="100%" height="100%" frameBorder="0" scrolling="no" className="absolute inset-0" title="Instagram Reel"></iframe>
                  </div>
                </div>

                <div className="rounded-3xl bg-white border border-[#EFE6DC] p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Youtube size={14} className="text-[#733617]" />
                    <span className="text-[#2D1508] font-bold text-xs uppercase tracking-wider">Our App Story</span>
                  </div>
                  <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-100 aspect-[9/16]">
                     <iframe src="https://www.youtube.com/embed/ZUnVB_55NAs" width="100%" height="100%" frameBorder="0" allowFullScreen className="absolute inset-0" title="YouTube App Video"></iframe>
                  </div>
                </div>

                <div className="rounded-3xl bg-white border border-[#EFE6DC] p-4 sm:col-span-2 lg:col-span-1 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Youtube size={14} className="text-[#733617]" />
                    <span className="text-[#2D1508] font-bold text-xs uppercase tracking-wider">Store Experience</span>
                  </div>
                  <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-100 aspect-[9/16] lg:aspect-[9/16] sm:aspect-video">
                     <iframe src="https://www.youtube.com/embed/mPpjd_owlO0" width="100%" height="100%" frameBorder="0" allowFullScreen className="absolute inset-0" title="YouTube Store Video"></iframe>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Partner Marketplaces ── */}
            <div className="w-full flex flex-col items-center pt-4">
              <h3 className="text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-5 text-center">
                Also Available On
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                
                <a 
                  href="https://www.swiggy.com/instamart/search?custom_back=true&query=Falguni+Gruh+Udhyog" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EFE6DC] hover:border-[#FC8019] bg-white shadow-2xs transition-colors"
                >
                  <SiSwiggy size={15} className="text-[#FC8019]" />
                  <span className="text-[#2D1508] text-xs font-bold">Swiggy Instamart</span>
                </a>

                <a 
                  href="https://www.flipkart.com/food-products/namkeen/falguni-gruh-udhyog~brand/pr?sid=eat,0we&marketplace=FLIPKART" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EFE6DC] hover:border-[#2874F0] bg-white shadow-2xs transition-colors"
                >
                  <SiFlipkart size={15} className="text-[#2874F0]" />
                  <span className="text-[#2D1508] text-xs font-bold">Flipkart</span>
                </a>

                <a 
                  href="https://www.amazon.in/s?k=FGU&ref=bl_dp_s_web_0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EFE6DC] hover:border-[#FF9900] bg-white shadow-2xs transition-colors"
                >
                  <FaAmazon size={15} className="text-[#FF9900]" />
                  <span className="text-[#2D1508] text-xs font-bold">Amazon</span>
                </a>

                <a 
                  href="https://taplink.cc/falgunigruhudhyog" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EFE6DC] hover:border-indigo-500 bg-white shadow-2xs transition-colors"
                >
                  <Link2 size={15} className="text-indigo-600" />
                  <span className="text-[#2D1508] text-xs font-bold">Taplink</span>
                </a>

              </div>
            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
