// ignore_for_file: deprecated_member_use, prefer_const_constructors

import 'package:animations/animations.dart';
import 'package:badges/badges.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart' hide Badge;
import 'package:easy_localization/easy_localization.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Model/rating.dart';
import '../Providers/analytics.dart';
import 'package:url_launcher/url_launcher.dart';

class ProductDetailsPage extends StatefulWidget {
  final String marketID;
  final ProductsModel productsModel;
  final String currency;
  const ProductDetailsPage(
      {super.key,
      required this.marketID,
      required this.productsModel,
      required this.currency});

  @override
  State<ProductDetailsPage> createState() => _ProductDetailsPageState();
}

class _ProductDetailsPageState extends State<ProductDetailsPage> {
  String doorDelivery = '';
  String pickUpDelivery = '';
  String selectedUnit = 'unit1';
  num quantity = 1;
  DocumentReference? userRef;
  bool isFavorite = false;
  String userID = '';
  num cartQuantity = 0;
  String currentMarketID = '';
  num price = 0;
  num deliveryFee = 0;

  getMarketDetails() {
    FirebaseFirestore.instance
        .collection('Delivery Fee')
        .doc('Delivery Fee')
        .get()
        .then((val) {
      setState(() {
        deliveryFee = val['Delivery Fee'];
      });
    });
  }

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  addToCart(ProductsModel productsModel) {
    userRef!
        .collection('Cart')
        .doc(
            '${widget.productsModel.vendorId}${widget.productsModel.name}$selectedUnit')
        .set(productsModel.toMap())
        .then((val) {
      Fluttertoast.showToast(
          msg: "Product has been added to your cart".tr(),
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          fontSize: 14.0);
    });
    userRef!.update(
        {'CurrentMarketID': widget.marketID, 'deliveryFee': deliveryFee});
  }

  addToFavorite(ProductsModel productsModel) {
    userRef!
        .collection('Favorite')
        .doc('${widget.productsModel.vendorId}${widget.productsModel.name}')
        .set(productsModel.toMap())
        .then((val) {
      Fluttertoast.showToast(
          msg: "Product has been added to your favorites".tr(),
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          fontSize: 14.0);
    });
  }

  removeFromFavorite() {
    userRef!
        .collection('Favorite')
        .doc(
            '${widget.marketID}${widget.productsModel.vendorId}${widget.productsModel.name}')
        .delete()
        .then((value) => Fluttertoast.showToast(
            msg: "Product has been removed from your favorites".tr(),
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.TOP,
            timeInSecForIosWeb: 1,
            fontSize: 14.0));
  }

  selectedUnitFunction() {
    if (selectedUnit == 'unit1') {
      return widget.productsModel.unitname1;
    } else if (selectedUnit == 'unit2') {
      return widget.productsModel.unitname2;
    } else if (selectedUnit == 'unit3') {
      return widget.productsModel.unitname3;
    } else if (selectedUnit == 'unit4') {
      return widget.productsModel.unitname4;
    } else if (selectedUnit == 'unit5') {
      return widget.productsModel.unitname5;
    } else if (selectedUnit == 'unit6') {
      return widget.productsModel.unitname6;
    } else if (selectedUnit == 'unit7') {
      return widget.productsModel.unitname7;
    }
  }

  selectedPriceFunction() {
    if (selectedUnit == 'unit1') {
      return widget.productsModel.unitPrice1 * quantity;
    } else if (selectedUnit == 'unit2') {
      return widget.productsModel.unitPrice2 * quantity;
    } else if (selectedUnit == 'unit3') {
      return widget.productsModel.unitPrice3 * quantity;
    } else if (selectedUnit == 'unit4') {
      return widget.productsModel.unitPrice4 * quantity;
    } else if (selectedUnit == 'unit5') {
      return widget.productsModel.unitPrice5 * quantity;
    } else if (selectedUnit == 'unit6') {
      return widget.productsModel.unitPrice6 * quantity;
    } else if (selectedUnit == 'unit7') {
      return widget.productsModel.unitPrice7 * quantity;
    }
  }

  selectedPrice() {
    if (selectedUnit == 'unit1') {
      return widget.productsModel.unitPrice1;
    } else if (selectedUnit == 'unit2') {
      return widget.productsModel.unitPrice2;
    } else if (selectedUnit == 'unit3') {
      return widget.productsModel.unitPrice3;
    } else if (selectedUnit == 'unit4') {
      return widget.productsModel.unitPrice4;
    } else if (selectedUnit == 'unit5') {
      return widget.productsModel.unitPrice5;
    } else if (selectedUnit == 'unit6') {
      return widget.productsModel.unitPrice6;
    } else if (selectedUnit == 'unit7') {
      return widget.productsModel.unitPrice7;
    }
  }

  @override
  void initState() {
    getMarketDetails();
    getIsLogged();
    getReturnPolicy();
    getRatingAndReview();
    _getUserDetails();
    _getUserDoc();
    super.initState();
  }

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    User? user = auth.currentUser;
    setState(() {
      userRef = firestore
          .collection('users')
          .doc(user!.uid)
          .snapshots()
          .listen((value) {
        setState(() {
          userID = value['id'];
        });
        if (userID != '') {
          getCart();
          getselectedMarket();
        }
      }) as DocumentReference<Object?>?;
    });
  }

  getFavorite() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .collection('Favorite')
        .where('marketID', isEqualTo: widget.productsModel.marketID)
        .where('vendorId', isEqualTo: widget.productsModel.vendorId)
        .where('name', isEqualTo: widget.productsModel.name)
        .snapshots()
        .listen((value) {
      setState(() {
        isFavorite = value.docs.isNotEmpty;
      });
    });
  }

  getIsLogged() {
    FirebaseAuth.instance.authStateChanges().listen((User? user) async {
      if (user == null) {
      } else {
        getFavorite();
      }
    });
  }

  getCart() {
    userRef!.collection('Cart').snapshots().listen((val) {
      num tempTotal =
          val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']);
      setState(() {
        cartQuantity = tempTotal;
      });
    });
  }

  getselectedMarket() {
    userRef!.get().then((value) {
      setState(() {
        currentMarketID = value['CurrentMarketID'];
      });
    });
  }

  Future deleteCartCollection() async {
    userRef!.collection('Cart').get().then((snapshot) {
      for (DocumentSnapshot ds in snapshot.docs) {
        ds.reference.delete();
      }
    });
  }

  deleteVendorsID() {
    userRef!.update({'CurrentMarketID': '', 'deliveryFee': 0});
  }

  bool ratingStatus = false;

  Future<List<RatingModel>> getRating() {
    return FirebaseFirestore.instance
        .collection('Products')
        .doc(widget.productsModel.productID)
        .collection('Ratings')
        .get()
        .then((event) {
      if (event.docs.isNotEmpty) {
        setState(() {
          ratingStatus = true;
        });
      } else {
        setState(() {
          ratingStatus = false;
        });
      }
      return event.docs
          .map((e) => RatingModel.fromMap(e.data(), e.id))
          .toList();
    });
  }

  num ratingAndReview = 0;
  num totalUser = 0;
  getRatingAndReview() {
    FirebaseFirestore.instance
        .collection('Products')
        .doc(widget.productsModel.productID)
        .collection('Ratings')
        .get()
        .then((val) {
      num rating = val.docs.fold(0, (tot, doc) => tot + doc.data()['rating']);
      num totalUserRating = val.docs.length;
      setState(() {
        ratingAndReview = (rating / totalUserRating).roundToDouble();
        totalUser = totalUserRating;
      });
    });
    debugPrint('$ratingAndReview is the average rating');
    return ratingAndReview;
  }

// void _shareProduct(ProductsModel product) {
//   final String productDetails =
//       'Check out this product: ${product.name}\nPrice: ${widget.currency}${Formatter().converter(product.unitPrice1.toDouble())}\n${product.image1}';
//   Share.share(productDetails);
// }

  void _shareProduct(String productName, String productDescription) async {
    // final String productDetails =
    //     'Check out this product: $productName\nDescription: $productDescription';

    final String deepLink =
        'falgunigruhudhyog://product?name=${Uri.encodeComponent(productName)}&description=${Uri.encodeComponent(productDescription)}';
    // const String playStoreLink = 'https://play.google.com/store/apps/details?id=com.Falgunigruhudhyog';

    if (await canLaunch(deepLink)) {
      await launch(deepLink);
    } else {
      // final String message = '$productDetails\n\nDownload the app from the Play Store: $playStoreLink';
      // Share.share(message);
    }
  }

  int returnDuration = 0;
  getReturnPolicy() {
    FirebaseFirestore.instance
        .collection('Products')
        .doc(widget.productsModel.productID)
        .snapshots()
        .listen((v) {
      if (v.exists) {
        setState(() {
          returnDuration = v['returnDuration'];
        });
      } else {
        FirebaseFirestore.instance
            .collection('Flash Sales Products')
            .doc(widget.productsModel.productID)
            .snapshots()
            .listen((r) {
          setState(() {
            returnDuration = v['returnDuration'];
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(slivers: [
        // SliverAppBar(
        //   primary: true,
        //   iconTheme: Theme.of(context).iconTheme,
        //   titleTextStyle: TextStyle(
        //     color: Theme.of(context).indicatorColor,
        //     fontWeight: FontWeight.bold,
        //     fontSize: 18,
        //   ),
        //   backgroundColor: Theme.of(context).colorScheme.background,
        //   snap: true,
        //   elevation: 4,
        //   centerTitle: true,
        //   pinned: true,
        //   floating: true,
        //   automaticallyImplyLeading: false,
        //   leading: Padding(
        //     padding: const EdgeInsets.all(8.0),
        //     child: Material(
        //       shape: CircleBorder(),
        //       elevation: 4,
        //       child: IconButton(
        //         icon: const Icon(Icons.cancel),
        //         color: Colors.black,
        //         onPressed: () => Navigator.of(context).pop(),
        //       ),
        //     ),
        //   ),
        //   // leading: Align(
        //   //   alignment: Alignment.topLeft,
        //   //   child: Padding(
        //   //     padding: const EdgeInsets.all(8.0),
        //   //     child: InkWell(
        //   //       onTap: () {
        //   //         Navigator.of(context).pop();
        //   //       },
        //   //       child: Container(
        //   //         height: 40,
        //   //         width: 40,
        //   //         decoration: BoxDecoration(
        //   //           shape: BoxShape.circle,
        //   //           color: Theme.of(context).colorScheme.surface,
        //   //           boxShadow: [
        //   //             BoxShadow(
        //   //               color: Colors.black.withOpacity(0.1),
        //   //               blurRadius: 6,
        //   //               offset: const Offset(0, 3),
        //   //             ),
        //   //           ],
        //   //         ),
        //   //         child: const Icon(
        //   //           Icons.cancel,
        //   //           color: Colors.black,
        //   //         ),
        //   //       ),
        //   //     ),
        //   //   ),
        //   // ),
        //   actions: [
        //     Align(
        //       alignment: Alignment.topRight,
        //       child: InkWell(
        //         onTap: () {
        //           if (userRef == null) {
        //             Navigator.of(context).pushNamed('/login');
        //           } else {
        //             Navigator.of(context).pushNamed('/cart');
        //           }
        //         },
        //         child: Padding(
        //           padding: const EdgeInsets.all(8.0),
        //           child: Container(
        //             height: 40,
        //             width: 40,
        //             decoration: BoxDecoration(
        //               shape: BoxShape.circle,
        //               color: Theme.of(context).colorScheme.surface,
        //               boxShadow: [
        //                 BoxShadow(
        //                   color: Colors.black.withOpacity(0.1),
        //                   blurRadius: 6,
        //                   offset: const Offset(0, 3),
        //                 ),
        //               ],
        //             ),
        //             child: Center(
        //               child: Badge(
        //                 badgeStyle: const BadgeStyle(
        //                   badgeColor: Color.fromARGB(255, 47, 37, 37),
        //                 ),
        //                 badgeContent: Text(
        //                   cartQuantity.toString(),
        //                   style: const TextStyle(color: Colors.white),
        //                 ),
        //                 child: const Icon(
        //                   Icons.shopping_cart,
        //                   color: Colors.black,
        //                 ),
        //               ),
        //             ),
        //           ),
        //         ),
        //       ),
        //     ),
        //   ],
        //   expandedHeight: MediaQuery.of(context).size.height / 2.5,
        //   flexibleSpace: FlexibleSpaceBar(
        //     background: SizedBox(
        //       height: MediaQuery.of(context).size.height / 2.5,
        //       width: double.infinity,
        //       child: Container(
        //         decoration: BoxDecoration(
        //           borderRadius: const BorderRadius.only(
        //             bottomRight: Radius.circular(40.0),
        //             bottomLeft: Radius.circular(40.0),
        //           ),
        //           boxShadow: [
        //             BoxShadow(
        //               color: Colors.black.withOpacity(0.1),
        //               blurRadius: 10,
        //               spreadRadius: 5,
        //             ),
        //           ],
        //         ),
        //         child: CarouselSlider(
        //           items: [
        //             widget.productsModel.image1 == ''
        //                 ? Image.network(
        //                     'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
        //                     fit: BoxFit.cover,
        //                   )
        //                 : Image.network(widget.productsModel.image1,
        //                     fit: BoxFit.cover),
        //             widget.productsModel.image2 == ''
        //                 ? Image.network(
        //                     'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
        //                     fit: BoxFit.cover,
        //                   )
        //                 : Image.network(widget.productsModel.image2,
        //                     fit: BoxFit.cover),
        //             widget.productsModel.image3 == ''
        //                 ? Image.network(
        //                     'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
        //                     fit: BoxFit.cover,
        //                   )
        //                 : Image.network(widget.productsModel.image3,
        //                     fit: BoxFit.cover),
        //           ],
        //           options: CarouselOptions(
        //             autoPlay: false,
        //             height: MediaQuery.of(context).size.height / 2.5,
        //             viewportFraction: 1.0,
        //             enableInfiniteScroll: false,
        //             autoPlayInterval: const Duration(seconds: 3),
        //             autoPlayAnimationDuration:
        //                 const Duration(milliseconds: 800),
        //             autoPlayCurve: Curves.fastOutSlowIn,
        //           ),
        //         ),
        //       ),
        //     ),
        //   ),
        // ),
        SliverAppBar(
          primary: true,
          pinned: true,
          floating: false,
          snap: false,
          elevation: 4,
          expandedHeight: MediaQuery.of(context).size.height / 2.2,
          backgroundColor: Theme.of(context).colorScheme.background,
          automaticallyImplyLeading: false,
          centerTitle: true,
          leading: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Material(
              shape: const CircleBorder(),
              elevation: 3,
              color: Colors.white,
              child: IconButton(
                icon: const Icon(Icons.close),
                color: Colors.black,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Material(
                shape: const CircleBorder(),
                elevation: 3,
                color: Colors.white,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.shopping_cart),
                      color: Colors.black,
                      onPressed: () {
                        if (userRef == null) {
                          Navigator.of(context).pushNamed('/login');
                        } else {
                          Navigator.of(context).pushNamed('/cart');
                        }
                      },
                    ),
                    if (cartQuantity > 0)
                      Positioned(
                        right: 6,
                        top: 6,
                        child: Badge(
                          badgeStyle: const BadgeStyle(
                            badgeColor: Color.fromARGB(255, 47, 37, 37),
                          ),
                          badgeContent: Text(
                            cartQuantity.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            collapseMode: CollapseMode.parallax,
            centerTitle: true,
            titlePadding:
                const EdgeInsets.symmetric(horizontal: 56.0, vertical: 12.0),
            title: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.85),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                widget.productsModel.name.length > 25
                    ? '${widget.productsModel.name.substring(0, 25)}...'
                    : widget.productsModel.name,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 10,
                  color: Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            background: ClipRRect(
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(40),
                bottomRight: Radius.circular(40),
              ),
              child: CarouselSlider(
                items: [
                  widget.productsModel.image1,
                  widget.productsModel.image2,
                  widget.productsModel.image3,
                ].map((img) {
                  return Image.network(
                    img.isNotEmpty
                        ? img
                        : 'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
                    fit: BoxFit.cover,
                    width: double.infinity,
                  );
                }).toList(),
                options: CarouselOptions(
                  height: MediaQuery.of(context).size.height / 2.5,
                  viewportFraction: 1.0,
                  enableInfiniteScroll: false,
                  autoPlay: false,
                ),
              ),
            ),
          ),
        ),

        // SliverList(
        //   delegate: SliverChildListDelegate([
        //     const SizedBox(height: 20),
        //     Row(
        //       mainAxisAlignment: MainAxisAlignment.spaceBetween,
        //       children: [
        //         Expanded(
        //           child: Padding(
        //             padding: const EdgeInsets.all(8.0),
        //             child: Text(
        //               widget.productsModel.name,
        //               maxLines: 2,
        //               style: const TextStyle(
        //                 fontSize: 26, // Slightly larger font size for emphasis
        //                 fontWeight: FontWeight.bold,
        //                 color: Colors.black87,
        //               ),
        //               textAlign: TextAlign.start,
        //               overflow: TextOverflow.ellipsis,
        //             ),
        //           ),
        //         ),
        //         Container(
        //           decoration: BoxDecoration(
        //             color: Colors.grey.shade200,
        //             shape: BoxShape.circle,
        //           ),
        //           child: IconButton(
        //             icon: const Icon(Icons.share, color: Colors.blueGrey),
        //             onPressed: () {
        //               _shareProduct(
        //                 widget.productsModel.name,
        //                 widget.productsModel.description,
        //               );
        //             },
        //           ),
        //         ),
        //       ],
        //     ),
        //     const SizedBox(height: 10),
        //     Padding(
        //       padding: const EdgeInsets.symmetric(horizontal: 16.0),
        //       child: Align(
        //         alignment: Alignment.centerLeft,
        //         child: Text(
        //           returnDuration == 0
        //               ? 'No return policy'
        //               : '$returnDuration Day Return Guarantee',
        //           style: const TextStyle(
        //             fontSize: 16,
        //             color: Colors.grey,
        //             fontStyle: FontStyle
        //                 .italic, // Added slight emphasis for better readability
        //           ),
        //         ),
        //       ),
        //     ),
        //     const SizedBox(height: 10),
        //     Padding(
        //       padding: const EdgeInsets.symmetric(horizontal: 16.0),
        //       child: Row(
        //         mainAxisAlignment: MainAxisAlignment.spaceBetween,
        //         children: [
        //           Text(
        //             '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice1.toDouble())}',
        //             style: const TextStyle(
        //               fontSize: 24, // Slightly larger for pricing emphasis
        //               fontWeight: FontWeight.bold,
        //               color: Colors.black,
        //             ),
        //           ),
        //           Row(
        //             children: [
        //               RatingBarIndicator(
        //                 rating: totalUser == 0
        //                     ? 0
        //                     : getRatingAndReview().toDouble(),
        //                 itemBuilder: (context, index) => const Icon(
        //                   Icons.star,
        //                   color: Color.fromARGB(255, 47, 37, 37),
        //                 ),
        //                 itemCount: 5,
        //                 itemSize: 22, // Slightly larger stars
        //                 direction: Axis.horizontal,
        //               ),
        //               const SizedBox(width: 8),
        //               Text(
        //                 '(${totalUser.toString()})',
        //                 style: const TextStyle(
        //                   color: Colors.grey,
        //                   fontSize: 14,
        //                 ),
        //               ),
        //             ],
        //           ),
        //         ],
        //       ),
        //     ),
        //     const SizedBox(height: 10),
        //     if (widget.productsModel.percantageDiscount != 0)
        //       Padding(
        //         padding: const EdgeInsets.only(left: 8),
        //         child: Row(
        //           children: [
        //             Text(
        //               '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice1.toDouble())}',
        //               style: const TextStyle(
        //                 fontSize: 16,
        //                 color: Colors.grey,
        //                 decoration: TextDecoration.lineThrough,
        //               ),
        //             ),
        //             const SizedBox(width: 5),
        //             Container(
        //               padding: const EdgeInsets.symmetric(
        //                   horizontal: 10, vertical: 4),
        //               decoration: BoxDecoration(
        //                 color: Colors
        //                     .redAccent, // Changed to red for more prominence
        //                 borderRadius: BorderRadius.circular(
        //                     8), // More rounded corners for better UI
        //               ),
        //               child: Text(
        //                 '-${widget.productsModel.percantageDiscount.toString()}%',
        //                 style: const TextStyle(
        //                   fontSize: 16,
        //                   color: Colors.white,
        //                   fontWeight: FontWeight.bold,
        //                 ),
        //               ),
        //             ),
        //           ],
        //         ),
        //       ),
        //     const SizedBox(height: 10),
        //     Padding(
        //       padding: const EdgeInsets.symmetric(
        //           horizontal: 16.0,
        //           vertical: 0.0), // Increased horizontal padding for alignment
        //       child: Container(
        //         width: double.infinity,
        //         padding: const EdgeInsets.all(
        //             16.0), // Slightly increased padding inside the container
        //         decoration: BoxDecoration(
        //           color: Colors.white, // Changed to white for a cleaner look
        //           borderRadius: BorderRadius.circular(
        //               12), // More rounded corners for a smoother look
        //           boxShadow: [
        //             BoxShadow(
        //               color: Colors.grey.shade300,
        //               blurRadius: 10, // Added shadow for card effect
        //               offset: const Offset(
        //                   0, 4), // Shadow below the card for elevation effect
        //             ),
        //           ],
        //         ),
        //         child: Text(
        //           widget.productsModel.description,
        //           style: const TextStyle(
        //             fontSize: 18, // Slightly larger font for better readability
        //             color: Colors.black87, // Darker shade for better contrast
        //             height: 1.5, // Increased line height for better readability
        //           ),
        //         ),
        //       ),
        //     ),
        //     const SizedBox(height: 10),
        SliverList(
          delegate: SliverChildListDelegate([
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      widget.productsModel.name,
                      maxLines: 2,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Material(
                    shape: const CircleBorder(),
                    elevation: 1,
                    color: Colors.grey.shade200,
                    child: IconButton(
                      icon: const Icon(Icons.share, color: Colors.blueGrey),
                      onPressed: () {
                        _shareProduct(
                          widget.productsModel.name,
                          widget.productsModel.description,
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  returnDuration == 0
                      ? 'No return policy'
                      : '$returnDuration Day Return Guarantee',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice1.toDouble())}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  Row(
                    children: [
                      RatingBarIndicator(
                        rating: totalUser == 0
                            ? 0
                            : getRatingAndReview().toDouble(),
                        itemBuilder: (context, index) => const Icon(
                          Icons.star,
                          color: Color.fromARGB(255, 47, 37, 37),
                        ),
                        itemCount: 5,
                        itemSize: 22,
                        direction: Axis.horizontal,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '($totalUser)',
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            if (widget.productsModel.percantageDiscount != 0)
              Padding(
                padding: const EdgeInsets.only(left: 16.0),
                child: Row(
                  children: [
                    Text(
                      '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice1.toDouble())}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.redAccent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '-${widget.productsModel.percantageDiscount}%',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.shade300,
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Text(
                  widget.productsModel.description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.black87,
                    height: 1.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Other Variants',
                    style: TextStyle(
                      fontSize: 16, // Slightly larger for clarity
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Unit 1 Option
                  InkWell(
                    onTap: () {
                      setState(() {
                        selectedUnit = 'unit1';
                        quantity = 1;
                      });
                    },
                    splashColor: Color.fromARGB(51, 47, 37, 37),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.shade300,
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              if (selectedUnit == 'unit1')
                                const Icon(
                                  Icons.check_circle_rounded,
                                  color: Color.fromARGB(255, 47, 37, 37),
                                  size: 20,
                                ),
                              const SizedBox(width: 12),
                              Text(
                                widget.productsModel.unitname1,
                                style: const TextStyle(
                                  fontSize: 20,
                                  color: Colors.black87,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice1.toDouble())}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12), // Spacing between unit options
                  // Unit 2 Option
                  if (widget.productsModel.unitname2.isNotEmpty)
                    InkWell(
                      onTap: () {
                        setState(() {
                          selectedUnit = 'unit2';
                          quantity = 1;
                        });
                      },
                      splashColor: Color.fromARGB(82, 47, 37, 37),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.shade300,
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                if (selectedUnit == 'unit2')
                                  const Icon(
                                    Icons.check_circle_rounded,
                                    color: Color.fromARGB(143, 47, 37, 37),
                                    size: 28,
                                  ),
                                const SizedBox(width: 12),
                                Text(
                                  widget.productsModel.unitname2,
                                  style: const TextStyle(
                                    fontSize: 20,
                                    color: Colors.black87,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice2.toDouble())}',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (ratingStatus)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: const Text(
                  'Product Reviews',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            FutureBuilder<List<RatingModel>>(
              future: getRating(),
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: snapshot.data!.length,
                    itemBuilder: (context, index) {
                      RatingModel ratingModel = snapshot.data![index];
                      return Column(
                        children: [
                          ListTile(
                            leading: ClipOval(
                              child: CachedNetworkImage(
                                height: 40,
                                width: 40,
                                fit: BoxFit.cover,
                                imageUrl: ratingModel.profilePicture.isNotEmpty
                                    ? ratingModel.profilePicture
                                    : 'https://eitrawmaterials.eu/wp-content/uploads/2016/09/person-icon.png',
                                placeholder: (context, url) =>
                                    const SpinKitRing(
                                  color: Color.fromARGB(255, 47, 37, 37),
                                  size: 30,
                                  lineWidth: 3,
                                ),
                                errorWidget: (context, url, error) =>
                                    const Icon(Icons.error),
                              ),
                            ),
                            title: Text(
                              ratingModel.fullname,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: RatingBarIndicator(
                              rating: ratingModel.rating.toDouble(),
                              itemBuilder: (context, index) => const Icon(
                                Icons.star,
                                color: Color.fromARGB(255, 47, 37, 37),
                              ),
                              itemCount: 5,
                              itemSize: 18,
                              direction: Axis.horizontal,
                            ),
                            trailing: Text(
                              ratingModel.timeCreated,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 16.0),
                            child: Container(
                              alignment: Alignment.centerLeft,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Text(
                                ratingModel.review,
                                textAlign: TextAlign.left,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.black54,
                                ),
                              ),
                            ),
                          ),
                          const Divider(),
                        ],
                      );
                    },
                  );
                } else {
                  return const Center(
                    child: CircularProgressIndicator(
                      color: Color.fromARGB(255, 47, 37, 37),
                    ),
                  );
                }
              },
            ),
            const SizedBox(height: 120),
          ]),
        )
      ]),
      bottomSheet: SizedBox(
          height: 120,
          width: double.infinity,
          child: Card(
            elevation: 6,
            margin: const EdgeInsets.all(0),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16.0),
                topRight: Radius.circular(16.0),
              ),
            ),
            child: Column(children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quantity',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 18))
                          .tr(),
                      Row(children: [
                        InkWell(
                            onTap: () {
                              if (quantity <= 1) {
                                Fluttertoast.showToast(
                                    msg: "This is the quantity limit".tr(),
                                    toastLength: Toast.LENGTH_SHORT,
                                    gravity: ToastGravity.TOP,
                                    timeInSecForIosWeb: 1,
                                    fontSize: 14.0);
                              } else {
                                setState(() {
                                  quantity--;
                                });
                              }
                            },
                            child: const Icon(Icons.remove,
                                size: 25,
                                color: Color.fromARGB(255, 47, 37, 37))),
                        const SizedBox(width: 20),
                        Text(quantity.toString(),
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(width: 20),
                        InkWell(
                            onTap: () {
                              if (widget.productsModel.quantity! <= quantity) {
                                Fluttertoast.showToast(
                                    msg:
                                        "This is the quantity available for this product"
                                            .tr(),
                                    toastLength: Toast.LENGTH_SHORT,
                                    gravity: ToastGravity.TOP,
                                    timeInSecForIosWeb: 1,
                                    fontSize: 14.0);
                              } else {
                                setState(() {
                                  quantity++;
                                });
                              }
                            },
                            child: const Icon(Icons.add,
                                size: 25,
                                color: Color.fromARGB(255, 47, 37, 37))),
                      ])
                    ]),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      isFavorite == true
                          ? InkWell(
                              onTap: () {
                                if (userRef == null) {
                                  Navigator.of(context)
                                      .pushNamed('/login')
                                      .then((value) {
                                    Fluttertoast.showToast(
                                        msg: "Please login to continue".tr(),
                                        toastLength: Toast.LENGTH_SHORT,
                                        gravity: ToastGravity.TOP,
                                        timeInSecForIosWeb: 1,
                                        fontSize: 14.0);
                                  });
                                } else {
                                  removeFromFavorite();
                                }
                              },
                              child: const Icon(Icons.favorite,
                                  color: Color.fromARGB(255, 47, 37, 37),
                                  size: 30))
                          : InkWell(
                              onTap: () {
                                if (userRef == null) {
                                  Navigator.of(context)
                                      .pushNamed('/login')
                                      .then((value) {
                                    Fluttertoast.showToast(
                                        msg: "Please login to continue".tr(),
                                        toastLength: Toast.LENGTH_SHORT,
                                        gravity: ToastGravity.TOP,
                                        timeInSecForIosWeb: 1,
                                        fontSize: 14.0);
                                  });
                                } else {
                                  Analytics().trackProductWishlist(
                                      widget.productsModel.productID,
                                      widget.productsModel.name);
                                  addToFavorite(ProductsModel(
                                      productID: widget.productsModel.productID,
                                      quantity: 0,
                                      selected: '',
                                      description:
                                          widget.productsModel.description,
                                      marketID: widget.marketID,
                                      marketName:
                                          widget.productsModel.marketName,
                                      uid: widget.productsModel.uid,
                                      name: widget.productsModel.name,
                                      category: widget.productsModel.category,
                                      subCategory:
                                          widget.productsModel.subCategory,
                                      subSubCategory:
                                          widget.productsModel.subSubCategory,
                                      image1: widget.productsModel.image1,
                                      image2: widget.productsModel.image2,
                                      image3: widget.productsModel.image3,
                                      unitname1: widget.productsModel.unitname1,
                                      unitname2: widget.productsModel.unitname2,
                                      unitname3: widget.productsModel.unitname3,
                                      unitname4: widget.productsModel.unitname4,
                                      unitname5: widget.productsModel.unitname5,
                                      unitname6: widget.productsModel.unitname6,
                                      unitname7: widget.productsModel.unitname7,
                                      unitPrice1:
                                          widget.productsModel.unitPrice1,
                                      unitPrice2:
                                          widget.productsModel.unitPrice2,
                                      unitPrice3:
                                          widget.productsModel.unitPrice3,
                                      unitPrice4:
                                          widget.productsModel.unitPrice4,
                                      unitPrice5:
                                          widget.productsModel.unitPrice5,
                                      unitPrice6:
                                          widget.productsModel.unitPrice6,
                                      unitPrice7:
                                          widget.productsModel.unitPrice7,
                                      unitOldPrice1:
                                          widget.productsModel.unitOldPrice1,
                                      unitOldPrice2:
                                          widget.productsModel.unitOldPrice2,
                                      unitOldPrice3:
                                          widget.productsModel.unitOldPrice3,
                                      unitOldPrice4:
                                          widget.productsModel.unitOldPrice4,
                                      unitOldPrice5:
                                          widget.productsModel.unitOldPrice5,
                                      unitOldPrice6:
                                          widget.productsModel.unitOldPrice6,
                                      unitOldPrice7:
                                          widget.productsModel.unitOldPrice7,
                                      percantageDiscount: widget
                                          .productsModel.percantageDiscount,
                                      vendorId: widget.productsModel.vendorId,
                                      brandName: widget.productsModel.brandName,
                                      totalNumberOfUserRating: widget
                                          .productsModel
                                          .totalNumberOfUserRating,
                                      totalRating:
                                          widget.productsModel.totalRating));
                                }
                              },
                              child: const Icon(Icons.favorite,
                                  color: Colors.grey, size: 30)),
                      widget.productsModel.quantity == 0
                          ? SizedBox(
                              width: MediaQuery.of(context).size.width * 0.7,
                              child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor:
                                          Color.fromARGB(255, 47, 37, 37)),
                                  onPressed: null,
                                  child: const Text('Sold Out')),
                            )
                          : SizedBox(
                              width: MediaQuery.of(context).size.width / 1.2,
                              child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor:
                                          Color.fromARGB(255, 47, 37, 37)),
                                  onPressed: () {
                                    if (userRef == null) {
                                      Navigator.of(context)
                                          .pushNamed('/login')
                                          .then((value) {
                                        Fluttertoast.showToast(
                                            msg:
                                                "Please login to continue".tr(),
                                            toastLength: Toast.LENGTH_SHORT,
                                            gravity: ToastGravity.TOP,
                                            timeInSecForIosWeb: 1,
                                            fontSize: 14.0);
                                      });
                                    } else {
                                      if (currentMarketID == '') {
                                        addToCart(ProductsModel(
                                            totalNumberOfUserRating: widget
                                                .productsModel
                                                .totalNumberOfUserRating,
                                            totalRating: widget
                                                .productsModel.totalRating,
                                            productID:
                                                widget.productsModel.productID,
                                            price: selectedPriceFunction(),
                                            selectedPrice: selectedPrice(),
                                            quantity: quantity,
                                            selected: selectedUnitFunction(),
                                            description: widget
                                                .productsModel.description,
                                            marketID: widget.marketID,
                                            marketName:
                                                widget.productsModel.marketName,
                                            uid: widget.productsModel.uid,
                                            name: widget.productsModel.name,
                                            category:
                                                widget.productsModel.category,
                                            subCategory: widget
                                                .productsModel.subCategory,
                                            subSubCategory: widget
                                                .productsModel.subSubCategory,
                                            image1: widget.productsModel.image1,
                                            image2: widget.productsModel.image2,
                                            image3: widget.productsModel.image3,
                                            unitname1:
                                                widget.productsModel.unitname1,
                                            unitname2:
                                                widget.productsModel.unitname2,
                                            unitname3:
                                                widget.productsModel.unitname3,
                                            unitname4:
                                                widget.productsModel.unitname4,
                                            unitname5:
                                                widget.productsModel.unitname5,
                                            unitname6:
                                                widget.productsModel.unitname6,
                                            unitname7:
                                                widget.productsModel.unitname7,
                                            unitPrice1:
                                                widget.productsModel.unitPrice1,
                                            unitPrice2:
                                                widget.productsModel.unitPrice2,
                                            unitPrice3:
                                                widget.productsModel.unitPrice3,
                                            unitPrice4:
                                                widget.productsModel.unitPrice4,
                                            unitPrice5:
                                                widget.productsModel.unitPrice5,
                                            unitPrice6:
                                                widget.productsModel.unitPrice6,
                                            unitPrice7:
                                                widget.productsModel.unitPrice7,
                                            unitOldPrice1: widget.productsModel.unitOldPrice1,
                                            unitOldPrice2: widget.productsModel.unitOldPrice2,
                                            unitOldPrice3: widget.productsModel.unitOldPrice3,
                                            unitOldPrice4: widget.productsModel.unitOldPrice4,
                                            unitOldPrice5: widget.productsModel.unitOldPrice5,
                                            unitOldPrice6: widget.productsModel.unitOldPrice6,
                                            unitOldPrice7: widget.productsModel.unitOldPrice7,
                                            percantageDiscount: widget.productsModel.percantageDiscount,
                                            vendorId: widget.productsModel.vendorId,
                                            brandName: widget.productsModel.brandName));
                                      } else if (currentMarketID ==
                                          widget.marketID) {
                                        addToCart(ProductsModel(
                                            totalNumberOfUserRating: widget
                                                .productsModel
                                                .totalNumberOfUserRating,
                                            totalRating: widget
                                                .productsModel.totalRating,
                                            productID:
                                                widget.productsModel.productID,
                                            selectedPrice: selectedPrice(),
                                            price: selectedPriceFunction(),
                                            quantity: quantity,
                                            selected: selectedUnitFunction(),
                                            description: widget
                                                .productsModel.description,
                                            marketID: widget.marketID,
                                            marketName:
                                                widget.productsModel.marketName,
                                            uid: widget.productsModel.uid,
                                            name: widget.productsModel.name,
                                            category:
                                                widget.productsModel.category,
                                            subCategory: widget
                                                .productsModel.subCategory,
                                            subSubCategory: widget
                                                .productsModel.subSubCategory,
                                            image1: widget.productsModel.image1,
                                            image2: widget.productsModel.image2,
                                            image3: widget.productsModel.image3,
                                            unitname1:
                                                widget.productsModel.unitname1,
                                            unitname2:
                                                widget.productsModel.unitname2,
                                            unitname3:
                                                widget.productsModel.unitname3,
                                            unitname4:
                                                widget.productsModel.unitname4,
                                            unitname5:
                                                widget.productsModel.unitname5,
                                            unitname6:
                                                widget.productsModel.unitname6,
                                            unitname7:
                                                widget.productsModel.unitname7,
                                            unitPrice1:
                                                widget.productsModel.unitPrice1,
                                            unitPrice2:
                                                widget.productsModel.unitPrice2,
                                            unitPrice3:
                                                widget.productsModel.unitPrice3,
                                            unitPrice4:
                                                widget.productsModel.unitPrice4,
                                            unitPrice5:
                                                widget.productsModel.unitPrice5,
                                            unitPrice6:
                                                widget.productsModel.unitPrice6,
                                            unitPrice7:
                                                widget.productsModel.unitPrice7,
                                            unitOldPrice1: widget.productsModel.unitOldPrice1,
                                            unitOldPrice2: widget.productsModel.unitOldPrice2,
                                            unitOldPrice3: widget.productsModel.unitOldPrice3,
                                            unitOldPrice4: widget.productsModel.unitOldPrice4,
                                            unitOldPrice5: widget.productsModel.unitOldPrice5,
                                            unitOldPrice6: widget.productsModel.unitOldPrice6,
                                            unitOldPrice7: widget.productsModel.unitOldPrice7,
                                            percantageDiscount: widget.productsModel.percantageDiscount,
                                            vendorId: widget.productsModel.vendorId,
                                            brandName: widget.productsModel.brandName));
                                      } else {
                                        showModal(
                                            configuration:
                                                const FadeScaleTransitionConfiguration(
                                                    transitionDuration:
                                                        Duration(seconds: 1)),
                                            context: context,
                                            builder: (BuildContext context) {
                                              return AlertDialog(
                                                title: Image.asset(
                                                  "assets/image/new cart.gif",
                                                  height: 200,
                                                ),
                                                content: SingleChildScrollView(
                                                  child: ListBody(
                                                    children: <Widget>[
                                                      const Text(
                                                              "Your Cart is not Empty")
                                                          .tr(),
                                                    ],
                                                  ),
                                                ),
                                                actions: <Widget>[
                                                  TextButton.icon(
                                                      onPressed: () {
                                                        Navigator.of(context)
                                                            .pop();
                                                        deleteVendorsID();
                                                        deleteCartCollection()
                                                            .then((_) {
                                                          Fluttertoast.showToast(
                                                              msg:
                                                                  "Your cart is empty"
                                                                      .tr(),
                                                              toastLength: Toast
                                                                  .LENGTH_SHORT,
                                                              gravity:
                                                                  ToastGravity
                                                                      .TOP,
                                                              timeInSecForIosWeb:
                                                                  1,
                                                              fontSize: 14.0);
                                                        });
                                                      },
                                                      icon: const Icon(
                                                          Icons.delete),
                                                      label: const Text("Empty")
                                                          .tr()),
                                                  TextButton.icon(
                                                      onPressed: () {
                                                        Navigator.of(context)
                                                            .pop();
                                                      },
                                                      icon: const Icon(
                                                          Icons.cancel),
                                                      label: const Text('No')
                                                          .tr()),
                                                ],
                                              );
                                            });
                                      }
                                    }
                                  },
                                  child: const Text('Add To Cart').tr()))
                    ]),
              )
            ]),
          )),
    );
  }
}
