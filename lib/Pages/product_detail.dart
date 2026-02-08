// ignore_for_file: deprecated_member_use, avoid_unnecessary_containers

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
import 'package:share_plus/share_plus.dart';
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

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

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
    final String productDetails =
        'Check out this product: $productName\nDescription: $productDescription';

    final String deepLink =
        'falgunigruhudhyog://product?name=${Uri.encodeComponent(productName)}&description=${Uri.encodeComponent(productDescription)}';
    const String playStoreLink =
        'https://play.google.com/store/apps/details?id=com.Falgunigruhudhyog';

    if (await canLaunch(deepLink)) {
      await launch(deepLink);
    } else {
      final String message =
          '$productDetails\n\nDownload the app from the Play Store: $playStoreLink';
      Share.share(message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgTop,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: CustomScrollView(slivers: [
          SliverAppBar(
            iconTheme: Theme.of(context).iconTheme,
            titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
            backgroundColor: kBgTop,
            snap: true,
            elevation: 0,
            centerTitle: true,
            pinned: true,
            floating: true,
            automaticallyImplyLeading: false,
            leading: Align(
                alignment: Alignment.topLeft,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      height: 40,
                      width: 40,
                      decoration: const BoxDecoration(
                          shape: BoxShape.circle, color: Colors.black26),
                      child: const Icon(
                        Icons.cancel,
                        color: Colors.white,
                      ),
                    ),
                  ),
                )),
            actions: [
              Align(
                  alignment: Alignment.topRight,
                  child: InkWell(
                    onTap: () {
                      if (userRef == null) {
                        Navigator.of(context).pushNamed('/login');
                      } else {
                        Navigator.of(context).pushNamed('/cart');
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Container(
                        height: 40,
                        width: 40,
                        decoration: const BoxDecoration(
                            shape: BoxShape.circle, color: Colors.black26),
                        child: Center(
                          child: Badge(
                            badgeStyle: const BadgeStyle(
                              badgeColor: kGold,
                            ),
                            badgeContent: Text(cartQuantity.toString(),
                                style: const TextStyle(
                                    color: Colors.white, fontSize: 10)),
                            child: const Icon(
                              Icons.shopping_cart,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ))
            ],
            expandedHeight: MediaQuery.of(context).size.height / 2.5,
            flexibleSpace: FlexibleSpaceBar(
              background: SizedBox(
                  height: MediaQuery.of(context).size.height / 2.5,
                  width: double.infinity,
                  child: Container(
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(
                          bottomRight: Radius.circular(40.0),
                          bottomLeft: Radius.circular(40.0)),
                    ),
                    child: CarouselSlider(
                      // indicatorBgPadding: 10,
                      // dotSize: 5,
                      // animationDuration: const Duration(seconds: 10),
                      // showIndicator: true,
                      items: [
                        widget.productsModel.image1 == ''
                            ? Image.network(
                                'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
                                fit: BoxFit.cover)
                            : Image.network(widget.productsModel.image1),
                        widget.productsModel.image2 == ''
                            ? Image.network(
                                'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
                                fit: BoxFit.cover)
                            : Image.network(widget.productsModel.image2),
                        widget.productsModel.image3 == ''
                            ? Image.network(
                                'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png',
                                fit: BoxFit.cover)
                            : Image.network(widget.productsModel.image3),
                      ],
                      options: CarouselOptions(),
                    ),
                  )),
            ),
          ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment
                      .spaceBetween, // Aligns items within the row
                  children: [
                    Expanded(
                      // Expands the child to take available space
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          widget.productsModel.name,
                          maxLines: 2,
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white),
                          textAlign: TextAlign.start,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.share, color: Colors.white),
                      onPressed: () {
                        _shareProduct(widget.productsModel.name,
                            widget.productsModel.description);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                          '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice1.toDouble())}',
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: kGold)),
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Row(
                          children: [
                            RatingBarIndicator(
                              rating: totalUser == 0
                                  ? 0
                                  : getRatingAndReview().toDouble(),
                              itemBuilder: (context, index) => const Icon(
                                Icons.star,
                                color: kGold,
                              ),
                              itemCount: 5,
                              itemSize: 20,
                              direction: Axis.horizontal,
                            ),
                            const SizedBox(width: 5),
                            Text('(${totalUser.toString()})',
                                style: const TextStyle(color: Colors.white54)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 5),
                if (widget.productsModel.percantageDiscount != 0)
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Row(
                      children: [
                        Text(
                          '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice1.toDouble())}',
                          style: const TextStyle(
                              fontSize: 16,
                              color: Colors.white54,
                              decoration: TextDecoration.lineThrough),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          '-${widget.productsModel.percantageDiscount.toString()}',
                          style: const TextStyle(
                            fontSize: 16,
                            color: kGold,
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: SizedBox(
                      width: double.infinity,
                      child: Text(widget.productsModel.description,
                          style: const TextStyle(color: Colors.white70))),
                ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: SizedBox(
                    width: double.infinity,
                    child: const Text('Other Variants',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white))
                        .tr(),
                  ),
                ),
                InkWell(
                  onTap: () {
                    setState(() {
                      selectedUnit = 'unit1';
                      quantity = 1;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(left: 10, right: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                selectedUnit == 'unit1'
                                    ? const Row(
                                        children: [
                                          Icon(
                                            Icons.check_outlined,
                                            color: kGold,
                                          ),
                                          SizedBox(
                                            width: 10,
                                          ),
                                        ],
                                      )
                                    : Container(),
                                Text(widget.productsModel.unitname1,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 18,
                                    )),
                              ],
                            ),
                            Row(children: [
                              Text(
                                  '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice1.toDouble())}',
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white)),
                              const SizedBox(width: 5),
                              if (widget.productsModel.percantageDiscount != 0)
                                Text(
                                  '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice1.toDouble())}',
                                  style: const TextStyle(
                                      fontSize: 15,
                                      color: Colors.white54,
                                      decoration: TextDecoration.lineThrough),
                                ),
                            ])
                          ]),
                    ),
                  ),
                ),
                widget.productsModel.unitname2 == ''
                    ? Container()
                    : InkWell(
                        onTap: () {
                          setState(() {
                            selectedUnit = 'unit2';
                            quantity = 1;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10, right: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      selectedUnit == 'unit2'
                                          ? const Row(
                                              children: [
                                                Icon(
                                                  Icons.check_outlined,
                                                  color: kGold,
                                                ),
                                                SizedBox(
                                                  width: 10,
                                                ),
                                              ],
                                            )
                                          : Container(),
                                      Text(widget.productsModel.unitname2,
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 18,
                                          )),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice2.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white)),
                                    const SizedBox(width: 5),
                                    if (widget
                                            .productsModel.percantageDiscount !=
                                        0)
                                      Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice2.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: Colors.white54,
                                            decoration:
                                                TextDecoration.lineThrough),
                                      ),
                                  ])
                                ]),
                          ),
                        ),
                      ),
                widget.productsModel.unitname3 == ''
                    ? Container()
                    : InkWell(
                        onTap: () {
                          setState(() {
                            selectedUnit = 'unit3';
                            quantity = 1;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10, right: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      selectedUnit == 'unit3'
                                          ? const Row(
                                              children: [
                                                Icon(
                                                  Icons.check_outlined,
                                                  color: kGold,
                                                ),
                                                SizedBox(
                                                  width: 10,
                                                ),
                                              ],
                                            )
                                          : Container(),
                                      Text(widget.productsModel.unitname3,
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 18,
                                          )),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice3.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white)),
                                    const SizedBox(width: 5),
                                    if (widget
                                            .productsModel.percantageDiscount !=
                                        0)
                                      Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice3.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: Colors.white54,
                                            decoration:
                                                TextDecoration.lineThrough),
                                      ),
                                  ])
                                ]),
                          ),
                        ),
                      ),
                widget.productsModel.unitname4 == ''
                    ? Container()
                    : InkWell(
                        onTap: () {
                          setState(() {
                            selectedUnit = 'unit4';
                            quantity = 1;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10, right: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      selectedUnit == 'unit4'
                                          ? const Row(
                                              children: [
                                                Icon(
                                                  Icons.check_outlined,
                                                  color: kGold,
                                                ),
                                                SizedBox(
                                                  width: 10,
                                                ),
                                              ],
                                            )
                                          : Container(),
                                      Text(widget.productsModel.unitname4,
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 18,
                                          )),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice4.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white)),
                                    const SizedBox(width: 5),
                                    if (widget
                                            .productsModel.percantageDiscount !=
                                        0)
                                      Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice4.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: Colors.white54,
                                            decoration:
                                                TextDecoration.lineThrough),
                                      ),
                                  ])
                                ]),
                          ),
                        ),
                      ),
                widget.productsModel.unitname5 == ''
                    ? Container()
                    : InkWell(
                        onTap: () {
                          setState(() {
                            selectedUnit = 'unit5';
                            quantity = 1;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10, right: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      selectedUnit == 'unit5'
                                          ? const Row(
                                              children: [
                                                Icon(
                                                  Icons.check_outlined,
                                                  color: kGold,
                                                ),
                                                SizedBox(
                                                  width: 10,
                                                ),
                                              ],
                                            )
                                          : Container(),
                                      Text(widget.productsModel.unitname5,
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 18,
                                          )),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice5.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white)),
                                    const SizedBox(width: 5),
                                    if (widget
                                            .productsModel.percantageDiscount !=
                                        0)
                                      Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice5.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: Colors.white54,
                                            decoration:
                                                TextDecoration.lineThrough),
                                      ),
                                  ])
                                ]),
                          ),
                        ),
                      ),
                widget.productsModel.unitname6 == ''
                    ? Container()
                    : InkWell(
                        onTap: () {
                          setState(() {
                            quantity = 1;
                            selectedUnit = 'unit6';
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10, right: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      selectedUnit == 'unit6'
                                          ? const Row(
                                              children: [
                                                Icon(
                                                  Icons.check_outlined,
                                                  color: kGold,
                                                ),
                                                SizedBox(
                                                  width: 10,
                                                ),
                                              ],
                                            )
                                          : Container(),
                                      Text(widget.productsModel.unitname6,
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 18,
                                          )),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice6.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white)),
                                    const SizedBox(width: 5),
                                    if (widget
                                            .productsModel.percantageDiscount !=
                                        0)
                                      Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice6.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: Colors.white54,
                                            decoration:
                                                TextDecoration.lineThrough),
                                      ),
                                  ])
                                ]),
                          ),
                        ),
                      ),
                widget.productsModel.unitname7 == ''
                    ? Container()
                    : InkWell(
                        onTap: () {
                          setState(() {
                            selectedUnit = 'unit7';
                            quantity = 1;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10, right: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      selectedUnit == 'unit7'
                                          ? const Row(
                                              children: [
                                                Icon(
                                                  Icons.check_outlined,
                                                  color: kGold,
                                                ),
                                                SizedBox(
                                                  width: 10,
                                                ),
                                              ],
                                            )
                                          : Container(),
                                      Text(widget.productsModel.unitname7,
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 18,
                                          )),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice7.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white)),
                                    const SizedBox(width: 5),
                                    if (widget
                                            .productsModel.percantageDiscount !=
                                        0)
                                      Text(
                                        '${widget.currency}${Formatter().converter(widget.productsModel.unitOldPrice7.toDouble())}',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: Colors.white54,
                                            decoration:
                                                TextDecoration.lineThrough),
                                      ),
                                  ])
                                ]),
                          ),
                        ),
                      ),
                const SizedBox(
                  height: 20,
                ),
                ratingStatus == false
                    ? const SizedBox()
                    : Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: SizedBox(
                          width: double.infinity,
                          child: const Text('Product Reviews',
                                  style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white))
                              .tr(),
                        ),
                      ),
                FutureBuilder<List<RatingModel>>(
                    future: getRating(),
                    builder: (context, snapshot) {
                      if (snapshot.hasData) {
                        return ListView.builder(
                            shrinkWrap: true,
                            physics: const BouncingScrollPhysics(),
                            itemCount: snapshot.data!.length,
                            itemBuilder: (context, index) {
                              RatingModel ratingModel = snapshot.data![index];
                              return Column(
                                children: [
                                  ListTile(
                                    leading: ratingModel.profilePicture == ''
                                        ? ClipOval(
                                            child: CachedNetworkImage(
                                            height: 35,
                                            fit: BoxFit.cover,
                                            width: 35,
                                            imageUrl:
                                                "https://eitrawmaterials.eu/wp-content/uploads/2016/09/person-icon.png",
                                            placeholder: (context, url) =>
                                                const SpinKitFadingCircle(
                                              color: Colors.orange,
                                              size: 30,
                                            ),
                                            errorWidget:
                                                (context, url, error) =>
                                                    const Icon(Icons.error),
                                          ))
                                        : ClipOval(
                                            child: CachedNetworkImage(
                                              height: 35,
                                              fit: BoxFit.cover,
                                              width: 35,
                                              imageUrl:
                                                  ratingModel.profilePicture,
                                              placeholder: (context, url) =>
                                                  const SpinKitFadingCircle(
                                                color: Colors.orange,
                                                size: 30,
                                              ),
                                              errorWidget:
                                                  (context, url, error) =>
                                                      const Icon(Icons.error),
                                            ),
                                          ),
                                    title: Text(ratingModel.fullname,
                                        style: const TextStyle(
                                            color: Colors.white)),
                                    subtitle: RatingBarIndicator(
                                      rating: ratingModel.rating.toDouble(),
                                      itemBuilder: (context, index) =>
                                          const Icon(
                                        Icons.star,
                                        color: kGold,
                                      ),
                                      itemCount: 5,
                                      itemSize: 15,
                                      direction: Axis.horizontal,
                                    ),
                                    trailing: Text(ratingModel.timeCreated,
                                        style: const TextStyle(
                                            color: Colors.white54)),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        left: 20, right: 20),
                                    child: Container(
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        ratingModel.review,
                                        textAlign: TextAlign.left,
                                        style: const TextStyle(
                                            color: Colors.white70),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            });
                      } else {
                        return const Center(child: CircularProgressIndicator());
                      }
                    }),
                const SizedBox(
                  height: 120,
                )
              ],
            ),
          )
        ]),
      ),
      bottomSheet: Container(
          height: 120,
          width: double.infinity,
          color: kBgTop,
          child: Container(
            child: Column(children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quantity',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: Colors.white))
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
                                size: 25, color: Colors.white)),
                        const SizedBox(width: 20),
                        Text(quantity.toString(),
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                color: Colors.white)),
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
                                size: 25, color: Colors.white)),
                      ])
                    ]),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
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
                                  color: kGold, size: 30))
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
                                  color: Colors.white54, size: 30)),
                      widget.productsModel.quantity == 0
                          ? SizedBox(
                              width: MediaQuery.of(context).size.width / 2,
                              child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: kGold),
                                  onPressed: null,
                                  child: const Text('Sold Out')),
                            )
                          : SizedBox(
                              width: MediaQuery.of(context).size.width / 1.2,
                              child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: kGold),
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
                                  child: const Text('Add To Cart',
                                          style: TextStyle(
                                              color: kBgTop,
                                              fontWeight: FontWeight.bold))
                                      .tr()))
                    ]),
              )
            ]),
          )),
    );
  }
}
