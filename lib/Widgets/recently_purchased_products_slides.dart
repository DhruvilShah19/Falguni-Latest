// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_rating_bar/flutter_rating_bar.dart';
// import 'package:gap/gap.dart';
// import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
// import 'package:shimmer/shimmer.dart';
// import '../../Model/products.dart';
// import '../Model/formatter.dart';
// import '../Pages/product_detail.dart';
// import '../Providers/analytics.dart';

// class RecentlyPurchasedProducts extends StatefulWidget {
//   const RecentlyPurchasedProducts({
//     super.key,
//   });

//   @override
//   State<RecentlyPurchasedProducts> createState() =>
//       _RecentlyPurchasedProductsState();
// }

// class _RecentlyPurchasedProductsState extends State<RecentlyPurchasedProducts> {
//   Future<List<ProductsModel>> getMyProducts() {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     User? user = auth.currentUser;
//     return FirebaseFirestore.instance
//         .collection('users')
//         .doc(user!.uid)
//         .collection('Recent Purchased Products')
//         .limit(6)
//         .get()
//         .then((snapshot) {
//       return snapshot.docs
//           .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
//           .toList();
//     });
//   }

//   String currencySymbol = '';
//   bool listview = true;
//   bool gridview = false;

//   getCurrencySymbol() {
//     FirebaseFirestore.instance
//         .collection('Currency Settings')
//         .doc('Currency Settings')
//         .get()
//         .then((value) {
//       if (mounted) {
//         setState(() {
//           currencySymbol = value['Currency symbol'];
//         });
//       }
//     });
//   }

//   @override
//   void initState() {
//     getCurrencySymbol();
//     super.initState();
//   }

//   final CarouselController controller = CarouselController();

//   @override
//   Widget build(BuildContext context) {
//     return FutureBuilder<List<ProductsModel>>(
//         future: getMyProducts(),
//         builder: (context, snapshot) {
//           if (snapshot.data?.isEmpty ?? true) {
//             return SizedBox(
//               width: double.infinity,
//               child: Column(
//                 mainAxisSize: MainAxisSize.max,
//                 children: <Widget>[
//                   const Gap(30),
//                   Expanded(
//                     child: Shimmer.fromColors(
//                       baseColor: Colors.grey[300]!,
//                       highlightColor: Colors.grey[100]!,
//                       enabled: true,
//                       child: ListView.builder(
//                         shrinkWrap: true,
//                         scrollDirection: Axis.horizontal,
//                         itemBuilder: (_, __) => SizedBox(
//                             height: 270,
//                             width: 180,
//                             child: Padding(
//                               padding:
//                                   const EdgeInsets.only(left: 10, right: 10),
//                               child: Column(
//                                 children: [
//                                   Container(
//                                     height: MediaQuery.of(context).size.width >=
//                                             1100
//                                         ? 120
//                                         : MediaQuery.of(context).size.width >
//                                                     600 &&
//                                                 MediaQuery.of(context)
//                                                         .size
//                                                         .width <
//                                                     1200
//                                             ? 150
//                                             : 150,
//                                     decoration: const BoxDecoration(
//                                         borderRadius: BorderRadius.all(
//                                             Radius.circular(20)),
//                                         color: Colors.white),
//                                   ),
//                                   const SizedBox(height: 10),
//                                   Padding(
//                                     padding: const EdgeInsets.only(left: 10),
//                                     child: Container(
//                                         height: 10,
//                                         width: 100,
//                                         color: Colors.white),
//                                   ),
//                                   const SizedBox(height: 10),
//                                   Padding(
//                                     padding: const EdgeInsets.only(
//                                         left: 10, right: 10),
//                                     child: Row(
//                                       children: [
//                                         Flexible(
//                                           flex: 3,
//                                           child: Container(
//                                               height: 10,
//                                               width: 200,
//                                               color: Colors.white),
//                                         ),
//                                         const SizedBox(width: 10),
//                                         Flexible(
//                                           flex: 5,
//                                           child: Container(
//                                               height: 10,
//                                               width: 200,
//                                               color: Colors.white),
//                                         ),
//                                       ],
//                                     ),
//                                   ),
//                                 ],
//                               ),
//                             )),
//                         itemCount: 8,
//                       ),
//                     ),
//                   ),
//                 ],
//               ),
//             );
//           } else if (snapshot.hasData) {
//             return ListView.builder(
//               shrinkWrap: true,
//               scrollDirection: Axis.horizontal,
//               itemCount: snapshot.data!.length,
//               itemBuilder: (
//                 BuildContext buildContext,
//                 int index,
//               ) {
//                 ProductsModel productModel = snapshot.data![index];
//                 return SizedBox(
//                   height: 280,
//                   width: 180,
//                   child: Column(
//                     children: [
//                       Card(
//                           elevation: 2,
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(5.0),
//                           ),
//                           child: Padding(
//                             padding: const EdgeInsets.all(10.0),
//                             child: InkWell(
//                               onTap: () {
//                                 Analytics().trackProductView(
//                                     productModel.productID, productModel.name);
//                                 if (MediaQuery.of(context).size.width >= 1100) {
//                                   showDialog(
//                                       context: context,
//                                       builder: (context) {
//                                         return AlertDialog(
//                                             content: SizedBox(
//                                           width: MediaQuery.of(context)
//                                                   .size
//                                                   .width /
//                                               1.5,
//                                           child: ProductDetailsPage(
//                                             currency: currencySymbol,
//                                             marketID: productModel.marketID,
//                                             productsModel: productModel,
//                                           ),
//                                         ));
//                                       });
//                                 } else {
//                                   showMaterialModalBottomSheet(
//                                     bounce: true,
//                                     expand: true,
//                                     context: context,
//                                     backgroundColor: Colors.transparent,
//                                     builder: (context) => Padding(
//                                       padding:
//                                           MediaQuery.of(context).size.width >=
//                                                   1100
//                                               ? const EdgeInsets.only(
//                                                   left: 200, right: 200)
//                                               : const EdgeInsets.only(
//                                                   left: 0, right: 0),
//                                       child: ProductDetailsPage(
//                                         currency: currencySymbol,
//                                         marketID: productModel.marketID,
//                                         productsModel: productModel,
//                                       ),
//                                     ),
//                                   );
//                                 }
//                               },
//                               child: SizedBox(
//                                   child: Card(
//                                       elevation: 0,
//                                       child: Stack(
//                                         children: [
//                                           Column(
//                                               mainAxisAlignment:
//                                                   MainAxisAlignment.spaceAround,
//                                               children: [
//                                                 Container(
//                                                   height: MediaQuery.of(context)
//                                                               .size
//                                                               .width >=
//                                                           1100
//                                                       ? 90
//                                                       : MediaQuery.of(context)
//                                                                       .size
//                                                                       .width >
//                                                                   600 &&
//                                                               MediaQuery.of(
//                                                                           context)
//                                                                       .size
//                                                                       .width <
//                                                                   1200
//                                                           ? 120
//                                                           : 120,
//                                                   width: 120,
//                                                   decoration:
//                                                       const BoxDecoration(
//                                                     borderRadius:
//                                                         BorderRadius.all(
//                                                             Radius.circular(
//                                                                 100.0)),
//                                                     color: Colors.black,
//                                                     boxShadow: [
//                                                       BoxShadow(
//                                                         color: Colors.black,
//                                                         blurRadius: 2.0,
//                                                         spreadRadius: 1.0,
//                                                         offset:
//                                                             Offset(3.0, 3.0),
//                                                       )
//                                                     ],
//                                                   ),
//                                                   child: ClipRRect(
//                                                     borderRadius:
//                                                         BorderRadius.circular(
//                                                             100.0),
//                                                     child: Image.network(
//                                                       productModel.image1,
//                                                       height: MediaQuery.of(
//                                                                       context)
//                                                                   .size
//                                                                   .width >=
//                                                               1100
//                                                           ? 90
//                                                           : MediaQuery.of(context)
//                                                                           .size
//                                                                           .width >
//                                                                       600 &&
//                                                                   MediaQuery.of(
//                                                                               context)
//                                                                           .size
//                                                                           .width <
//                                                                       1200
//                                                               ? 120
//                                                               : 120,
//                                                       width: double.infinity,
//                                                       fit: BoxFit.fill,
//                                                     ),
//                                                   ),
//                                                 ),
//                                                 Padding(
//                                                   padding: const EdgeInsets.all(
//                                                       20.0),
//                                                   child: Column(
//                                                     children: [
//                                                       Row(
//                                                         mainAxisAlignment:
//                                                             MainAxisAlignment
//                                                                 .spaceBetween,
//                                                         children: [
//                                                           Flexible(
//                                                             flex: 5,
//                                                             child: Text(
//                                                                 productModel
//                                                                     .name,
//                                                                 overflow:
//                                                                     TextOverflow
//                                                                         .ellipsis,
//                                                                 style: TextStyle(
//                                                                     fontSize:
//                                                                         MediaQuery.of(context).size.width >=
//                                                                                 1100
//                                                                             ? 13
//                                                                             : 12,
//                                                                     fontWeight:
//                                                                         FontWeight
//                                                                             .bold)),
//                                                           ),
//                                                           productModel.totalNumberOfUserRating ==
//                                                                       0 &&
//                                                                   productModel
//                                                                           .totalRating ==
//                                                                       0
//                                                               ? const SizedBox()
//                                                               : Flexible(
//                                                                   flex: 3,
//                                                                   child: Row(
//                                                                       mainAxisAlignment:
//                                                                           MainAxisAlignment
//                                                                               .end,
//                                                                       children: [
//                                                                         RatingBarIndicator(
//                                                                           rating:
//                                                                               (productModel.totalRating / productModel.totalNumberOfUserRating).roundToDouble(),
//                                                                           itemBuilder: (context, index) =>
//                                                                               const Icon(
//                                                                             Icons.star,
//                                                                             color: Color.fromARGB(
//                                                                                 255,
//                                                                                 47,
//                                                                                 37,
//                                                                                 37),
//                                                                           ),
//                                                                           itemCount:
//                                                                               5,
//                                                                           itemSize:
//                                                                               10,
//                                                                           direction:
//                                                                               Axis.horizontal,
//                                                                         ),
//                                                                         Text(
//                                                                             ' ${(productModel.totalRating / productModel.totalNumberOfUserRating).roundToDouble()}',
//                                                                             style:
//                                                                                 const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))
//                                                                       ]))
//                                                         ],
//                                                       ),
//                                                       const Gap(10),
//                                                       // -------- product description --------
//                                                       // Row(
//                                                       //   children: [
//                                                       //     Flexible(
//                                                       //       flex: 5,
//                                                       //       child: Text(
//                                                       //         productModel
//                                                       //             .description,
//                                                       //         maxLines: 1,
//                                                       //         overflow:
//                                                       //             TextOverflow
//                                                       //                 .ellipsis,
//                                                       //         style: TextStyle(
//                                                       //             color: Colors
//                                                       //                 .grey,
//                                                       //             fontSize:
//                                                       //                 MediaQuery.of(context).size.width >=
//                                                       //                         1100
//                                                       //                     ? 10
//                                                       //                     : 10),
//                                                       //       ),
//                                                       //     ),
//                                                       //     const Flexible(
//                                                       //         flex: 1,
//                                                       //         child: Text(''))
//                                                       //   ],
//                                                       // ),
//                                                       // const Gap(5),
//                                                       Row(
//                                                           mainAxisAlignment:
//                                                               MainAxisAlignment
//                                                                   .spaceBetween,
//                                                           children: [
//                                                             Flexible(
//                                                               flex: 6,
//                                                               child: Text(
//                                                                   '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
//                                                                   style: TextStyle(
//                                                                       fontSize: MediaQuery.of(context).size.width >=
//                                                                               1100
//                                                                           ? 13
//                                                                           : 12,
//                                                                       fontWeight:
//                                                                           FontWeight
//                                                                               .bold,
//                                                                       overflow:
//                                                                           TextOverflow
//                                                                               .ellipsis)),
//                                                             ),
//                                                             if (productModel
//                                                                     .percantageDiscount !=
//                                                                 0)
//                                                               Flexible(
//                                                                 flex: 6,
//                                                                 child: Text(
//                                                                     '$currencySymbol${Formatter().converter(productModel.unitOldPrice1 == 0 ? 0 : productModel.unitOldPrice1.toDouble())}',
//                                                                     style: TextStyle(
//                                                                         fontSize: MediaQuery.of(context).size.width >=
//                                                                                 1100
//                                                                             ? 13
//                                                                             : 12,
//                                                                         fontWeight:
//                                                                             FontWeight
//                                                                                 .bold,
//                                                                         overflow:
//                                                                             TextOverflow.ellipsis)),
//                                                               ),
//                                                           ])
//                                                     ],
//                                                   ),
//                                                 ),
//                                               ]),
//                                           productModel.percantageDiscount == 0
//                                               ? const SizedBox.shrink()
//                                               : Align(
//                                                   alignment: Alignment.topRight,
//                                                   child: Padding(
//                                                     padding:
//                                                         const EdgeInsets.only(
//                                                             top: 10, right: 10),
//                                                     child: Container(
//                                                       color:
//                                                           const Color.fromARGB(
//                                                               255, 47, 37, 37),
//                                                       width: 50,
//                                                       height: 20,
//                                                       child: Center(
//                                                         child: Text(
//                                                           '-${productModel.percantageDiscount}%',
//                                                           style:
//                                                               const TextStyle(
//                                                             fontSize: 13,
//                                                             color: Colors.white,
//                                                           ),
//                                                         ),
//                                                       ),
//                                                     ),
//                                                   ))
//                                         ],
//                                       ))),
//                             ),
//                           )),
//                     ],
//                   ),
//                 );
//               },
//             );
//           } else {
//             return SizedBox(
//               width: double.infinity,
//               child: Column(
//                 mainAxisSize: MainAxisSize.max,
//                 children: <Widget>[
//                   const Gap(15),
//                   Expanded(
//                     child: Shimmer.fromColors(
//                       baseColor: Colors.grey[300]!,
//                       highlightColor: Colors.grey[100]!,
//                       enabled: true,
//                       child: ListView.builder(
//                         shrinkWrap: true,
//                         scrollDirection: Axis.horizontal,
//                         itemBuilder: (_, __) => SizedBox(
//                             height: 270,
//                             width: 180,
//                             child: Padding(
//                               padding:
//                                   const EdgeInsets.only(left: 10, right: 10),
//                               child: Column(
//                                 children: [
//                                   Container(
//                                     height: MediaQuery.of(context).size.width >=
//                                             1100
//                                         ? 120
//                                         : MediaQuery.of(context).size.width >
//                                                     600 &&
//                                                 MediaQuery.of(context)
//                                                         .size
//                                                         .width <
//                                                     1200
//                                             ? 150
//                                             : 150,
//                                     decoration: const BoxDecoration(
//                                         borderRadius: BorderRadius.all(
//                                             Radius.circular(20)),
//                                         color: Colors.white),
//                                   ),
//                                   const SizedBox(height: 10),
//                                   Padding(
//                                     padding: const EdgeInsets.only(left: 10),
//                                     child: Container(
//                                         height: 10,
//                                         width: 100,
//                                         color: Colors.white),
//                                   ),
//                                   const SizedBox(height: 10),
//                                   Padding(
//                                     padding: const EdgeInsets.only(
//                                         left: 10, right: 10),
//                                     child: Row(
//                                       children: [
//                                         Flexible(
//                                           flex: 3,
//                                           child: Container(
//                                               height: 10,
//                                               width: 200,
//                                               color: Colors.white),
//                                         ),
//                                         const SizedBox(width: 10),
//                                         Flexible(
//                                           flex: 5,
//                                           child: Container(
//                                               height: 10,
//                                               width: 200,
//                                               color: Colors.white),
//                                         ),
//                                       ],
//                                     ),
//                                   ),
//                                 ],
//                               ),
//                             )),
//                         itemCount: 8,
//                       ),
//                     ),
//                   ),
//                 ],
//               ),
//             );
//           }
//         });
//   }
// }

// ignore_for_file: avoid_print, deprecated_member_use

// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:flutter_rating_bar/flutter_rating_bar.dart';
// import 'package:gap/gap.dart';
// import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
// import 'package:shimmer/shimmer.dart';
// import 'package:cached_network_image/cached_network_image.dart';

// import '../../Model/products.dart';
// import '../Model/formatter.dart';
// import '../Pages/product_detail.dart';
// import '../Providers/analytics.dart';

// class RecentlyPurchasedProducts extends StatefulWidget {
//   const RecentlyPurchasedProducts({super.key});

//   @override
//   State<RecentlyPurchasedProducts> createState() =>
//       _RecentlyPurchasedProductsState();
// }

// class _RecentlyPurchasedProductsState extends State<RecentlyPurchasedProducts> {
//   // --- BOUTIQUE THEME CONSTANTS ---
//   static const Color kGold = Color(0xFFC9A86A);

//   // 🔹 FIX: Initializing directly to prevent LateInitializationError
//   Future<List<ProductsModel>>? _recentProductsFuture;
//   String currencySymbol = '';

//   @override
//   void initState() {
//     super.initState();
//     _recentProductsFuture = getMyProducts();
//     getCurrencySymbol();
//   }

//   Future<List<ProductsModel>> getMyProducts() async {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     User? user = auth.currentUser;
//     if (user == null) return [];

//     try {
//       final snapshot = await FirebaseFirestore.instance
//           .collection('users')
//           .doc(user.uid)
//           .collection('Recent Purchased Products')
//           .limit(6)
//           .get();

//       return snapshot.docs
//           .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
//           .toList();
//     } catch (e) {
//       print("Error fetching recent products: $e");
//       return [];
//     }
//   }

//   void getCurrencySymbol() {
//     FirebaseFirestore.instance
//         .collection('Currency Settings')
//         .doc('Currency Settings')
//         .get()
//         .then((value) {
//       if (mounted && value.exists) {
//         setState(() {
//           currencySymbol = value['Currency symbol'] ?? "";
//         });
//       }
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return FutureBuilder<List<ProductsModel>>(
//         future: _recentProductsFuture,
//         builder: (context, snapshot) {
//           // 🔹 Handle Loading State
//           if (snapshot.connectionState == ConnectionState.waiting) {
//             return _buildShimmer(context);
//           }

//           // 🔹 Handle Empty/Error State
//           if (!snapshot.hasData || snapshot.data!.isEmpty) {
//             return const SizedBox.shrink();
//           }

//           // 🔹 Success UI
//           return SizedBox(
//             height: 220, // Boutique compact height
//             child: ListView.builder(
//               padding: const EdgeInsets.symmetric(horizontal: 14),
//               scrollDirection: Axis.horizontal,
//               physics: const BouncingScrollPhysics(),
//               itemCount: snapshot.data!.length,
//               itemBuilder: (context, index) {
//                 return _RecentProductCard(
//                   product: snapshot.data![index],
//                   currency: currencySymbol,
//                 );
//               },
//             ),
//           );
//         });
//   }

//   Widget _buildShimmer(BuildContext context) {
//     return Shimmer.fromColors(
//       baseColor: Colors.grey.shade900,
//       highlightColor: Colors.grey.shade800,
//       child: ListView.builder(
//         scrollDirection: Axis.horizontal,
//         padding: const EdgeInsets.symmetric(horizontal: 14),
//         itemCount: 4,
//         itemBuilder: (_, __) => Container(
//           width: 150,
//           margin: const EdgeInsets.only(right: 12),
//           decoration: BoxDecoration(
//             color: Colors.white10,
//             borderRadius: BorderRadius.circular(24),
//           ),
//         ),
//       ),
//     );
//   }
// }

// class _RecentProductCard extends StatelessWidget {
//   final ProductsModel product;
//   final String currency;

//   const _RecentProductCard({required this.product, required this.currency});

//   @override
//   Widget build(BuildContext context) {
//     final double rating = product.totalNumberOfUserRating == 0
//         ? 0
//         : (product.totalRating / product.totalNumberOfUserRating);

//     return InkWell(
//       onTap: () {
//         HapticFeedback.lightImpact();
//         Analytics().trackProductView(product.productID, product.name);
//         _openDetails(context);
//       },
//       child: Container(
//         width: 150,
//         margin: const EdgeInsets.only(right: 12, bottom: 8, top: 4),
//         padding: const EdgeInsets.all(12),
//         decoration: BoxDecoration(
//           color: Colors.white.withOpacity(0.04), // Glassmorphism
//           borderRadius: BorderRadius.circular(24),
//           border: Border.all(color: Colors.white.withOpacity(0.08)),
//         ),
//         child: Column(
//           children: [
//             // 🔹 BOUTIQUE CIRCULAR IMAGE
//             Stack(
//               children: [
//                 Container(
//                   height: 85,
//                   width: 85,
//                   decoration: BoxDecoration(
//                     shape: BoxShape.circle,
//                     border: Border.all(
//                         color: const Color(0xFFC9A86A).withOpacity(0.4),
//                         width: 1.5),
//                     boxShadow: [
//                       BoxShadow(
//                         color: Colors.black.withOpacity(0.5),
//                         blurRadius: 8,
//                         offset: const Offset(0, 4),
//                       )
//                     ],
//                   ),
//                   child: ClipRRect(
//                     borderRadius: BorderRadius.circular(100),
//                     child: CachedNetworkImage(
//                       imageUrl: product.image1,
//                       fit: BoxFit.cover,
//                       placeholder: (context, url) =>
//                           Container(color: Colors.white10),
//                       errorWidget: (context, url, error) =>
//                           const Icon(Icons.fastfood, color: Colors.white24),
//                     ),
//                   ),
//                 ),
//                 if (product.percantageDiscount > 0)
//                   Positioned(
//                     right: 0,
//                     top: 0,
//                     child: Container(
//                       padding: const EdgeInsets.symmetric(
//                           horizontal: 6, vertical: 2),
//                       decoration: BoxDecoration(
//                         color: const Color(0xFFC9A86A),
//                         borderRadius: BorderRadius.circular(6),
//                       ),
//                       child: Text(
//                         '-${product.percantageDiscount}%',
//                         style: const TextStyle(
//                             color: Colors.black,
//                             fontSize: 8,
//                             fontWeight: FontWeight.bold),
//                       ),
//                     ),
//                   ),
//               ],
//             ),
//             const Gap(10),
//             // 🔹 TEXT DETAILS
//             Text(
//               product.name.toUpperCase(),
//               maxLines: 1,
//               overflow: TextOverflow.ellipsis,
//               textAlign: TextAlign.center,
//               style: const TextStyle(
//                 color: Colors.white,
//                 fontSize: 11,
//                 fontWeight: FontWeight.bold,
//                 letterSpacing: 0.5,
//               ),
//             ),
//             const Gap(4),
//             if (rating > 0)
//               RatingBarIndicator(
//                 rating: rating,
//                 itemBuilder: (_, __) =>
//                     const Icon(Icons.star, color: Color(0xFFC9A86A)),
//                 itemCount: 5,
//                 itemSize: 10,
//               ),
//             const Spacer(),
//             // 🔹 PRICE
//             Text(
//               '$currency${Formatter().converter(product.unitPrice1.toDouble())}',
//               style: const TextStyle(
//                 color: Color(0xFFC9A86A),
//                 fontSize: 13,
//                 fontWeight: FontWeight.w900,
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   void _openDetails(BuildContext context) {
//     showMaterialModalBottomSheet(
//       bounce: true,
//       expand: true,
//       context: context,
//       backgroundColor: Colors.transparent,
//       builder: (context) => ProductDetailsPage(
//         currency: currency,
//         marketID: product.marketID,
//         productsModel: product,
//       ),
//     );
//   }
// }

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:gap/gap.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../Model/products.dart';
import '../Model/formatter.dart';
import '../Pages/product_detail.dart';
import '../Providers/analytics.dart';
import '../Providers/global_config.dart';

class RecentlyPurchasedProducts extends StatefulWidget {
  const RecentlyPurchasedProducts({super.key});

  @override
  State<RecentlyPurchasedProducts> createState() =>
      _RecentlyPurchasedProductsState();
}

class _RecentlyPurchasedProductsState extends State<RecentlyPurchasedProducts> {
  static const Color kGold = Color(0xFFC9A86A);

  Future<List<ProductsModel>>? _recentProductsFuture;
  String currencySymbol = '';

  @override
  void initState() {
    super.initState();
    _recentProductsFuture = getMyProducts();
    getCurrencySymbol();
  }

  Future<List<ProductsModel>> getMyProducts() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    User? user = auth.currentUser;
    if (user == null) return [];

    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('Recent Purchased Products')
          .limit(6)
          .get();

      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      print("Error fetching recent products: $e");
      return [];
    }
  }

  void getCurrencySymbol() {
    setState(() { currencySymbol = GlobalConfig.currencySymbol; });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ProductsModel>>(
        future: _recentProductsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildShimmer(context);
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const SizedBox.shrink();
          }

          return SizedBox(
            // 🔹 Linearity Fix: Height matches the compact ListTiles in reference
            height: 95,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                return _RecentProductCard(
                  product: snapshot.data![index],
                  currency: currencySymbol,
                );
              },
            ),
          );
        });
  }

  Widget _buildShimmer(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade900,
      highlightColor: Colors.grey.shade800,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: 4,
        itemBuilder: (_, __) => Container(
          width: 240,
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(
            color: Colors.white10,
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
    );
  }
}

class _RecentProductCard extends StatelessWidget {
  final ProductsModel product;
  final String currency;

  const _RecentProductCard({required this.product, required this.currency});

  @override
  Widget build(BuildContext context) {
    final double rating = product.totalNumberOfUserRating == 0
        ? 0
        : (product.totalRating / product.totalNumberOfUserRating);

    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        Analytics().trackProductView(product.productID, product.name);
        _openDetails(context);
      },
      child: Container(
        // 🔹 Width expanded to handle horizontal row content properly
        width: 220,
        margin: const EdgeInsets.only(right: 12, bottom: 8),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            // 🔹 Image Section (Matches reference size 85)
            Stack(
              children: [
                Container(
                  height: 65,
                  width: 65,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: const Color(0xFFC9A86A).withOpacity(0.2),
                        width: 3),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(100),
                    child: CachedNetworkImage(
                      imageUrl: product.image1,
                      fit: BoxFit.cover,
                      placeholder: (context, url) =>
                          Container(color: Colors.white10),
                      errorWidget: (context, url, error) =>
                          const Icon(Icons.fastfood, color: Colors.white24),
                    ),
                  ),
                ),
                if (product.percantageDiscount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFC9A86A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '-${product.percantageDiscount}%',
                        style: const TextStyle(
                            color: Colors.black,
                            fontSize: 7,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 10),
            // 🔹 Content Section (Spacing optimized to remove gaps)
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment:
                    MainAxisAlignment.spaceBetween, // 🔹 Pin price to bottom
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name.toUpperCase(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const Gap(2),
                      Text(
                        product.description.isEmpty
                            ? "Premium Selection"
                            : product.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.4),
                          fontSize: 10,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      if (rating > 0) ...[
                        const Gap(4),
                        Row(
                          children: [
                            RatingBarIndicator(
                              rating: rating,
                              itemBuilder: (_, __) => const Icon(Icons.star,
                                  color: Color(0xFFC9A86A)),
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
                      ],
                    ],
                  ),
                  // 🔹 Pricing Row (Tightened)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (product.percantageDiscount > 0)
                            Text(
                              '$currency${Formatter().converter(product.unitOldPrice1.toDouble())}',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.2),
                                fontSize: 9,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          Text(
                            '$currency${Formatter().converter(product.unitPrice1.toDouble())}',
                            style: const TextStyle(
                              color: Color(0xFFC9A86A),
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                      Icon(Icons.arrow_forward_ios_rounded,
                          color: Colors.white.withOpacity(0.1), size: 12),
                    ],
                  ),
                ],
              ),
            ),
          ],
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
        currency: currency,
        marketID: product.marketID,
        productsModel: product,
      ),
    );
  }
}
