import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { ArrowLeft } from 'lucide-react';
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

export default function WebsiteDisclaimerPage() {
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
              Website Disclaimer
            </h1>

            <p className="animate-fade-up text-white/40 text-[11px] md:text-sm" style={{ animationDelay: '200ms' }}>
              Effective Date: 01-04-2026 &nbsp;•&nbsp; Last Updated: 01-08-2026
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-8 mb-8">
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Welcome to Falguni Gruh Udhyog (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). This Website Disclaimer
              governs your use of https://falgunigruhudhyog.in (&ldquo;Website&rdquo;).
            </p>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mt-3">
              By accessing or using this Website, you agree to the terms of this Disclaimer.
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
