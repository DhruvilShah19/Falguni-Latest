// ignore_for_file: deprecated_member_use, avoid_unnecessary_containers, curly_braces_in_flow_control_structures

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
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Model/rating.dart';
import '../Providers/analytics.dart';
import 'package:share_plus/share_plus.dart';

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
  int _currentImageIndex = 0;
  String fullname = '';
  String deliveryAddress = '';
  String address = '';

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

  void _getLocation() async {
    try {
      Position pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.low);
      List<Placemark> p =
          await placemarkFromCoordinates(pos.latitude, pos.longitude);
      if (mounted) setState(() => address = p.first.street ?? "Locating...");
    } catch (_) {}
  }

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    if (user != null) {
      setState(() {
        userRef = firestore.collection('users').doc(user.uid);
      });
    }
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
    _getLocation();
    super.initState();
  }

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    User? user = auth.currentUser;
    if (user != null) {
      firestore.collection('users').doc(user.uid).snapshots().listen((value) {
        if (mounted) {
          setState(() {
            userID = value['id'];
            fullname = value['fullname'].toString().split(' ')[0];
            deliveryAddress = value['DeliveryAddress'] ?? '';
          });
          if (userID != '') {
            getCart();
            getselectedMarket();
          }
        }
      });
    }
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

  Widget _buildGallery() {
    List<String> images = [];
    if (widget.productsModel.image1.isNotEmpty) {
      images.add(widget.productsModel.image1);
    }
    if (widget.productsModel.image2.isNotEmpty) {
      images.add(widget.productsModel.image2);
    }
    if (widget.productsModel.image3.isNotEmpty) {
      images.add(widget.productsModel.image3);
    }

    if (images.isEmpty) {
      images.add(
          'https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png');
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(20.0),
      child: Stack(
        children: [
          CarouselSlider(
            items: images.map((url) {
              return Builder(
                builder: (BuildContext context) {
                  return SizedBox(
                    width: MediaQuery.of(context).size.width,
                    child: CachedNetworkImage(
                      imageUrl: url,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Center(
                        child: SpinKitFadingCircle(
                          color: kGold,
                          size: 50.0,
                        ),
                      ),
                      errorWidget: (context, url, error) =>
                          const Icon(Icons.error),
                    ),
                  );
                },
              );
            }).toList(),
            options: CarouselOptions(
              height: double.infinity,
              viewportFraction: 1.0,
              autoPlay: images.length > 1,
              enableInfiniteScroll: images.length > 1,
              onPageChanged: (index, reason) {
                setState(() {
                  _currentImageIndex = index;
                });
              },
            ),
          ),
          if (images.length > 1)
            Positioned(
              bottom: 10,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: images.asMap().entries.map((entry) {
                  return Container(
                    width: 8.0,
                    height: 8.0,
                    margin: const EdgeInsets.symmetric(
                        vertical: 8.0, horizontal: 4.0),
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withOpacity(
                            _currentImageIndex == entry.key ? 0.9 : 0.4)),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  void _shareProduct(String productName, String productDescription) {
    final String productDetails =
        'Check out this product: $productName\nDescription: $productDescription';
    const String playStoreLink =
        'https://play.google.com/store/apps/details?id=com.Falgunigruhudhyog';
    final String message =
        '$productDetails\n\nDownload the app from the Play Store: $playStoreLink';
    Share.share(message);
  }

  Widget _buildDescriptionSection() {
    if (widget.productsModel.description.isEmpty)
      return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kGold.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.description_outlined,
                    color: kGold, size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                'Description'.tr(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            widget.productsModel.description,
            style: TextStyle(
              fontSize: 15,
              color: Colors.white.withOpacity(0.85),
              height: 1.6,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVariantTile(
      String unitKey, String name, num price, num oldPrice) {
    if (name.isEmpty) return const SizedBox.shrink();

    bool isSelected = selectedUnit == unitKey;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
      child: InkWell(
        onTap: () {
          setState(() {
            selectedUnit = unitKey;
            quantity = 1;
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isSelected
                ? kGold.withOpacity(0.15)
                : Colors.white.withOpacity(0.05),
            border: Border.all(
              color: isSelected ? kGold : Colors.white24,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? kGold : Colors.white54,
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? Center(
                        child: Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: kGold,
                          ),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  name,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontSize: 16,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${widget.currency}${Formatter().converter(price.toDouble())}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  if (widget.productsModel.percantageDiscount != 0 &&
                      oldPrice > 0)
                    Text(
                      '${widget.currency}${Formatter().converter(oldPrice.toDouble())}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white54,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReviewsSection() {
    return FutureBuilder<List<RatingModel>>(
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
                                errorWidget: (context, url, error) =>
                                    const Icon(Icons.error),
                              ))
                            : ClipOval(
                                child: CachedNetworkImage(
                                  height: 35,
                                  fit: BoxFit.cover,
                                  width: 35,
                                  imageUrl: ratingModel.profilePicture,
                                  placeholder: (context, url) =>
                                      const SpinKitFadingCircle(
                                    color: Colors.orange,
                                    size: 30,
                                  ),
                                  errorWidget: (context, url, error) =>
                                      const Icon(Icons.error),
                                ),
                              ),
                        title: Text(ratingModel.fullname,
                            style: const TextStyle(color: Colors.white)),
                        subtitle: RatingBarIndicator(
                          rating: ratingModel.rating.toDouble(),
                          itemBuilder: (context, index) => const Icon(
                            Icons.star,
                            color: kGold,
                          ),
                          itemCount: 5,
                          itemSize: 15,
                          direction: Axis.horizontal,
                        ),
                        trailing: Text(ratingModel.timeCreated,
                            style: const TextStyle(color: Colors.white54)),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 20, right: 20),
                        child: Container(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            ratingModel.review,
                            textAlign: TextAlign.left,
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ),
                      ),
                    ],
                  );
                });
          } else {
            return const Center(child: CircularProgressIndicator());
          }
        });
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
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                  height: MediaQuery.of(context).size.height / 2.5,
                  width: double.infinity,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: _buildGallery(),
                  )),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                        '${widget.currency}${Formatter().converter(widget.productsModel.unitPrice1.toDouble())}',
                        style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: kGold)),
                    IconButton(
                      icon: const Icon(Icons.share, color: Colors.white),
                      onPressed: () {
                        _shareProduct(widget.productsModel.name,
                            widget.productsModel.description);
                      },
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    RatingBarIndicator(
                      rating:
                          totalUser == 0 ? 0 : getRatingAndReview().toDouble(),
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
              if (widget.productsModel.percantageDiscount != 0)
                Padding(
                  padding: const EdgeInsets.only(left: 16, top: 5),
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
              _buildDescriptionSection(),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: SizedBox(
                  width: double.infinity,
                  child: const Text('Select Variant',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white))
                      .tr(),
                ),
              ),
              _buildVariantTile(
                  'unit1',
                  widget.productsModel.unitname1,
                  widget.productsModel.unitPrice1,
                  widget.productsModel.unitOldPrice1),
              _buildVariantTile(
                  'unit2',
                  widget.productsModel.unitname2,
                  widget.productsModel.unitPrice2,
                  widget.productsModel.unitOldPrice2),
              _buildVariantTile(
                  'unit3',
                  widget.productsModel.unitname3,
                  widget.productsModel.unitPrice3,
                  widget.productsModel.unitOldPrice3),
              _buildVariantTile(
                  'unit4',
                  widget.productsModel.unitname4,
                  widget.productsModel.unitPrice4,
                  widget.productsModel.unitOldPrice4),
              _buildVariantTile(
                  'unit5',
                  widget.productsModel.unitname5,
                  widget.productsModel.unitPrice5,
                  widget.productsModel.unitOldPrice5),
              _buildVariantTile(
                  'unit6',
                  widget.productsModel.unitname6,
                  widget.productsModel.unitPrice6,
                  widget.productsModel.unitOldPrice6),
              _buildVariantTile(
                  'unit7',
                  widget.productsModel.unitname7,
                  widget.productsModel.unitPrice7,
                  widget.productsModel.unitOldPrice7),
              const SizedBox(height: 20),
              ratingStatus == false
                  ? const SizedBox()
                  : Padding(
                      padding: const EdgeInsets.all(16.0),
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
              _buildReviewsSection(),
              const SizedBox(height: 120),
            ],
          ),
        ),
      ),
      appBar: AppBar(
        backgroundColor: kBgTop,
        elevation: 0,
        centerTitle: true,
        title: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            widget.productsModel.name,
            style: const TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
          ),
        ),
        leading: IconButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          icon: const Icon(
            Icons.arrow_back,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              if (userRef == null) {
                Navigator.of(context).pushNamed('/login');
              } else {
                Navigator.of(context).pushNamed('/cart');
              }
            },
            icon: Badge(
              badgeStyle: const BadgeStyle(badgeColor: kGold),
              badgeContent: Text(cartQuantity.toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 10)),
              child:
                  const Icon(Icons.shopping_bag_outlined, color: Colors.white),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        decoration: BoxDecoration(
          color: kBgTop,
          // borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Quantity'.tr(),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: kGold.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () {
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
                        icon: const Icon(Icons.remove, color: Colors.white),
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.all(12),
                        iconSize: 20,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          quantity.toString(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: kGold,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
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
                        icon: const Icon(Icons.add, color: Colors.white),
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.all(12),
                        iconSize: 20,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: IconButton(
                    onPressed: () {
                      if (userRef == null) {
                        Navigator.of(context).pushNamed('/login').then((value) {
                          Fluttertoast.showToast(
                              msg: "Please login to continue".tr(),
                              toastLength: Toast.LENGTH_SHORT,
                              gravity: ToastGravity.TOP,
                              timeInSecForIosWeb: 1,
                              fontSize: 14.0);
                        });
                      } else {
                        if (isFavorite) {
                          removeFromFavorite();
                        } else {
                          Analytics().trackProductWishlist(
                              widget.productsModel.productID,
                              widget.productsModel.name);
                          addToFavorite(ProductsModel(
                              productID: widget.productsModel.productID,
                              quantity: 0,
                              selected: '',
                              description: widget.productsModel.description,
                              marketID: widget.marketID,
                              marketName: widget.productsModel.marketName,
                              uid: widget.productsModel.uid,
                              name: widget.productsModel.name,
                              category: widget.productsModel.category,
                              subCategory: widget.productsModel.subCategory,
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
                              unitPrice1: widget.productsModel.unitPrice1,
                              unitPrice2: widget.productsModel.unitPrice2,
                              unitPrice3: widget.productsModel.unitPrice3,
                              unitPrice4: widget.productsModel.unitPrice4,
                              unitPrice5: widget.productsModel.unitPrice5,
                              unitPrice6: widget.productsModel.unitPrice6,
                              unitPrice7: widget.productsModel.unitPrice7,
                              unitOldPrice1: widget.productsModel.unitOldPrice1,
                              unitOldPrice2: widget.productsModel.unitOldPrice2,
                              unitOldPrice3: widget.productsModel.unitOldPrice3,
                              unitOldPrice4: widget.productsModel.unitOldPrice4,
                              unitOldPrice5: widget.productsModel.unitOldPrice5,
                              unitOldPrice6: widget.productsModel.unitOldPrice6,
                              unitOldPrice7: widget.productsModel.unitOldPrice7,
                              percantageDiscount:
                                  widget.productsModel.percantageDiscount,
                              vendorId: widget.productsModel.vendorId,
                              brandName: widget.productsModel.brandName,
                              totalNumberOfUserRating:
                                  widget.productsModel.totalNumberOfUserRating,
                              totalRating: widget.productsModel.totalRating));
                        }
                      }
                    },
                    icon: Icon(
                      isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: isFavorite ? kGold : Colors.white,
                      size: 28,
                    ),
                    padding: const EdgeInsets.all(12),
                    constraints: const BoxConstraints(),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: widget.productsModel.quantity == 0
                        ? null
                        : () {
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
                              if (currentMarketID == '') {
                                addToCart(ProductsModel(
                                    totalNumberOfUserRating: widget
                                        .productsModel.totalNumberOfUserRating,
                                    totalRating:
                                        widget.productsModel.totalRating,
                                    productID: widget.productsModel.productID,
                                    price: selectedPriceFunction(),
                                    selectedPrice: selectedPrice(),
                                    quantity: quantity,
                                    selected: selectedUnitFunction(),
                                    description:
                                        widget.productsModel.description,
                                    marketID: widget.marketID,
                                    marketName: widget.productsModel.marketName,
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
                                    unitPrice1: widget.productsModel.unitPrice1,
                                    unitPrice2: widget.productsModel.unitPrice2,
                                    unitPrice3: widget.productsModel.unitPrice3,
                                    unitPrice4: widget.productsModel.unitPrice4,
                                    unitPrice5: widget.productsModel.unitPrice5,
                                    unitPrice6: widget.productsModel.unitPrice6,
                                    unitPrice7: widget.productsModel.unitPrice7,
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
                                    percantageDiscount:
                                        widget.productsModel.percantageDiscount,
                                    vendorId: widget.productsModel.vendorId,
                                    brandName: widget.productsModel.brandName));
                              } else if (currentMarketID == widget.marketID) {
                                addToCart(ProductsModel(
                                    totalNumberOfUserRating: widget
                                        .productsModel.totalNumberOfUserRating,
                                    totalRating:
                                        widget.productsModel.totalRating,
                                    productID: widget.productsModel.productID,
                                    selectedPrice: selectedPrice(),
                                    price: selectedPriceFunction(),
                                    quantity: quantity,
                                    selected: selectedUnitFunction(),
                                    description:
                                        widget.productsModel.description,
                                    marketID: widget.marketID,
                                    marketName: widget.productsModel.marketName,
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
                                    unitPrice1: widget.productsModel.unitPrice1,
                                    unitPrice2: widget.productsModel.unitPrice2,
                                    unitPrice3: widget.productsModel.unitPrice3,
                                    unitPrice4: widget.productsModel.unitPrice4,
                                    unitPrice5: widget.productsModel.unitPrice5,
                                    unitPrice6: widget.productsModel.unitPrice6,
                                    unitPrice7: widget.productsModel.unitPrice7,
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
                                    percantageDiscount:
                                        widget.productsModel.percantageDiscount,
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
                                                Navigator.of(context).pop();
                                                deleteVendorsID();
                                                deleteCartCollection()
                                                    .then((_) {
                                                  Fluttertoast.showToast(
                                                      msg: "Your cart is empty"
                                                          .tr(),
                                                      toastLength:
                                                          Toast.LENGTH_SHORT,
                                                      gravity: ToastGravity.TOP,
                                                      timeInSecForIosWeb: 1,
                                                      fontSize: 14.0);
                                                });
                                              },
                                              icon: const Icon(Icons.delete),
                                              label: const Text("Empty").tr()),
                                          TextButton.icon(
                                              onPressed: () {
                                                Navigator.of(context).pop();
                                              },
                                              icon: const Icon(Icons.cancel),
                                              label: const Text('No').tr()),
                                        ],
                                      );
                                    });
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      foregroundColor: kBgTop,
                      disabledBackgroundColor: Colors.grey,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      widget.productsModel.quantity == 0
                          ? 'Sold Out'
                          : 'Add To Cart',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ).tr(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
