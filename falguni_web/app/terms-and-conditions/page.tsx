import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { Scale, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { DISTANCE_TIERS, OUTSTATION_TIERS } from '@/lib/deliveryPricing';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Falguni Gruh Udhyog',
  description: 'The terms and conditions governing your use of Falguni Gruh Udhyog’s website, app, and ordering services.',
};

// Same principle as /delivery-charges: the actual fee/threshold numbers in
// Section 8 are pulled live from DISTANCE_TIERS / OUTSTATION_TIERS
// (lib/deliveryPricing.ts) instead of being retyped here, so this legal
// page can never drift out of sync with what customers are actually
// charged at checkout.
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const [hyperlocal, intercity, interstate] = DISTANCE_TIERS;
const { gujarat, panIndia } = OUTSTATION_TIERS;

type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

type Section = {
  title: string;
  blocks: Block[];
};

const p = (text: string): Block => ({ type: 'p', text });
const ul = (items: string[]): Block => ({ type: 'ul', items });

const SECTIONS: Section[] = [
  {
    title: '1. Eligibility',
    blocks: [
      p('You must be at least 18 years of age or have the consent of a parent or legal guardian to place an order.'),
      p('By placing an order, you confirm that all information provided by you is accurate and complete.'),
    ],
  },
  {
    title: '2. Products',
    blocks: [
      p('Falguni Gruh Udhyog manufactures and sells traditional Indian food products, snacks, sweets, savouries, bakery products, packaged foods and other food items.'),
      p('Product availability may vary by location, season and stock availability.'),
      p('We reserve the right to discontinue any product without prior notice.'),
    ],
  },
  {
    title: '3. Product Images',
    blocks: [
      p('Product photographs displayed on our website are for illustration purposes.'),
      p('Actual product colour, texture, size and packaging may vary slightly due to:'),
      ul(['Handmade preparation', 'Manufacturing batches', 'Lighting', 'Packaging improvements', 'Screen settings']),
      p('Such variations shall not be treated as product defects.'),
    ],
  },
  {
    title: '4. Pricing',
    blocks: [
      p('All prices are displayed in Indian Rupees (INR).'),
      p('Prices are subject to change without prior notice.'),
      p('Applicable GST shall be charged wherever required under Indian law.'),
      p('Promotional prices are valid only during the advertised period.'),
    ],
  },
  {
    title: '5. Order Acceptance',
    blocks: [
      p('Submission of an order does not constitute acceptance by Falguni Gruh Udhyog.'),
      p('We reserve the right to:'),
      ul(['Accept or reject any order', 'Limit quantities purchased', 'Cancel duplicate orders', 'Reject suspicious transactions', 'Reject incomplete or fraudulent orders']),
      p('If payment has already been received for a cancelled order, the eligible amount will be refunded to the original payment method.'),
    ],
  },
  {
    title: '6. Payment',
    blocks: [
      p('We accept payment through approved payment methods available on our website or application, including UPI, debit cards, credit cards, net banking and other supported digital payment options.'),
      p('All online payments are processed through secure third-party payment gateways.'),
      p('Falguni Gruh Udhyog does not store customers’ card details, CVV, UPI PIN or internet banking credentials.'),
    ],
  },
  {
    title: '7. Order Confirmation',
    blocks: [
      p('Once payment is successfully completed, an order confirmation will be sent through email, SMS and/or WhatsApp (where applicable).'),
      p('Customers are responsible for reviewing the order details immediately and informing us of any discrepancies before dispatch.'),
    ],
  },
  {
    title: '8. Delivery Policy',
    blocks: [
      p('Delivery charges are calculated based on the delivery location.'),
      p(`Hyperlocal Delivery (Within ${hyperlocal.maxDistanceKm} km)`),
      ul([`Delivery Charge: ${inr(hyperlocal.fee)}`, `Free Delivery on orders above ${inr(hyperlocal.freeAbove)}`]),
      p(`Intercity Delivery (${hyperlocal.maxDistanceKm}–${intercity.maxDistanceKm} km)`),
      ul([`Delivery Charge: ${inr(intercity.fee)}`, `Free Delivery on orders above ${inr(intercity.freeAbove)}`]),
      p(`Interstate Delivery (${intercity.maxDistanceKm}–${interstate.maxDistanceKm} km)`),
      ul([`Delivery Charge: ${inr(interstate.fee)}`, `Free Delivery on orders above ${inr(interstate.freeAbove)}`]),
      p('Regional Delivery (Across Gujarat)'),
      ul([
        `Delivery Charge: ${inr(gujarat.feePerKg)} per kg`,
        `Free Delivery on orders above ${inr(gujarat.freeAbove)}`,
      ]),
      p('Pan-India Interstate Delivery (Rest of India)'),
      ul([
        `Delivery Charge: ${inr(panIndia.feePerKg)} per kg`,
        `Free Delivery on orders above ${inr(panIndia.freeAbove)}`,
      ]),
      p('Estimated Delivery Times'),
      ul(['Ahmedabad: Same day or next day', 'Gujarat: 1 to 3 business days', 'Other States: 3 to 7 business days']),
      p('Delivery timelines are estimates and may vary due to weather, traffic, courier delays, festivals or unforeseen events.'),
    ],
  },
  {
    title: '9. Delivery Address Accuracy',
    blocks: [
      p('Customers must ensure the delivery address, PIN code and contact number provided are accurate and complete.'),
      p('We are not liable for delayed or failed delivery caused by incorrect or incomplete customer information.'),
      p('Additional re-delivery charges may apply if an order is returned due to customer unavailability or incorrect address details.'),
    ],
  },
  {
    title: '10. Perishable Products Notice',
    blocks: [
      p('Certain fresh foods, sweets and dairy items have limited shelf life.'),
      p('Customers are advised to consume or store perishable products appropriately upon delivery.'),
      p('We are not liable for product deterioration caused by delayed collection, inappropriate storage or failure to follow storage instructions after delivery.'),
    ],
  },
  {
    title: '11. Cancellation Policy',
    blocks: [
      p('Orders may be cancelled only before preparation or dispatch has begun.'),
      p('Once an order is prepared, packed or dispatched, cancellation requests cannot be accepted.'),
      p('Customised or festive special orders cannot be cancelled once production has commenced.'),
    ],
  },
  {
    title: '12. Return & Refund Policy',
    blocks: [
      p('Due to the perishable and consumable nature of food products, returns are generally not accepted.'),
      p('A return or refund request may be considered solely in the following cases:'),
      ul(['Damaged packaging upon delivery', 'Spoiled or contaminated food delivered', 'Incorrect item delivered', 'Missing items from an order']),
      p('Reporting Requirements'),
      ul([
        'Customers must report issues within 24 hours of delivery.',
        'Clear photographs or video evidence of the outer package, shipping label and damaged or incorrect product must be provided.',
      ]),
      p('Refund Resolution'),
      p('Upon successful verification, Falguni Gruh Udhyog may, at its discretion:'),
      ul(['Issue a replacement', 'Provide store credit', 'Process a refund to the original payment method within 5 to 7 business days']),
    ],
  },
  {
    title: '13. Intellectual Property',
    blocks: [
      p('All content on this website, including logos, trademarks, text, product descriptions, images, graphics and website design, is the exclusive intellectual property of Falguni Gruh Udhyog.'),
      p('No part of this website may be copied, reproduced, distributed or used without prior written permission.'),
    ],
  },
  {
    title: '14. User Conduct',
    blocks: [
      p('Users agree not to:'),
      ul([
        'Use the website for unlawful purposes',
        'Attempt unauthorised access to our systems',
        'Transmit viruses, malware or harmful code',
        'Place fraudulent or speculative orders',
        'Interfere with website operations or other users’ access',
      ]),
      p('Violation of these terms may result in account termination and legal action.'),
    ],
  },
  {
    title: '15. Limitation of Liability',
    blocks: [
      p('To the maximum extent permitted by law, Falguni Gruh Udhyog shall not be liable for:'),
      ul([
        'Indirect, incidental or consequential damages',
        'Courier delays beyond our reasonable control',
        'Allergic reactions where ingredients were properly listed or standard',
        'Loss of profits, business interruptions or data loss',
      ]),
      p('In all cases, our total liability shall not exceed the value of the order placed by the customer.'),
    ],
  },
  {
    title: '16. Force Majeure',
    blocks: [
      p('We shall not be liable for failure or delay in performing our obligations resulting from events beyond our control, including:'),
      ul([
        'Natural disasters',
        'Floods, earthquakes or extreme weather',
        'Strikes, lockouts or civil unrest',
        'Government restrictions or regulations',
        'Transport or courier disruptions',
        'Telecommunication or internet outages',
      ]),
    ],
  },
  {
    title: '17. Modification of Terms',
    blocks: [
      p('Falguni Gruh Udhyog reserves the right to amend these Terms & Conditions at any time.'),
      p('Updated terms will be posted on this page with a revised effective date.'),
      p('Continued use of our website or services following any changes constitutes acceptance of the modified terms.'),
    ],
  },
  {
    title: '18. Governing Law and Jurisdiction',
    blocks: [
      p('These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India.'),
      p('Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat, India.'),
    ],
  },
  {
    title: '19. Customer Support',
    blocks: [
      p('For any inquiries, feedback, or complaints regarding orders or services:'),
      ul([
        'Business Name: Falguni Gruh Udhyog',
        'Address: Gf 1 to 4, Hirak avenue, opp. shakti enclave, vastrapur, Ahmedabad 380015',
        'Phone: 9825382002',
        'Email: sales@falgunigruhudhyog.in',
        'Website: https://falgunigruhudhyog.in',
      ]),
    ],
  },
];

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === 'ul') {
    return (
      <ul className="flex flex-col gap-2 my-3 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[#2D1508] text-xs sm:text-sm leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#733617] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-[#65544A] text-xs sm:text-sm leading-relaxed my-2">
      {block.text}
    </p>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Left-aligned Breadcrumbs ── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link 
              href="/" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Home
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#8A796F]">Legal &amp; Compliance</span>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">Terms &amp; Conditions</span>
          </nav>

          {/* ── 2. Signature Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 text-[#733617]">
                  <Scale size={12} className="text-[#733617]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    Falguni Legal &amp; Compliance • નિયમો અને શરતો
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Terms &amp; Conditions
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] max-w-2xl leading-relaxed">
                  The terms and conditions governing your orders, deliveries, payments, and use of Falguni Gruh Udhyog services.
                </p>
              </div>

              {/* Version & Date Chip */}
              <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 self-start md:self-auto shrink-0">
                <ShieldCheck size={22} className="text-[#733617]" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-[#733617]">
                    Official Terms Version 3.1
                  </span>
                  <span className="block text-xs font-semibold text-[#2D1508]">
                    Updated: August 01, 2026
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ── 3. Legal Quick-Switch Tabs ── */}
          <div className="flex items-center gap-2 border-b border-[#EFE6DC] pb-3 overflow-x-auto scrollbar-hide">
            <Link
              href="/privacy-policy"
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-[#733617] text-white shadow-xs"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/website-disclaimer"
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]"
            >
              Website Disclaimer
            </Link>
            <Link
              href="/account-deletion"
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]"
            >
              Account Deletion
            </Link>
          </div>

          {/* ── 4. Legal Document Content ── */}
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            {/* Preamble Card */}
            <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
              <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed">
                Welcome to Falguni Gruh Udhyog (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). These Terms &amp; Conditions
                govern your access to and use of our website, mobile application, WhatsApp ordering service, telephone
                ordering service, retail stores and all related services.
              </p>
              <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed mt-3">
                By accessing our website or placing an order with Falguni Gruh Udhyog, you agree to be legally bound by
                these Terms &amp; Conditions.
              </p>
            </div>

            {/* Sections Accordion / Cards */}
            <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              {SECTIONS.map((section) => (
                <section key={section.title} className="border-t border-[#EFE6DC] pt-5 first:border-t-0 first:pt-0">
                  <h2 className="text-[#733617] font-serif font-bold text-sm sm:text-base tracking-wide mb-2.5 flex items-baseline gap-2">
                    <span>{section.title}</span>
                  </h2>
                  {section.blocks.map((block, i) => (
                    <BlockRenderer key={i} block={block} />
                  ))}
                </section>
              ))}
            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
