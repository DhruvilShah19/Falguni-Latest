// ignore_for_file: avoid_print, deprecated_member_use
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:falguni_app/Pages/products_by_categories.dart';
import '../Model/categories.dart';

class CategoriesPage extends StatefulWidget {
  const CategoriesPage({super.key});

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  Future<List<CategoriesModel>> getCategories() {
    return FirebaseFirestore.instance.collection('Categories').get().then(
        (event) => event.docs
            .map((e) => CategoriesModel.fromMap(e.data(), e.id))
            .toList());
  }

  final CarouselController controller = CarouselController();

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         iconTheme: Theme.of(context).iconTheme,
//         titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
//         backgroundColor: Theme.of(context).colorScheme.background,
//         centerTitle: true,
//         elevation: 2,
//         title: const Text('CATEGORIES').tr(),
//       ),
//       body: FutureBuilder<List<CategoriesModel>>(
//           future: getCategories(),
//           builder: (context, snapshot) {
//             if (snapshot.data?.isEmpty ?? true) {
//               return const Center(
//                 child: SpinKitCircle(
//                   color: Color.fromARGB(255, 47, 37, 37),
//                 ),
//               );
//             } else if (snapshot.hasData) {
//               return AlignedGridView.count(
//                 physics: const BouncingScrollPhysics(),
//                 crossAxisCount:
//                     MediaQuery.of(context).size.width >= 1100 ? 4 : 3,
//                 mainAxisSpacing: 5,
//                 crossAxisSpacing: 5,
//                 itemCount: snapshot.data!.length,
//                 itemBuilder: (
//                   BuildContext buildContext,
//                   int index,
//                 ) {
//                   CategoriesModel marketModel = snapshot.data![index];
//                   return AnimationConfiguration.staggeredGrid(
//                     position: index,
//                     duration: const Duration(milliseconds: 500),
//                     columnCount:
//                         MediaQuery.of(context).size.width >= 1100 ? 4 : 3,
//                     child: ScaleAnimation(
//                       child: FadeInAnimation(
//                         child: SizedBox(
//                           width: MediaQuery.of(context).size.width >= 1100
//                               ? MediaQuery.of(context).size.width / 9
//                               : MediaQuery.of(context).size.width / 1.2,
//                           height: MediaQuery.of(context).size.width >= 1100
//                               ? MediaQuery.of(context).size.width / 9
//                               : MediaQuery.of(context).size.width / 4,
//                           child: InkWell(
//                             onTap: () async {
//                               Navigator.of(context)
//                                   .push(MaterialPageRoute(builder: ((context) {
//                                 return ProductsByCategories(
//                                   collection: marketModel.category);
//                               })));
//                             },
//                             child: Card(
//                                 elevation: 2, // Increase elevation for a more pronounced shadow/3D effect
//                                 color: Colors.white,
//                                 shape: const RoundedRectangleBorder(
//                                   borderRadius: BorderRadius.all(
//                                     Radius.circular(5),
//                                   ),
//                                   side: BorderSide(
//                                     color: Colors.white12, // Color of the border
//                                     width: 0.5, // Thickness of the border
//                                   ),
//                                 ),
//                                 child: Column(
//                                   mainAxisAlignment: MainAxisAlignment.center,
//                                   children: [
//                                     Center(
//                                       child: Image.network(
//                                         marketModel.image,
//                                         width: 50,
//                                         height: 50,
//                                       ),
//                                     ),
//                                     const SizedBox(
//                                       height: 5,
//                                     ),
//                                     SizedBox(
//                                       width: double.infinity,
//                                       child: Center(
//                                         child: Text(
//                                           marketModel.category,
//                                           overflow: TextOverflow.ellipsis,
//                                           style: TextStyle(
//                                               color: Colors.black,
//                                               fontSize: MediaQuery.of(context)
//                                                           .size
//                                                           .width >=
//                                                       1100
//                                                   ? 15
//                                                   : 12),
//                                         ),
//                                       ),
//                                     )
//                                   ],
//                                 )),
//                           ),
//                         ),
//                       ),
//                     ),
//                   );
//                 },
//               );
//             } else {
//               return const Center(
//                 child: SpinKitCircle(
//                   color: Color.fromARGB(255, 47, 37, 37),
//                 ),
//               );
//             }
//           }),
//     );
//   }
// }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
        backgroundColor: Theme.of(context).colorScheme.background,
        centerTitle: true,
        elevation: 4,
        title: const Text(
          'CATEGORIES',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.0,
          ),
        ).tr(),
      ),
      body: FutureBuilder<List<CategoriesModel>>(
        future: getCategories(),
        builder: (context, snapshot) {
          if (snapshot.data?.isEmpty ?? true) {
            return const Center(
              child: SpinKitCircle(
                color: Color.fromARGB(255, 47, 37, 37),
                size: 70,
              ),
            );
          } else if (snapshot.hasData) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: AlignedGridView.count(
                physics: const BouncingScrollPhysics(),
                crossAxisCount:
                    MediaQuery.of(context).size.width >= 1100 ? 4 : 2,
                mainAxisSpacing:
                    16, // Increased spacing for more breathing room
                crossAxisSpacing: 16,
                itemCount: snapshot.data!.length,
                itemBuilder: (BuildContext buildContext, int index) {
                  CategoriesModel marketModel = snapshot.data![index];
                  return AnimationConfiguration.staggeredGrid(
                    position: index,
                    duration: const Duration(milliseconds: 500),
                    columnCount:
                        MediaQuery.of(context).size.width >= 1100 ? 4 : 2,
                    child: ScaleAnimation(
                      child: FadeInAnimation(
                        child: InkWell(
                          onTap: () async {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) {
                                  return ProductsByCategories(
                                    collection: marketModel.category,
                                  );
                                },
                              ),
                            );
                          },
                          child: Card(
                            elevation:
                                8, // Higher elevation for floating effect
                            shadowColor: Colors.grey.shade300,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                  16), // Smooth rounded corners
                            ),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 20),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: Image.network(
                                      marketModel.image,
                                      width: 70,
                                      height: 70,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) => Icon(
                                        Icons.broken_image,
                                        size: 50,
                                        color: Colors.grey.shade400,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    marketModel.category,
                                    textAlign: TextAlign.center,
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 2,
                                    style: const TextStyle(
                                      color: Colors.black87,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color:
                                          const Color.fromARGB(15, 47, 37, 37),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text(
                                      'Explore Products',
                                      style: TextStyle(
                                        color: Color.fromARGB(255, 47, 37, 37),
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
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
                  );
                },
              ),
            );
          } else {
            return const Center(
              child: SpinKitCircle(
                color: Color.fromARGB(255, 47, 37, 37),
                size: 70,
              ),
            );
          }
        },
      ),
    );
  }
}
