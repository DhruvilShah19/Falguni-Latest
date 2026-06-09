import Link from 'next/link';

interface Props {
  title: string;       // e.g. "Categories"      → rendered UPPERCASE
  subtitle: string;    // e.g. "Explore by"      → rendered UPPERCASE, gold
  viewAllHref?: string; // if omitted → no VIEW ALL button (matches Flutter null onAction)
}

/**
 * Matches Flutter _buildSectionHeader() exactly:
 *   - gold subtitle (9 px, letterSpacing 2, bold)
 *   - 3 × 16 px gold vertical bar
 *   - white title (17 px, weight 900, letterSpacing 1)
 *   - "VIEW ALL" pill with 50 % gold border (shown only when viewAllHref is set)
 */
export default function SectionHeader({ title, subtitle, viewAllHref }: Props) {
  return (
    <div
      className="flex items-end justify-between max-w-7xl mx-auto w-full mb-8"
      style={{ padding: '0 20px' }}
    >
      {/* Left: subtitle + title */}
      <div className="flex flex-col gap-2">
        {/* Subtitle — gold, small, all-caps, wide tracking */}
        <div className="flex items-center gap-4">
           <span className="w-12 h-[1px] bg-[#D4AF37]/50" />
           <span
             className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase"
             style={{ color: '#D4AF37' }}
           >
             {subtitle}
           </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-serif text-[var(--color-fg)] drop-shadow-sm leading-tight mt-1">
           {title}
        </h2>
      </div>

      {/* Right: VIEW ALL button */}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group hidden md:flex items-center gap-3 text-sm font-bold tracking-widest uppercase transition-all pb-2 mb-2 hover:text-white"
          style={{ color: '#D4AF37', borderBottom: '1px solid rgba(212,175,55,0.5)' }}
        >
          VIEW ALL
          <span className="group-hover:translate-x-2 transition-transform">→</span>
        </Link>
      )}
    </div>
  );
}
