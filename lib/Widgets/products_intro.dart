// // ignore_for_file: avoid_print, deprecated_member_use

// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:easy_localization/easy_localization.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/foundation.dart';
// import 'package:flutter/material.dart' hide Badge;
// import 'package:flutter/services.dart';
// import 'package:flutter_rating_bar/flutter_rating_bar.dart';
// import 'package:flutter_spinkit/flutter_spinkit.dart';
// import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
// import '../Model/formatter.dart';
// import '../Model/products.dart';
// import '../Pages/product_detail.dart';
// import '../Providers/analytics.dart';

// class ProductsIntro extends StatefulWidget {
//   const ProductsIntro({
//     super.key,
//   });

//   @override
//   State<ProductsIntro> createState() => _ProductsIntroState();
// }

// class _ProductsIntroState extends State<ProductsIntro> {
//   Future<List<ProductsModel>> getMyProducts() {
//     return FirebaseFirestore.instance
//         .collection('Products')
//         .limit(40)
//         .get()
//         .then((snapshot) {
//       return snapshot.docs
//           .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
//           .toList();
//     });
//   }

//   String currencySymbol = '';
//   getCurrencySymbol() {
//     FirebaseFirestore.instance
//         .collection('Currency Settings')
//         .doc('Currency Settings')
//         .get()
//         .then((value) {
//       setState(() {
//         currencySymbol = value['Currency symbol'];
//       });
//     });
//   }

//   @override
//   void initState() {
//     _getUserDoc();
//     getCurrencySymbol();
//     getCart();
//     super.initState();
//   }

//   final ScrollController _scrollController = ScrollController();
//   @override
//   void dispose() {
//     _focusNode.dispose();
//     _scrollController.dispose(); // dispose the controller
//     super.dispose();
//   }

//   num cartQuantity = 0;
//   DocumentReference? userRef;

//   getCart() {
//     if (userRef != null) {
//       userRef!.collection('Cart').snapshots().listen((val) {
//         num tempTotal =
//             val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']);
//         setState(() {
//           cartQuantity = tempTotal;
//         });
//       });
//     }
//   }

//   Future<void> _getUserDoc() async {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     final FirebaseFirestore firestore = FirebaseFirestore.instance;

//     User? user = auth.currentUser;
//     setState(() {
//       userRef = firestore.collection('users').doc(user!.uid);
//     });
//   }

//   final FocusNode _focusNode = FocusNode();
//   void _handleKeyEvent(RawKeyEvent event) {
//     var offset = _scrollController.offset;
//     if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
//       setState(() {
//         if (kReleaseMode) {
//           _scrollController.animateTo(offset - 200,
//               duration: const Duration(milliseconds: 30), curve: Curves.ease);
//         } else {
//           _scrollController.animateTo(offset - 200,
//               duration: const Duration(milliseconds: 30), curve: Curves.ease);
//         }
//       });
//     } else if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
//       setState(() {
//         if (kReleaseMode) {
//           _scrollController.animateTo(offset + 200,
//               duration: const Duration(milliseconds: 30), curve: Curves.ease);
//         } else {
//           _scrollController.animateTo(offset + 200,
//               duration: const Duration(milliseconds: 30), curve: Curves.ease);
//         }
//       });
//     }
//   }

//   String search = "Search For Markets on".tr();

//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: MediaQuery.of(context).size.width >= 1100
//           ? const EdgeInsets.symmetric(horizontal: 150)
//           : const EdgeInsets.symmetric(horizontal: 8),
//       child: FutureBuilder<List<ProductsModel>>(
//         future: getMyProducts(),
//         builder: (context, snapshot) {
//           if (snapshot.hasData) {
//             return RawKeyboardListener(
//               autofocus: true,
//               focusNode: _focusNode,
//               onKey: _handleKeyEvent,
//               child: GridView.builder(
//                 padding: const EdgeInsets.symmetric(vertical: 10),
//                 controller: _scrollController,
//                 gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
//                     mainAxisSpacing: MediaQuery.of(context).size.width >= 1100
//                         ? 10
//                         : MediaQuery.of(context).size.width > 600 &&
//                                 MediaQuery.of(context).size.width < 1200
//                             ? 5
//                             : 0,
//                     crossAxisSpacing: MediaQuery.of(context).size.width >= 1100
//                         ? 10
//                         : MediaQuery.of(context).size.width > 600 &&
//                                 MediaQuery.of(context).size.width < 1200
//                             ? 5
//                             : 0,
//                     crossAxisCount: MediaQuery.of(context).size.width >= 1100
//                         ? 4
//                         : MediaQuery.of(context).size.width > 600 &&
//                                 MediaQuery.of(context).size.width < 1200
//                             ? 3
//                             : 2,
//                     childAspectRatio: MediaQuery.of(context).size.width >= 1100
//                         ? 1
//                         : MediaQuery.of(context).size.width > 600 &&
//                                 MediaQuery.of(context).size.width < 1200
//                             ? 0.9
//                             : 0.8),
//                 itemCount: snapshot.data!.length,
//                 physics: const BouncingScrollPhysics(),
//                 shrinkWrap: true,
//                 itemBuilder: (BuildContext buildContext, int index) {
//                   ProductsModel productModel = snapshot.data![index];
//                   return Padding(
//                     padding: const EdgeInsets.all(8.0),
//                     child: InkWell(
//                       onTap: () {
//                         Analytics().trackProductView(
//                             productModel.productID, productModel.name);
//                         if (MediaQuery.of(context).size.width >= 1100) {
//                           showDialog(
//                               context: context,
//                               builder: (context) {
//                                 return AlertDialog(
//                                     content: SizedBox(
//                                   width:
//                                       MediaQuery.of(context).size.width / 1.5,
//                                   child: ProductDetailsPage(
//                                     currency: currencySymbol,
//                                     marketID: productModel.marketID,
//                                     productsModel: productModel,
//                                   ),
//                                 ));
//                               });
//                         } else {
//                           showMaterialModalBottomSheet(
//                             bounce: true,
//                             expand: true,
//                             context: context,
//                             backgroundColor: Colors.transparent,
//                             builder: (context) => Padding(
//                               padding: MediaQuery.of(context).size.width >= 1100
//                                   ? const EdgeInsets.only(left: 200, right: 200)
//                                   : const EdgeInsets.only(left: 0, right: 0),
//                               child: ProductDetailsPage(
//                                 currency: currencySymbol,
//                                 marketID: productModel.marketID,
//                                 productsModel: productModel,
//                               ),
//                             ),
//                           );
//                         }
//                       },
//                       child: ConstrainedBox(
//                         constraints: const BoxConstraints(
//                           minHeight: 0,
//                           maxHeight: double.infinity,
//                         ),
//                         child: Card(
//                           elevation: 4,
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(16.0),
//                           ),
//                           child: Stack(
//                             children: [
//                               Column(
//                                 crossAxisAlignment: CrossAxisAlignment.stretch,
//                                 children: [
//                                   AspectRatio(
//                                     aspectRatio: 16 / 9,
//                                     child: ClipRRect(
//                                       borderRadius: const BorderRadius.only(
//                                         topLeft: Radius.circular(16.0),
//                                         topRight: Radius.circular(16.0),
//                                       ),
//                                       child: Image.network(
//                                         productModel.image1,
//                                         height:
//                                             MediaQuery.of(context).size.width >=
//                                                     1100
//                                                 ? 140
//                                                 : MediaQuery.of(context)
//                                                                 .size
//                                                                 .width >
//                                                             600 &&
//                                                         MediaQuery.of(context)
//                                                                 .size
//                                                                 .width <
//                                                             1200
//                                                     ? 130
//                                                     : 120,
//                                         width: double.infinity,
//                                         fit: BoxFit.cover,
//                                       ),
//                                     ),
//                                   ),
//                                   Expanded(
//                                     child: Padding(
//                                       padding: const EdgeInsets.all(12.0),
//                                       child: Column(
//                                         mainAxisAlignment:
//                                             MainAxisAlignment.spaceBetween,
//                                         crossAxisAlignment:
//                                             CrossAxisAlignment.start,
//                                         children: [
//                                           // Row(
//                                           //   mainAxisAlignment:
//                                           //       MainAxisAlignment.spaceBetween,
//                                           //   children: [
//                                           //     Flexible(
//                                           //       flex: 5,
//                                           //       child: Text(
//                                           //         productModel.name,
//                                           //         overflow:
//                                           //             TextOverflow.ellipsis,
//                                           //         style: TextStyle(
//                                           //           fontSize:
//                                           //               MediaQuery.of(context)
//                                           //                           .size
//                                           //                           .width >=
//                                           //                       1100
//                                           //                   ? 16
//                                           //                   : 14,
//                                           //           fontWeight: FontWeight.w600,
//                                           //         ),
//                                           //       ),
//                                           //     ),
//                                           //     productModel.totalNumberOfUserRating ==
//                                           //                 0 &&
//                                           //             productModel
//                                           //                     .totalRating ==
//                                           //                 0
//                                           //         ? const SizedBox()
//                                           //         : Flexible(
//                                           //             flex: MediaQuery.of(
//                                           //                             context)
//                                           //                         .size
//                                           //                         .width >=
//                                           //                     1100
//                                           //                 ? 5
//                                           //                 : MediaQuery.of(context)
//                                           //                                 .size
//                                           //                                 .width >
//                                           //                             600 &&
//                                           //                         MediaQuery.of(
//                                           //                                     context)
//                                           //                                 .size
//                                           //                                 .width <
//                                           //                             1200
//                                           //                     ? 5
//                                           //                     : 6,
//                                           //             child: Row(
//                                           //               mainAxisAlignment:
//                                           //                   MainAxisAlignment
//                                           //                       .end,
//                                           //               children: [
//                                           //                 RatingBarIndicator(
//                                           //                   rating: (productModel
//                                           //                               .totalRating /
//                                           //                           productModel
//                                           //                               .totalNumberOfUserRating)
//                                           //                       .roundToDouble(),
//                                           //                   itemBuilder:
//                                           //                       (context,
//                                           //                               index) =>
//                                           //                           const Icon(
//                                           //                     Icons.star,
//                                           //                     color:
//                                           //                         Colors.amber,
//                                           //                   ),
//                                           //                   itemCount: 5,
//                                           //                   itemSize: 16,
//                                           //                   direction:
//                                           //                       Axis.horizontal,
//                                           //                 ),
//                                           //                 Text(
//                                           //                   ' ${(productModel.totalRating / productModel.totalNumberOfUserRating).toStringAsFixed(1)}',
//                                           //                   style: TextStyle(
//                                           //                     fontSize: MediaQuery.of(
//                                           //                                     context)
//                                           //                                 .size
//                                           //                                 .width >=
//                                           //                             1100
//                                           //                         ? 12
//                                           //                         : 10,
//                                           //                     fontWeight:
//                                           //                         FontWeight
//                                           //                             .w600,
//                                           //                   ),
//                                           //                 ),
//                                           //               ],
//                                           //             ),
//                                           //           ),
//                                           //   ],
//                                           // ),
//                                           Row(
//                                             mainAxisAlignment:
//                                                 MainAxisAlignment.spaceBetween,
//                                             children: [
//                                               Expanded(
//                                                 child: Text(
//                                                   productModel.name,
//                                                   overflow:
//                                                       TextOverflow.ellipsis,
//                                                   style: TextStyle(
//                                                     fontSize:
//                                                         MediaQuery.of(context)
//                                                                     .size
//                                                                     .width >=
//                                                                 1100
//                                                             ? 16
//                                                             : 14,
//                                                     fontWeight: FontWeight.w600,
//                                                   ),
//                                                 ),
//                                               ),
//                                               if (productModel
//                                                           .totalNumberOfUserRating >
//                                                       0 &&
//                                                   productModel.totalRating > 0)
//                                                 Row(
//                                                   children: [
//                                                     RatingBarIndicator(
//                                                       rating: (productModel
//                                                                   .totalRating /
//                                                               productModel
//                                                                   .totalNumberOfUserRating)
//                                                           .roundToDouble(),
//                                                       itemBuilder: (_, __) =>
//                                                           const Icon(Icons.star,
//                                                               color:
//                                                                   Colors.amber),
//                                                       itemCount: 5,
//                                                       itemSize: 16,
//                                                       direction:
//                                                           Axis.horizontal,
//                                                     ),
//                                                     const SizedBox(width: 4),
//                                                     Text(
//                                                       (productModel
//                                                                   .totalRating /
//                                                               productModel
//                                                                   .totalNumberOfUserRating)
//                                                           .toStringAsFixed(1),
//                                                       style: TextStyle(
//                                                         fontSize: MediaQuery.of(
//                                                                         context)
//                                                                     .size
//                                                                     .width >=
//                                                                 1100
//                                                             ? 12
//                                                             : 10,
//                                                         fontWeight:
//                                                             FontWeight.w600,
//                                                       ),
//                                                     ),
//                                                   ],
//                                                 ),
//                                             ],
//                                           ),
//                                           Text(
//                                             productModel.description,
//                                             maxLines: 2,
//                                             overflow: TextOverflow.ellipsis,
//                                             style: const TextStyle(
//                                               fontSize: 12,
//                                               color: Colors.grey,
//                                             ),
//                                           ),
//                                           Row(
//                                             mainAxisAlignment:
//                                                 MainAxisAlignment.spaceBetween,
//                                             children: [
//                                               Text(
//                                                 '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
//                                                 style: TextStyle(
//                                                   fontSize:
//                                                       MediaQuery.of(context)
//                                                                   .size
//                                                                   .width >=
//                                                               1100
//                                                           ? 16
//                                                           : 14,
//                                                   fontWeight: FontWeight.w700,
//                                                   color: Colors.black87,
//                                                 ),
//                                               ),
//                                               if (productModel
//                                                       .percantageDiscount !=
//                                                   0)
//                                                 Text(
//                                                   '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
//                                                   style: const TextStyle(
//                                                     fontSize: 12,
//                                                     decoration: TextDecoration
//                                                         .lineThrough,
//                                                     color: Colors.red,
//                                                   ),
//                                                 ),
//                                             ],
//                                           ),
//                                         ],
//                                       ),
//                                     ),
//                                   ),
//                                 ],
//                               ),
//                               if (productModel.percantageDiscount != 0)
//                                 Align(
//                                   alignment: Alignment.topRight,
//                                   child: Padding(
//                                     padding: const EdgeInsets.only(
//                                         top: 10, right: 10),
//                                     child: Container(
//                                       decoration: BoxDecoration(
//                                         color: Colors.redAccent,
//                                         borderRadius: BorderRadius.circular(8),
//                                       ),
//                                       width: 50,
//                                       height: 25,
//                                       child: Center(
//                                         child: Text(
//                                           '-${productModel.percantageDiscount}% OFF',
//                                           style: const TextStyle(
//                                             fontSize: 12,
//                                             color: Colors.white,
//                                             fontWeight: FontWeight.bold,
//                                           ),
//                                         ),
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                             ],
//                           ),
//                         ),
//                       ),
//                     ),
//                   );
//                 },
//               ),
//             );
//           } else {
//             return const Center(
//               child: SpinKitCircle(color: Color.fromARGB(255, 47, 37, 37)),
//             );
//           }
//         },
//       ),
//     );
//   }
// }

// ignore_for_file: deprecated_member_use, avoid_print

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:gap/gap.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Pages/product_detail.dart';

class ProductsIntro extends StatefulWidget {
  const ProductsIntro({super.key});

  @override
  State<ProductsIntro> createState() => _ProductsIntroState();
}

class _ProductsIntroState extends State<ProductsIntro> {
  static const Color kGold = Color(0xFFC9A86A);

  Future<List<ProductsModel>>? _productsFuture;
  String currencySymbol = '';
  DocumentReference? userRef;

  @override
  void initState() {
    super.initState();
    _productsFuture = getMyProducts();
    _getUserDoc();
    getCurrencySymbol();
  }

  Future<List<ProductsModel>> getMyProducts() async {
    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('Products')
          .limit(
              70) // High limit to ensure enough unique items for alternating rows
          .get();
      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      print("Firebase Error: $e");
      return [];
    }
  }

  void getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      if (mounted) {
        setState(() => currencySymbol = value['Currency symbol'] ?? "");
      }
    });
  }

  Future<void> _getUserDoc() async {
    User? user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      setState(() => userRef =
          FirebaseFirestore.instance.collection('users').doc(user.uid));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: MediaQuery.of(context).size.width >= 1100
          ? const EdgeInsets.symmetric(horizontal: 150)
          : const EdgeInsets.symmetric(horizontal: 14),
      child: FutureBuilder<List<ProductsModel>>(
        future: _productsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildShimmer();
          }
          if (snapshot.hasError ||
              !snapshot.hasData ||
              snapshot.data!.isEmpty) {
            return const SizedBox();
          }

          List<ProductsModel> allProducts = snapshot.data!;
          List<Widget> magazineItems = [];

          int currentIndex = 0;
          int sectionCount = 0;

          // Logic to iterate through data and distribute uniquely
          while (currentIndex < allProducts.length) {
            // 1. Vertical Batch (Take 5 unique items)
            int vEnd = (currentIndex + 5 > allProducts.length)
                ? allProducts.length
                : currentIndex + 5;
            List<ProductsModel> vBatch =
                allProducts.sublist(currentIndex, vEnd);

            magazineItems.addAll(vBatch.map((p) => _ProductListTile(
                productModel: p, currencySymbol: currencySymbol)));

            currentIndex = vEnd;

            // 2. Horizontal Batch (Take 6 unique items)
            if (currentIndex < allProducts.length) {
              int hEnd = (currentIndex + 6 > allProducts.length)
                  ? allProducts.length
                  : currentIndex + 6;
              List<ProductsModel> hBatch =
                  allProducts.sublist(currentIndex, hEnd);

              String sectionTitle = "";
              if (sectionCount == 0) {
                sectionTitle = "Editor's Picks";
              } else if (sectionCount == 1) {
                sectionTitle = "Top Rated";
              } else if (sectionCount == 2) {
                sectionTitle = "New Arrivals";
              } else if (sectionCount == 3) {
                sectionTitle = "Best Sellers";
              } else if (sectionCount == 4) {
                sectionTitle = "Trending Now";
              } else {
                sectionTitle = "Selected For You";
              }
              magazineItems
                  .add(_buildEliteHorizontalSection(sectionTitle, hBatch));

              currentIndex = hEnd;
              sectionCount++;
            }
          }

          return ListView(
            shrinkWrap: true,
            padding: EdgeInsets.zero,
            physics: const NeverScrollableScrollPhysics(),
            children: magazineItems,
          );
        },
      ),
    );
  }

  Widget _buildEliteHorizontalSection(
      String title, List<ProductsModel> products) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 15, 0, 10),
          child: Row(
            children: [
              Container(width: 2, height: 12, color: kGold),
              const Gap(8),
              Text(title.toUpperCase(),
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2)),
            ],
          ),
        ),
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: products.length,
            itemBuilder: (context, index) {
              return _ProductHorizontalCard(
                  productModel: products[index],
                  currencySymbol: currencySymbol);
            },
          ),
        ),
        const Gap(15), // Consistent spacing before next vertical block
      ],
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade900,
      highlightColor: Colors.grey.shade800,
      child: ListView.builder(
        shrinkWrap: true,
        itemCount: 5,
        itemBuilder: (_, __) => Container(
          height: 90,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
              color: Colors.white10, borderRadius: BorderRadius.circular(18)),
        ),
      ),
    );
  }
}

class _ProductListTile extends StatelessWidget {
  final ProductsModel productModel;
  final String currencySymbol;
  const _ProductListTile(
      {required this.productModel, required this.currencySymbol});

  @override
  Widget build(BuildContext context) {
    final double rating = productModel.totalNumberOfUserRating == 0
        ? 0
        : (productModel.totalRating / productModel.totalNumberOfUserRating);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => _openDetails(context),
        child: Container(
          height: 90,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
          ),
          child: Row(
            children: [
              _ProductImage(productModel: productModel, size: 80),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(productModel.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold)),
                    const Gap(2),
                    Text(productModel.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                            color: Colors.white.withOpacity(0.4),
                            fontSize: 10)),
                    const Spacer(),
                    if (rating > 0) _RatingWidget(rating: rating),
                    _PriceWidget(
                        productModel: productModel,
                        currencySymbol: currencySymbol,
                        small: true),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios_rounded,
                  color: Colors.white.withOpacity(0.1), size: 12),
            ],
          ),
        ),
      ),
    );
  }

  void _openDetails(BuildContext context) {
    showMaterialModalBottomSheet(
      bounce: true,
      expand: true,
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => ProductDetailsPage(
          currency: currencySymbol,
          marketID: productModel.marketID,
          productsModel: productModel),
    );
  }
}

class _ProductHorizontalCard extends StatelessWidget {
  final ProductsModel productModel;
  final String currencySymbol;
  const _ProductHorizontalCard(
      {required this.productModel, required this.currencySymbol});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        showMaterialModalBottomSheet(
          bounce: true,
          expand: true,
          context: context,
          backgroundColor: Colors.transparent,
          builder: (context) => ProductDetailsPage(
              currency: currencySymbol,
              marketID: productModel.marketID,
              productsModel: productModel),
        );
      },
      child: Container(
        width: 130,
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFC9A86A).withOpacity(0.15)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
                child: _ProductImage(
                    productModel: productModel, size: double.infinity)),
            const Gap(8),
            Text(productModel.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold)),
            const Gap(2),
            _PriceWidget(
                productModel: productModel,
                currencySymbol: currencySymbol,
                small: true),
          ],
        ),
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  final ProductsModel productModel;
  final double size;
  const _ProductImage({required this.productModel, required this.size});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: CachedNetworkImage(
            imageUrl: productModel.image1,
            width: size,
            height: size,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(color: Colors.white10),
          ),
        ),
        if (productModel.percantageDiscount > 0)
          Positioned(
            top: 5,
            left: 5,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(
                  color: const Color(0xFFC9A86A),
                  borderRadius: BorderRadius.circular(6)),
              child: Text('-${productModel.percantageDiscount}%',
                  style: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w900,
                      fontSize: 8)),
            ),
          ),
      ],
    );
  }
}

class _PriceWidget extends StatelessWidget {
  final ProductsModel productModel;
  final String currencySymbol;
  final bool small;
  const _PriceWidget(
      {required this.productModel,
      required this.currencySymbol,
      this.small = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
            '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
            style: TextStyle(
                color: const Color(0xFFC9A86A),
                fontSize: small ? 13 : 15,
                fontWeight: FontWeight.w900)),
        if (productModel.percantageDiscount > 0) ...[
          const Gap(4),
          Padding(
            padding: const EdgeInsets.only(bottom: 1),
            child: Text(
                '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                style: TextStyle(
                    color: Colors.white24,
                    fontSize: small ? 9 : 10,
                    decoration: TextDecoration.lineThrough)),
          ),
        ],
      ],
    );
  }
}

class _RatingWidget extends StatelessWidget {
  final double rating;
  const _RatingWidget({required this.rating});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          RatingBarIndicator(
            rating: rating,
            itemBuilder: (_, __) =>
                const Icon(Icons.star, color: Color(0xFFC9A86A)),
            itemCount: 5,
            itemSize: 10,
          ),
          const Gap(4),
          Text(rating.toStringAsFixed(1),
              style: const TextStyle(
                  color: Color(0xFFC9A86A),
                  fontSize: 9,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
