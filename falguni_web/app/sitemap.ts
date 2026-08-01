import type { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

// Canonical host -- the site redirects the bare apex and non-www to this,
// so every sitemap entry should use it directly rather than relying on the
// redirect (Google prefers sitemap URLs to already be the final destination).
const BASE_URL = 'https://www.falgunigruhudhyog.in';

// Only public, indexable pages belong here. Anything account-specific
// (cart, checkout, profile, orders, favorites, notifications, coupon,
// courier, audit-orders, auth screens) is deliberately left out -- it's
// either behind auth or has no value as a search landing page, and is
// blocked in robots.ts anyway.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/categories', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.8, changeFrequency: 'daily' },
  { path: '/delivery-charges', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/website-disclaimer', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Products and categories are pulled live from Firestore so the sitemap
  // never drifts from what's actually in the catalog -- no separate list to
  // remember to update. If Firestore is unreachable for any reason, fall
  // back to just the static pages rather than failing the whole sitemap.
  try {
    const [productsSnap, categoriesSnap] = await Promise.all([
      adminDb.collection('Products').get(),
      adminDb.collection('Categories').get(),
    ]);

    const productEntries: MetadataRoute.Sitemap = productsSnap.docs.map((doc) => ({
      url: `${BASE_URL}/products/${doc.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Category pages are matched by name (not doc id) in
    // app/categories/[slug]/page.tsx, so the sitemap URL has to be the
    // encoded category name to actually resolve.
    const seenCategories = new Set<string>();
    const categoryEntries: MetadataRoute.Sitemap = [];
    categoriesSnap.docs.forEach((doc) => {
      const category = doc.data().category as string | undefined;
      if (category && !seenCategories.has(category)) {
        seenCategories.add(category);
        categoryEntries.push({
          url: `${BASE_URL}/categories/${encodeURIComponent(category)}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    });

    return [...staticEntries, ...categoryEntries, ...productEntries];
  } catch (error) {
    console.error('sitemap: failed to load Products/Categories from Firestore, returning static routes only', error);
    return staticEntries;
  }
}
