import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ProductsModel, CategoriesModel, BannerModel, CartItem, CouponModel } from '@/types';

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(limitCount = 20): Promise<ProductsModel[]> {
  const snap = await getDocs(query(collection(db, 'Products'), limit(limitCount)));
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel));
}

export async function getProductsByCategory(category: string): Promise<ProductsModel[]> {
  const snap = await getDocs(
    query(collection(db, 'Products'), where('category', '==', category))
  );
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel));
}

export async function getRecentPurchasedProducts(userId: string): Promise<ProductsModel[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'Recent Purchased Products'));
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel));
}

export async function getProductById(id: string): Promise<ProductsModel | null> {
  const snap = await getDoc(doc(db, 'Products', id));
  if (!snap.exists()) return null;
  return { ...snap.data(), uid: snap.id } as ProductsModel;
}

export async function getFlashSaleProducts(): Promise<ProductsModel[]> {
  const snap = await getDocs(collection(db, 'Flash Sales Products'));
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as ProductsModel));
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoriesModel[]> {
  const snap = await getDocs(collection(db, 'Categories'));
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as CategoriesModel));
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
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as SliderFeed));
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
  const snap = await getDocs(
    query(collection(db, 'Coupons'), where('coupon', '==', code))
  );
  if (snap.empty) return null;
  return { ...snap.docs[0].data(), uid: snap.docs[0].id } as CouponModel;
}

export async function getCoupons(limitCount = 3): Promise<CouponModel[]> {
  const snap = await getDocs(
    query(collection(db, 'Coupons'), limit(limitCount))
  );
  return snap.docs.map(d => ({ ...d.data(), uid: d.id } as CouponModel));
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUserDoc(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() };
}

export async function updateUserDoc(userId: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, 'users', userId), data);
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
