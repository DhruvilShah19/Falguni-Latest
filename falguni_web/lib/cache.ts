import { getProducts, getFlashSaleProducts } from './firestore';
import type { ProductsModel } from '@/types';

// We use an in-memory Node.js cache to bypass Next.js's 2MB `unstable_cache` limit.
// In dev mode, we attach it to `global` so it survives hot-reloads.
const globalAny: any = global;

if (!globalAny.productCache) {
  globalAny.productCache = { data: null, timestamp: 0 };
}
if (!globalAny.flashCache) {
  globalAny.flashCache = { data: null, timestamp: 0 };
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

export async function getCachedAllProducts(): Promise<ProductsModel[]> {
  const now = Date.now();
  if (globalAny.productCache.data && (now - globalAny.productCache.timestamp < CACHE_TTL_MS)) {
    return globalAny.productCache.data;
  }
  
  // Fetch from Firestore
  const data = await getProducts(10000);
  const plainData = JSON.parse(JSON.stringify(data));
  
  // Update Cache
  globalAny.productCache = { data: plainData, timestamp: now };
  return plainData;
}

export async function getCachedFlashSales(): Promise<ProductsModel[]> {
  const now = Date.now();
  if (globalAny.flashCache.data && (now - globalAny.flashCache.timestamp < CACHE_TTL_MS)) {
    return globalAny.flashCache.data;
  }
  
  const data = await getFlashSaleProducts();
  const plainData = JSON.parse(JSON.stringify(data));
  globalAny.flashCache = { data: plainData, timestamp: now };
  return plainData;
}
