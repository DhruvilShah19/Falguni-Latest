// ignore_for_file: deprecated_member_use, use_build_context_synchronously, unused_element

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shimmer/shimmer.dart';
import 'package:falguni_app/Providers/analytics.dart';
import 'package:falguni_app/Providers/global_config.dart';

import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Model/coupon.dart';
import 'product_detail.dart';

class CartPage extends StatefulWidget {
  final bool isbottomNav;
  const CartPage({super.key, required this.isbottomNav});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  DocumentReference? userRef;
  bool showBottomSheet = true;
  bool showBottomSheetOnLoading = false;
  String currencySymbol = '';
  num subTotal = 0;
  num originalSubTotal = 0;
  num deliveryFee = 0;
  num couponReward = 0;
  bool couponStatus = false;
  bool pleaseWait = false;

  // Design constants
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  Future<List<ProductsModel>> getMyCart() {
    return userRef!.collection('Cart').get().then((snapshot) {
      if (snapshot.docs.isEmpty) {
        userRef!.update({'deliveryFee': 0}).then((value) {
          setState(() {
            showBottomSheet = false;
          });
        });
      }

      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  getSubTotal() {
    userRef!.collection('Cart').snapshots().listen((val) {
      num tempTotal = val.docs.fold(0, (tot, doc) => tot + doc.data()['price']);

      setState(() {
        originalSubTotal = tempTotal;
        subTotal = tempTotal -
            (couponStatus == true && couponReward != 0
                ? (couponReward * tempTotal / 100)
                : 0);
      });
    });
  }

  String coupon = '';
  getCouponStatus() {
    FirebaseFirestore.instance
        .collection('Coupon System')
        .doc('Coupon System')
        .snapshots()
        .listen((value) {
      setState(() {
        couponStatus = value['Status'];
      });
      getSubTotal();
    });
  }

  getCurrencySymbol() {
    setState(() {
      currencySymbol = GlobalConfig.currencySymbol;
    });
  }

  getDeliveryFee() {
    userRef!.snapshots().listen((val) {
      setState(() {
        //deliveryFee = val['deliveryFee'];
        couponReward = val["Coupon Reward"];
      });
    });
  }

  void _applyCoupon() {
    if (coupon.trim().isEmpty) {
      Fluttertoast.showToast(
        msg: "Enter coupon code".tr(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
      );
      return;
    }

    setState(() {
      pleaseWait = true;
    });

    FirebaseFirestore.instance
        .collection('Coupons')
        .where('coupon', isEqualTo: coupon.trim())
        .get()
        .then((value) {
      if (value.docs.isNotEmpty) {
        for (var item in value.docs) {
          userRef!.update({'Coupon Reward': item['percentage']}).then((val) {
            setState(() {
              pleaseWait = false;
              couponReward = item['percentage'];
              coupon = '';
            });
            // Recalculate subtotal immediately with discount
            getSubTotal();
            Fluttertoast.showToast(
              msg: "Coupon applied!".tr(),
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.TOP,
              timeInSecForIosWeb: 1,
              fontSize: 14.0,
            );
          });
        }
      } else {
        setState(() {
          pleaseWait = false;
        });
        Fluttertoast.showToast(
          msg: "Invalid coupon code".tr(),
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          fontSize: 14.0,
        );
      }
    });
  }

  void _removeCoupon() {
    setState(() {
      pleaseWait = true;
    });

    userRef!.update({'Coupon Reward': 0}).then((val) {
      setState(() {
        pleaseWait = false;
        couponReward = 0;
      });
      // Recalculate subtotal without discount
      getSubTotal();
      Fluttertoast.showToast(
        msg: "Coupon removed successfully".tr(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        fontSize: 14.0,
      );
    }).catchError((error) {
      setState(() {
        pleaseWait = false;
      });
      Fluttertoast.showToast(
        msg: "Error removing coupon".tr(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
      );
    });
  }

  @override
  void initState() {
    getCurrencySymbol();
    _getUserDoc();
    getCouponStatus();
    getDeliveryFee();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
          automaticallyImplyLeading: widget.isbottomNav == true ? false : true,
          backgroundColor: Colors.transparent,
          elevation: 0,
          iconTheme: const IconThemeData(color: kGold),
          centerTitle: true,
          title: const Text(
            'Shopping Cart',
            style: TextStyle(
                color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
          ).tr()),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: FutureBuilder<List<ProductsModel>>(
            future: getMyCart(),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return const Column(
                  children: [
                    SizedBox(height: 10),
                    Text('Something went wrong'),
                  ],
                );
              }

              if (!snapshot.hasData) {
                return Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  enabled: true,
                  child: ListView.builder(
                    shrinkWrap: true,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 16),
                    itemBuilder: (_, __) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Container(
                        height: 100,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(18),
                        ),
                      ),
                    ),
                    itemCount: 5,
                  ),
                );
              }
              return snapshot.data?.isEmpty ?? true
                  ? SingleChildScrollView(
                      child: SizedBox(
                        height: MediaQuery.of(context).size.height - 100,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Empty Icon Circle with animation
                            Container(
                              width: 140,
                              height: 140,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    kGold.withOpacity(0.25),
                                    kGold.withOpacity(0.08),
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                border: Border.all(
                                  color: kGold.withOpacity(0.4),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: kGold.withOpacity(0.2),
                                    blurRadius: 30,
                                    offset: const Offset(0, 10),
                                  )
                                ],
                              ),
                              child: const Icon(
                                Icons.shopping_cart_outlined,
                                size: 70,
                                color: kGold,
                              ),
                            ),
                            const SizedBox(height: 40),
                            const Text(
                              'Your cart is empty',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.5,
                              ),
                            ).tr(),
                            const SizedBox(height: 16),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 32),
                              child: Text(
                                'Explore our collection and add your favorite items to get started!',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white60,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                  height: 1.6,
                                ),
                              ),
                            ),
                            const SizedBox(height: 48),
                            // Featured items hint with better styling
                            Container(
                              margin: const EdgeInsets.symmetric(
                                  horizontal: 24, vertical: 16),
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    kGold.withOpacity(0.15),
                                    kGold.withOpacity(0.05),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: kGold.withOpacity(0.3),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: kGold.withOpacity(0.1),
                                    blurRadius: 20,
                                    offset: const Offset(0, 10),
                                  )
                                ],
                              ),
                              child: const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.local_offer_rounded,
                                          color: kGold, size: 18),
                                      SizedBox(width: 8),
                                      Text(
                                        'Exclusive Offers',
                                        style: TextStyle(
                                          color: kGold,
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 8),
                                  Text(
                                    'Browse premium collection with amazing deals',
                                    style: TextStyle(
                                      color: Colors.white60,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w400,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 32),
                            // Enhanced CTA Button
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [kGold, kGold.withOpacity(0.85)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: kGold.withOpacity(0.4),
                                    blurRadius: 24,
                                    offset: const Offset(0, 12),
                                  )
                                ],
                              ),
                              child: SizedBox(
                                width: 280,
                                height: 56,
                                child: Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(16),
                                    onTap: () {
                                      Navigator.of(context)
                                          .pushNamed('/bottomNav');
                                    },
                                    child: const Center(
                                      child: Text(
                                        'Start Shopping',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : Stack(
                      children: [
                        // Scrollable Content
                        SingleChildScrollView(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Header with item count
                              Padding(
                                padding: const EdgeInsets.only(bottom: 20),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          '${snapshot.data!.length} ${snapshot.data!.length == 1 ? 'Item' : 'Items'}',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 28,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: -0.5,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Ready to checkout',
                                          style: TextStyle(
                                            color:
                                                Colors.white.withOpacity(0.6),
                                            fontSize: 13,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 8),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.green.withOpacity(0.3),
                                            Colors.green.withOpacity(0.1),
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(
                                            color:
                                                Colors.green.withOpacity(0.5),
                                            width: 1.2),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.check_circle_rounded,
                                              size: 16, color: Colors.green),
                                          SizedBox(width: 6),
                                          Text(
                                            'Active',
                                            style: TextStyle(
                                              color: Colors.green,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Cart Items
                              ListView.builder(
                                itemCount: snapshot.data!.length,
                                physics: const NeverScrollableScrollPhysics(),
                                shrinkWrap: true,
                                itemBuilder:
                                    (BuildContext buildContext, int index) {
                                  ProductsModel productModel =
                                      snapshot.data![index];
                                  return _buildCartItemCard(productModel);
                                },
                              ),
                              const SizedBox(height: 28),
                              _buildPricingSummary(),
                              const SizedBox(height: 16),
                              if (couponStatus == true && couponReward == 0)
                                _buildCouponAndOffersBox(),
                              if (couponStatus == true && couponReward > 0)
                                _buildReferralBox(),
                              if (couponStatus == true)
                                const SizedBox(height: 16),
                              // Extra bottom padding to avoid button overlap
                              const SizedBox(height: 80),
                            ],
                          ),
                        ),
                        // Sticky Checkout Button at Bottom
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.black.withOpacity(0),
                                  Colors.black.withOpacity(0.8),
                                  Colors.black.withOpacity(0.95),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                            ),
                            padding: EdgeInsets.fromLTRB(
                              16,
                              24,
                              16,
                              16 + MediaQuery.of(context).padding.bottom,
                            ),
                            child: _buildCheckoutButton(),
                          ),
                        ),
                      ],
                    );
            },
          ),
        ),
      ),
      bottomSheet: null,
    );
  }

  // Premium Pricing Summary Widget
  Widget _buildPricingSummary() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.08),
            Colors.white.withOpacity(0.03),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: kGold.withOpacity(0.15),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildPricingRow(
            label: 'Subtotal',
            amount:
                '$currencySymbol${Formatter().converter(subTotal.toDouble())}',
            isSubtitle: true,
          ),
          const SizedBox(height: 14),
          Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  kGold.withOpacity(0.2),
                  kGold.withOpacity(0.05),
                  kGold.withOpacity(0.2),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Amount',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.75),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ).tr(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (couponReward > 0)
                    Text(
                      '$currencySymbol${Formatter().converter((deliveryFee + originalSubTotal).toDouble())}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.lineThrough,
                        decorationColor: Colors.white.withOpacity(0.5),
                        letterSpacing: -0.2,
                      ),
                    ),
                  if (couponReward > 0) const SizedBox(height: 4),
                  Text(
                    '$currencySymbol${Formatter().converter((deliveryFee + subTotal).toDouble())}',
                    style: const TextStyle(
                      color: kGold,
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (couponReward > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.green.withOpacity(0.15),
                    Colors.green.withOpacity(0.08),
                  ],
                ),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Colors.green.withOpacity(0.4),
                  width: 1.2,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.trending_down_rounded,
                          size: 16, color: Colors.green),
                      SizedBox(width: 8),
                      Text(
                        'You\'re saving big!',
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '-$couponReward%',
                          style: const TextStyle(
                            color: Colors.green,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: pleaseWait ? null : _removeCoupon,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: Colors.red.withOpacity(0.4),
                              width: 1,
                            ),
                          ),
                          child: const Text(
                            'Remove',
                            style: TextStyle(
                              color: Colors.red,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPricingRow({
    required String label,
    required String amount,
    bool isSubtitle = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isSubtitle ? Colors.white.withOpacity(0.7) : Colors.white60,
            fontSize: isSubtitle ? 14 : 13,
            fontWeight: isSubtitle ? FontWeight.w600 : FontWeight.w500,
          ),
        ).tr(),
        Text(
          amount,
          style: TextStyle(
            color: isSubtitle ? Colors.white : Colors.white70,
            fontSize: isSubtitle ? 15 : 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  // Combined Coupon & Offers Box
  Widget _buildCouponAndOffersBox() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.08),
            Colors.white.withOpacity(0.03),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: kGold.withOpacity(0.15),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              const Icon(Icons.local_offer_rounded, color: kGold, size: 18),
              const SizedBox(width: 10),
              const Text(
                'Apply Coupon or View Offers',
                style: TextStyle(
                  color: kGold,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.2,
                ),
              ).tr(),
            ],
          ),
          const SizedBox(height: 14),
          // Coupon Input Section
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: kGold.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                  child: TextField(
                    onChanged: (val) {
                      coupon = val;
                    },
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Enter coupon code',
                      hintStyle: TextStyle(
                        color: Colors.white.withOpacity(0.4),
                        fontSize: 13,
                      ),
                      prefixIcon: Icon(
                        Icons.confirmation_number_outlined,
                        color: kGold.withOpacity(0.6),
                        size: 18,
                      ),
                      prefixIconConstraints: const BoxConstraints(
                        minWidth: 40,
                        minHeight: 40,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [kGold, kGold.withOpacity(0.85)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: kGold.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: _applyCoupon,
                    child: const Padding(
                      padding:
                          EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      child: Icon(Icons.check_rounded,
                          color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Divider
          Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  kGold.withOpacity(0.2),
                  kGold.withOpacity(0.05),
                  kGold.withOpacity(0.2),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Popular Offers Section
          Row(
            children: [
              const Icon(Icons.flash_on_rounded, color: kGold, size: 16),
              const SizedBox(width: 8),
              const Text(
                'Popular Offers',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ).tr(),
            ],
          ),
          const SizedBox(height: 10),
          StreamBuilder<List<CouponModel>>(
            stream: _getCoupons(),
            builder: (context, snapshot) {
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return Center(
                  child: Text(
                    'No offers available',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 12,
                    ),
                  ),
                );
              }
              final coupons = snapshot.data!.take(3).toList();
              return Column(
                children: coupons.asMap().entries.map((entry) {
                  int index = entry.key;
                  var coupon = entry.value;
                  bool isLast = index == coupons.length - 1;

                  return Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: kGold.withOpacity(0.15),
                            width: 0.8,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${coupon.percentage}% off',
                                    style: const TextStyle(
                                      color: kGold,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    coupon.title ?? 'Special offer',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.65),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 9, vertical: 5),
                              decoration: BoxDecoration(
                                color: kGold.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(7),
                                border: Border.all(
                                  color: kGold.withOpacity(0.4),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                coupon.coupon.toUpperCase(),
                                style: const TextStyle(
                                  color: kGold,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (!isLast) const SizedBox(height: 8),
                    ],
                  );
                }).toList(),
              );
            },
          ),
          const SizedBox(height: 10),
          // View All Link
          Center(
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).pushNamed('/coupon');
              },
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'View all offers',
                    style: TextStyle(
                      color: kGold,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
                  ).tr(),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward_rounded,
                      size: 14, color: kGold),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReferralBox() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.purple.withOpacity(0.12),
            Colors.blue.withOpacity(0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.purple.withOpacity(0.25),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(Icons.people_outline_rounded,
                  color: Colors.purple.shade300, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Refer & Earn',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Invite friends & earn rewards',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Referral Info Cards
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: Colors.purple.withOpacity(0.2),
                width: 0.8,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'You Share',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Your unique link',
                        style: TextStyle(
                          color: Colors.purple.shade300,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(7),
                    border: Border.all(
                      color: Colors.purple.withOpacity(0.4),
                      width: 1,
                    ),
                  ),
                  child: Icon(Icons.link_rounded,
                      color: Colors.purple.shade300, size: 16),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: Colors.purple.withOpacity(0.2),
                width: 0.8,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'They Get',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Special discount',
                        style: TextStyle(
                          color: Colors.green.shade400,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(7),
                    border: Border.all(
                      color: Colors.green.withOpacity(0.4),
                      width: 1,
                    ),
                  ),
                  child: Icon(Icons.card_giftcard_rounded,
                      color: Colors.green.shade400, size: 16),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          // CTA Button
          SizedBox(
            width: double.infinity,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.purple.shade600, Colors.purple.shade800],
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.purple.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () {
                    Navigator.of(context).pushNamed('/referral-page');
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.arrow_forward_rounded,
                            color: Colors.white, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'View Referral Program',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponInput() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: kGold.withOpacity(0.15),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: kGold.withOpacity(0.2),
                  width: 1,
                ),
              ),
              child: TextField(
                onChanged: (val) {
                  coupon = val;
                },
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Have a coupon code?',
                  hintStyle: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 13,
                  ),
                  prefixIcon: Icon(
                    Icons.local_offer_outlined,
                    color: kGold.withOpacity(0.6),
                    size: 18,
                  ),
                  prefixIconConstraints: const BoxConstraints(
                    minWidth: 40,
                    minHeight: 40,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [kGold, kGold.withOpacity(0.85)],
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: kGold.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: _applyCoupon,
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child:
                      Icon(Icons.check_rounded, color: Colors.white, size: 20),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPromoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 8),
          child: Row(
            children: [
              const Icon(Icons.flash_on_rounded, color: kGold, size: 16),
              const SizedBox(width: 8),
              const Text(
                'Popular Offers',
                style: TextStyle(
                  color: kGold,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.3,
                ),
              ).tr(),
            ],
          ),
        ),
        const SizedBox(height: 10),
        StreamBuilder<List<CouponModel>>(
          stream: _getCoupons(),
          builder: (context, snapshot) {
            if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const SizedBox.shrink();
            }
            final coupons = snapshot.data!.take(3).toList();
            return Column(
              children: coupons.map((coupon) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.white.withOpacity(0.06),
                          Colors.white.withOpacity(0.02),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: kGold.withOpacity(0.2),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${coupon.percentage}% off',
                                style: const TextStyle(
                                  color: kGold,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                coupon.title ?? 'Special offer',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: kGold.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: kGold.withOpacity(0.4),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            coupon.coupon.toUpperCase(),
                            style: const TextStyle(
                              color: kGold,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
        const SizedBox(height: 8),
        Center(
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).pushNamed('/coupon');
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'See all offers',
                    style: TextStyle(
                      color: kGold,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
                  ).tr(),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward_rounded,
                      size: 14, color: kGold),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCheckoutButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [kGold, kGold.withOpacity(0.85)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: kGold.withOpacity(0.4),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
          BoxShadow(
            color: kGold.withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: pleaseWait == true
                ? null
                : () {
                    if (subTotal == 0) {
                      Navigator.of(context).pushNamed('/bottomNav');
                    } else {
                      Navigator.of(context).pushNamed('/checkout');
                    }
                  },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.shopping_bag_rounded,
                  color: Colors.white.withOpacity(0.9),
                  size: 20,
                ),
                const SizedBox(width: 10),
                const Text(
                  'Proceed to Checkout',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.4,
                  ),
                ).tr(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Cart Item Card Widget
  Widget _buildCartItemCard(ProductsModel productModel) {
    return InkWell(
      onTap: () {
        Analytics().trackProductView(productModel.productID, productModel.name);
        Navigator.of(context).push(MaterialPageRoute(
            builder: (context) => ProductDetailsPage(
                  currency: currencySymbol,
                  marketID: productModel.marketID,
                  productsModel: productModel,
                )));
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: kGold.withOpacity(0.12),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: kGold.withOpacity(0.05),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Product Image - Clean
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Image.network(
                    productModel.image1,
                    height: 95,
                    width: 95,
                    fit: BoxFit.cover,
                  ),
                ),
                // Discount badge - Bold red
                if (productModel.percantageDiscount > 0)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '-${productModel.percantageDiscount.toInt()}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),

            // Product Info - Minimalist
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Product Name - Clean & Bold
                  Text(
                    productModel.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Selected Item - Minimal badge
                  Text(
                    productModel.selected ?? 'Item',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: kGold.withOpacity(0.85),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Price - Bold & Tempting
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Current Price - Prominent
                      Text(
                        '$currencySymbol${Formatter().converter(productModel.price!.toDouble())}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: kGold,
                          letterSpacing: -0.2,
                        ),
                      ),
                      // Original Price if discount exists - Subtle
                      if (productModel.percantageDiscount > 0)
                        Text(
                          '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.red.withOpacity(0.7),
                            decoration: TextDecoration.lineThrough,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 12),

            // Quantity Controls (Enhanced)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kGold.withOpacity(0.2), width: 1.2),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Increase button
                  InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () {
                      userRef!.collection('Cart').doc(productModel.uid).update({
                        'quantity': productModel.quantity! + 1,
                        'price': (productModel.quantity! + 1) *
                            productModel.selectedPrice!,
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: kGold.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.add, size: 16, color: kGold),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Quantity
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, animation) =>
                        ScaleTransition(scale: animation, child: child),
                    child: Text(
                      productModel.quantity.toString(),
                      key: ValueKey<int>(productModel.quantity!.toInt()),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Decrease button
                  InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () {
                      if (productModel.quantity! <= 1) {
                        userRef!
                            .collection('Cart')
                            .doc(productModel.uid)
                            .delete()
                            .then((value) {
                          Fluttertoast.showToast(
                            msg: "Product removed from cart".tr(),
                            toastLength: Toast.LENGTH_SHORT,
                            gravity: ToastGravity.TOP,
                            timeInSecForIosWeb: 1,
                            fontSize: 14.0,
                          );
                        });
                      } else {
                        userRef!
                            .collection('Cart')
                            .doc(productModel.uid)
                            .update({
                          'quantity': productModel.quantity! - 1,
                          'price': (productModel.quantity! - 1) *
                              productModel.selectedPrice!,
                        });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child:
                          const Icon(Icons.remove, size: 16, color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Stream to get available coupons
  Stream<List<CouponModel>> _getCoupons() {
    return FirebaseFirestore.instance.collection('Coupons').snapshots().map(
        (s) => s.docs.map((d) => CouponModel.fromMap(d.data(), d.id)).toList());
  }
}
