// ignore_for_file: avoid_print, deprecated_member_use
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:falguni_app/Pages/products_by_categories.dart';
import 'package:cached_network_image/cached_network_image.dart'; // Added this
import 'dart:ui';
import '../Model/categories.dart';

class CategoriesPage extends StatefulWidget {
  const CategoriesPage({super.key});

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  String _searchQuery = "";
  final TextEditingController _searchController = TextEditingController();

  // Optimization: Store the future to prevent re-fetching on rebuilds
  late Future<List<CategoriesModel>> _categoriesFuture;

  @override
  void initState() {
    super.initState();
    _categoriesFuture = getCategories();
  }

  Future<List<CategoriesModel>> getCategories() {
    return FirebaseFirestore.instance.collection('Categories').get().then(
        (event) => event.docs
            .map((e) => CategoriesModel.fromMap(e.data(), e.id))
            .toList());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        backgroundColor: Colors.black.withOpacity(0.2),
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          'CATEGORIES'.tr(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                child: Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.12)),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) =>
                        setState(() => _searchQuery = value.toLowerCase()),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: "Search categories...".tr(),
                      hintStyle: const TextStyle(color: Colors.white30),
                      prefixIcon: const Icon(Icons.search_rounded,
                          color: kGold, size: 22),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: FutureBuilder<List<CategoriesModel>>(
                  future: _categoriesFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(
                          child: SpinKitFadingCube(color: kGold, size: 35));
                    }

                    final items = snapshot.data
                            ?.where((cat) => cat.category
                                .toLowerCase()
                                .contains(_searchQuery))
                            .toList() ??
                        [];

                    return AnimationLimiter(
                      child: AlignedGridView.count(
                        padding: const EdgeInsets.fromLTRB(14, 10, 14, 40),
                        physics: const BouncingScrollPhysics(),
                        crossAxisCount:
                            MediaQuery.of(context).size.width >= 1100 ? 6 : 3,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        itemCount: items.length,
                        itemBuilder: (context, index) {
                          // Performance: Using a dedicated Stateless widget for each tile
                          return CategoryTile(model: items[index]);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// 🔹 Optimized Tile Component with KeepAlive and Local Caching
class CategoryTile extends StatefulWidget {
  final CategoriesModel model;
  const CategoryTile({super.key, required this.model});

  @override
  State<CategoryTile> createState() => _CategoryTileState();
}

class _CategoryTileState extends State<CategoryTile>
    with AutomaticKeepAliveClientMixin {
  // This prevents the tile from being disposed when scrolled off-screen
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAlive

    return AnimationConfiguration.staggeredGrid(
      position: 0,
      duration: const Duration(milliseconds: 450),
      columnCount: 3,
      child: ScaleAnimation(
        scale: 0.9,
        child: FadeInAnimation(
          child: InkWell(
            onTap: () {
              HapticFeedback.lightImpact();
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) =>
                      ProductsByCategories(collection: widget.model.category),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                            color: const Color(0xFFC9A86A).withOpacity(0.15),
                            blurRadius: 12,
                            spreadRadius: 2)
                      ],
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: const Color(0xFFC9A86A).withOpacity(0.4),
                            width: 1.5),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(50),
                        child: CachedNetworkImage(
                          imageUrl: widget.model.image,
                          width: 52,
                          height: 52,
                          fit: BoxFit.cover,
                          // Memory Optimization: Decode at display size
                          memCacheWidth: 150,
                          memCacheHeight: 150,
                          placeholder: (context, url) => Container(
                            color: Colors.white10,
                            child: const SpinKitPulse(
                                color: Color(0xFFC9A86A), size: 20),
                          ),
                          errorWidget: (context, url, error) => const Icon(
                              Icons.error_outline,
                              color: Colors.white24,
                              size: 20),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.model.category.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
