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
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:tab_indicator_styler/tab_indicator_styler.dart';
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
                bottom: TabBar(
                  isScrollable: true,
                  labelColor: const Color.fromARGB(
                      255, 47, 37, 37), // Highlight active tab
                  unselectedLabelColor: Colors.grey, // Grey for inactive tabs
                  indicator: DotIndicator(
                    distanceFromCenter: 16,
                    radius: 4, // Slightly larger dot indicator
                    paintingStyle: PaintingStyle.fill,
                    color: const Color.fromARGB(
                        255, 47, 37, 37), // indicator for a modern look
                  ),
                  tabs: data.map((e) {
                    return Tab(
                      text: e,
                    );
                  }).toList(),
                ),
                iconTheme: Theme.of(context).iconTheme,
                titleTextStyle: TextStyle(
                  color: Theme.of(context).indicatorColor,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
                backgroundColor: Theme.of(context).colorScheme.background,
                elevation: 4, // Slight elevation for app bar shadow
                centerTitle: true,
                title: SizedBox(
                  width: MediaQuery.of(context).size.width / 1.2,
                  height: 45,
                  child: TextField(
                    readOnly: true,
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
                    decoration: InputDecoration(
                      filled: true,
                      fillColor:
                          Colors.white, // Bright background for better contrast
                      hintText: '$search Khakhra, Mathiya',
                      hintStyle: const TextStyle(
                        color: Colors.black54, // Subtle black for hint text
                        fontSize: 14,
                      ),
                      prefixIcon: const Icon(
                        Icons.search,
                        color:
                            Colors.grey, // Grey search icon for a cleaner look
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: const BorderSide(color: Colors.transparent),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderSide: const BorderSide(color: Colors.transparent),
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: InkWell(
                      onTap: () {
                        if (userRef == null) {
                          Navigator.of(context).pushNamed('/login');
                        } else {
                          Navigator.of(context).pushNamed('/cart');
                        }
                      },
                      child: Container(
                        height: 45,
                        width: 45,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color.fromARGB(255, 245, 240, 240),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.3),
                              blurRadius: 6,
                              spreadRadius: 2,
                              offset: const Offset(0, 4), // Slight elevation
                            ),
                          ],
                        ),
                        child: Center(
                          child: Badge(
                            badgeStyle: const BadgeStyle(
                              badgeColor: Color.fromARGB(255, 47, 37, 37),
                            ),
                            badgeContent: Text(
                              cartQuantity.toString(),
                              style: const TextStyle(color: Colors.white),
                            ),
                            child: const Icon(
                              Icons.shopping_cart,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              body: TabBarView(
                children: List.generate(data.length, (index) {
                  return Padding(
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
                                        mainAxisSpacing: MediaQuery.of(context)
                                                    .size
                                                    .width >=
                                                1100
                                            ? 10
                                            : MediaQuery.of(context).size.width > 600 &&
                                                    MediaQuery.of(context).size.width <
                                                        1200
                                                ? 5
                                                : 0,
                                        crossAxisSpacing: MediaQuery.of(context)
                                                    .size
                                                    .width >=
                                                1100
                                            ? 10
                                            : MediaQuery.of(context).size.width > 600 &&
                                                    MediaQuery.of(context).size.width <
                                                        1200
                                                ? 5
                                                : 0,
                                        crossAxisCount: MediaQuery.of(context)
                                                    .size
                                                    .width >=
                                                1100
                                            ? 4
                                            : MediaQuery.of(context).size.width > 600 &&
                                                    MediaQuery.of(context).size.width <
                                                        1200
                                                ? 3
                                                : 2,
                                        childAspectRatio: MediaQuery.of(context)
                                                    .size
                                                    .width >=
                                                1100
                                            ? 1
                                            : MediaQuery.of(context).size.width >
                                                        600 &&
                                                    MediaQuery.of(context).size.width < 1200
                                                ? 0.9
                                                : 0.8),
                                itemCount: snapshot.data!.length,
                                physics: const BouncingScrollPhysics(),
                                shrinkWrap: true,
                                itemBuilder:
                                    (BuildContext buildContext, int index) {
                                  ProductsModel productModel =
                                      snapshot.data![index];
                                  return Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: InkWell(
                                      onTap: () {
                                        Analytics().trackProductView(
                                            productModel.productID,
                                            productModel.name);
                                        if (MediaQuery.of(context).size.width >=
                                            1100) {
                                          showDialog(
                                              context: context,
                                              builder: (context) {
                                                return AlertDialog(
                                                    content: SizedBox(
                                                  width: MediaQuery.of(context)
                                                          .size
                                                          .width /
                                                      1.5,
                                                  child: ProductDetailsPage(
                                                    currency: currencySymbol,
                                                    marketID:
                                                        productModel.marketID,
                                                    productsModel: productModel,
                                                  ),
                                                ));
                                              });
                                        } else {
                                          showMaterialModalBottomSheet(
                                            bounce: true,
                                            expand: true,
                                            context: context,
                                            backgroundColor: Colors.transparent,
                                            builder: (context) => Padding(
                                              padding: MediaQuery.of(context)
                                                          .size
                                                          .width >=
                                                      1100
                                                  ? const EdgeInsets.only(
                                                      left: 200, right: 200)
                                                  : const EdgeInsets.only(
                                                      left: 0, right: 0),
                                              child: ProductDetailsPage(
                                                currency: currencySymbol,
                                                marketID: productModel.marketID,
                                                productsModel: productModel,
                                              ),
                                            ),
                                          );
                                        }
                                      },
                                      child: Card(
                                        elevation: 4,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                              16.0), // Rounded corners for the card
                                        ),
                                        child: Stack(
                                          children: [
                                            Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.stretch,
                                              children: [
                                                AspectRatio(
                                                  aspectRatio: 16 / 9,
                                                  child: ClipRRect(
                                                    borderRadius:
                                                        const BorderRadius.only(
                                                      topLeft:
                                                          Radius.circular(16.0),
                                                      topRight:
                                                          Radius.circular(16.0),
                                                    ),
                                                    child: Image.network(
                                                      productModel.image1,
                                                      height: MediaQuery.of(
                                                                      context)
                                                                  .size
                                                                  .width >=
                                                              1100
                                                          ? 160
                                                          : MediaQuery.of(context)
                                                                          .size
                                                                          .width >
                                                                      600 &&
                                                                  MediaQuery.of(
                                                                              context)
                                                                          .size
                                                                          .width <
                                                                      1200
                                                              ? 140
                                                              : 120,
                                                      width: double.infinity,
                                                      fit: BoxFit.cover,
                                                      errorBuilder: (context,
                                                              error,
                                                              stackTrace) =>
                                                          Container(
                                                        height: 120,
                                                        color: Colors
                                                            .grey.shade200,
                                                        child: const Icon(
                                                          Icons.broken_image,
                                                          color: Colors.grey,
                                                          size: 40,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.all(
                                                      16.0), // Increased padding for better spacing
                                                  child: Column(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceEvenly,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Flexible(
                                                            flex: 5,
                                                            child: Text(
                                                              productModel.name,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              style: TextStyle(
                                                                fontSize: MediaQuery.of(context)
                                                                            .size
                                                                            .width >=
                                                                        1100
                                                                    ? 16
                                                                    : 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                              ),
                                                            ),
                                                          ),
                                                          if (productModel
                                                                      .totalNumberOfUserRating !=
                                                                  0 &&
                                                              productModel
                                                                      .totalRating !=
                                                                  0)
                                                            Flexible(
                                                              flex: 5,
                                                              child: Row(
                                                                mainAxisAlignment:
                                                                    MainAxisAlignment
                                                                        .end,
                                                                children: [
                                                                  RatingBarIndicator(
                                                                    rating: (productModel.totalRating /
                                                                            productModel.totalNumberOfUserRating)
                                                                        .toDouble(),
                                                                    itemBuilder:
                                                                        (context,
                                                                                index) =>
                                                                            const Icon(
                                                                      Icons
                                                                          .star,
                                                                      color: Colors
                                                                          .amber,
                                                                    ),
                                                                    itemCount:
                                                                        5,
                                                                    itemSize:
                                                                        16,
                                                                    direction: Axis
                                                                        .horizontal,
                                                                  ),
                                                                  const SizedBox(
                                                                      width: 4),
                                                                  Text(
                                                                    '${(productModel.totalRating / productModel.totalNumberOfUserRating).toStringAsFixed(1)}',
                                                                    style:
                                                                        TextStyle(
                                                                      fontSize: MediaQuery.of(context).size.width >=
                                                                              1100
                                                                          ? 12
                                                                          : 10,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .bold,
                                                                    ),
                                                                  ),
                                                                ],
                                                              ),
                                                            ),
                                                        ],
                                                      ),
                                                      const SizedBox(
                                                          height: 12),
                                                      Text(
                                                        productModel
                                                            .description,
                                                        maxLines: 2,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          color: Colors.grey,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 8),
                                                      Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Text(
                                                            '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
                                                            style: TextStyle(
                                                              fontSize: MediaQuery.of(
                                                                              context)
                                                                          .size
                                                                          .width >=
                                                                      1100
                                                                  ? 16
                                                                  : 14,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              color: Colors
                                                                  .black87,
                                                            ),
                                                          ),
                                                          if (productModel
                                                                  .percantageDiscount !=
                                                              0)
                                                            Text(
                                                              '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                                                              style:
                                                                  const TextStyle(
                                                                fontSize: 12,
                                                                decoration:
                                                                    TextDecoration
                                                                        .lineThrough,
                                                                color:
                                                                    Colors.red,
                                                              ),
                                                            ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                            if (productModel
                                                    .percantageDiscount !=
                                                0)
                                              Positioned(
                                                top: 10,
                                                right: 10,
                                                child: Container(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 8,
                                                      vertical: 4),
                                                  decoration: BoxDecoration(
                                                    color: Colors.redAccent,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8),
                                                  ),
                                                  child: Text(
                                                    '-${productModel.percantageDiscount}% OFF',
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      color: Colors.white,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
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
                              child: SpinKitCircle(
                                  color: Color.fromARGB(255, 47, 37, 37)),
                            );
                          }
                        }),
                  );
                }),
              ),
            ),
          );
  }
}
