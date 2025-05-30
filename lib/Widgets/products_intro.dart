// ignore_for_file: avoid_print, deprecated_member_use

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
import '../Pages/product_detail.dart';
import '../Providers/analytics.dart';

class ProductsIntro extends StatefulWidget {
  const ProductsIntro({
    super.key,
  });

  @override
  State<ProductsIntro> createState() => _ProductsIntroState();
}

class _ProductsIntroState extends State<ProductsIntro> {
  Future<List<ProductsModel>> getMyProducts() {
    return FirebaseFirestore.instance
        .collection('Products')
        .limit(40)
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

  String search = "Search For Markets on".tr();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: MediaQuery.of(context).size.width >= 1100
          ? const EdgeInsets.symmetric(horizontal: 150)
          : const EdgeInsets.symmetric(horizontal: 8),
      child: FutureBuilder<List<ProductsModel>>(
        future: getMyProducts(),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return RawKeyboardListener(
              autofocus: true,
              focusNode: _focusNode,
              onKey: _handleKeyEvent,
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(vertical: 10),
                controller: _scrollController,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    mainAxisSpacing: MediaQuery.of(context).size.width >= 1100
                        ? 10
                        : MediaQuery.of(context).size.width > 600 &&
                                MediaQuery.of(context).size.width < 1200
                            ? 5
                            : 0,
                    crossAxisSpacing: MediaQuery.of(context).size.width >= 1100
                        ? 10
                        : MediaQuery.of(context).size.width > 600 &&
                                MediaQuery.of(context).size.width < 1200
                            ? 5
                            : 0,
                    crossAxisCount: MediaQuery.of(context).size.width >= 1100
                        ? 4
                        : MediaQuery.of(context).size.width > 600 &&
                                MediaQuery.of(context).size.width < 1200
                            ? 3
                            : 2,
                    childAspectRatio: MediaQuery.of(context).size.width >= 1100
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
                                  width:
                                      MediaQuery.of(context).size.width / 1.5,
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
                              padding: MediaQuery.of(context).size.width >= 1100
                                  ? const EdgeInsets.only(left: 200, right: 200)
                                  : const EdgeInsets.only(left: 0, right: 0),
                              child: ProductDetailsPage(
                                currency: currencySymbol,
                                marketID: productModel.marketID,
                                productsModel: productModel,
                              ),
                            ),
                          );
                        }
                      },
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(
                          minHeight: 0,
                          maxHeight: double.infinity,
                        ),
                        child: Card(
                          elevation: 4,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16.0),
                          ),
                          child: Stack(
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  AspectRatio(
                                    aspectRatio: 16 / 9,
                                    child: ClipRRect(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(16.0),
                                        topRight: Radius.circular(16.0),
                                      ),
                                      child: Image.network(
                                        productModel.image1,
                                        height:
                                            MediaQuery.of(context).size.width >=
                                                    1100
                                                ? 140
                                                : MediaQuery.of(context)
                                                                .size
                                                                .width >
                                                            600 &&
                                                        MediaQuery.of(context)
                                                                .size
                                                                .width <
                                                            1200
                                                    ? 130
                                                    : 120,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(12.0),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Row(
                                          //   mainAxisAlignment:
                                          //       MainAxisAlignment.spaceBetween,
                                          //   children: [
                                          //     Flexible(
                                          //       flex: 5,
                                          //       child: Text(
                                          //         productModel.name,
                                          //         overflow:
                                          //             TextOverflow.ellipsis,
                                          //         style: TextStyle(
                                          //           fontSize:
                                          //               MediaQuery.of(context)
                                          //                           .size
                                          //                           .width >=
                                          //                       1100
                                          //                   ? 16
                                          //                   : 14,
                                          //           fontWeight: FontWeight.w600,
                                          //         ),
                                          //       ),
                                          //     ),
                                          //     productModel.totalNumberOfUserRating ==
                                          //                 0 &&
                                          //             productModel
                                          //                     .totalRating ==
                                          //                 0
                                          //         ? const SizedBox()
                                          //         : Flexible(
                                          //             flex: MediaQuery.of(
                                          //                             context)
                                          //                         .size
                                          //                         .width >=
                                          //                     1100
                                          //                 ? 5
                                          //                 : MediaQuery.of(context)
                                          //                                 .size
                                          //                                 .width >
                                          //                             600 &&
                                          //                         MediaQuery.of(
                                          //                                     context)
                                          //                                 .size
                                          //                                 .width <
                                          //                             1200
                                          //                     ? 5
                                          //                     : 6,
                                          //             child: Row(
                                          //               mainAxisAlignment:
                                          //                   MainAxisAlignment
                                          //                       .end,
                                          //               children: [
                                          //                 RatingBarIndicator(
                                          //                   rating: (productModel
                                          //                               .totalRating /
                                          //                           productModel
                                          //                               .totalNumberOfUserRating)
                                          //                       .roundToDouble(),
                                          //                   itemBuilder:
                                          //                       (context,
                                          //                               index) =>
                                          //                           const Icon(
                                          //                     Icons.star,
                                          //                     color:
                                          //                         Colors.amber,
                                          //                   ),
                                          //                   itemCount: 5,
                                          //                   itemSize: 16,
                                          //                   direction:
                                          //                       Axis.horizontal,
                                          //                 ),
                                          //                 Text(
                                          //                   ' ${(productModel.totalRating / productModel.totalNumberOfUserRating).toStringAsFixed(1)}',
                                          //                   style: TextStyle(
                                          //                     fontSize: MediaQuery.of(
                                          //                                     context)
                                          //                                 .size
                                          //                                 .width >=
                                          //                             1100
                                          //                         ? 12
                                          //                         : 10,
                                          //                     fontWeight:
                                          //                         FontWeight
                                          //                             .w600,
                                          //                   ),
                                          //                 ),
                                          //               ],
                                          //             ),
                                          //           ),
                                          //   ],
                                          // ),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
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
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ),
                                              if (productModel
                                                          .totalNumberOfUserRating >
                                                      0 &&
                                                  productModel.totalRating > 0)
                                                Row(
                                                  children: [
                                                    RatingBarIndicator(
                                                      rating: (productModel
                                                                  .totalRating /
                                                              productModel
                                                                  .totalNumberOfUserRating)
                                                          .roundToDouble(),
                                                      itemBuilder: (_, __) =>
                                                          const Icon(Icons.star,
                                                              color:
                                                                  Colors.amber),
                                                      itemCount: 5,
                                                      itemSize: 16,
                                                      direction:
                                                          Axis.horizontal,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      (productModel
                                                                  .totalRating /
                                                              productModel
                                                                  .totalNumberOfUserRating)
                                                          .toStringAsFixed(1),
                                                      style: TextStyle(
                                                        fontSize: MediaQuery.of(
                                                                        context)
                                                                    .size
                                                                    .width >=
                                                                1100
                                                            ? 12
                                                            : 10,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                            ],
                                          ),
                                          Text(
                                            productModel.description,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,
                                            ),
                                          ),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
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
                                                  fontWeight: FontWeight.w700,
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
                                Align(
                                  alignment: Alignment.topRight,
                                  child: Padding(
                                    padding: const EdgeInsets.only(
                                        top: 10, right: 10),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.redAccent,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      width: 50,
                                      height: 25,
                                      child: Center(
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
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          } else {
            return const Center(
              child: SpinKitCircle(color: Color.fromARGB(255, 47, 37, 37)),
            );
          }
        },
      ),
    );
  }
}
