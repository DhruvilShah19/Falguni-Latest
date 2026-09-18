import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Disclaimer | Falguni Gruh Udhyog',
  description: 'Disclaimer governing the use of falgunigruhudhyog.in, including product, pricing, delivery and liability terms.',
};

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
    title: '1. General Information',
    blocks: [
      p('The information available on this Website is provided for general informational and commercial purposes only.'),
      p('While we strive to ensure that all information is accurate and up to date, we do not guarantee the completeness, accuracy or reliability of any information published on the Website.'),
    ],
  },
  {
    title: '2. Product Information',
    blocks: [
      p('We make every effort to accurately describe our products.'),
      p('However, due to the traditional and handmade nature of many of our food products, slight variations may occur in:'),
      ul(['Colour', 'Texture', 'Shape', 'Thickness', 'Weight (within legally permissible limits)', 'Packaging design']),
      p('These natural variations should not be treated as manufacturing defects.'),
    ],
  },
  {
    title: '3. Product Images',
    blocks: [
      p('Product photographs displayed on the Website are for representation purposes only.'),
      p('Actual products may differ slightly due to:'),
      ul(['Manufacturing batches', 'Packaging improvements', 'Photography lighting', 'Screen display settings', 'Product size representation']),
      p('Such differences do not affect product quality.'),
    ],
  },
  {
    title: '4. Pricing Errors',
    blocks: [
      p('Although we take reasonable care to ensure correct pricing, typographical, technical or human errors may occasionally occur.'),
      p('If a product is listed with an incorrect price or promotional offer due to an error, Falguni Gruh Udhyog reserves the right to:'),
      ul(['Cancel the order before dispatch.', 'Correct the pricing.', 'Contact the customer for confirmation before processing the order.', 'Refund any payment received where applicable.']),
    ],
  },
  {
    title: '5. Product Availability',
    blocks: [
      p('Product availability displayed on the Website is subject to change without notice.'),
      p('We reserve the right to:'),
      ul(['Discontinue products.', 'Limit purchase quantities.', 'Refuse orders due to stock shortages.', 'Modify product packaging or specifications.']),
    ],
  },
  {
    title: '6. Nutritional Information',
    blocks: [
      p('Nutritional values, ingredient information and serving suggestions are provided for general guidance only.'),
      p('Values may vary slightly due to:'),
      ul(['Natural ingredients', 'Manufacturing variations', 'Seasonal changes']),
      p('Customers should always refer to the product packaging for the latest information.'),
    ],
  },
  {
    title: '7. Medical Disclaimer',
    blocks: [
      p('The information provided on this Website should not be interpreted as medical, nutritional or healthcare advice.'),
      p('Customers with allergies, dietary restrictions or medical conditions should consult a qualified healthcare professional before consuming our products if they have any concerns.'),
    ],
  },
  {
    title: '8. Third-Party Links',
    blocks: [
      p('Our Website may contain links to third-party websites, payment gateways or social media platforms for customer convenience.'),
      p('We do not control or endorse the content, privacy practices or policies of third-party websites and are not responsible for their availability or content.'),
    ],
  },
  {
    title: '9. Website Availability',
    blocks: [
      p('While we endeavour to keep our Website operational, uninterrupted access cannot be guaranteed.'),
      p('The Website may occasionally be unavailable due to:'),
      ul(['Scheduled maintenance', 'Technical issues', 'Internet outages', 'Software updates', 'Cybersecurity measures', 'Circumstances beyond our reasonable control']),
      p('We shall not be liable for temporary interruptions in service.'),
    ],
  },
  {
    title: '10. Technical Errors',
    blocks: [
      p('Occasionally, technical errors may result in:'),
      ul(['Incorrect pricing', 'Display issues', 'Inventory inaccuracies', 'Duplicate orders', 'Payment interruptions']),
      p('Falguni Gruh Udhyog reserves the right to rectify such errors and take appropriate corrective action.'),
    ],
  },
  {
    title: '11. Payment Gateway Disclaimer',
    blocks: [
      p('Online payments are processed through trusted third-party payment service providers.'),
      p('We do not store customers’:'),
      ul(['Card details', 'CVV', 'UPI PIN', 'Net Banking credentials']),
      p('Any payment processing delays or failures caused by payment service providers or banks are outside our direct control.'),
    ],
  },
  {
    title: '12. Delivery Disclaimer',
    blocks: [
      p('Estimated delivery timelines are indicative only.'),
      p('Actual delivery may be delayed due to:'),
      ul(['Weather', 'Traffic', 'Festivals', 'Government restrictions', 'Courier operations', 'Natural disasters', 'Force Majeure events']),
      p('Such delays do not automatically entitle customers to compensation or damages.'),
    ],
  },
  {
    title: '13. Intellectual Property',
    blocks: [
      p('Unless otherwise stated, all Website content including:'),
      ul(['Logos', 'Brand names', 'Product names', 'Photographs', 'Graphics', 'Icons', 'Videos', 'Product descriptions', 'Website design', 'Text content']),
      p('is the exclusive intellectual property of Falguni Gruh Udhyog and is protected under applicable copyright and trademark laws.'),
      p('No part of this Website may be copied, reproduced, republished, distributed, modified or commercially exploited without our prior written permission.'),
    ],
  },
  {
    title: '14. User Responsibility',
    blocks: [
      p('Users are responsible for:'),
      ul([
        'Maintaining the confidentiality of their account credentials.',
        'Providing accurate information while placing orders.',
        'Reviewing product details before purchase.',
        'Reading product labels before consumption.',
        'Ensuring that products are suitable for their dietary needs.',
      ]),
    ],
  },
  {
    title: '15. Limitation of Liability',
    blocks: [
      p('To the maximum extent permitted by law, Falguni Gruh Udhyog shall not be liable for:'),
      ul([
        'Indirect or consequential losses.',
        'Loss of profits or business opportunities.',
        'Delays beyond our reasonable control.',
        'Website downtime.',
        'Customer misuse of products.',
        'Improper storage after delivery.',
        'Allergic reactions where ingredient and allergen information has been disclosed.',
      ]),
      p('Nothing in this Disclaimer limits any statutory rights available to consumers under applicable law.'),
    ],
  },
  {
    title: '16. Indemnity',
    blocks: [
      p('You agree to indemnify and hold harmless Falguni Gruh Udhyog, its owners, directors, employees and representatives from any claims, liabilities, damages, losses or expenses arising out of:'),
      ul(['Your misuse of the Website.', 'Violation of these policies.', 'Fraudulent activities.', 'Infringement of any third-party rights.']),
    ],
  },
  {
    title: '17. Governing Law',
    blocks: [
      p('This Disclaimer shall be governed by and interpreted in accordance with the laws of India.'),
      p('Any disputes shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat.'),
    ],
  },
  {
    title: '18. Changes to this Disclaimer',
    blocks: [
      p('Falguni Gruh Udhyog reserves the right to modify this Disclaimer at any time.'),
      p('The updated version will be published on this Website with the revised “Last Updated” date.'),
      p('Your continued use of the Website after any changes constitutes acceptance of the revised Disclaimer.'),
    ],
  },
  {
    title: '19. Contact Us',
    blocks: [
      p('For any questions regarding this Disclaimer, please contact:'),
      ul(['Falguni Gruh Udhyog', 'Website: https://falgunigruhudhyog.in']),
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

export default function WebsiteDisclaimerPage() {
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
            <span className="text-[#733617] font-semibold" aria-current="page">Website Disclaimer</span>
          </nav>

          {/* ── 2. Signature Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 text-[#733617]">
                  <AlertCircle size={12} className="text-[#733617]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    Falguni Legal &amp; Compliance • વેબસાઇટ ડિસક્લેમર
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Website Disclaimer
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] max-w-2xl leading-relaxed">
                  Important disclosures regarding product representation, pricing accuracy, dietary guidance, and website operations.
                </p>
              </div>

              {/* Version & Date Chip */}
              <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 self-start md:self-auto shrink-0">
                <ShieldCheck size={22} className="text-[#733617]" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-[#733617]">
                    Official Disclaimer
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
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/website-disclaimer"
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-[#733617] text-white shadow-xs"
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
                Welcome to Falguni Gruh Udhyog (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). This Website Disclaimer
                governs your use of https://falgunigruhudhyog.in (&ldquo;Website&rdquo;).
              </p>
              <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed mt-3">
                By accessing or using this Website, you agree to the terms of this Disclaimer.
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
