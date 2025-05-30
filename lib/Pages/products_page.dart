// ignore_for_file: avoid_print, deprecated_member_use, duplicate_ignore, unused_import, unused_element, unnecessary_string_interpolations

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
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Providers/analytics.dart';
import '../Widgets/search_products.dart';
import 'product_detail.dart';

class ProductsPage extends StatefulWidget {
  const ProductsPage({
    super.key,
  });

  @override
  State<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends State<ProductsPage> {
  Future<List<ProductsModel>> getMyProducts() {
    return FirebaseFirestore.instance
        .collection('Products')
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

  @override
  void initState() {
    _getUserDoc();
    getCurrencySymbol();
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
  // ignore: deprecated_member_use
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

  String search = "Search For Products On".tr();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
        backgroundColor: Theme.of(context).colorScheme.background,
        elevation: 0,
        centerTitle: true,
        title: SizedBox(
            width: MediaQuery.of(context).size.width / 1.2,
            height: 40,
            child: TextField(
              readOnly: true,
              onTap: () {
                Navigator.of(context).push(MaterialPageRoute(
                    builder: (context) => const SearchProductPage(
                          marketID: '',
                          category: '',
                        )));
              },
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color.fromARGB(255, 236, 230, 230),
                hintText: '$search Khakhra, Mathiya',
                hintStyle: const TextStyle(color: Colors.black),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: Colors.white),
                  borderRadius: BorderRadius.circular(15),
                ),
                enabledBorder: UnderlineInputBorder(
                  borderSide: const BorderSide(color: Colors.white),
                  borderRadius: BorderRadius.circular(15),
                ),
              ),
            )),
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
                height: 40,
                width: 40,
                decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color.fromARGB(255, 236, 230, 230)),
                child: Center(
                  child: Badge(
                    badgeStyle: const BadgeStyle(
                      badgeColor: Color.fromARGB(255, 47, 37, 37),
                    ),
                    badgeContent: Text(cartQuantity.toString(),
                        style: const TextStyle(color: Colors.white)),
                    child: const Icon(
                      Icons.shopping_cart,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ),
          )
        ],
      ),
      body: Padding(
        padding: MediaQuery.of(context).size.width >= 1100
            ? const EdgeInsets.only(left: 200, right: 200)
            : const EdgeInsets.only(left: 8, right: 8),
        child: FutureBuilder<List<ProductsModel>>(
            future: getMyProducts(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return RawKeyboardListener(
                  autofocus: true,
                  focusNode: _focusNode,
                  onKey: _handleKeyEvent,
                  child: GridView.builder(
                    controller: _scrollController,
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        mainAxisSpacing:
                            MediaQuery.of(context).size.width >= 1100
                                ? 10
                                : MediaQuery.of(context).size.width > 600 &&
                                        MediaQuery.of(context).size.width < 1200
                                    ? 5
                                    : 0,
                        crossAxisSpacing:
                            MediaQuery.of(context).size.width >= 1100
                                ? 10
                                : MediaQuery.of(context).size.width > 600 &&
                                        MediaQuery.of(context).size.width < 1200
                                    ? 5
                                    : 0,
                        crossAxisCount:
                            MediaQuery.of(context).size.width >= 1100
                                ? 4
                                : MediaQuery.of(context).size.width > 600 &&
                                        MediaQuery.of(context).size.width < 1200
                                    ? 3
                                    : 2,
                        childAspectRatio:
                            MediaQuery.of(context).size.width >= 1100
                                ? 1
                                : MediaQuery.of(context).size.width > 600 &&
                                        MediaQuery.of(context).size.width < 1200
                                    ? 0.9
                                    : 0.8),
                    itemCount: snapshot.data!.length,
                    physics: const BouncingScrollPhysics(),
                    shrinkWrap: true,
                    itemBuilder: (BuildContext buildContext, int index) {
                      ProductsModel productModel = snapshot.data![index];
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: InkWell(
                          onTap: () {
                            Analytics().trackProductView(
                                productModel.productID, productModel.name);
                            if (MediaQuery.of(context).size.width >= 1100) {
                              showDialog(
                                  context: context,
                                  builder: (context) {
                                    return AlertDialog(
                                        content: SizedBox(
                                      width: MediaQuery.of(context).size.width /
                                          1.5,
                                      child: ProductDetailsPage(
                                        currency: currencySymbol,
                                        marketID: productModel.marketID,
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
                                  padding:
                                      MediaQuery.of(context).size.width >= 1100
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
                                            const BorderRadius.vertical(
                                          top: Radius.circular(16.0),
                                        ),
                                        child: Image.network(
                                          productModel.image1,
                                          height: MediaQuery.of(context)
                                                      .size
                                                      .width >=
                                                  1100
                                              ? 160
                                              : MediaQuery.of(context)
                                                              .size
                                                              .width >
                                                          600 &&
                                                      MediaQuery.of(context)
                                                              .size
                                                              .width <
                                                          1200
                                                  ? 140
                                                  : 120,
                                          width: double.infinity,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stackTrace) =>
                                                  Container(
                                            height: 120,
                                            color: Colors.grey.shade200,
                                            child: const Icon(
                                              Icons.broken_image,
                                              color: Colors.grey,
                                              size: 40,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.all(
                                            16.0), // Increased padding for better spacing
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
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
                                                        TextOverflow.ellipsis,
                                                    style: TextStyle(
                                                      fontSize:
                                                          MediaQuery.of(context)
                                                                      .size
                                                                      .width >=
                                                                  1100
                                                              ? 16
                                                              : 14,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                  ),
                                                ),
                                                if (productModel
                                                            .totalNumberOfUserRating !=
                                                        0 &&
                                                    productModel.totalRating !=
                                                        0)
                                                  Flexible(
                                                    flex: 5,
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment.end,
                                                      children: [
                                                        RatingBarIndicator(
                                                          rating: (productModel
                                                                      .totalRating /
                                                                  productModel
                                                                      .totalNumberOfUserRating)
                                                              .toDouble(),
                                                          itemBuilder: (context,
                                                                  index) =>
                                                              const Icon(
                                                            Icons.star,
                                                            color: Colors.amber,
                                                          ),
                                                          itemCount: 5,
                                                          itemSize: 16,
                                                          direction:
                                                              Axis.horizontal,
                                                        ),
                                                        const SizedBox(
                                                            width: 4),
                                                        Text(
                                                          '${(productModel.totalRating / productModel.totalNumberOfUserRating).toStringAsFixed(1)}',
                                                          style: TextStyle(
                                                            fontSize: MediaQuery.of(
                                                                            context)
                                                                        .size
                                                                        .width >=
                                                                    1100
                                                                ? 12
                                                                : 10,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              productModel.description,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
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
                                                    fontSize:
                                                        MediaQuery.of(context)
                                                                    .size
                                                                    .width >=
                                                                1100
                                                            ? 16
                                                            : 14,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.black87,
                                                  ),
                                                ),
                                                if (productModel
                                                        .percantageDiscount !=
                                                    0)
                                                  Text(
                                                    '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      decoration: TextDecoration
                                                          .lineThrough,
                                                      color: Colors.red,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                if (productModel.percantageDiscount != 0)
                                  Positioned(
                                    top: 10,
                                    right: 10,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.redAccent,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        '-${productModel.percantageDiscount}% OFF',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
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
                    color: Color.fromARGB(255, 47, 37, 37),
                  ),
                );
              }
            }),
      ),
    );
  }
}
