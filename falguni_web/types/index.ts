// ─── Product ─────────────────────────────────────────────────────────────────
export interface ProductsModel {
  uid: string;
  name: string;
  category: string;
  subCategory: string;
  subSubCategory: string;
  image1: string;
  image2: string;
  image3: string;
  unitname1: string;
  unitname2: string;
  unitname3: string;
  unitname4: string;
  unitname5: string;
  unitname6: string;
  unitname7: string;
  unitPrice1: number;
  unitPrice2: number;
  unitPrice3: number;
  unitPrice4: number;
  unitPrice5: number;
  unitPrice6: number;
  unitPrice7: number;
  unitOldPrice1: number;
  unitOldPrice2: number;
  unitOldPrice3: number;
  unitOldPrice4: number;
  unitOldPrice5: number;
  unitOldPrice6: number;
  unitOldPrice7: number;
  percantageDiscount: number;
  vendorId: string;
  brandName: string;
  marketID: string;
  marketName: string;
  description: string;
  productID: string;
  totalRating: number;
  totalNumberOfUserRating: number;
  endFlash?: string;
  returnDuration?: number;
  vendorName?: string;
  isBestseller?: boolean;
  createdAt?: any;
  updatedAt?: any;
  // Cart extras
  selected?: string;
  quantity?: number;
  price?: number;
  selectedPrice?: number;
}

// ─── Product Variant Helper ──────────────────────────────────────────────────
export interface ProductVariant {
  index: number;
  unitName: string;
  price: number;
  oldPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
}

export function getProductVariants(product: ProductsModel): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (let i = 1; i <= 7; i++) {
    const uName = (product as any)[`unitname${i}`] as string;
    const uPrice = (product as any)[`unitPrice${i}`] as number;
    const uOldPrice = (product as any)[`unitOldPrice${i}`] as number;

    if (uPrice && uPrice > 0) {
      const hasDiscount = Boolean(uOldPrice && uOldPrice > uPrice);
      const discountPercentage = hasDiscount
        ? Math.round(((uOldPrice - uPrice) / uOldPrice) * 100)
        : (product.percantageDiscount || 0);

      variants.push({
        index: i,
        unitName: uName?.trim() || (i === 1 ? 'Standard Pack' : `Pack ${i}`),
        price: uPrice,
        oldPrice: uOldPrice || 0,
        hasDiscount,
        discountPercentage,
      });
    }
  }

  if (variants.length === 0) {
    const fallbackPrice = (product.unitPrice1 && product.unitPrice1 > 0) ? product.unitPrice1 : (product.price || 0);
    const fallbackOld = product.unitOldPrice1 || 0;
    const hasDiscount = fallbackOld > fallbackPrice;
    variants.push({
      index: 1,
      unitName: product.unitname1?.trim() || 'Standard Pack',
      price: fallbackPrice,
      oldPrice: fallbackOld,
      hasDiscount,
      discountPercentage: hasDiscount
        ? Math.round(((fallbackOld - fallbackPrice) / fallbackOld) * 100)
        : (product.percantageDiscount || 0),
    });
  }

  return variants;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface CategoriesModel {
  uid?: string;
  id?: string;
  category: string;
  image: string;
  position?: number;
  sortOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

// ─── Sub Category (Collection: 'Sub Categories') ─────────────────────────────
export interface SubCategoryModel {
  uid?: string;
  id?: string;
  category: string;
  name: string;
  image: string;
  position?: number;
  sortOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

// ─── Sub Category Collection (Collection: 'Sub categories collections') ──────
export interface SubCategoryCollectionModel {
  uid?: string;
  id?: string;
  category: string;
  subCategory: string;
  name: string;
  image: string;
  position?: number;
  sortOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserModel {
  uid: string;
  fullname: string;
  email: string;
  phone?: string;
  userPic?: string;
  deliveryAddress?: string;
  DeliveryAddress?: string;
  DeliveryAddressID?: string;
  HouseNumber?: string;
  address?: string;
  personalReferralCode?: string;
  referralCode?: string;
}

// ─── Cart Item ───────────────────────────────────────────────────────────────
export interface CartItem extends ProductsModel {
  cartDocId: string;
  quantity: number;
  price: number;
  selected: string;
  selectedPrice: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface OrderModel {
  orderId: string;
  userId: string;
  items: CartItem[];
  subTotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: Date;
  deliveryAddress: string;
  paymentMethod: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface CouponModel {
  uid?: string;
  coupon: string;
  percentage: number;
  title?: string;
}

// ─── Banner/Slider ────────────────────────────────────────────────────────────
export interface BannerModel {
  uid?: string;
  image: string;
  title?: string;
}

// ─── Courier ─────────────────────────────────────────────────────────────────
export interface CourierModel {
  uid?: string;
  userUID: string;
  parcelID: number;
  parcelName: string;
  parcelDescription: string;
  parcelImage: string;
  sendersName: string;
  sendersPhone: string;
  sendersAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  deliveryDate: string;
  deliveryBoyID: string;
  deliveryBoysName: string;
  deliveryBoysPhone: string;
  deliveryBoysAddress: string;
  weight: number;
  price: number;
  km: number;
  comission: number;
  status: boolean;
}

// ─── Address ─────────────────────────────────────────────────────────────────
export interface AddressModel {
  uid?: string;
  id: string;
  address: string;        // Mapped from 'Addresses' in Firestore
  Addresses?: string;
  houseNumber: string;
  closestbusStop: string;
}

// ─── Rating ──────────────────────────────────────────────────────────────────
export interface RatingModel {
  uid?: string;
  review: string;
  rating: number;
  fullname: string;
  profilePicture: string;
  timeCreated: string;
}

// ─── Promotional Popup Banner ────────────────────────────────────────────────
export interface PopupBannerConfig {
  enabled: boolean;
  layout?: 'split' | 'banner' | 'card';
  eyebrow?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  showCouponCode?: boolean;
  couponCode?: string;
  delaySeconds?: number;
  showFrequency?: 'once_per_session' | 'once_per_day' | 'always';
  updatedAt?: any;
}

