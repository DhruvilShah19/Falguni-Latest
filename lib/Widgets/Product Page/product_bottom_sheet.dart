// lib/Widgets/Product Page/product_bottom_sheet.dart

// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:animations/animations.dart';

import '../../Services/cart_service.dart';
import '../../Services/favorite_service.dart';
import '../../Services/product_service.dart';
import '../../Providers/analytics.dart';
import '../../Widgets/Common/top_toast.dart';

import '../../Model/products.dart';

class ProductBottomSheet extends StatefulWidget {
  final ProductsModel product;
  final String userID;
  final String marketID;
  final String currentMarketID;
  final num deliveryFee;
  final bool isFavoriteInitial;

  const ProductBottomSheet({
    super.key,
    required this.product,
    required this.userID,
    required this.marketID,
    required this.currentMarketID,
    required this.deliveryFee,
    required this.isFavoriteInitial,
  });

  @override
  State<ProductBottomSheet> createState() => _ProductBottomSheetState();
}

class _ProductBottomSheetState extends State<ProductBottomSheet> {
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kDark1 = Color(0xFF1C1515);
  static const Color kDark2 = Color(0xFF2F2525);

  late bool isFavorite;
  String selectedUnit = "unit1";
  num quantity = 1;

  /// After first successful add, future taps should say "Cart updated"
  bool hasAddedToCart = false;

  @override
  void initState() {
    super.initState();
    isFavorite = widget.isFavoriteInitial;
  }

  // **********************************************************************
  // FAVORITE (Analytics + Toast)
  // **********************************************************************
  Future<void> _toggleFavorite() async {
    if (isFavorite) {
      await FavoriteService.removeFavorite(
        userID: widget.userID,
        product: widget.product,
      );

      Analytics().trackProductWishlist(
        widget.product.productID,
        widget.product.name,
      );

      TopToast.show(context, "Removed from favorites".tr());
    } else {
      await FavoriteService.addFavorite(
        userID: widget.userID,
        product: widget.product,
      );

      Analytics().trackProductWishlist(
        widget.product.productID,
        widget.product.name,
      );

      TopToast.show(context, "Added to favorites ❤️".tr());
    }

    setState(() => isFavorite = !isFavorite);
  }

  // **********************************************************************
  // ADD TO CART (Analytics + Market Conflict)
  // **********************************************************************
  Future<void> _handleAddToCart() async {
    // Market conflict
    if (widget.currentMarketID.isNotEmpty &&
        widget.currentMarketID != widget.marketID) {
      _showCartConflictModal();
      return;
    }

    await CartService.addToCart(
      userID: widget.userID,
      marketID: widget.marketID,
      deliveryFee: widget.deliveryFee,
      product: _cartProduct(),
      selectedUnit: selectedUnit,
    );

    Analytics().trackProductWishlist(
      widget.product.productID,
      widget.product.name,
    );

    if (!hasAddedToCart) {
      TopToast.show(context, "Added to cart".tr());
    } else {
      TopToast.show(context, "Cart updated".tr());
    }

    setState(() {
      hasAddedToCart = true;
    });
  }

  ProductsModel _cartProduct() => ProductsModel(
        totalNumberOfUserRating: widget.product.totalNumberOfUserRating,
        totalRating: widget.product.totalRating,
        productID: widget.product.productID,
        price: ProductService.selectedPrice(
            widget.product, selectedUnit, quantity),
        selectedPrice:
            ProductService.selectedUnitPrice(widget.product, selectedUnit),
        quantity: quantity,
        selected: ProductService.selectedUnitName(widget.product, selectedUnit),
        description: widget.product.description,
        marketID: widget.marketID,
        marketName: widget.product.marketName,
        uid: widget.product.uid,
        name: widget.product.name,
        category: widget.product.category,
        subCategory: widget.product.subCategory,
        subSubCategory: widget.product.subSubCategory,
        image1: widget.product.image1,
        image2: widget.product.image2,
        image3: widget.product.image3,
        unitname1: widget.product.unitname1,
        unitname2: widget.product.unitname2,
        unitname3: widget.product.unitname3,
        unitname4: widget.product.unitname4,
        unitname5: widget.product.unitname5,
        unitname6: widget.product.unitname6,
        unitname7: widget.product.unitname7,
        unitPrice1: widget.product.unitPrice1,
        unitPrice2: widget.product.unitPrice2,
        unitPrice3: widget.product.unitPrice3,
        unitPrice4: widget.product.unitPrice4,
        unitPrice5: widget.product.unitPrice5,
        unitPrice6: widget.product.unitPrice6,
        unitPrice7: widget.product.unitPrice7,
        unitOldPrice1: widget.product.unitOldPrice1,
        unitOldPrice2: widget.product.unitOldPrice2,
        unitOldPrice3: widget.product.unitOldPrice3,
        unitOldPrice4: widget.product.unitOldPrice4,
        unitOldPrice5: widget.product.unitOldPrice5,
        unitOldPrice6: widget.product.unitOldPrice6,
        unitOldPrice7: widget.product.unitOldPrice7,
        percantageDiscount: widget.product.percantageDiscount,
        vendorId: widget.product.vendorId,
        brandName: widget.product.brandName,
      );

  // **********************************************************************
  // CART CONFLICT MODAL
  // **********************************************************************
  void _showCartConflictModal() {
    showModal(
      context: context,
      configuration: const FadeScaleTransitionConfiguration(),
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 26),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(26),
            border: Border.all(color: kGold, width: 1.3),
            gradient: const LinearGradient(
              colors: [kDark1, kDark2],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.85),
                blurRadius: 25,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.asset(
                  "assets/image/new cart.gif",
                  height: 170,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 22),
              const Text(
                "Your cart contains items from another market",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ).tr(),
              const SizedBox(height: 12),
              const Text(
                "To continue, please clear your current cart.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ).tr(),
              const SizedBox(height: 26),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: kGold,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      onPressed: () async {
                        Navigator.pop(context);
                        await CartService.resetMarketID(widget.userID);
                        await CartService.clearCart(widget.userID);
                        TopToast.show(context, "Cart cleared".tr());
                      },
                      child: const Text("Empty Cart").tr(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(
                          color: Colors.white.withOpacity(0.45),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text("Cancel").tr(),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // **********************************************************************
  // QUANTITY CONTROL
  // **********************************************************************
  void _increase() {
    if (quantity < widget.product.quantity!) {
      setState(() => quantity++);
    } else {
      TopToast.show(
        context,
        "Only ${widget.product.quantity} in stock".tr(),
      );
    }
  }

  void _decrease() {
    if (quantity > 1) {
      setState(() => quantity--);
    } else {
      TopToast.show(context, "Minimum quantity reached".tr());
    }
  }

  // **********************************************************************
  // FINAL CLEAN & PREMIUM BOTTOM SHEET UI
  // **********************************************************************
  @override
  @override
  Widget build(BuildContext context) {
    final String buttonLabel = !hasAddedToCart
        ? "Add $quantity to cart".tr()
        : "Update cart ($quantity)".tr();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(
        left: 18,
        right: 18,
        top: 18,
        bottom: 22, // full bottom padding so it feels grounded
      ),
      decoration: BoxDecoration(
        color: kDark2,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(26),
          topRight: Radius.circular(26),
        ),
        border: Border(
          top: BorderSide(
            color: Colors.white.withOpacity(0.12),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.45),
            blurRadius: 25,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // ❤️ FAVORITE
              GestureDetector(
                onTap: _toggleFavorite,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isFavorite
                        ? kGold.withOpacity(0.20)
                        : Colors.white.withOpacity(0.09),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isFavorite ? kGold : Colors.white24,
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: isFavorite ? kGold : Colors.white70,
                    size: 26,
                  ),
                ),
              ),

              const SizedBox(width: 14),

              // QUANTITY CONTROL
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white24, width: 1),
                ),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: _decrease,
                      child: const Icon(Icons.remove, color: kGold, size: 22),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      quantity.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 16),
                    GestureDetector(
                      onTap: _increase,
                      child: const Icon(Icons.add, color: kGold, size: 22),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 14),

              // ADD / UPDATE BUTTON
              Expanded(
                child: SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      foregroundColor: Colors.black,
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                    onPressed: _handleAddToCart,
                    child: Text(
                      buttonLabel,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // TIP INSIDE SHEET (premium subtle look)
          Center(
            child: Text(
              "Tip: Change quantity, then tap the button to update your cart."
                  .tr(),
              style: TextStyle(
                color: Colors.white.withOpacity(0.55),
                fontSize: 11.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
