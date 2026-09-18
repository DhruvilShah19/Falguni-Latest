import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { UserX, ShieldCheck, Mail, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account & Data Deletion | Falguni Gruh Udhyog',
  description: 'How to delete your Falguni Gruh Udhyog account and personal data, on the app or the website.',
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
    title: 'What Gets Permanently Deleted',
    blocks: [
      p('Deleting your account permanently removes the following from our active systems:'),
      ul([
        'Your full name, registered email address, and mobile phone number',
        'All saved delivery addresses and contact preferences',
        'Your account profile credentials and password records',
        'Saved marketing preferences and newsletter subscriptions',
      ]),
    ],
  },
  {
    title: 'What We Retain, and Why',
    blocks: [
      p('Some transaction records may be retained after account deletion where strictly required to:'),
      ul([
        'Complete orders already confirmed or in-transit',
        'Meet statutory legal, GST, and tax accounting obligations under Indian law',
        'Maintain financial audit books and transaction verification logs',
        'Prevent fraudulent chargebacks and resolve consumer disputes',
      ]),
      p('This retained data is permanently unlinked from active login systems and cannot be accessed via customer portals. For full details on data retention periods, please consult our Privacy Policy.'),
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

export default function AccountDeletionPage() {
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
            <span className="text-[#733617] font-semibold" aria-current="page">Account Deletion</span>
          </nav>

          {/* ── 2. Signature Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 text-[#733617]">
                  <UserX size={12} className="text-[#733617]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    Falguni Account &amp; Privacy • એકાઉન્ટ ડિલીટ કરવાની પ્રક્રિયા
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Account &amp; Data Deletion
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] max-w-2xl leading-relaxed">
                  Transparent procedures to request immediate self-service account deletion or assisted data removal on the Android app and website.
                </p>
              </div>

              {/* Version & Date Chip */}
              <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 self-start md:self-auto shrink-0">
                <ShieldCheck size={22} className="text-[#733617]" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-[#733617]">
                    Data Rights Compliant
                  </span>
                  <span className="block text-xs font-semibold text-[#2D1508]">
                    Digital Privacy Standard
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
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]"
            >
              Website Disclaimer
            </Link>
            <Link
              href="/account-deletion"
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-[#733617] text-white shadow-xs"
            >
              Account Deletion
            </Link>
          </div>

          {/* ── 4. Legal Document Content ── */}
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            {/* Preamble Card */}
            <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
              <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed">
                At Falguni Gruh Udhyog, we respect your right to control your personal data. You may request the permanent deletion of your customer account and associated personal information at any time. We provide two easy methods depending on whether you currently have active access to your account.
              </p>
            </div>

            {/* ── Two Method Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Method 1: In-App / Web Self-Service */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-[#733617]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                      <Smartphone size={20} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] uppercase font-bold tracking-wider">
                      Instant Self-Service
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D1508] mb-2">
                    Method 1: Direct In-App or Website Deletion
                  </h3>
                  <p className="text-xs text-[#65544A] leading-relaxed mb-4">
                    If you are logged into your account on the Falguni Android App or falgunigruhudhyog.in:
                  </p>

                  <ol className="flex flex-col gap-2.5 text-xs text-[#2D1508] mb-6">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Log in and navigate to your <strong>Profile Hub</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Select <strong>Edit Profile</strong> from account options.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Scroll to the danger zone and click <strong>&ldquo;Delete Account&rdquo;</strong> to confirm.</span>
                    </li>
                  </ol>
                </div>

                <Link
                  href="/profile/edit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#733617] hover:bg-[#5C2B12] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  <span>Go to Edit Profile</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Method 2: Email Request */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-[#733617]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                      <Mail size={20} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] text-[10px] uppercase font-bold tracking-wider">
                      Turnaround: 7 Days
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D1508] mb-2">
                    Method 2: Assisted Request by Email
                  </h3>
                  <p className="text-xs text-[#65544A] leading-relaxed mb-4">
                    If you cannot access your account or need assistance deleting your records:
                  </p>

                  <ul className="flex flex-col gap-2.5 text-xs text-[#2D1508] mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Email us from any address to <strong>sales@falgunigruhudhyog.in</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Use subject line: <strong>&ldquo;Account Deletion Request&rdquo;</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Include your registered phone number or email address.</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="mailto:sales@falgunigruhudhyog.in?subject=Account%20Deletion%20Request"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#733617] text-[#733617] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <Mail size={14} />
                  <span>Send Deletion Email</span>
                </a>
              </div>

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

            {/* Support and Privacy Notice */}
            <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 text-center text-xs text-[#65544A]">
              <span>Have additional privacy questions? Review our full </span>
              <Link href="/privacy-policy" className="text-[#733617] font-bold hover:underline">
                Privacy Policy
              </Link>
              <span> or contact customer care at </span>
              <a href="tel:9825382002" className="text-[#733617] font-bold hover:underline">
                +91 98253 82002
              </a>
              .
            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
