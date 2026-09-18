import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { ShieldCheck, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Falguni Gruh Udhyog',
  description: 'How Falguni Gruh Udhyog collects, uses, stores, discloses and protects your personal information.',
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

const BUSINESS_INFO = [
  'Business Name: Falguni Gruh Udhyog',
  'Website: https://falgunigruhudhyog.in',
  'Email: sales@falgunigruhudhyog.in',
  'Phone: 9825382002',
  'Address: Gf 1 to 4, Hirak avenue, opp. shakti enclave, vastrapur, Ahmedabad 380015',
];

const SECTIONS: Section[] = [
  {
    title: '1. Business Information',
    blocks: [ul(BUSINESS_INFO)],
  },
  {
    title: '2. Information We Collect',
    blocks: [
      p('We may collect the following categories of information:'),
      p('Personal Information'),
      ul(['Full Name', 'Mobile Number', 'Email Address', 'Billing Address', 'Shipping Address', 'PIN Code', 'City and State']),
      p('Order Information'),
      ul(['Products Ordered', 'Order Amount', 'Order History', 'Invoice Details', 'Delivery Preferences']),
      p('Payment Information'),
      p('Payments are processed through secure third-party payment gateways.'),
      p('We do not store:'),
      ul(['Credit Card Numbers', 'Debit Card Numbers', 'CVV', 'UPI PIN', 'Net Banking Passwords']),
      p('Payment processors may collect payment information according to their own privacy policies.'),
    ],
  },
  {
    title: '3. Information Collected Automatically',
    blocks: [
      p('When you use our website, we may automatically collect:'),
      ul(['IP Address', 'Browser Type', 'Device Information', 'Operating System', 'Date & Time of Visit', 'Pages Viewed', 'Session Duration', 'Cookies', 'Referral Source']),
      p('This information helps us improve website performance and user experience.'),
    ],
  },
  {
    title: '4. How We Use Your Information',
    blocks: [
      p('Your information may be used to:'),
      ul([
        'Process and deliver orders',
        'Verify customer identity',
        'Generate invoices',
        'Process payments',
        'Provide customer support',
        'Send order confirmations',
        'Send shipping updates',
        'Improve our website and services',
        'Detect fraud and misuse',
        'Maintain legal and regulatory compliance',
        'Respond to customer queries',
        'Conduct internal analytics',
        'Send promotional offers (only where permitted)',
      ]),
    ],
  },
  {
    title: '5. Marketing Communication',
    blocks: [
      p('With your consent, we may send:'),
      ul(['Promotional offers', 'Festival discounts', 'New product launches', 'Seasonal collections', 'Exclusive membership offers']),
      p('You may unsubscribe at any time by contacting us or using the unsubscribe option available in our communications.'),
    ],
  },
  {
    title: '6. Cookies',
    blocks: [
      p('Our website uses cookies to:'),
      ul(['Remember your preferences', 'Improve website functionality', 'Enhance user experience', 'Measure website traffic', 'Analyse visitor behaviour', 'Maintain login sessions']),
      p('You may disable cookies through your browser settings; however, some website features may not function properly.'),
    ],
  },
  {
    title: '7. Sharing of Information',
    blocks: [
      p('We do not sell or rent your personal information.'),
      p('We may share information with trusted service providers solely for legitimate business purposes, including:'),
      ul(['Payment gateways', 'Delivery partners', 'Courier companies', 'SMS providers', 'Email service providers', 'Cloud hosting providers', 'Website maintenance partners', 'Government authorities when required by law']),
      p('Each third-party provider is expected to maintain appropriate confidentiality and security standards.'),
    ],
  },
  {
    title: '8. Payment Security',
    blocks: [
      p('All online payments are handled by certified payment gateway providers using secure encryption technologies.'),
      p('Falguni Gruh Udhyog never stores your:'),
      ul(['Card Number', 'CVV', 'UPI PIN', 'Internet Banking Credentials']),
      p('Customers should ensure they transact only through our official payment channels.'),
    ],
  },
  {
    title: '9. Delivery Information',
    blocks: [
      p('To complete your order, we may share limited customer information with delivery partners, including:'),
      ul(['Name', 'Delivery Address', 'Mobile Number', 'Order Reference Number']),
      p('Delivery partners receive only the information necessary to fulfil the delivery.'),
    ],
  },
  {
    title: '10. Data Security',
    blocks: [
      p('We implement commercially reasonable technical and organisational safeguards to protect your personal information against:'),
      ul(['Unauthorised access', 'Alteration', 'Disclosure', 'Misuse', 'Loss', 'Destruction']),
      p('While we strive to protect your information, no online transmission or storage system can be guaranteed to be completely secure.'),
    ],
  },
  {
    title: '11. Data Retention',
    blocks: [
      p('We retain personal information only for as long as necessary to:'),
      ul(['Complete orders', 'Meet legal obligations', 'Resolve disputes', 'Maintain accounting records', 'Prevent fraud', 'Enforce our agreements']),
      p('Information no longer required will be securely deleted or anonymised in accordance with applicable laws.'),
    ],
  },
  {
    title: '12. Your Rights',
    blocks: [
      p('Subject to applicable law, you may request to:'),
      ul([
        'Access your personal information',
        'Correct inaccurate information',
        'Update your contact details',
        'Withdraw consent where applicable',
        'Request deletion of eligible personal information',
        'Raise concerns regarding data processing',
      ]),
      p('Requests may be submitted through our customer support contact details.'),
    ],
  },
  {
    title: "13. Children's Privacy",
    blocks: [
      p('Our services are intended for individuals who are legally capable of entering into binding contracts.'),
      p('We do not knowingly collect personal information from children without appropriate parental or guardian consent.'),
    ],
  },
  {
    title: '14. Third-Party Links',
    blocks: [
      p('Our website may contain links to third-party websites, payment platforms or social media pages.'),
      p('We are not responsible for the privacy practices or content of third-party websites. Users are encouraged to review their respective privacy policies before providing any personal information.'),
    ],
  },
  {
    title: '15. Business Transfers',
    blocks: [
      p('In the event of a merger, acquisition, restructuring, or sale of assets, customer information may be transferred as part of the business transaction, subject to applicable legal requirements.'),
    ],
  },
  {
    title: '16. Fraud Prevention',
    blocks: [
      p('To protect our customers and business, we reserve the right to:'),
      ul(['Verify customer identity', 'Verify payment authenticity', 'Cancel suspicious orders', 'Suspend fraudulent accounts', 'Report suspected fraud to appropriate authorities']),
    ],
  },
  {
    title: '17. Compliance with Law',
    blocks: [
      p('We may disclose information where required to:'),
      ul(['Comply with applicable laws', 'Respond to lawful requests by government authorities', 'Protect our legal rights', 'Prevent fraud', 'Protect public safety']),
    ],
  },
  {
    title: '18. Policy Updates',
    blocks: [
      p('We reserve the right to modify this Privacy Policy at any time.'),
      p('Updated versions will be published on our website with the revised effective date. Continued use of our services after such updates constitutes acceptance of the revised policy.'),
    ],
  },
  {
    title: '19. Contact Us',
    blocks: [
      p('For questions regarding this Privacy Policy or your personal information, please contact:'),
      ul(BUSINESS_INFO.filter((line) => !line.startsWith('Business Name'))),
    ],
  },
  {
    title: '20. Consent',
    blocks: [
      p('By accessing our website, placing an order, using our mobile application, contacting us through WhatsApp, telephone or social media, or otherwise using our services, you acknowledge that you have read, understood and agreed to this Privacy Policy.'),
      p('If you do not agree with any part of this Privacy Policy, please discontinue the use of our website and services.'),
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

export default function PrivacyPolicyPage() {
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
            <span className="text-[#733617] font-semibold" aria-current="page">Privacy Policy</span>
          </nav>

          {/* ── 2. Signature Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 text-[#733617]">
                  <Lock size={12} className="text-[#733617]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    Falguni Legal &amp; Compliance • કાનૂની દસ્તાવેજ
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Privacy Policy
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] max-w-2xl leading-relaxed">
                  How Falguni Gruh Udhyog collects, uses, protects, and handles your personal information across all platforms.
                </p>
              </div>

              {/* Version & Date Chip */}
              <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 self-start md:self-auto shrink-0">
                <ShieldCheck size={22} className="text-[#733617]" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-[#733617]">
                    Official Policy Version 2.4
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
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-[#733617] text-white shadow-xs"
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
                Welcome to Falguni Gruh Udhyog (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). We value your privacy and are committed to
                protecting your personal information. This Privacy Policy explains how we collect, use, store, disclose
                and protect your information when you visit our website, mobile application, place an order through
                WhatsApp, telephone, social media, or purchase from any of our sales channels.
              </p>
              <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed mt-3">
                By using our website or services, you acknowledge that you have read and understood this Privacy Policy
                and consent to the collection and processing of your information as described herein.
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
