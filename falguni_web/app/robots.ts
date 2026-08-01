import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.falgunigruhudhyog.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Account-specific and transactional pages have no value as search
      // results and shouldn't be crawled -- mirrors the exclusions in
      // sitemap.ts.
      disallow: [
        '/cart',
        '/checkout',
        '/profile',
        '/orders',
        '/favorites',
        '/notifications',
        '/coupon',
        '/courier',
        '/audit-orders',
        '/login',
        '/signup',
        '/forgot-password',
        '/api/',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
