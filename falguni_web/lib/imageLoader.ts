'use client';

export default function imageProxyLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  if (src.startsWith('http')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}&output=webp`;
  }
  // For local files in public/ directory
  return `${src}?w=${width}&q=${quality || 75}`;
}
