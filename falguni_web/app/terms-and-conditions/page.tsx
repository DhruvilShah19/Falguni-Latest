import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { ArrowLeft } from 'lucide-react';
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
      p(`Gujarat Outstation (More than ${interstate.maxDistanceKm} km within Gujarat)`),
      ul([`Delivery Charge: ${inr(gujarat.feePerKg)} per kg`, `Free Delivery on orders above ${inr(gujarat.freeAbove)}`]),
      p('PAN India Delivery'),
      ul([`Delivery Charge: ${inr(panIndia.feePerKg)} per kg`, `Free Delivery on orders above ${inr(panIndia.freeAbove)}`]),
      p('Delivery charges, distance calculations and eligibility for free delivery are determined solely by Falguni Gruh Udhyog. See our Delivery Charges page for the full breakdown and worked examples.'),
    ],
  },
  {
    title: '9. Delivery Timeline',
    blocks: [
      p('Estimated delivery times are indicative only.'),
      p('Delays may occur due to:'),
      ul(['Weather conditions', 'Traffic', 'Festivals', 'Government restrictions', 'Courier delays', 'Natural disasters', 'Operational constraints']),
      p('Such delays shall not constitute grounds for cancellation, compensation or damages.'),
    ],
  },
  {
    title: '10. Delivery Address',
    blocks: [
      p('Customers are responsible for providing a complete and accurate delivery address.'),
      p('If an incorrect or incomplete address results in delivery failure, additional delivery charges may apply for re-delivery.'),
    ],
  },
  {
    title: '11. Customer Availability',
    blocks: [
      p('Customers or an authorised recipient must be available to receive the order.'),
      p('If delivery cannot be completed because the recipient is unavailable, we reserve the right to:'),
      ul(['Attempt re-delivery (subject to availability)', 'Charge additional delivery fees', 'Cancel the order if the product is perishable']),
    ],
  },
  {
    title: '12. Risk & Ownership',
    blocks: [
      p('Ownership and risk in the products pass to the customer upon successful delivery.'),
      p('Customers should inspect the order immediately upon receipt.'),
    ],
  },
  {
    title: '13. Order Cancellation',
    blocks: [
      p('Orders may be cancelled only before dispatch.'),
      p('Once dispatched, orders cannot be cancelled.'),
      p('Freshly prepared, customised or perishable food products are generally not eligible for cancellation after processing has commenced.'),
    ],
  },
  {
    title: '14. Refunds & Replacements',
    blocks: [
      p('Refunds or replacements may be considered only in cases such as:'),
      ul(['Wrong product delivered', 'Damaged package received', 'Manufacturing defect', 'Missing items', 'Products damaged during transit']),
      p('Requests must be reported within 24 hours of delivery and supported with photographs or videos where requested.'),
      p('Refunds will not be provided merely because a customer dislikes the taste, texture, flavour or personal preference of a product.'),
    ],
  },
  {
    title: '15. Shelf Life & Storage',
    blocks: [
      p('Customers must follow the storage instructions printed on the packaging.'),
      p('Falguni Gruh Udhyog shall not be responsible for product deterioration due to improper storage after delivery.'),
    ],
  },
  {
    title: '16. Allergens',
    blocks: [
      p('Our products may contain or be processed in facilities handling:'),
      ul(['Wheat', 'Gluten', 'Milk', 'Peanuts', 'Tree Nuts', 'Sesame', 'Soy', 'Mustard', 'Spices']),
      p('Customers with allergies should review ingredient information carefully before purchase.'),
    ],
  },
  {
    title: '17. Customer Responsibilities',
    blocks: [
      p('Customers agree not to:'),
      ul(['Provide false information', 'Place fraudulent orders', 'Misuse promotional offers', 'Attempt unauthorised access to our systems', 'Copy website content without permission', 'Disrupt website operations']),
      p('Violation of these terms may result in suspension of services or legal action.'),
    ],
  },
  {
    title: '18. Intellectual Property',
    blocks: [
      p('All trademarks, logos, product names, packaging designs, website content, photographs, graphics and text are the exclusive property of Falguni Gruh Udhyog unless otherwise stated.'),
      p('No content may be copied, reproduced, modified or distributed without prior written permission.'),
    ],
  },
  {
    title: '19. Promotional Offers',
    blocks: [
      p('Promotional offers are subject to specific terms and may be modified or withdrawn without prior notice.'),
      p('Only one promotional offer may be applied per order unless otherwise specified.'),
    ],
  },
  {
    title: '20. Limitation of Liability',
    blocks: [
      p('To the maximum extent permitted by law, Falguni Gruh Udhyog shall not be liable for any indirect, incidental, consequential or special damages arising from the use of our website, products or services.'),
      p('Our total liability, if any, shall not exceed the value of the product purchased.'),
    ],
  },
  {
    title: '21. Force Majeure',
    blocks: [
      p('We shall not be liable for delays or failure to perform due to circumstances beyond our reasonable control, including but not limited to:'),
      ul(['Natural disasters', 'Floods', 'Fires', 'Pandemic', 'Government restrictions', 'Strikes', 'Power failures', 'Internet outages', 'Transportation disruptions']),
    ],
  },
  {
    title: '22. Governing Law',
    blocks: [
      p('These Terms & Conditions shall be governed by and construed in accordance with the laws of India.'),
    ],
  },
  {
    title: '23. Jurisdiction',
    blocks: [
      p('Any dispute arising out of or relating to these Terms & Conditions shall be subject to the exclusive jurisdiction of the competent courts located in Ahmedabad, Gujarat.'),
    ],
  },
  {
    title: '24. Amendments',
    blocks: [
      p('Falguni Gruh Udhyog reserves the right to modify these Terms & Conditions at any time.'),
      p('Revised Terms shall become effective immediately upon publication on our website.'),
      p('Continued use of our services constitutes acceptance of the revised Terms.'),
    ],
  },
  {
    title: '25. Contact Us',
    blocks: [
      p('For any questions regarding these Terms & Conditions, please contact:'),
      ul(['Falguni Gruh Udhyog', 'Website: https://falgunigruhudhyog.in', 'Email: sales@falgunigruhudhyog.in', 'Phone: 9825382002']),
    ],
  },
];

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === 'ul') {
    return (
      <ul className="flex flex-col gap-1.5 my-3 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-white/60 text-sm md:text-base leading-relaxed">
            <span className="mt-2.5 w-1 h-1 rounded-full bg-[#D4AF37]/60 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-white/60 text-sm md:text-base leading-relaxed my-2">
      {block.text}
    </p>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

        {/* Header Banner */}
        <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-16 flex flex-col items-center justify-center mb-6 md:mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

          <div className="absolute top-28 md:top-36 left-4 md:left-8 z-50">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4AF37] transition-colors text-[9px] md:text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back
            </Link>
          </div>

          <div className="relative z-10 text-center px-4 w-full mt-4 md:mt-0">
            <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
              <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
              LEGAL
              <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
            </div>

            <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
              Terms &amp; Conditions
            </h1>

            <p className="animate-fade-up text-white/40 text-[11px] md:text-sm" style={{ animationDelay: '200ms' }}>
              Effective Date: 01-04-2026 &nbsp;•&nbsp; Last Updated: 01-08-2026
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-8 mb-8">
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Welcome to Falguni Gruh Udhyog (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). These Terms &amp; Conditions
              govern your access to and use of our website, mobile application, WhatsApp ordering service, telephone
              ordering service, retail stores and all related services.
            </p>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mt-3">
              By accessing our website or placing an order with Falguni Gruh Udhyog, you agree to be legally bound by
              these Terms &amp; Conditions.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {SECTIONS.map((section) => (
              <section key={section.title} className="border-t border-white/5 pt-6 first:border-t-0 first:pt-0">
                <h2 className="text-[#D4AF37] font-bold text-base md:text-lg tracking-wide mb-2">
                  {section.title}
                </h2>
                {section.blocks.map((block, i) => (
                  <BlockRenderer key={i} block={block} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
