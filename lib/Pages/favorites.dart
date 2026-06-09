// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables, avoid_types_as_parameter_names, use_build_context_synchronously, deprecated_member_use

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:easy_localization/easy_localization.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Pages/product_detail.dart';
import '../Providers/analytics.dart';
import '../Providers/global_config.dart';
import '../Widgets/premium_empty_state.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FavoritesPage extends StatefulWidget {
  final bool isbottomNav;
  const FavoritesPage({
    super.key,
    required this.isbottomNav,
  });

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> {
  DocumentReference? userRef;

  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop =
      Color.fromARGB(255, 45, 31, 28); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  String currencySymbol = '';
  String? currentMarketID;

  // UI State
  String searchQuery = "";
  String sortOption = 'popular';
  bool isGridView = false;

  @override
  void initState() {
    _getUserDoc();
    getCurrencySymbol();
    getselectedMarket();
    super.initState();
  }

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  Stream<List<ProductsModel>> getMyFavorite() {
    return userRef!.collection('Favorite').snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  getCurrencySymbol() {
    setState(() {
      currencySymbol = GlobalConfig.currencySymbol;
    });
  }

  getselectedMarket() {
    if (userRef != null) {
      userRef!.snapshots().listen((value) {
        setState(() {
          currentMarketID = value['CurrentMarketID'];
        });
      });
    }
  }

  // ----------------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
        automaticallyImplyLeading: !widget.isbottomNav,
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text(
          "Favorites",
          style: TextStyle(
              color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
        ).tr(),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: StreamBuilder<List<ProductsModel>>(
            stream: getMyFavorite(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return Center(child: SpinKitCircle(color: kGold));
              }

              List<ProductsModel> items = List.of(snapshot.data!);

              // 🔍 SEARCH FILTER
              if (searchQuery.isNotEmpty) {
                items = items
                    .where((p) => p.name
                        .toLowerCase()
                        .contains(searchQuery.toLowerCase()))
                    .toList();
              }

              // 🔧 SORT
              _sortItems(items);

              final total = items.length;

              return SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(18, 14, 18, 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSummaryCard(total),

                    SizedBox(height: 22),

                    // 🔍 SEARCH + SORT + GRID (ONE ROW)
                    Row(
                      children: [
                        // SEARCH BAR
                        Expanded(
                          child: Container(
                            height: 42,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.07),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            padding: EdgeInsets.symmetric(horizontal: 12),
                            child: TextField(
                              onChanged: (value) =>
                                  setState(() => searchQuery = value.trim()),
                              style:
                                  TextStyle(color: Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                border: InputBorder.none,
                                hintText: "Search...",
                                hintStyle: TextStyle(
                                    color: Colors.white38, fontSize: 13),
                              ),
                            ),
                          ),
                        ),

                        SizedBox(width: 10),

                        // SORT
                        IconButton(
                          icon: Icon(Icons.swap_vert_rounded,
                              color: Colors.white70),
                          tooltip: "Sort",
                          onPressed: _showSortSheet,
                        ),

                        // VIEW TOGGLE
                        IconButton(
                          icon: Icon(
                            isGridView
                                ? Icons.view_list_rounded
                                : Icons.grid_view_rounded,
                            color: Colors.white70,
                          ),
                          onPressed: () =>
                              setState(() => isGridView = !isGridView),
                        ),
                      ],
                    ),

                    SizedBox(height: 20),

                    // EMPTY STATE
                    if (items.isEmpty)
                      Center(
                      child: const PremiumEmptyState(
                        icon: Icons.favorite_border_rounded,
                        title: 'No Favorites',
                        subtitle: 'You have not added any items to your wishlist yet.',
                      ),
                    )
                    else
                      isGridView
                          ? _buildGridView(items)
                          : _buildListView(items),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  // ----------------------------------------------------------------------
  // SUMMARY CARD
  // ----------------------------------------------------------------------

  Widget _buildSummaryCard(int total) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 22,
            offset: Offset(0, 10),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Favorite Items",
            style: TextStyle(
              color: kGold,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 12),
          Text(
            "$total products saved",
            style: TextStyle(
              color: Colors.white,
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 8),
          Text(
            "Curated for your taste.",
            style: TextStyle(
              color: Colors.white54,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------------------------
  // LIST VIEW
  // ----------------------------------------------------------------------

  Widget _buildListView(List<ProductsModel> items) {
    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, i) {
        final product = items[i];
        return _buildDismissibleWrapper(
          product,
          child: _buildFavoriteCard(product),
        );
      },
    );
  }

  // ----------------------------------------------------------------------
  // GRID VIEW (FIXED OVERFLOW)
  // ----------------------------------------------------------------------

  Widget _buildGridView(List<ProductsModel> items) {
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: items.length,
      padding: EdgeInsets.only(bottom: 20),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 14,
        childAspectRatio: 0.68, // FIX FOR OVERFLOW
      ),
      itemBuilder: (context, i) {
        final product = items[i];
        return _buildDismissibleWrapper(
          product,
          child: _buildFavoriteCard(product, compact: true),
        );
      },
    );
  }

  // ----------------------------------------------------------------------
  // SORTING LOGIC
  // ----------------------------------------------------------------------

  void _sortItems(List<ProductsModel> items) {
    switch (sortOption) {
      case 'priceLow':
        items.sort((a, b) =>
            a.unitPrice1.toDouble().compareTo(b.unitPrice1.toDouble()));
        break;
      case 'priceHigh':
        items.sort((a, b) =>
            b.unitPrice1.toDouble().compareTo(a.unitPrice1.toDouble()));
        break;
      case 'ratingHigh':
        items.sort((a, b) {
          final ar = a.totalRating == 0
              ? 0.0
              : a.totalRating / a.totalNumberOfUserRating;
          final br = b.totalRating == 0
              ? 0.0
              : b.totalRating / b.totalNumberOfUserRating;
          return br.compareTo(ar);
        });
        break;
      case 'popular':
      default:
        items.sort((a, b) =>
            b.totalNumberOfUserRating.compareTo(a.totalNumberOfUserRating));
        break;
    }
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: kPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (_) {
        return Padding(
          padding: EdgeInsets.fromLTRB(18, 16, 18, 26),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              Text(
                "Sort favorites",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 10),
              _sortTile("Most Popular", "popular"),
              _sortTile("Price: Low to High", "priceLow"),
              _sortTile("Price: High to Low", "priceHigh"),
              _sortTile("Highest Rated", "ratingHigh"),
            ],
          ),
        );
      },
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
      title: Text(label, style: TextStyle(color: Colors.white)),
    );
  }

  // ----------------------------------------------------------------------
  // SWIPE-REMOVE WRAPPER
  // ----------------------------------------------------------------------

  Widget _buildDismissibleWrapper(ProductsModel product,
      {required Widget child}) {
    return Dismissible(
      key: ValueKey(product.productID),
      direction: DismissDirection.endToStart,
      background: Container(
        margin: EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.9),
          borderRadius: BorderRadius.circular(18),
        ),
        alignment: Alignment.centerRight,
        padding: EdgeInsets.only(right: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Icon(Icons.favorite_border, color: Colors.white),
            SizedBox(width: 6),
            Text(
              "Remove",
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
      onDismissed: (_) async {
        await userRef!.collection('Favorite').doc(product.productID).delete();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Removed from favorites"),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Colors.black87,
          ),
        );
      },
      child: child,
    );
  }

  // ----------------------------------------------------------------------
  // CARD UI (LIST + GRID)
  // ----------------------------------------------------------------------

  Widget _buildFavoriteCard(ProductsModel productModel,
      {bool compact = false}) {
    return InkWell(
      onTap: () {
        Analytics().trackProductView(productModel.productID, productModel.name);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailsPage(
              currency: currencySymbol,
              marketID: productModel.marketID,
              productsModel: productModel,
            ),
          ),
        );
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: 220),
        margin: compact ? EdgeInsets.zero : EdgeInsets.only(bottom: 16),
        padding: EdgeInsets.all(compact ? 8 : 12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.25),
              blurRadius: 18,
              offset: Offset(0, 6),
            )
          ],
        ),
        child: compact
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // IMAGE
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(
                      productModel.image1,
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    productModel.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    "Timeless choice.",
                    style: TextStyle(
                      color: kGold.withOpacity(0.9),
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 10),

                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      "$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: kGold,
                      ),
                    ),
                  ),
                ],
              )
            : Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(
                      productModel.image1,
                      height: 72,
                      width: 72,
                      fit: BoxFit.cover,
                    ),
                  ),
                  SizedBox(width: 14),

                  // TEXT DETAILS
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          productModel.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          "Timeless choice.",
                          style: TextStyle(
                            color: kGold.withOpacity(0.9),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 10),
                        Row(
                          children: [
                            RatingBarIndicator(
                              rating: productModel.totalRating == 0
                                  ? 0
                                  : productModel.totalRating /
                                      productModel.totalNumberOfUserRating,
                              itemBuilder: (context, index) =>
                                  Icon(Icons.star, color: kGold),
                              itemCount: 5,
                              itemSize: 14,
                            ),
                            SizedBox(width: 8),
                            Text(
                              "(${productModel.totalNumberOfUserRating})",
                              style: TextStyle(
                                  fontSize: 12, color: Colors.white38),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        "$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: kGold,
                        ),
                      ),
                      if (productModel.percantageDiscount > 0)
                        Text(
                          "$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}",
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white38,
                            decoration: TextDecoration.lineThrough,
                          ),
                        )
                    ],
                  ),
                ],
              ),
      ),
    );
  }
}
