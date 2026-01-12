// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_rating_bar/flutter_rating_bar.dart';
// import 'package:flutter_spinkit/flutter_spinkit.dart';
// import 'package:easy_localization/easy_localization.dart';
// import '../Model/formatter.dart';
// import '../Model/products.dart';
// import '../Pages/product_detail.dart';
// import '../Providers/analytics.dart';

// class SearchProductPage extends StatefulWidget {
//   final String? marketID;
//   final String? category;
//   const SearchProductPage(
//       {super.key, required this.marketID, required this.category});

//   @override
//   State<SearchProductPage> createState() => _SearchProductPageState();
// }

// class _SearchProductPageState extends State<SearchProductPage> {
//   final _searchController = TextEditingController();
//   String currencySymbol = '';
//   Future<List<ProductsModel>> getMyProducts() {
//     return FirebaseFirestore.instance
//         .collection('Products')
//         .where('category', isEqualTo: widget.category)
//         .get()
//         .then((snapshot) {
//       return snapshot.docs
//           .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
//           .toList();
//     });
//   }

//   Future<List<ProductsModel>> getAllProducts() {
//     return FirebaseFirestore.instance
//         .collection('Products')
//         .get()
//         .then((snapshot) {
//       return snapshot.docs
//           .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
//           .toList();
//     });
//   }

//   Future<List<ProductsModel>> getByCategoryProducts() {
//     return FirebaseFirestore.instance
//         .collection('Products')
//         .where('category', isEqualTo: widget.category)
//         .get()
//         .then((snapshot) {
//       return snapshot.docs
//           .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
//           .toList();
//     });
//   }

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
//     super.initState();
//     getCurrencySymbol();
//   }

//   String displayName = '';
//   getList(int itemList) {
//     if (displayName == '') {
//       return 0;
//     } else {
//       return itemList;
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: CustomScrollView(
//         slivers: [
//           SliverAppBar(
//             actions: const [],
//             automaticallyImplyLeading: false,
//             backgroundColor: Colors.white12,
//             expandedHeight: 200,
//             flexibleSpace: FlexibleSpaceBar(
//               collapseMode: CollapseMode.pin,
//               centerTitle: true,
//               background: Center(
//                 child: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   crossAxisAlignment: CrossAxisAlignment.center,
//                   children: [
//                     const SizedBox(
//                       height: 50,
//                     ),
//                     Row(
//                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                       children: [
//                         Column(
//                           children: [
//                             Padding(
//                               padding: const EdgeInsets.fromLTRB(5, 0, 97, 0),
//                               child: const Text(
//                                 'search',
//                                 style: TextStyle(
//                                     fontSize: 20, fontWeight: FontWeight.bold),
//                                 textAlign: TextAlign.start,
//                               ).tr(),
//                             ),
//                             Padding(
//                               padding: const EdgeInsets.all(8.0),
//                               child:
//                                   const Text('ordered by market Products').tr(),
//                             ),
//                           ],
//                         ),
//                         Padding(
//                           padding: const EdgeInsets.only(right: 30),
//                           child: InkWell(
//                             onTap: () {
//                               Navigator.of(context).pop();
//                             },
//                             child: const Icon(
//                               Icons.close,
//                               size: 30,
//                             ),
//                           ),
//                         )
//                       ],
//                     ),
//                     const SizedBox(height: 30),
//                     Padding(
//                       padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
//                       child: SizedBox(
//                         height: 50,
//                         width: MediaQuery.of(context).size.width / 1,
//                         child: TextField(
//                             onChanged: (value) {
//                               setState(() {
//                                 displayName = value.toLowerCase();
//                               });
//                             },
//                             controller: _searchController,
//                             autofocus: true,
//                             style: const TextStyle(color: Colors.grey),
//                             decoration: InputDecoration(
//                               focusColor: Colors.grey,
//                               hintText: 'search for market products'.tr(),
//                               hintStyle: const TextStyle(color: Colors.grey),
//                               prefixIcon: Icon(
//                                 Icons.search,
//                                 size: 30,
//                                 color: Colors.blue.shade800,
//                               ),
//                               filled: true,
//                               fillColor: Colors.white10,
//                               focusedBorder: OutlineInputBorder(
//                                 borderRadius: BorderRadius.circular(10),
//                                 borderSide: const BorderSide(
//                                     color: Colors.grey, width: 1.0),
//                               ),
//                               enabledBorder: OutlineInputBorder(
//                                 borderRadius: BorderRadius.circular(8),
//                                 borderSide: const BorderSide(
//                                     color: Colors.grey, width: 1.0),
//                               ),
//                             )),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//           SliverFillRemaining(
//               child: ListView(
//             shrinkWrap: true,
//             scrollDirection: Axis.vertical,
//             physics: const BouncingScrollPhysics(),
//             children: [
//               const SizedBox(height: 10),
//               Padding(
//                 padding: const EdgeInsets.all(8.0),
//                 child: const Text(
//                   'Search Results',
//                   style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
//                   textAlign: TextAlign.start,
//                 ).tr(),
//               ),
//               displayName == ''
//                   ? Container()
//                   : FutureBuilder<List<ProductsModel>>(
//                       future: widget.marketID == '' && widget.category == ''
//                           ? getAllProducts()
//                           : widget.category != '' && widget.marketID == ''
//                               ? getByCategoryProducts()
//                               : widget.category != '' && widget.marketID != ''
//                                   ? getMyProducts()
//                                   : getAllProducts(),
//                       builder: (context, snapshot) {
//                         if (snapshot.hasError) {
//                           return const Column(
//                             children: [
//                               SizedBox(height: 10),
//                               Text('Something went wrong'),
//                             ],
//                           );
//                         } else if (snapshot.hasData) {
//                           return ListView.builder(
//                               itemCount: snapshot.data!.length,
//                               physics: const BouncingScrollPhysics(),
//                               shrinkWrap: true,
//                               itemBuilder:
//                                   (BuildContext buildContext, int index) {
//                                 ProductsModel productModel =
//                                     snapshot.data![index];
//                                 return productModel.name
//                                         .toLowerCase()
//                                         .contains(displayName)
//                                     ? Padding(
//                                         padding: const EdgeInsets.all(8.0),
//                                         child: InkWell(
//                                           onTap: () {
//                                             Analytics().trackProductView(
//                                                 productModel.productID,
//                                                 productModel.name);
//                                             Navigator.of(context).push(
//                                                 MaterialPageRoute(
//                                                     builder: (context) =>
//                                                         ProductDetailsPage(
//                                                           currency:
//                                                               currencySymbol,
//                                                           marketID: productModel
//                                                               .marketID,
//                                                           productsModel:
//                                                               productModel,
//                                                         )));
//                                           },
//                                           child: SizedBox(
//                                               height: 140,
//                                               width: double.infinity,
//                                               child: Card(
//                                                   elevation: 0,
//                                                   shape: RoundedRectangleBorder(
//                                                     borderRadius:
//                                                         BorderRadius.circular(
//                                                             15.0),
//                                                   ),
//                                                   child: Column(children: [
//                                                     Padding(
//                                                       padding:
//                                                           const EdgeInsets.all(
//                                                               8.0),
//                                                       child: Row(
//                                                         mainAxisAlignment:
//                                                             MainAxisAlignment
//                                                                 .spaceBetween,
//                                                         children: [
//                                                           Image.network(
//                                                             productModel.image1,
//                                                             height: 100,
//                                                             width: 100,
//                                                             fit: BoxFit.cover,
//                                                           ),
//                                                           Column(
//                                                             mainAxisAlignment:
//                                                                 MainAxisAlignment
//                                                                     .spaceBetween,
//                                                             children: [
//                                                               SizedBox(
//                                                                 width: MediaQuery.of(
//                                                                             context)
//                                                                         .size
//                                                                         .width /
//                                                                     2,
//                                                                 child: Text(
//                                                                     productModel
//                                                                         .name,
//                                                                     maxLines: 2,
//                                                                     textAlign:
//                                                                         TextAlign
//                                                                             .center,
//                                                                     overflow:
//                                                                         TextOverflow
//                                                                             .ellipsis,
//                                                                     style: const TextStyle(
//                                                                         fontSize:
//                                                                             15,
//                                                                         fontWeight:
//                                                                             FontWeight.bold)),
//                                                               ),
//                                                               SizedBox(
//                                                                   width: MediaQuery.of(
//                                                                               context)
//                                                                           .size
//                                                                           .width /
//                                                                       2,
//                                                                   child: Text(
//                                                                     productModel
//                                                                         .description,
//                                                                     maxLines: 2,
//                                                                     overflow:
//                                                                         TextOverflow
//                                                                             .ellipsis,
//                                                                     textAlign:
//                                                                         TextAlign
//                                                                             .center,
//                                                                   )),
//                                                               Row(
//                                                                   mainAxisAlignment:
//                                                                       MainAxisAlignment
//                                                                           .spaceBetween,
//                                                                   children: [
//                                                                     Text(
//                                                                         '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
//                                                                         style: const TextStyle(
//                                                                             fontSize:
//                                                                                 18,
//                                                                             fontWeight:
//                                                                                 FontWeight.bold)),
//                                                                     const SizedBox(
//                                                                         width:
//                                                                             20),
//                                                                     if (productModel
//                                                                             .percantageDiscount !=
//                                                                         0)
//                                                                       Text(
//                                                                           '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
//                                                                           style: const TextStyle(
//                                                                               color: Colors.grey,
//                                                                               fontSize: 18,
//                                                                               decoration: TextDecoration.lineThrough,
//                                                                               fontWeight: FontWeight.bold)),
//                                                                   ]),
//                                                               Center(
//                                                                 child: Row(
//                                                                   mainAxisAlignment:
//                                                                       MainAxisAlignment
//                                                                           .center,
//                                                                   children: [
//                                                                     RatingBarIndicator(
//                                                                       rating: productModel.totalRating ==
//                                                                               0
//                                                                           ? 0
//                                                                           : productModel.totalRating /
//                                                                               productModel.totalNumberOfUserRating,
//                                                                       itemBuilder:
//                                                                           (context, index) =>
//                                                                               const Icon(
//                                                                         Icons
//                                                                             .star,
//                                                                         color: Color.fromARGB(
//                                                                             255,
//                                                                             47,
//                                                                             37,
//                                                                             37),
//                                                                       ),
//                                                                       itemCount:
//                                                                           5,
//                                                                       itemSize:
//                                                                           12,
//                                                                       direction:
//                                                                           Axis.horizontal,
//                                                                     ),
//                                                                     const SizedBox(
//                                                                         width:
//                                                                             5),
//                                                                     Text(
//                                                                         '(${productModel.totalNumberOfUserRating.toString()})',
//                                                                         style: const TextStyle(
//                                                                             fontSize:
//                                                                                 12,
//                                                                             color:
//                                                                                 Colors.grey)),
//                                                                   ],
//                                                                 ),
//                                                               ),
//                                                             ],
//                                                           )
//                                                         ],
//                                                       ),
//                                                     ),
//                                                   ]))),
//                                         ),
//                                       )
//                                     : Container();
//                               });
//                         } else {
//                           return const Center(
//                               child: SpinKitCircle(
//                                   color: Color.fromARGB(255, 47, 37, 37)));
//                         }
//                       })
//             ],
//           ))
//         ],
//       ),
//     );
//   }
// }

// ignore_for_file: curly_braces_in_flow_control_structures

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:gap/gap.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Pages/product_detail.dart';
import '../Providers/analytics.dart';

class SearchProductPage extends StatefulWidget {
  final String? marketID;
  final String? category;
  const SearchProductPage(
      {super.key, required this.marketID, required this.category});

  @override
  State<SearchProductPage> createState() => _SearchProductPageState();
}

class _SearchProductPageState extends State<SearchProductPage> {
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  final _searchController = TextEditingController();
  String currencySymbol = '';
  String displayName = '';
  String sortOption = 'relevance';

  List<String> recentSearches = ["Khakhra", "Mathiya", "Traditional", "Snacks"];

  @override
  void initState() {
    super.initState();
    getCurrencySymbol();
  }

  void getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      if (mounted)
        setState(() => currencySymbol = value['Currency symbol'] ?? "");
    });
  }

  // --- LOGIC PRESERVED ---
  Future<List<ProductsModel>> getMyProducts() => FirebaseFirestore.instance
      .collection('Products')
      .where('category', isEqualTo: widget.category)
      .get()
      .then((s) =>
          s.docs.map((d) => ProductsModel.fromMap(d.data(), d.id)).toList());
  Future<List<ProductsModel>> getAllProducts() =>
      FirebaseFirestore.instance.collection('Products').get().then((s) =>
          s.docs.map((d) => ProductsModel.fromMap(d.data(), d.id)).toList());
  Future<List<ProductsModel>> getByCategoryProducts() => FirebaseFirestore
      .instance
      .collection('Products')
      .where('category', isEqualTo: widget.category)
      .get()
      .then((s) =>
          s.docs.map((d) => ProductsModel.fromMap(d.data(), d.id)).toList());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            _buildEliteHeader(),
            _buildSearchAndSortBar(),
            _buildContentArea(),
          ],
        ),
      ),
    );
  }

  Widget _buildEliteHeader() {
    return SliverAppBar(
      automaticallyImplyLeading: false,
      backgroundColor: Colors.transparent,
      // 🔹 REDUCED HEIGHT to remove excess space
      expandedHeight: 120,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            // 🔹 Shifted to END to sit closer to the search bar
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('search'.tr().toUpperCase(),
                          style: const TextStyle(
                              color: kGold,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 3)),
                      const Gap(2),
                      Text('Discover'.tr(),
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w900)),
                    ],
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.05)),
                      child: const Icon(Icons.close_rounded,
                          color: Colors.white, size: 22),
                    ),
                  )
                ],
              ),
              const Gap(10), // Tightened gap
              _buildSummaryIndicator(),
              const Gap(10), // Reduced space before search bar
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryIndicator() {
    return Text(
      widget.category?.isNotEmpty == true
          ? "Exploring ${widget.category}"
          : "Searching all markets",
      style: TextStyle(
          color: kGold.withOpacity(0.6),
          fontSize: 11,
          fontWeight: FontWeight.w500),
    );
  }

  Widget _buildSearchAndSortBar() {
    return SliverToBoxAdapter(
      child: Padding(
        padding:
            const EdgeInsets.fromLTRB(18, 5, 18, 15), // Reduced top padding
        child: Row(
          children: [
            Expanded(
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: _searchController,
                  autofocus: true,
                  onChanged: (value) =>
                      setState(() => displayName = value.toLowerCase().trim()),
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  cursorColor: kGold,
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: "What are you looking for?".tr(),
                    hintStyle:
                        const TextStyle(color: Colors.white24, fontSize: 13),
                    icon: const Icon(Icons.search_rounded,
                        color: kGold, size: 20),
                    // 🔹 Added CLEAR BUTTON
                    suffixIcon: displayName.isNotEmpty
                        ? GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              setState(() => displayName = "");
                            },
                            child: const Icon(Icons.cancel_rounded,
                                color: Colors.white24, size: 18),
                          )
                        : null,
                  ),
                ),
              ),
            ),
            const Gap(12),
            _buildCircleIconButton(Icons.tune_rounded, _showSortSheet),
          ],
        ),
      ),
    );
  }

  Widget _buildCircleIconButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        width: 48,
        decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05), shape: BoxShape.circle),
        child: Icon(icon, color: Colors.white70, size: 20),
      ),
    );
  }

  Widget _buildContentArea() {
    if (displayName.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Gap(10), // Tightened
              const Text("RECENT SEARCHES",
                  style: TextStyle(
                      color: Colors.white24,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5)),
              const Gap(12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children:
                    recentSearches.map((s) => _buildRecentChip(s)).toList(),
              ),
            ],
          ),
        ),
      );
    }
    return _buildResultsStream();
  }

  Widget _buildRecentChip(String text) {
    return GestureDetector(
      onTap: () {
        _searchController.text = text;
        setState(() => displayName = text.toLowerCase());
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Text(text,
            style: const TextStyle(color: Colors.white60, fontSize: 12)),
      ),
    );
  }

  // ... (Rest of the _buildResultsStream, _buildEliteSearchTile, _applySorting, etc. remain the same as previous)

  Widget _buildResultsStream() {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      sliver: FutureBuilder<List<ProductsModel>>(
        future: widget.marketID == '' && widget.category == ''
            ? getAllProducts()
            : widget.category != '' && widget.marketID == ''
                ? getByCategoryProducts()
                : widget.category != '' && widget.marketID != ''
                    ? getMyProducts()
                    : getAllProducts(),
        builder: (context, snapshot) {
          if (!snapshot.hasData)
            return const SliverFillRemaining(
                child: Center(child: SpinKitCircle(color: kGold, size: 40)));

          List<ProductsModel> results = snapshot.data!
              .where((p) => p.name.toLowerCase().contains(displayName))
              .toList();
          _applySorting(results);

          if (results.isEmpty)
            return const SliverFillRemaining(
                child: Center(
                    child: Text("No items found",
                        style: TextStyle(color: Colors.white24))));

          return SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => _buildEliteSearchTile(results[index]),
              childCount: results.length,
            ),
          );
        },
      ),
    );
  }

  Widget _buildEliteSearchTile(ProductsModel p) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          HapticFeedback.lightImpact();
          Analytics().trackProductView(p.productID, p.name);
          Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => ProductDetailsPage(
                      currency: currencySymbol,
                      marketID: p.marketID,
                      productsModel: p)));
        },
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(20)),
          child: Row(
            children: [
              ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: CachedNetworkImage(
                      imageUrl: p.image1,
                      height: 75,
                      width: 75,
                      fit: BoxFit.cover)),
              const Gap(14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.name,
                        maxLines: 1,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white)),
                    const Gap(4),
                    Text(p.description,
                        maxLines: 1,
                        style: const TextStyle(
                            color: Colors.white24, fontSize: 11)),
                    const Gap(8),
                    _buildRatingRow(p),
                  ],
                ),
              ),
              _buildPriceColumn(p),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriceColumn(ProductsModel p) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text("$currencySymbol${Formatter().converter(p.unitPrice1.toDouble())}",
            style: const TextStyle(
                fontSize: 14, fontWeight: FontWeight.w900, color: kGold)),
        if (p.percantageDiscount > 0)
          Text("-$p.percantageDiscount%",
              style: const TextStyle(
                  fontSize: 10,
                  color: Colors.redAccent,
                  fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildRatingRow(ProductsModel p) {
    final rating =
        p.totalRating == 0 ? 0.0 : p.totalRating / p.totalNumberOfUserRating;
    return Row(
      children: [
        RatingBarIndicator(
          rating: rating,
          itemBuilder: (context, index) =>
              const Icon(Icons.star_rounded, color: kGold),
          itemCount: 5,
          itemSize: 12,
        ),
        const Gap(5),
        // ignore: unnecessary_string_interpolations
        Text("${rating.toStringAsFixed(1)}",
            style: const TextStyle(color: Colors.white24, fontSize: 10)),
      ],
    );
  }

  void _applySorting(List<ProductsModel> items) {
    if (sortOption == 'priceLow')
      items.sort((a, b) => a.unitPrice1.compareTo(b.unitPrice1));
    else if (sortOption == 'priceHigh')
      items.sort((a, b) => b.unitPrice1.compareTo(a.unitPrice1));
    else if (sortOption == 'ratingHigh')
      items.sort((a, b) => (b.totalRating /
              (b.totalNumberOfUserRating == 0 ? 1 : b.totalNumberOfUserRating))
          .compareTo(a.totalRating /
              (a.totalNumberOfUserRating == 0
                  ? 1
                  : a.totalNumberOfUserRating)));
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: kBgMid,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 26),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
                child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(10)))),
            const Gap(15),
            const Text("Sort Results",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700)),
            _sortTile("Relevance", "relevance"),
            _sortTile("Price: Low to High", "priceLow"),
            _sortTile("Price: High to Low", "priceHigh"),
            _sortTile("Highest Rated", "ratingHigh"),
          ],
        ),
      ),
    );
  }

  Widget _sortTile(String label, String value) {
    return RadioListTile<String>(
      value: value,
      groupValue: sortOption,
      activeColor: kGold,
      onChanged: (val) {
        Navigator.pop(context);
        setState(() => sortOption = val!);
      },
      title: Text(label,
          style: const TextStyle(color: Colors.white, fontSize: 14)),
    );
  }
}
