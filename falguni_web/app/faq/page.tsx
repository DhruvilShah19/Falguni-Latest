'use client';

import { useState, useMemo } from 'react';
import PageShell from '@/components/layout/PageShell';
import { 
  Plus, 
  Minus, 
  ChevronRight, 
  Search, 
  HelpCircle, 
  Phone, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Package, 
  MessageSquare,
  ArrowRight,
  X
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: 'ordering' | 'delivery' | 'payments' | 'freshness' | 'returns';
  question: string;
  answer: React.ReactNode;
}

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'ordering', label: 'Ordering & Account', icon: ShoppingBag },
  { id: 'delivery', label: 'Delivery & Shipping', icon: Truck },
  { id: 'payments', label: 'Payments & Pricing', icon: CreditCard },
  { id: 'freshness', label: 'Freshness & Shelf Life', icon: Package },
  { id: 'returns', label: 'Returns & Support', icon: ShieldCheck },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const FAQS: FAQItem[] = [
  // Ordering & Account
  {
    id: 'account-need',
    category: 'ordering',
    question: "Do I need an account to shop at Falguni Gruh Udhyog?",
    answer: (
      <span>
        While you can browse our entire catalog freely, creating an account with your mobile number provides real-time SMS order updates, saved delivery addresses, access to exclusive promo codes, and your personal referral rewards link.
      </span>
    )
  },
  {
    id: 'track-order',
    category: 'ordering',
    question: "How can I track the live status of my order?",
    answer: (
      <span>
        Once your order is confirmed, you can track it live from your <Link href="/orders" className="text-[#733617] font-bold underline hover:opacity-80">My Orders</Link> dashboard. In addition, we send automated SMS notifications with courier tracking links as soon as your package is dispatched from our Vastrapur kitchen.
      </span>
    )
  },
  {
    id: 'modify-order',
    category: 'ordering',
    question: "Can I modify or add items to an order after placing it?",
    answer: (
      <span>
        Because we dispatch freshly packaged farsan quickly, orders enter fulfillment within 1–2 hours. If you need to make changes, please contact our store concierge immediately at <a href="tel:+919825382002" className="text-[#733617] font-bold underline">+91 98253 82002</a> or via WhatsApp, and we will do our best to accommodate your request before dispatch.
      </span>
    )
  },
  {
    id: 'bulk-orders',
    category: 'ordering',
    question: "Do you accept bulk orders for weddings, festivals, or corporate gifting?",
    answer: (
      <span>
        Yes! We specialize in custom festive hampers, wedding favor boxes, and corporate gift hampers with bespoke packaging. Please visit our <Link href="/contact" className="text-[#733617] font-bold underline hover:opacity-80">Contact Page</Link> to submit an inquiry or speak directly with our bulk orders team.
      </span>
    )
  },

  // Delivery & Shipping
  {
    id: 'delivery-times',
    category: 'delivery',
    question: "How soon will I receive my order?",
    answer: (
      <span>
        <strong>Local Ahmedabad:</strong> Orders are typically delivered same-day or within 24–48 hours.<br />
        <strong>Across Gujarat:</strong> 2–3 business days via express courier.<br />
        <strong>Rest of India (Pan-India):</strong> 3–5 business days depending on your pincode.<br />
        <strong>International:</strong> 7–10 business days via international air cargo partners.
      </span>
    )
  },
  {
    id: 'delivery-charges',
    category: 'delivery',
    question: "How are delivery charges calculated?",
    answer: (
      <span>
        Delivery is priced transparently based on distance and weight:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Hyperlocal (Within 5 km):</strong> ₹50 flat fee (FREE on orders above ₹600).</li>
          <li><strong>Intercity (5–10 km):</strong> ₹100 flat fee (FREE on orders above ₹1,200).</li>
          <li><strong>Interstate / Extended (10–15 km):</strong> ₹150 flat fee (FREE on orders above ₹1,800).</li>
          <li><strong>Outstation & Pan-India:</strong> Calculated per kg based on total package weight.</li>
        </ul>
        <span className="block mt-2">
          Review our comprehensive breakdown on the <Link href="/delivery-charges" className="text-[#733617] font-bold underline hover:opacity-80">Delivery Charges page</Link>.
        </span>
      </span>
    )
  },
  {
    id: 'store-pickup',
    category: 'delivery',
    question: "Can I choose Store Pickup from your Vastrapur flagship location?",
    answer: (
      <span>
        Yes! Simply select <strong>Store Pickup</strong> during checkout. Your freshly packed order will be kept ready at our Vastrapur store (Shop No. 1, Hirak Complex, Nehru Park, Vastrapur, Ahmedabad). Pickup hours are daily between <strong>9:00 AM and 5:00 PM</strong>.
      </span>
    )
  },
  {
    id: 'international-shipping',
    category: 'delivery',
    question: "Do you ship authentic Gujarati snacks overseas?",
    answer: (
      <span>
        Yes, we ship authentic snacks, vacuum-sealed khakhras, sweets, and festival specialties to the USA, UK, Canada, Australia, UAE, and other destinations. Selected perishables may have export restrictions. Contact our overseas support at <a href="tel:+919825382002" className="text-[#733617] font-bold underline">+91 98253 82002</a> for international shipping rates.
      </span>
    )
  },

  // Payments & Pricing
  {
    id: 'payment-modes',
    category: 'payments',
    question: "What online payment methods are accepted?",
    answer: (
      <span>
        We support all major Indian payment options via our secure Cashfree gateway:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>UPI:</strong> Google Pay, PhonePe, Paytm, BHIM, and any UPI app.</li>
          <li><strong>Cards:</strong> All Visa, MasterCard, RuPay, and American Express debit/credit cards.</li>
          <li><strong>Net Banking:</strong> Over 50+ major Indian banks.</li>
          <li><strong>Wallets:</strong> Popular digital wallets.</li>
        </ul>
      </span>
    )
  },
  {
    id: 'payment-security',
    category: 'payments',
    question: "Is my payment information safe and secure?",
    answer: (
      <span>
        Absolutely. All transactions are protected with bank-grade 256-bit SSL encryption. We never store your card numbers or UPI PINs on our servers; payments are processed directly through RBI-compliant, PCI-DSS certified gateway infrastructure.
      </span>
    )
  },
  {
    id: 'gst-invoice',
    category: 'payments',
    question: "Can I receive a GST tax invoice for my order?",
    answer: (
      <span>
        Yes. All customer orders receive a compliant tax invoice with GST breakdown. If you require your registered business GSTIN printed on the invoice for input tax credit, please reach out to our accounts desk with your Order ID.
      </span>
    )
  },

  // Freshness & Packaging
  {
    id: 'shelf-life',
    category: 'freshness',
    question: "What is the shelf life of your namkeens, khakhras, and sweets?",
    answer: (
      <span>
        All our items are prepared in small artisanal batches to maximize freshness:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Vacuum-Packed Khakhra:</strong> 4 to 6 months from packaging.</li>
          <li><strong>Dry Namkeens & Farsan:</strong> 2 to 3 months when stored in an airtight container.</li>
          <li><strong>Dry Fruit Sweets:</strong> 30 to 45 days.</li>
          <li><strong>Traditional Mawa & Milk Sweets:</strong> 5 to 7 days (refrigeration recommended).</li>
        </ul>
        <span className="block mt-2">
          Specific 'Best Before' dates and storage recommendations are clearly printed on every package.
        </span>
      </span>
    )
  },
  {
    id: 'protective-packaging',
    category: 'freshness',
    question: "How do you package delicate farsan to prevent breakage during transit?",
    answer: (
      <span>
        We take immense pride in our protective packaging! Each snack is packed in multi-layered, food-grade barrier pouches, sealed airtight, and cushioned with air bubbles inside heavy-duty 5-ply corrugated shipper boxes so your delicacies arrive crisp and intact.
      </span>
    )
  },

  // Returns & Support
  {
    id: 'returns-policy',
    category: 'returns',
    question: "What is your refund and replacement policy for food items?",
    answer: (
      <span>
        Because food safety, hygiene, and freshness are paramount, opened or consumed food items cannot be accepted for return. However, if your package arrived damaged in transit, with broken seals, or missing items, we will promptly provide a replacement or a full refund.
      </span>
    )
  },
  {
    id: 'damaged-transit',
    category: 'returns',
    question: "What should I do if my package arrives damaged or tampered with?",
    answer: (
      <span>
        Please take 2–3 clear photographs or a short unboxing video of the outer box and affected items within <strong>24 hours of delivery</strong>, and share them with us via WhatsApp at <a href="https://api.whatsapp.com/send?phone=919825382002" target="_blank" rel="noopener noreferrer" className="text-[#733617] font-bold underline">+91 98253 82002</a>. Our resolution team will review and dispatch a fresh replacement immediately.
      </span>
    )
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('account-need');

  // Filter FAQs by Category and Search Query
  const filteredFAQs = useMemo(() => {
    return FAQS.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesQuery = 
        faq.question.toLowerCase().includes(query) ||
        (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 sm:pb-28">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Frequently Asked Questions</span>
          </nav>

          {/* Hero Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EBE1] via-[#FAF7F2] to-[#EFE6DC] border border-[#EFE6DC] p-6 sm:p-10 mb-8 shadow-xs">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[#EFE6DC]">
                <Sparkles size={13} className="text-[#733617]" />
                <span>પ્રશ્નો અને જવાબો • HELP & SUPPORT</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2D1508] tracking-tight mb-3">
                Frequently Asked Questions
              </h1>
              <p className="text-sm sm:text-base text-[#733617]/85 leading-relaxed">
                Find quick, clear answers about ordering authentic Gujarati snacks, delivery schedules, packaging freshness, shelf life, and payment safety.
              </p>
            </div>

            {/* Decorative background embellishment */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 rounded-full bg-[#733617]/5 pointer-events-none blur-2xl" />
          </div>

          {/* Live Search & Filter Controls */}
          <div className="mb-8 space-y-4">
            
            {/* Search Input Bar */}
            <div className="relative max-w-2xl">
              <Search 
                size={18} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#733617]/60 pointer-events-none" 
              />
              <input
                type="text"
                placeholder="Search questions (e.g. delivery, UPI, shelf life, returns)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#EFE6DC] text-sm text-[#2D1508] placeholder-[#733617]/45 focus:outline-none focus:border-[#733617] shadow-xs transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#733617]/50 hover:text-[#733617] p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#733617] text-white shadow-2xs'
                        : 'bg-white text-[#733617] hover:bg-[#FAF7F2] border border-[#EFE6DC]'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Accordion Column */}
            <div className="lg:col-span-8 flex flex-col gap-3.5">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#EFE6DC] rounded-3xl p-8 shadow-xs">
                  <div className="w-14 h-14 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#733617]">
                    <HelpCircle size={26} />
                  </div>
                  <h3 className="text-xl text-[#2D1508] font-serif font-bold mb-2">No Matching Questions Found</h3>
                  <p className="text-[#733617]/80 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
                    We couldn&apos;t find any questions matching &ldquo;{searchQuery}&rdquo;. Try another search term or contact our store concierge directly.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#733617] hover:underline"
                  >
                    View All Questions <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                filteredFAQs.map((faq) => {
                  const isOpen = openId === faq.id;
                  const catMeta = CATEGORIES.find(c => c.id === faq.category);

                  return (
                    <div 
                      key={faq.id}
                      className={`bg-white border rounded-2xl sm:rounded-3xl transition-all duration-200 overflow-hidden shadow-xs ${
                        isOpen 
                          ? 'border-[#733617] shadow-sm' 
                          : 'border-[#EFE6DC] hover:border-[#733617]/40'
                      }`}
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="w-full px-6 py-4 sm:py-5 flex items-start justify-between gap-4 text-left focus:outline-none group cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <div className="flex-1 pr-2">
                          {catMeta && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#733617]/70 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#EFE6DC] mb-1.5">
                              {catMeta.label}
                            </span>
                          )}
                          <h2 className={`font-serif font-bold text-base sm:text-lg transition-colors ${
                            isOpen ? 'text-[#733617]' : 'text-[#2D1508] group-hover:text-[#733617]'
                          }`}>
                            {faq.question}
                          </h2>
                        </div>

                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors mt-1 ${
                          isOpen 
                            ? 'bg-[#733617] text-white shadow-2xs' 
                            : 'bg-[#FAF7F2] text-[#733617] border border-[#EFE6DC]'
                        }`}>
                          {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                        </div>
                      </button>

                      {/* Expandable Answer Box (Without max-h-40 clipping) */}
                      <div 
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                      >
                        <div className="px-6 pb-6 pt-2 text-[#733617]/85 text-xs sm:text-sm leading-relaxed border-t border-dashed border-[#EFE6DC] mt-1 mx-2">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Concierge Assistance & Support Cards */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Still Have Questions? Card */}
              <div className="bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4">
                  <MessageSquare size={22} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                  VASTRAPUR CONCIERGE
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2D1508] mt-1 mb-2">
                  Still Have Questions?
                </h3>
                <p className="text-xs text-[#733617]/80 leading-relaxed mb-6">
                  Can&apos;t find the answer you are looking for? Our Vastrapur team is happy to answer any questions regarding product ingredients, delivery timelines, or bulk orders.
                </p>

                <div className="space-y-3">
                  <a
                    href="https://api.whatsapp.com/send?phone=919825382002&text=Hello%20Falguni%20Gruh%20Udhyog,%20I%20have%20a%20question"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold tracking-wider uppercase text-xs bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors shadow-2xs"
                  >
                    <FaWhatsapp size={16} />
                    Chat on WhatsApp
                  </a>

                  <a
                    href="tel:+919825382002"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold tracking-wider uppercase text-xs bg-[#FAF7F2] text-[#2D1508] hover:bg-[#F5EBE1] border border-[#EFE6DC] transition-colors"
                  >
                    <Phone size={15} className="text-[#733617]" />
                    Call +91 98253 82002
                  </a>

                  <Link
                    href="/contact"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold tracking-wider uppercase text-xs bg-[#733617] hover:bg-[#5c2b12] text-white transition-colors shadow-2xs"
                  >
                    <MessageSquare size={15} />
                    Send Contact Inquiry
                  </Link>
                </div>
              </div>

              {/* Related Help Links */}
              <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5EBE1] border border-[#EFE6DC] rounded-3xl p-6 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#733617] mb-3">
                  Helpful Policies
                </h4>
                <div className="space-y-2.5 text-xs">
                  <Link 
                    href="/delivery-charges" 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#EFE6DC] text-[#2D1508] font-medium transition-colors"
                  >
                    <span>Delivery Charges & Distance Tiers</span>
                    <ChevronRight size={13} className="text-[#733617]" />
                  </Link>
                  <Link 
                    href="/terms-and-conditions" 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#EFE6DC] text-[#2D1508] font-medium transition-colors"
                  >
                    <span>Terms & Conditions</span>
                    <ChevronRight size={13} className="text-[#733617]" />
                  </Link>
                  <Link 
                    href="/privacy-policy" 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#EFE6DC] text-[#2D1508] font-medium transition-colors"
                  >
                    <span>Privacy Policy</span>
                    <ChevronRight size={13} className="text-[#733617]" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
