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
  // Cart extras
  selected?: string;
  quantity?: number;
  price?: number;
  selectedPrice?: number;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface CategoriesModel {
  uid?: string;
  category: string;
  image: string;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserModel {
  uid: string;
  fullname: string;
  email: string;
  phone?: string;
  userPic?: string;
  wallet?: number;
  deliveryAddress?: string;
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
  couponCode: string;
  percentage: number;
  status: boolean;
}

// ─── Banner/Slider ────────────────────────────────────────────────────────────
export interface BannerModel {
  uid?: string;
  image: string;
  title?: string;
}
