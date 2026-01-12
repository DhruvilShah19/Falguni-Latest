// // ignore_for_file: avoid_print

// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
// import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
// import 'package:shimmer/shimmer.dart';

// import '../Model/categories.dart';
// import '../Pages/products_by_categories.dart';

// class CategoriesIntro extends StatefulWidget {
//   const CategoriesIntro({super.key});

//   @override
//   State<CategoriesIntro> createState() => _CategoriesIntroState();
// }

// class _CategoriesIntroState extends State<CategoriesIntro> {
//   Future<List<CategoriesModel>> getCategories() {
//     return FirebaseFirestore.instance
//         .collection('Categories')
//         .limit(16)
//         .get()
//         .then((event) => event.docs
//             .map((e) => CategoriesModel.fromMap(e.data(), e.id))
//             .toList());
//   }

//   final CarouselController controller = CarouselController();

//   @override
//   Widget build(BuildContext context) {
//     return FutureBuilder<List<CategoriesModel>>(
//         future: getCategories(),
//         builder: (context, snapshot) {
//           if (snapshot.data?.isEmpty ?? true) {
//             return SizedBox(
//               width: double.infinity,
//               child: Column(
//                 mainAxisSize: MainAxisSize.max,
//                 children: <Widget>[
//                   Expanded(
//                     child: Shimmer.fromColors(
//                       baseColor: Colors.grey.shade300,
//                       highlightColor: Colors.grey.shade100,
//                       enabled: true,
//                       child: GridView.builder(
//                         padding: const EdgeInsets.only(bottom: 20),
//                         physics: const NeverScrollableScrollPhysics(),
//                         itemCount:
//                             MediaQuery.of(context).size.width >= 1100 ? 10 : 10,
//                         gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
//                           crossAxisCount: MediaQuery.of(context).size.width >=
//                                   1100
//                               ? 3
//                               : MediaQuery.of(context).size.width > 600 &&
//                                       MediaQuery.of(context).size.width < 1200
//                                   ? 3
//                                   : 3,
//                           mainAxisSpacing:
//                               16, // Added spacing between grid items
//                           crossAxisSpacing: 16,
//                         ),
//                         itemBuilder: (BuildContext buildContext, int index) {
//                           return SizedBox(
//                             width: 100,
//                             height: 80,
//                             child: Padding(
//                               padding:
//                                   const EdgeInsets.symmetric(horizontal: 10),
//                               child: Column(
//                                 children: [
//                                   Card(
//                                     elevation:
//                                         2, // Added slight elevation for card effect
//                                     shape: RoundedRectangleBorder(
//                                       borderRadius: BorderRadius.circular(
//                                           16), // Rounded corners
//                                     ),
//                                     child: Container(
//                                       decoration: BoxDecoration(
//                                         color: Colors.grey
//                                             .shade200, // Soft background color
//                                         borderRadius: BorderRadius.circular(16),
//                                       ),
//                                       width:
//                                           60, // Adjusted width for better proportion
//                                       height:
//                                           60, // Adjusted height for better proportion
//                                     ),
//                                   ),
//                                   const SizedBox(height: 10),
//                                   Padding(
//                                     padding: const EdgeInsets.symmetric(
//                                         horizontal: 10),
//                                     child: Container(
//                                       height: 12,
//                                       width:
//                                           80, // Adjusted width for better alignment
//                                       decoration: BoxDecoration(
//                                         color: Colors.grey
//                                             .shade200, // Light grey color for shimmer
//                                         borderRadius: BorderRadius.circular(
//                                             8), // Rounded corners
//                                       ),
//                                     ),
//                                   ),
//                                 ],
//                               ),
//                             ),
//                           );
//                         },
//                       ),
//                     ),
//                   ),
//                 ],
//               ),
//             );
//           } else if (snapshot.hasData) {
//             return AlignedGridView.count(
//               padding: const EdgeInsets.only(bottom: 20),
//               physics: const NeverScrollableScrollPhysics(),
//               crossAxisCount: MediaQuery.of(context).size.width >= 1100 ? 3 : 3,
//               mainAxisSpacing: 16, // Increased spacing between items
//               crossAxisSpacing: 16,
//               itemCount: snapshot.data!.length,
//               itemBuilder: (
//                 BuildContext buildContext,
//                 int index,
//               ) {
//                 CategoriesModel marketModel = snapshot.data![index];
//                 return AnimationConfiguration.staggeredGrid(
//                   position: index,
//                   duration: const Duration(milliseconds: 500),
//                   columnCount:
//                       MediaQuery.of(context).size.width >= 1100 ? 4 : 4,
//                   child: ScaleAnimation(
//                     child: FadeInAnimation(
//                       child: SizedBox(
//                         width: 120,
//                         height: 140,
//                         child: InkWell(
//                           onTap: () async {
//                             Navigator.of(context).push(MaterialPageRoute(
//                                 builder: (context) => ProductsByCategories(
//                                       collection: marketModel.category,
//                                     )));
//                           },
//                           child: Card(
//                             elevation:
//                                 4, // Increased elevation for card-like effect
//                             color: Colors.white,
//                             shape: RoundedRectangleBorder(
//                               borderRadius: BorderRadius.circular(
//                                   16), // Smoother rounded corners
//                               side: const BorderSide(
//                                 color: Color.fromARGB(
//                                     31, 0, 0, 0), // Subtle border color
//                                 width:
//                                     1.0, // Reduced thickness for a clean look
//                               ),
//                             ),
//                             child: Padding(
//                               padding: const EdgeInsets.all(
//                                   12), // Added padding for content inside the card
//                               child: Column(
//                                 mainAxisAlignment: MainAxisAlignment.center,
//                                 children: [
//                                   Center(
//                                     child: ClipRRect(
//                                       borderRadius: BorderRadius.circular(
//                                           8), // Rounded corners for the image
//                                       child: Image.network(
//                                         marketModel.image,
//                                         width: 70,
//                                         height: 70,
//                                         fit: BoxFit.cover,
//                                         errorBuilder:
//                                             (context, error, stackTrace) =>
//                                                 Icon(
//                                           Icons.broken_image,
//                                           size: 40,
//                                           color: Colors.grey.shade400,
//                                         ),
//                                       ),
//                                     ),
//                                   ),
//                                   const SizedBox(height: 8),
//                                   SizedBox(
//                                     width: double.infinity,
//                                     child: Center(
//                                       child: Text(
//                                         marketModel.category,
//                                         overflow: TextOverflow.ellipsis,
//                                         style: TextStyle(
//                                           fontSize: MediaQuery.of(context)
//                                                       .size
//                                                       .width >=
//                                                   1100
//                                               ? 14
//                                               : 12,
//                                           fontWeight: FontWeight
//                                               .w600, // Slightly bolder font for clarity
//                                           color: Colors.black87,
//                                         ),
//                                         textAlign: TextAlign.center,
//                                       ),
//                                     ),
//                                   ),
//                                 ],
//                               ),
//                             ),
//                           ),
//                         ),
//                       ),
//                     ),
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
//                   Expanded(
//                     child: Shimmer.fromColors(
//                       baseColor: Colors.grey.shade300,
//                       highlightColor: Colors.grey.shade100,
//                       enabled: true,
//                       child: GridView.builder(
//                         padding: const EdgeInsets.only(bottom: 20),
//                         physics: const NeverScrollableScrollPhysics(),
//                         itemCount:
//                             MediaQuery.of(context).size.width >= 1100 ? 10 : 10,
//                         gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
//                           crossAxisCount: MediaQuery.of(context).size.width >=
//                                   1100
//                               ? 3
//                               : MediaQuery.of(context).size.width > 600 &&
//                                       MediaQuery.of(context).size.width < 1200
//                                   ? 3
//                                   : 3,
//                           mainAxisSpacing:
//                               16, // Added spacing between grid items
//                           crossAxisSpacing: 16,
//                         ),
//                         itemBuilder: (BuildContext buildContext, int index) {
//                           return SizedBox(
//                             width: 80,
//                             height: 100,
//                             child: Padding(
//                               padding:
//                                   const EdgeInsets.symmetric(horizontal: 10),
//                               child: Card(
//                                 elevation:
//                                     2, // Added elevation for subtle shadow effect
//                                 shape: RoundedRectangleBorder(
//                                   borderRadius: BorderRadius.circular(
//                                       16), // Rounded corners
//                                 ),
//                                 child: Padding(
//                                   padding: const EdgeInsets.all(12),
//                                   child: Column(
//                                     mainAxisAlignment: MainAxisAlignment.center,
//                                     children: [
//                                       Container(
//                                         decoration: BoxDecoration(
//                                           color: Colors.grey.shade200,
//                                           borderRadius:
//                                               BorderRadius.circular(16),
//                                         ),
//                                         height: 50,
//                                         width: 50,
//                                       ),
//                                       const SizedBox(height: 12),
//                                       Container(
//                                         height: 12,
//                                         width: 80,
//                                         decoration: BoxDecoration(
//                                           color: Colors.grey.shade200,
//                                           borderRadius:
//                                               BorderRadius.circular(8),
//                                         ),
//                                       ),
//                                     ],
//                                   ),
//                                 ),
//                               ),
//                             ),
//                           );
//                         },
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

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../Model/categories.dart';
import '../Pages/products_by_categories.dart';

class CategoriesIntro extends StatefulWidget {
  const CategoriesIntro({super.key});

  @override
  State<CategoriesIntro> createState() => _CategoriesIntroState();
}

class _CategoriesIntroState extends State<CategoriesIntro> {
  // --- Exact UI Theme Colors ---
  static const Color kGold = Color(0xFFC9A86A);

  // 🔹 Optimized Initialization to avoid LateInitializationError
  late final Future<List<CategoriesModel>> _categoriesFuture = getCategories();

  Future<List<CategoriesModel>> getCategories() {
    return FirebaseFirestore.instance
        .collection('Categories')
        .limit(9) // Multiple of 3 for the grid
        .get()
        .then((event) => event.docs
            .map((e) => CategoriesModel.fromMap(e.data(), e.id))
            .toList());
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<CategoriesModel>>(
        future: _categoriesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildShimmer(context);
          } else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
            return AnimationLimiter(
              child: AlignedGridView.count(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                physics: const NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                // 🔹 Exact 3 Tiles Per Row
                crossAxisCount:
                    MediaQuery.of(context).size.width >= 1100 ? 6 : 3,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                itemCount: snapshot.data!.length,
                itemBuilder: (context, index) {
                  return AnimationConfiguration.staggeredGrid(
                    position: index,
                    duration: const Duration(milliseconds: 450),
                    columnCount: 3,
                    child: ScaleAnimation(
                      scale: 0.9,
                      child: FadeInAnimation(
                        child: _IntroCategoryTile(model: snapshot.data![index]),
                      ),
                    ),
                  );
                },
              ),
            );
          } else {
            return const SizedBox.shrink();
          }
        });
  }

  // 🔹 Dark Theme Shimmer
  Widget _buildShimmer(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade900,
      highlightColor: Colors.grey.shade800,
      child: AlignedGridView.count(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: 9,
        crossAxisCount: MediaQuery.of(context).size.width >= 1100 ? 6 : 3,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        itemBuilder: (context, index) {
          return Container(
            height: 110,
            decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(20),
            ),
          );
        },
      ),
    );
  }
}

// 🔹 Exact Card Design with Glassmorphism and Gold Glow
class _IntroCategoryTile extends StatefulWidget {
  final CategoriesModel model;
  const _IntroCategoryTile({required this.model});

  @override
  State<_IntroCategoryTile> createState() => _IntroCategoryTileState();
}

class _IntroCategoryTileState extends State<_IntroCategoryTile>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive =>
      true; // Essential for smooth scrolling without re-rendering

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAlive

    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact(); // Tactile feedback
        Navigator.of(context).push(MaterialPageRoute(
            builder: (context) => ProductsByCategories(
                  collection: widget.model.category,
                )));
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04), // Exact glassmorphism
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 🔹 Image Container with Gold Shadow/Glow
            Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFC9A86A).withOpacity(0.15),
                    blurRadius: 12,
                    spreadRadius: 2,
                  )
                ],
              ),
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: const Color(0xFFC9A86A).withOpacity(0.4),
                    width: 1.5,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(50),
                  child: CachedNetworkImage(
                    imageUrl: widget.model.image,
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                    memCacheWidth: 150, // Memory performance fix
                    placeholder: (context, url) =>
                        Container(color: Colors.white10),
                    errorWidget: (context, url, error) => const Icon(
                      Icons.error_outline,
                      color: Colors.white24,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // 🔹 Text Design
            Text(
              widget.model.category.toUpperCase(),
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
