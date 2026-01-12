// ignore_for_file: avoid_print, deprecated_member_use, unnecessary_string_interpolations

import 'package:badges/badges.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' hide Badge;
import 'package:flutter/services.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:gap/gap.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Providers/analytics.dart';
import '../Widgets/search_products.dart';
import 'product_detail.dart';

class ProductsByCategories extends StatefulWidget {
  final String collection;
  const ProductsByCategories({super.key, required this.collection});

  @override
  State<ProductsByCategories> createState() => _ProductsByCategoriesState();
}

class _ProductsByCategoriesState extends State<ProductsByCategories> {
  Future<List<ProductsModel>> getMyProducts() {
    return FirebaseFirestore.instance
        .collection('Products')
        .where('category', isEqualTo: widget.collection)
        .get()
        .then((snapshot) {
      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  Future<List<ProductsModel>> getMyProductsBySubCategory(String subCat) {
    return FirebaseFirestore.instance
        .collection('Products')
        .where('category', isEqualTo: widget.collection)
        .where('subCategory', isEqualTo: subCat)
        .get()
        .then((snapshot) {
      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  String currencySymbol = '';
  getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      setState(() {
        currencySymbol = value['Currency symbol'];
      });
    });
  }

  bool isLoading = false;
  getSubCollections() {
    setState(() {
      isLoading = true;
    });
    FirebaseFirestore.instance
        .collection('Sub Categories')
        .where('category', isEqualTo: widget.collection)
        .snapshots()
        .listen((event) {
      setState(() {
        isLoading = false;
      });
      // data.clear();
      for (var element in event.docs) {
        data.add(element['name']);
        print(data);
      }
    });
  }

  List<String> data = [
    "All",
    // 'Flash sales'
  ];
  @override
  void initState() {
    _getUserDoc();
    getCurrencySymbol();
    getSubCollections();
    getCart();
    super.initState();
  }

  final ScrollController _scrollController = ScrollController();
  @override
  void dispose() {
    _focusNode.dispose();
    _scrollController.dispose(); // dispose the controller
    super.dispose();
  }

  num cartQuantity = 0;
  DocumentReference? userRef;

  getCart() {
    if (userRef != null) {
      userRef!.collection('Cart').snapshots().listen((val) {
        num tempTotal =
            val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']);
        setState(() {
          cartQuantity = tempTotal;
        });
      });
    }
  }

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  final FocusNode _focusNode = FocusNode();
  void _handleKeyEvent(RawKeyEvent event) {
    var offset = _scrollController.offset;
    if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
      setState(() {
        if (kReleaseMode) {
          _scrollController.animateTo(offset - 200,
              duration: const Duration(milliseconds: 30), curve: Curves.ease);
        } else {
          _scrollController.animateTo(offset - 200,
              duration: const Duration(milliseconds: 30), curve: Curves.ease);
        }
      });
    } else if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
      setState(() {
        if (kReleaseMode) {
          _scrollController.animateTo(offset + 200,
              duration: const Duration(milliseconds: 30), curve: Curves.ease);
        } else {
          _scrollController.animateTo(offset + 200,
              duration: const Duration(milliseconds: 30), curve: Curves.ease);
        }
      });
    }
  }

  void _openBoutiqueDetails(BuildContext context, ProductsModel productModel) {
    // 🔹 Trigger premium tactile feedback
    HapticFeedback.lightImpact();

    if (MediaQuery.of(context).size.width >= 1100) {
      // 🔹 Desktop / Tablet Boutique Dialog
      showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            backgroundColor: const Color(0xFF1C1515), // Theme Charcoal
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            content: SizedBox(
              width: MediaQuery.of(context).size.width / 1.5,
              child: ProductDetailsPage(
                currency: currencySymbol,
                marketID: productModel.marketID,
                productsModel: productModel,
              ),
            ),
          );
        },
      );
    } else {
      // 🔹 Mobile Boutique Modal Bottom Sheet
      showMaterialModalBottomSheet(
        bounce: true,
        expand: true,
        context: context,
        backgroundColor:
            Colors.transparent, // Ensures the Glassmorphism blur works
        builder: (context) => Container(
          decoration: const BoxDecoration(
            color: Color(0xFF1C1515), // Theme Charcoal
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(30),
              topRight: Radius.circular(30),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.only(top: 10),
            child: ProductDetailsPage(
              currency: currencySymbol,
              marketID: productModel.marketID,
              productsModel: productModel,
            ),
          ),
        ),
      );
    }
  }

  Widget _buildRatingRow(ProductsModel productModel) {
    // Calculate rating safely
    final double rating =
        (productModel.totalRating / productModel.totalNumberOfUserRating);

    return Row(
      children: [
        // Premium star indicator with theme color
        RatingBarIndicator(
          rating: rating.toDouble(),
          itemBuilder: (context, index) => const Icon(
            Icons.star_rounded,
            color: Color(0xFFC9A86A), // Boutique Gold
          ),
          itemCount: 5,
          itemSize: 14, // Slightly smaller for professional look
          direction: Axis.horizontal,
        ),
        const SizedBox(width: 6),
        // Numeric rating text
        Text(
          rating.toStringAsFixed(1),
          style: const TextStyle(
            color: Color(0xFFC9A86A),
            fontSize: 11,
            fontWeight: FontWeight.w900,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(width: 4),
        // Subtle indicator of total reviews
        Text(
          '(${productModel.totalNumberOfUserRating})',
          style: TextStyle(
            color: Colors.white.withOpacity(0.2),
            fontSize: 10,
          ),
        ),
      ],
    );
  }

  Widget _buildPriceRow(ProductsModel productModel) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🔹 Original Price (Strikethrough) - only shows if discount exists
            if (productModel.percantageDiscount != 0)
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text(
                  '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.15),
                    fontSize: 10,
                    decoration: TextDecoration.lineThrough,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            // 🔹 Current Boutique Price
            Text(
              '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
              style: const TextStyle(
                color: Color(0xFFC9A86A), // Boutique Gold
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        // 🔹 Subtle Action Indicator
        Icon(
          Icons.arrow_forward_ios_rounded,
          color: Colors.white.withOpacity(0.1),
          size: 12,
        ),
      ],
    );
  }

  Widget _buildDiscountBadge(num percentage) {
    return Positioned(
      top: 14,
      right: 14,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFC9A86A), // Boutique Gold
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Text(
          '-$percentage% OFF',
          style: const TextStyle(
            color: Colors.black, // Dark text for high contrast on Gold
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  String search = "Eg:".tr();
  @override
  Widget build(BuildContext context) {
    return isLoading == true
        ? const Scaffold(
            body: Center(
              child: SpinKitCircle(
                color: Color.fromARGB(
                    255, 47, 37, 37), // Slightly brighter accent color
                size: 60, // Increased size for better visibility
              ),
            ),
          )
        : DefaultTabController(
            length: data.length,
            child: Scaffold(
              appBar: AppBar(
                backgroundColor:
                    const Color(0xFF1C1515), // Elite Boutique Charcoal
                elevation: 0,
                centerTitle: false,
                iconTheme: const IconThemeData(color: Colors.white),
                // 🔹 HEADER: CLEAR CATEGORY BRANDING
                title: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "EXPLORE".tr().toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFFC9A86A), // Boutique Gold
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                    Text(
                      widget.collection.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 15),
                    child: InkWell(
                      onTap: () {
                        if (userRef == null) {
                          Navigator.of(context).pushNamed('/login');
                        } else {
                          Navigator.of(context).pushNamed('/cart');
                        }
                      },
                      child: Center(
                        child: Badge(
                          badgeStyle: const BadgeStyle(
                            badgeColor: Color(0xFFC9A86A),
                            padding: EdgeInsets.all(5),
                          ),
                          badgeContent: Text(
                            cartQuantity.toString(),
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          child: const Icon(
                            Icons.shopping_bag_outlined,
                            color: Colors.white,
                            size: 26,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(105),
                  child: Column(
                    children: [
                      // 🔹 RICH SEARCH BAR
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        child: InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => SearchProductPage(
                                  marketID: '',
                                  category: widget.collection,
                                ),
                              ),
                            );
                          },
                          child: Container(
                            height: 42,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                  color: const Color(0xFFC9A86A)
                                      .withOpacity(0.15)),
                            ),
                            child: Row(
                              children: [
                                const Gap(15),
                                const Icon(Icons.search_rounded,
                                    color: Color(0xFFC9A86A), size: 18),
                                const Gap(10),
                                Text(
                                  "Search in ${widget.collection}...".tr(),
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.3),
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      // 🔹 REFINED LINE INDICATOR TABBAR
                      TabBar(
                        isScrollable: true,
                        labelColor: const Color(0xFFC9A86A),
                        unselectedLabelColor: Colors.white24,
                        labelStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8),
                        // 🔹 LUXURY LINE INDICATOR
                        indicator: const UnderlineTabIndicator(
                          borderSide: BorderSide(
                            color: Color(0xFFC9A86A),
                            width: 3,
                          ),
                        ),
                        tabs: data
                            .map((e) => Tab(
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 4),
                                    child: Text(e.toUpperCase()),
                                  ),
                                ))
                            .toList(),
                      ),
                      const Gap(5),
                    ],
                  ),
                ),
              ),
              body: TabBarView(
                children: List.generate(data.length, (index) {
                  return Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF1C1515), Color(0xFF0D0D0D)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Padding(
                      padding: MediaQuery.of(context).size.width >= 1100
                          ? const EdgeInsets.only(left: 200, right: 200)
                          : const EdgeInsets.only(left: 8, right: 8),
                      child: FutureBuilder<List<ProductsModel>>(
                          future: data[index] == 'All'
                              ? getMyProducts()
                              : getMyProductsBySubCategory(data[index]),
                          builder: (context, snapshot) {
                            if (snapshot.hasData) {
                              return RawKeyboardListener(
                                autofocus: true,
                                focusNode: _focusNode,
                                onKey: _handleKeyEvent,
                                child: GridView.builder(
                                  controller: _scrollController,
                                  gridDelegate:
                                      SliverGridDelegateWithFixedCrossAxisCount(
                                          mainAxisSpacing: 12,
                                          crossAxisSpacing: 12,
                                          crossAxisCount: MediaQuery.of(context)
                                                      .size
                                                      .width >=
                                                  1100
                                              ? 4
                                              : MediaQuery.of(context)
                                                              .size
                                                              .width >
                                                          600 &&
                                                      MediaQuery.of(context)
                                                              .size
                                                              .width <
                                                          1200
                                                  ? 3
                                                  : 2,
                                          // 🔹 Adjusted Ratio for Square Images + Info
                                          childAspectRatio: 0.68),
                                  itemCount: snapshot.data!.length,
                                  physics: const BouncingScrollPhysics(),
                                  shrinkWrap: true,
                                  itemBuilder:
                                      (BuildContext buildContext, int index) {
                                    ProductsModel productModel =
                                        snapshot.data![index];
                                    return Padding(
                                      padding: const EdgeInsets.all(4.0),
                                      child: InkWell(
                                        onTap: () {
                                          Analytics().trackProductView(
                                              productModel.productID,
                                              productModel.name);
                                          _openBoutiqueDetails(
                                              context, productModel);
                                        },
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color:
                                                Colors.white.withOpacity(0.04),
                                            borderRadius:
                                                BorderRadius.circular(20.0),
                                            border: Border.all(
                                                color: Colors.white
                                                    .withOpacity(0.08)),
                                          ),
                                          child: Stack(
                                            children: [
                                              Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.stretch,
                                                children: [
                                                  // 🔹 PREMIUM SQUARE ASPECT RATIO
                                                  AspectRatio(
                                                    aspectRatio: 1 / 1,
                                                    child: Container(
                                                      margin:
                                                          const EdgeInsets.all(
                                                              8),
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(16),
                                                        boxShadow: [
                                                          BoxShadow(
                                                            color: const Color(
                                                                    0xFFC9A86A)
                                                                .withOpacity(
                                                                    0.05),
                                                            blurRadius: 10,
                                                            spreadRadius: 2,
                                                          )
                                                        ],
                                                      ),
                                                      child: ClipRRect(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(16.0),
                                                        child: Image.network(
                                                          productModel.image1,
                                                          fit: BoxFit.cover,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  Padding(
                                                    padding: const EdgeInsets
                                                        .fromLTRB(
                                                        12, 4, 12, 12),
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          productModel.name
                                                              .toUpperCase(),
                                                          maxLines: 1,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 13,
                                                            fontWeight:
                                                                FontWeight.w800,
                                                            letterSpacing: 0.5,
                                                          ),
                                                        ),
                                                        const Gap(4),
                                                        if (productModel
                                                                .totalNumberOfUserRating !=
                                                            0)
                                                          _buildRatingRow(
                                                              productModel),
                                                        const Gap(6),
                                                        // Text(
                                                        //   productModel
                                                        //       .description,
                                                        //   maxLines: 1,
                                                        //   overflow: TextOverflow
                                                        //       .ellipsis,
                                                        //   style: TextStyle(
                                                        //       fontSize: 10,
                                                        //       color: Colors
                                                        //           .white
                                                        //           .withOpacity(
                                                        //               0.3)),
                                                        // ),
                                                        const Gap(10),
                                                        _buildPriceRow(
                                                            productModel),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              if (productModel
                                                      .percantageDiscount !=
                                                  0)
                                                _buildDiscountBadge(productModel
                                                    .percantageDiscount),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              );
                            } else {
                              return const Center(
                                  child: CircularProgressIndicator(
                                      color: Color(0xFFC9A86A)));
                            }
                          }),
                    ),
                  );
                }),
              ),
            ),
          );
  }
}
