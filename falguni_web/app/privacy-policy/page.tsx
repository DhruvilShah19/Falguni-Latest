import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { ArrowLeft } from 'lucide-react';
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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>

            <p className="animate-fade-up text-white/40 text-[11px] md:text-sm" style={{ animationDelay: '200ms' }}>
              Effective Date: 01-04-2026 &nbsp;•&nbsp; Last Updated: 01-08-2026
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-8 mb-8">
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Welcome to Falguni Gruh Udhyog (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). We value your privacy and are committed to
              protecting your personal information. This Privacy Policy explains how we collect, use, store, disclose
              and protect your information when you visit our website, mobile application, place an order through
              WhatsApp, telephone, social media, or purchase from any of our sales channels.
            </p>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mt-3">
              By using our website or services, you acknowledge that you have read and understood this Privacy Policy
              and consent to the collection and processing of your information as described herein.
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
