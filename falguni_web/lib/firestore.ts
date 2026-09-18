import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  ProductsModel,
  CategoriesModel,
  SubCategoryModel,
  SubCategoryCollectionModel,
  BannerModel,
  CartItem,
  CouponModel,
  RatingModel,
  UserModel,
} from '@/types';

// ─── Helper for RSC Serialization ─────────────────────────────────────────────

/**
 * Converts Firestore data into plain serializable objects.
 * Removes non-plain prototype methods (e.g. Timestamp.toJSON / toDate) to prevent
 * Next.js error: "Only plain objects can be passed to Client Components from Server Components".
 */
export function toPlainObject<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(limitCount = 20): Promise<ProductsModel[]> {
  const snap = await getDocs(query(collection(db, 'Products'), limit(limitCount)));
  return toPlainObject(snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel)));
}

export async function getProductsByCategory(category: string): Promise<ProductsModel[]> {
  if (!category || !category.trim()) return [];
  const trimmed = category.trim();

  // Known category aliases mapping to canonical DB names
  const ALIAS_MAP: Record<string, string[]> = {
    'COMBOS': ['COMBOS & GIFT PACKS', 'COMBOS'],
    'COMBO': ['COMBOS & GIFT PACKS', 'COMBOS'],
    'MUKHVAS': ['MUKHWAS', 'MUKHVAS'],
    'PICKLES': ['PICKLES & ACHAR', 'PICKLES'],
    'PICKLE': ['PICKLES & ACHAR', 'PICKLES'],
    'ACHAR': ['PICKLES & ACHAR', 'PICKLES'],
    'FARSAN': ['FRIED / TRADITIONAL SNACKS', 'FARALI', 'GATHIYA', 'CHIVDA', 'FARSAN'],
    'GROUNDNUT': ['GROUNDNUT OIL PRODUCTS'],
    'GROUNDNUT OIL': ['GROUNDNUT OIL PRODUCTS'],
    'GROUNDNUT-OIL-PRODUCTS': ['GROUNDNUT OIL PRODUCTS'],
    'BAKERY': ['BAKERY PRODUCTS', 'BISCUITS & COOKIES'],
    'HEALTHY': ['ROASTED & HEALTHY SNACKS', 'MILLET & HEALTHY'],
  };

  const normalizedKey = trimmed.toUpperCase().replace(/[^\w]/g, '');
  const aliasValues = ALIAS_MAP[normalizedKey] || [];

  const variations = Array.from(new Set([
    trimmed,
    trimmed.toUpperCase(),
    trimmed.toLowerCase(),
    trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
    ...aliasValues,
  ])).slice(0, 10); // Firestore 'in' query supports max 10 elements

  const snap = await getDocs(
    query(collection(db, 'Products'), where('category', 'in', variations))
  );
  return toPlainObject(snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel)));
}

export async function getRecentPurchasedProducts(userId: string): Promise<ProductsModel[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'Recent Purchased Products'));
  const products = snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      uid: data.productID || data.uid || d.id,
    } as ProductsModel;
  });

  const uniqueProducts: ProductsModel[] = [];
  const seenIds = new Set<string>();
  for (const p of products) {
    if (!seenIds.has(p.uid)) {
      seenIds.add(p.uid);
      uniqueProducts.push(p);
    }
  }
  return toPlainObject(uniqueProducts);
}

export async function getProductById(id: string): Promise<ProductsModel | null> {
  if (!id) return null;
  // 1. Try direct document ID lookup
  const snap = await getDoc(doc(db, 'Products', id));
  if (snap.exists()) {
    return toPlainObject({ ...snap.data(), uid: snap.id } as ProductsModel);
  }

  // 2. Fallback: Lookup by productID field (e.g. "771975F5-4")
  const idQuery = query(collection(db, 'Products'), where('productID', '==', id), limit(1));
  const idSnap = await getDocs(idQuery);
  if (!idSnap.empty) {
    const d = idSnap.docs[0];
    return toPlainObject({ ...d.data(), uid: d.id } as ProductsModel);
  }

  // 3. Fallback: Lookup by exact product name
  const nameQuery = query(collection(db, 'Products'), where('name', '==', id), limit(1));
  const nameSnap = await getDocs(nameQuery);
  if (!nameSnap.empty) {
    const d = nameSnap.docs[0];
    return toPlainObject({ ...d.data(), uid: d.id } as ProductsModel);
  }

  return null;
}

export async function getFlashSaleProducts(): Promise<ProductsModel[]> {
  const snap = await getDocs(collection(db, 'Flash Sales Products'));
  return toPlainObject(snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel)));
}

export async function getProductReviews(productId: string): Promise<RatingModel[]> {
  try {
    const snap = await getDocs(collection(db, 'Products', productId, 'Ratings'));
    return toPlainObject(snap.docs.map(d => ({ uid: d.id, ...d.data() } as RatingModel)));
  } catch (err) {
    console.warn('Could not fetch product reviews:', err);
    return [];
  }
}

export async function setProductReview(productId: string, rating: number, review: string, user: UserModel, oldRating: number = 0) {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeCreated = new Date().toLocaleDateString('en-US', options);
  
  if (!user.uid) throw new Error("User UID is missing");

  await setDoc(doc(db, 'Products', productId, 'Ratings', user.uid), {
    rating,
    review,
    fullname: user.fullname || 'Anonymous',
    profilePicture: user.userPic || '',
    timeCreated
  });

  if (oldRating === 0) {
    // New Review
    await updateDoc(doc(db, 'Products', productId), {
      totalRating: increment(rating),
      totalNumberOfUserRating: increment(1)
    });
  } else {
    // Edit Review
    const difference = rating - oldRating;
    if (difference !== 0) {
      await updateDoc(doc(db, 'Products', productId), {
        totalRating: increment(difference)
      });
    }
  }
}

export async function deleteProductReview(productId: string, userUid: string, oldRating: number) {
  await deleteDoc(doc(db, 'Products', productId, 'Ratings', userUid));
  await updateDoc(doc(db, 'Products', productId), {
    totalRating: increment(-oldRating),
    totalNumberOfUserRating: increment(-1)
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoriesModel[]> {
  const snap = await getDocs(collection(db, 'Categories'));
  const list = snap.docs.map(d => ({ ...d.data(), uid: d.id, id: d.id } as CategoriesModel));
  list.sort((a, b) => {
    const posA = typeof a.position === 'number' ? a.position : (typeof a.sortOrder === 'number' ? a.sortOrder : 999);
    const posB = typeof b.position === 'number' ? b.position : (typeof b.sortOrder === 'number' ? b.sortOrder : 999);
    if (posA !== posB) return posA - posB;
    return (a.category || '').localeCompare(b.category || '');
  });
  return toPlainObject(list);
}

// ─── Sub Categories (Collection: 'Sub Categories') ────────────────────────────

export async function getSubCategories(category?: string): Promise<SubCategoryModel[]> {
  let snap;
  if (category && category.trim()) {
    const trimmed = category.trim();
    const variations = Array.from(new Set([
      trimmed,
      trimmed.toUpperCase(),
      trimmed.toLowerCase(),
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
    ]));
    snap = await getDocs(
      query(collection(db, 'Sub Categories'), where('category', 'in', variations))
    );
  } else {
    snap = await getDocs(collection(db, 'Sub Categories'));
  }

  const list = snap.docs.map(d => ({ ...d.data(), uid: d.id, id: d.id } as SubCategoryModel));
  list.sort((a, b) => {
    const posA = typeof a.position === 'number' ? a.position : (typeof a.sortOrder === 'number' ? a.sortOrder : 999);
    const posB = typeof b.position === 'number' ? b.position : (typeof b.sortOrder === 'number' ? b.sortOrder : 999);
    if (posA !== posB) return posA - posB;
    return (a.name || '').localeCompare(b.name || '');
  });
  return toPlainObject(list);
}

// ─── Sub Category Collections (Collection: 'Sub categories collections') ──────

export async function getSubCategoryCollections(
  category?: string,
  subCategory?: string
): Promise<SubCategoryCollectionModel[]> {
  const snap = await getDocs(collection(db, 'Sub categories collections'));
  let list = snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      subCategory: data.subCategory || data['sub-category'] || '',
      uid: d.id,
      id: d.id,
    } as SubCategoryCollectionModel;
  });

  if (category && category.trim()) {
    const cUpper = category.trim().toUpperCase();
    list = list.filter(item => (item.category || '').toUpperCase() === cUpper);
  }
  if (subCategory && subCategory.trim()) {
    const sUpper = subCategory.trim().toUpperCase();
    list = list.filter(item => (item.subCategory || '').toUpperCase() === sUpper);
  }

  list.sort((a, b) => {
    const posA = typeof a.position === 'number' ? a.position : (typeof a.sortOrder === 'number' ? a.sortOrder : 999);
    const posB = typeof b.position === 'number' ? b.position : (typeof b.sortOrder === 'number' ? b.sortOrder : 999);
    if (posA !== posB) return posA - posB;
    return (a.name || '').localeCompare(b.name || '');
  });

  return toPlainObject(list);
}

// ─── Banners / Sliders ────────────────────────────────────────────────────────
// Mirrors Flutter: collection('Feeds').where('slider', isEqualTo: true).limit(10)

export interface SliderFeed {
  uid: string;
  image: string;
  title: string;
  detail: string;
  category: string;
  subCategory: string;
  slider: boolean;
}

export async function getSliderFeeds(): Promise<SliderFeed[]> {
  const snap = await getDocs(
    query(collection(db, 'Feeds'), where('slider', '==', true), limit(10))
  );
  const feeds = snap.docs.map(d => ({ uid: d.id, ...d.data() } as SliderFeed & { position?: number }));
  feeds.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)));
  return toPlainObject(feeds);
}

// Legacy – kept for backward compat
export async function getBanners(): Promise<BannerModel[]> {
  return getSliderFeeds() as any;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function subscribeToCart(
  userId: string,
  callback: (items: CartItem[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users', userId, 'Cart'),
    (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), cartDocId: d.id } as CartItem));
      callback(items);
    }
  );
}

export async function addToCart(userId: string, item: Partial<CartItem>, docId: string) {
  await setDoc(doc(db, 'users', userId, 'Cart', docId), item);
}

export async function removeFromCart(userId: string, docId: string) {
  await deleteDoc(doc(db, 'users', userId, 'Cart', docId));
}

export async function updateCartItem(userId: string, docId: string, data: Partial<CartItem>) {
  await updateDoc(doc(db, 'users', userId, 'Cart', docId), data);
}

export async function clearCart(userId: string) {
  const snap = await getDocs(collection(db, 'users', userId, 'Cart'));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ─── Delivery Fee ──────────────────────────────────────────────────────────────

export async function getDeliveryFee(): Promise<number> {
  const snap = await getDoc(doc(db, 'Delivery Fee', 'Delivery Fee'));
  if (!snap.exists()) return 0;
  return snap.data()['Delivery Fee'] ?? 0;
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export async function validateCoupon(code: string): Promise<CouponModel | null> {
  // Check if store currently accepts coupons
  try {
    const couponSysSnap = await getDoc(doc(db, 'Coupon System', 'Coupon System'));
    if (couponSysSnap.exists() && couponSysSnap.data()?.Status === false) {
      return null;
    }
  } catch (e) {
    console.warn('Coupon System check error:', e);
  }

  const snap = await getDocs(
    query(collection(db, 'Coupons'), where('coupon', '==', code))
  );
  if (snap.empty) return null;
  return toPlainObject({ ...snap.docs[0].data(), uid: snap.docs[0].id } as CouponModel);
}

export async function getCoupons(limitCount = 3): Promise<CouponModel[]> {
  try {
    const couponSysSnap = await getDoc(doc(db, 'Coupon System', 'Coupon System'));
    if (couponSysSnap.exists() && couponSysSnap.data()?.Status === false) {
      return [];
    }
  } catch (e) {
    console.warn('Coupon System check error:', e);
  }

  const snap = await getDocs(
    query(collection(db, 'Coupons'), limit(limitCount))
  );
  return toPlainObject(snap.docs.map(d => ({ ...d.data(), uid: d.id } as CouponModel)));
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUserDoc(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return toPlainObject({ uid: snap.id, ...snap.data() });
}

export async function updateUserDoc(userId: string, data: Record<string, unknown>) {
  await setDoc(doc(db, 'users', userId), data, { merge: true });
}

export function subscribeToUserDoc(
  userId: string,
  callback: (userDoc: any) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', userId),
    (snap) => {
      if (snap.exists()) {
        callback({ uid: snap.id, ...snap.data() });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('UserDoc listener error:', err);
    }
  );
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export function subscribeToFavorites(
  userId: string,
  callback: (items: ProductsModel[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users', userId, 'Favorite'),
    (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel));
      callback(items);
    },
    (err) => {
      console.warn('Favorite listener error:', err);
    }
  );
}

export async function addToFavorites(userId: string, item: ProductsModel) {
  // Use productID or uid as the document ID inside the Favorite subcollection
  const docId = item.productID || item.uid;
  if (!docId) return;
  await setDoc(doc(db, 'users', userId, 'Favorite', docId), item);
}

export async function removeFromFavorites(userId: string, productId: string) {
  await deleteDoc(doc(db, 'users', userId, 'Favorite', productId));
}
