// ignore_for_file: prefer_const_constructors

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart' hide Badge;
import 'package:cloud_firestore/cloud_firestore.dart';

import '../Services/product_service.dart';
import '../Services/cart_service.dart';
import '../Services/favorite_service.dart';
import '../Services/rating_service.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Model/rating.dart';

// NEW IMPORTS
import '../Widgets/Product Page/product_description_section.dart';
import '../Widgets/Product Page/product_header_carousel.dart';
import '../Widgets/Product Page/product_info_section.dart';
import '../Widgets/Product Page/product_variants_section.dart';
import '../Widgets/Product Page/product_reviews_section.dart';
import '../Widgets/Product Page/product_appbar.dart';
import '../Widgets/Product Page/product_bottom_sheet.dart';

class ProductDetailsPage extends StatefulWidget {
  final String marketID;
  final ProductsModel productsModel;
  final String currency;

  const ProductDetailsPage({
    super.key,
    required this.marketID,
    required this.productsModel,
    required this.currency,
  });

  @override
  State<ProductDetailsPage> createState() => _ProductDetailsPageState();
}

class _ProductDetailsPageState extends State<ProductDetailsPage> {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  DocumentReference? userRef;
  String userID = "";

  // Scroll tracking
  final ScrollController _scrollController = ScrollController();
  double _scrollOffset = 0;

  // Page-level state (ONLY Variants)
  String selectedUnit = 'unit1';

  // Live states
  num cartQuantity = 0;
  String currentMarketID = '';
  num deliveryFee = 0;

  bool isFavorite = false;
  num ratingAndReview = 0;
  num totalUser = 0;
  int returnDuration = 0;

  // ⭐ Cached reviews future
  late Future<List<RatingModel>> reviewsFuture;

  @override
  void initState() {
    super.initState();
    _initUser();
    _loadInitialData();

    // SCROLL LISTENER
    _scrollController.addListener(() {
      setState(() => _scrollOffset = _scrollController.offset);
    });

    // ⭐ CACHE REVIEWS ONCE
    reviewsFuture = RatingService.getRatings(widget.productsModel.productID);
  }

  // USER SETUP
  Future<void> _initUser() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    userID = user.uid;
    userRef = FirebaseFirestore.instance.collection('users').doc(userID);
  }

  // LOAD DATA LISTENERS
  Future<void> _loadInitialData() async {
    if (userID.isEmpty) return;

    deliveryFee = await ProductService.getMarketDeliveryFee();

    ProductService.getReturnPolicy(widget.productsModel.productID)
        .listen((value) => setState(() => returnDuration = value));

    FavoriteService.isFavorite(
      userID: userID,
      product: widget.productsModel,
    ).listen((value) => setState(() => isFavorite = value));

    CartService.listenCartQuantity(userID)
        .listen((qty) => setState(() => cartQuantity = qty));

    FirebaseFirestore.instance
        .collection("users")
        .doc(userID)
        .snapshots()
        .listen((snap) {
      if (snap.exists) {
        setState(() => currentMarketID = snap["CurrentMarketID"] ?? "");
      }
    });

    RatingService.ratingSummaryStream(widget.productsModel.productID)
        .listen((summary) {
      setState(() {
        ratingAndReview = summary["avg"]!;
        totalUser = summary["count"]!;
      });
    });
  }

  // UI BUILD
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: ProductAppBar(
        title: widget.productsModel.name,
        cartQuantity: cartQuantity.toInt(),
        scrollOffset: _scrollOffset,
        onBack: () => Navigator.pop(context),
        onCartTap: () {
          if (userRef == null) {
            Navigator.pushNamed(context, '/login');
          } else {
            Navigator.pushNamed(context, '/cart');
          }
        },
      ),
      body: Stack(
        children: [
          // BACKGROUND GRADIENT
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [kBgTop, kBgMid, kBgTop],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),

          // MAIN CONTENT
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // IMAGE GALLERY
              SliverToBoxAdapter(
                child: SizedBox(
                  height: MediaQuery.of(context).size.height * 0.48,
                  child: ProductHeaderCarousel(
                    productsModel: widget.productsModel,
                  ),
                ),
              ),

              // CONTENT SECTION
              SliverToBoxAdapter(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1C1515), Color(0xFF2F2525)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(28),
                      topRight: Radius.circular(28),
                    ),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.07),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: 24),

                      ProductInfoSection(
                        productsModel: widget.productsModel,
                        returnDuration: returnDuration,
                        currency: widget.currency,
                        totalUser: totalUser,
                        getRatingAndReview: () => ratingAndReview,
                      ),

                      SizedBox(height: 16),

                      // DISCOUNT STRIP
                      if (widget.productsModel.percantageDiscount != 0)
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 18.0),
                          child: Row(
                            children: [
                              Text(
                                '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice1.toDouble())}',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.white38,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                              SizedBox(width: 8),
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent.withOpacity(0.85),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '-${widget.productsModel.percantageDiscount}%',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                      SizedBox(height: 24),

                      ProductDescriptionSection(
                          productsModel: widget.productsModel),

                      SizedBox(height: 24),

                      ProductVariantsSection(
                        productsModel: widget.productsModel,
                        selectedUnit: selectedUnit,
                        currency: widget.currency,
                        onUnitChanged: (unit) {
                          setState(() => selectedUnit = unit);
                        },
                      ),

                      SizedBox(height: 24),

                      // ⭐ PASS CACHED FUTURE HERE
                      ProductReviewsSection(
                        ratingStatus: ratingAndReview > 0,
                        reviewsFuture: reviewsFuture,
                      ),

                      SizedBox(height: 200),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // FIXED BOTTOM SHEET
          Align(
            alignment: Alignment.bottomCenter,
            child: ProductBottomSheet(
              product: widget.productsModel,
              userID: userID,
              marketID: widget.marketID,
              currentMarketID: currentMarketID,
              deliveryFee: deliveryFee,
              isFavoriteInitial: isFavorite,
            ),
          ),
        ],
      ),
    );
  }
}
