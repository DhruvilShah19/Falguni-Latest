// ignore_for_file: avoid_print

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:shimmer/shimmer.dart';

import '../Model/categories.dart';
import '../Pages/products_by_categories.dart';

class CategoriesIntro extends StatefulWidget {
  const CategoriesIntro({super.key});

  @override
  State<CategoriesIntro> createState() => _CategoriesIntroState();
}

class _CategoriesIntroState extends State<CategoriesIntro> {
  Future<List<CategoriesModel>> getCategories() {
    return FirebaseFirestore.instance
        .collection('Categories')
        .limit(16)
        .get()
        .then((event) => event.docs
            .map((e) => CategoriesModel.fromMap(e.data(), e.id))
            .toList());
  }

  final CarouselController controller = CarouselController();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<CategoriesModel>>(
        future: getCategories(),
        builder: (context, snapshot) {
          // if (snapshot.data?.isEmpty ?? true) {
          //   return SizedBox(
          //     width: double.infinity,
          //     child: Column(
          //       mainAxisSize: MainAxisSize.max,
          //       children: <Widget>[
          //         Expanded(
          //           child: Shimmer.fromColors(
          //             baseColor: Colors.grey[300]!,
          //             highlightColor: Colors.grey[100]!,
          //             enabled: true,
          //             child: GridView.builder(
          //                 padding: const EdgeInsets.only(bottom: 20),
          //                 physics: const NeverScrollableScrollPhysics(),
          //                 itemCount: MediaQuery.of(context).size.width >= 1100
          //                     ? 10
          //                     : 10,
          //                 gridDelegate:
          //                     SliverGridDelegateWithFixedCrossAxisCount(
          //                   crossAxisCount: MediaQuery.of(context).size.width >=
          //                           1100
          //                       ? 3
          //                       : MediaQuery.of(context).size.width > 600 &&
          //                               MediaQuery.of(context).size.width < 1200
          //                           ? 3
          //                           : 3,
          //                 ),
          //                 itemBuilder: (BuildContext buildContext, int index) {
          //                   return SizedBox(
          //                     width: 100,
          //                     height: 80,
          //                     child: Padding(
          //                       padding:
          //                           const EdgeInsets.only(left: 10, right: 10),
          //                       child: Column(
          //                         children: [
          //                           Card(
          //                             elevation: 0,
          //                             shape: const RoundedRectangleBorder(
          //                                 borderRadius: BorderRadius.all(
          //                               Radius.circular(5),
          //                             )),
          //                             child: Container(
          //                                 decoration: BoxDecoration(
          //                                   color: Colors.transparent,
          //                                   borderRadius:
          //                                       BorderRadius.circular(20),
          //                                 ),
          //                                 width: 40,
          //                                 height: 40),
          //                           ),
          //                           const SizedBox(height: 10),
          //                           Padding(
          //                             padding: const EdgeInsets.only(
          //                                 left: 10, right: 10),
          //                             child: Container(
          //                                 height: 10,
          //                                 width: 60,
          //                                 color: Colors.transparent),
          //                           ),
          //                         ],
          //                       ),
          //                     ),
          //                   );
          //                 }),
          //           ),
          //         ),
          //       ],
          //     ),
          //   );
          // }
          if (snapshot.data?.isEmpty ?? true) {
  return SizedBox(
    width: double.infinity,
    child: Column(
      mainAxisSize: MainAxisSize.max,
      children: <Widget>[
        Expanded(
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade300,
            highlightColor: Colors.grey.shade100,
            enabled: true,
            child: GridView.builder(
              padding: const EdgeInsets.only(bottom: 20),
              physics: const NeverScrollableScrollPhysics(),
              itemCount: MediaQuery.of(context).size.width >= 1100 ? 10 : 10,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: MediaQuery.of(context).size.width >= 1100
                    ? 3
                    : MediaQuery.of(context).size.width > 600 &&
                            MediaQuery.of(context).size.width < 1200
                        ? 3
                        : 3,
                mainAxisSpacing: 16, // Added spacing between grid items
                crossAxisSpacing: 16,
              ),
              itemBuilder: (BuildContext buildContext, int index) {
                return SizedBox(
                  width: 100,
                  height: 80,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Column(
                      children: [
                        Card(
                          elevation: 2, // Added slight elevation for card effect
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16), // Rounded corners
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.grey.shade200, // Soft background color
                              borderRadius: BorderRadius.circular(16),
                            ),
                            width: 60, // Adjusted width for better proportion
                            height: 60, // Adjusted height for better proportion
                          ),
                        ),
                        const SizedBox(height: 10),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Container(
                            height: 12,
                            width: 80, // Adjusted width for better alignment
                            decoration: BoxDecoration(
                              color: Colors.grey.shade200, // Light grey color for shimmer
                              borderRadius: BorderRadius.circular(8), // Rounded corners
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    ),
  );
} 
// else if (snapshot.hasData) {
//             return AlignedGridView.count(
//               padding: const EdgeInsets.only(bottom: 20),
//               physics: const NeverScrollableScrollPhysics(),
//               crossAxisCount: MediaQuery.of(context).size.width >= 1100 ? 3 : 3,
//               mainAxisSpacing: 1,
//               crossAxisSpacing: 1,
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
//                         width: 10,
//                         height: 110,
//                         child: InkWell(
//                           onTap: () async {
//                             Navigator.of(context)
//                                 .push(MaterialPageRoute(builder: ((context) {
//                               return ProductsByCategories(
//                                   collection: marketModel.category);
//                             })));
//                           },
//                           // child: Card(
//                           //     elevation: 0,
//                           //     color: Colors.grey,
//                           //     shape: const RoundedRectangleBorder(
//                           //         borderRadius: BorderRadius.all(
//                           //       Radius.circular(20),
//                           //     )),
//                             child: Card(
//                                 elevation: 2, // Increase elevation for a more pronounced shadow/3D effect
//                                 // color: Colors.transparent,
//                                 shape: const RoundedRectangleBorder(
//                                   borderRadius: BorderRadius.all(
//                                     Radius.circular(5),
//                                   ),
//                                   side: BorderSide(
//                                     color: Color.fromARGB(31, 0, 0, 0), // Color of the border
//                                     width: 1.5, // Thickness of the border
//                                   ),
//                             ),
//                               child: Column(
//                                 mainAxisAlignment: MainAxisAlignment.center,
//                                 children: [
//                                   Center(
//                                     child: Image.network(
//                                       marketModel.image,
//                                       width: 60,
//                                       height: 60,
//                                       fit: BoxFit.cover,
//                                     ),
//                                   ),
//                                   const SizedBox(
//                                     height: 8,
//                                   ),
//                                   SizedBox(
//                                     width: double.infinity,
//                                     child: Center(
//                                       child: Text(
//                                         marketModel.category,
//                                         overflow: TextOverflow.ellipsis,
//                                         style: TextStyle(
//                                             fontSize: MediaQuery.of(context)
//                                                         .size
//                                                         .width >=
//                                                     1100
//                                                 ? 12
//                                                 : 10),
//                                       ),
//                                     ),
//                                   )
//                                 ],
//                               )),
//                         ),
//                       ),
//                     ),
//                   ),
//                 );
//               },
//             );
//           } 
else if (snapshot.hasData) {
  return AlignedGridView.count(
    padding: const EdgeInsets.only(bottom: 20),
    physics: const NeverScrollableScrollPhysics(),
    crossAxisCount: MediaQuery.of(context).size.width >= 1100 ? 3 : 3,
    mainAxisSpacing: 16, // Increased spacing between items
    crossAxisSpacing: 16,
    itemCount: snapshot.data!.length,
    itemBuilder: (
      BuildContext buildContext,
      int index,
    ) {
      CategoriesModel marketModel = snapshot.data![index];
      return AnimationConfiguration.staggeredGrid(
        position: index,
        duration: const Duration(milliseconds: 500),
        columnCount: MediaQuery.of(context).size.width >= 1100 ? 4 : 4,
        child: ScaleAnimation(
          child: FadeInAnimation(
            child: SizedBox(
              width: 120,
              height: 140,
              child: InkWell(
                onTap: () async {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => ProductsByCategories(
                            collection: marketModel.category,
                          )));
                },
                child: Card(
                  elevation: 4, // Increased elevation for card-like effect
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16), // Smoother rounded corners
                    side: const BorderSide(
                      color: Color.fromARGB(31, 0, 0, 0), // Subtle border color
                      width: 1.0, // Reduced thickness for a clean look
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12), // Added padding for content inside the card
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8), // Rounded corners for the image
                            child: Image.network(
                              marketModel.image,
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Icon(
                                Icons.broken_image,
                                size: 40,
                                color: Colors.grey.shade400,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: Center(
                            child: Text(
                              marketModel.category,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: MediaQuery.of(context).size.width >=
                                        1100
                                    ? 14
                                    : 12,
                                fontWeight: FontWeight.w600, // Slightly bolder font for clarity
                                color: Colors.black87,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    },
  );
} 
//else {
//             return SizedBox(
//               width: double.infinity,
//               child: Column(
//                 mainAxisSize: MainAxisSize.max,
//                 children: <Widget>[
//                   Expanded(
//                     child: Shimmer.fromColors(
//                       baseColor: Colors.grey[300]!,
//                       highlightColor: Colors.grey[100]!,
//                       enabled: true,
//                       child: GridView.builder(
//                           padding: const EdgeInsets.only(bottom: 20),
//                           physics: const NeverScrollableScrollPhysics(),
//                           itemCount: MediaQuery.of(context).size.width >= 1100
//                               ? 10
//                               : 10,
//                           gridDelegate:
//                               SliverGridDelegateWithFixedCrossAxisCount(
//                             crossAxisCount: MediaQuery.of(context).size.width >=
//                                     1100
//                                 ? 3
//                                 : MediaQuery.of(context).size.width > 600 &&
//                                         MediaQuery.of(context).size.width < 1200
//                                     ? 3
//                                     : 3,
//                           ),
//                           itemBuilder: (BuildContext buildContext, int index) {
//                             return SizedBox(
//                               width: 80,
//                               height: 100,
//                               child: Padding(
//                                 padding:
//                                     const EdgeInsets.only(left: 10, right: 10),
//                                 child: Card(
//                                   elevation: 0,
//                                   shape: const RoundedRectangleBorder(
//                                       borderRadius: BorderRadius.all(
//                                     Radius.circular(20),
//                                   )),
//                                   child: Column(
//                                     children: [
//                                       Container(
//                                           decoration: BoxDecoration(
//                                             color: Colors.white,
//                                             borderRadius:
//                                                 BorderRadius.circular(20),
//                                           ),
//                                           height: 40,
//                                           width: 40),
//                                       const SizedBox(height: 10),
//                                       Padding(
//                                         padding: const EdgeInsets.only(
//                                             left: 10, right: 10),
//                                         child: Container(
//                                             height: 10,
//                                             width: 60,
//                                             color: Colors.white),
//                                       ),
//                                     ],
//                                   ),
//                                 ),
//                               ),
//                             );
//                           }),
//                     ),
//                   ),
//                 ],
//               ),
//             );
//           }
//         }
 else {
  return SizedBox(
    width: double.infinity,
    child: Column(
      mainAxisSize: MainAxisSize.max,
      children: <Widget>[
        Expanded(
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade300,
            highlightColor: Colors.grey.shade100,
            enabled: true,
            child: GridView.builder(
              padding: const EdgeInsets.only(bottom: 20),
              physics: const NeverScrollableScrollPhysics(),
              itemCount: MediaQuery.of(context).size.width >= 1100 ? 10 : 10,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: MediaQuery.of(context).size.width >= 1100
                    ? 3
                    : MediaQuery.of(context).size.width > 600 &&
                            MediaQuery.of(context).size.width < 1200
                        ? 3
                        : 3,
                mainAxisSpacing: 16, // Added spacing between grid items
                crossAxisSpacing: 16,
              ),
              itemBuilder: (BuildContext buildContext, int index) {
                return SizedBox(
                  width: 80,
                  height: 100,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Card(
                      elevation: 2, // Added elevation for subtle shadow effect
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16), // Rounded corners
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              height: 50,
                              width: 50,
                            ),
                            const SizedBox(height: 12),
                            Container(
                              height: 12,
                              width: 80,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(8),
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
          ),
        ),
      ],
    ),
  );
}});
  }
}
