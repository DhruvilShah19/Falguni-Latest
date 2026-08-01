// ignore_for_file: curly_braces_in_flow_control_structures, use_build_context_synchronously, avoid_print, deprecated_member_use, unused_import, prefer_const_constructors

import 'dart:async';
import 'dart:math' as math;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:falguni_app/Widgets/plural_direct.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:isoweek/isoweek.dart';
import 'package:logger/logger.dart';
// import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:shimmer/shimmer.dart';
import 'package:animated_check/animated_check.dart';
import 'package:falguni_app/Pages/pickup_addresses.dart';

import 'package:flutter_cashfree_pg_sdk/api/cferrorresponse/cferrorresponse.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfdropcheckoutpayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfsession/cfsession.dart';
import 'package:flutter_cashfree_pg_sdk/api/cftheme/cftheme.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpaymentgateway/cfpaymentgatewayservice.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfenums.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfexceptions.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

import 'order_success_page.dart';
import 'delivery_addresses.dart';
import '../Providers/delivery_config.dart';
import 'checkout_step1_delivery.dart';
import 'checkout_step2_payment.dart';
import 'checkout_step3_completed.dart';
import '../Model/address.dart';
import 'package:geocoding/geocoding.dart';
import '../Model/formatter.dart';
import '../Model/history.dart';
import '../Model/order_model.dart';
import '../Model/products.dart';
import '../Providers/analytics.dart';
import '../Widgets/map_snapshot.dart';

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage>
    with SingleTickerProviderStateMixin {
  // Theme Palette
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  int _index = 0;
  DocumentReference? userDetails;
  String id = '';
  String addressID = '';
  DocumentReference? userRef;
  String currencySymbol = '';
  num subTotal = 0;
  bool selectedStepper1 = true;
  bool selectedStepper2 = false;
  num deliveryFee = 0;
  // Mirrors the website's DeliveryTier labels (lib/deliveryPricing.ts) so
  // customers see the same "Hyperlocal Delivery" / "Interstate Delivery"
  // etc. badge on both platforms instead of just a bare fee number.
  String? deliveryTierName;
  bool deliveryBool = false;
  bool pickupBool = false;
  bool isAddressEmpty = false;
  // Wallet payment was never a live payment path (checkout only ever offers
  // Cashfree, matching the website) -- confirmed by the business owner.
  // The old wallet-selection UI is gone; keeping these two out entirely so
  // the old order-creation branch below can't be resurrected accidentally.
  bool payWithCard = true;
  bool selectedStepper3 = false;
  String currentMarketID = '';
  String deliveryAddress = '';
  String houseNumber = '';
  String closestBustStop = '';
  String vendorID = '';
  int orderID = 0;
  List<Map<String, dynamic>> orders = [];
  AnimationController? _animationController;
  Animation<double>? _animation;
  String uid = DateTime.now().toIso8601String();
  String getOnesignalKey = '';
  String playerId = '';
  Timer? oneSignalTimer;
  String vendorToken = '';
  num couponReward = 0;
  String fullname = '';
  String email = '';
  String phone = '';

  // Cashfree Integration
  final CFPaymentGatewayService _cfPaymentGatewayService =
      CFPaymentGatewayService();
  bool isProcessingPayment = false;
  final uuid = const Uuid();
  String? cashFreeOrderID;
  String? paymentSessionId;
  Map<String, dynamic>? cashFreeResponseData;

  getOneSignalDetails() {
    FirebaseFirestore.instance
        .collection('Push notification Settings')
        .doc('OneSignal')
        .get()
        .then((value) {
      setState(() {
        getOnesignalKey = value['OnesignalKey'];
      });
    });
  }

  Future<List<ProductsModel>> getMyCart() {
    return userRef!.collection('Cart').get().then((snapshot) {
      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  Future<List<ProductsModel>> getMyCartToOrders() {
    var logger = Logger();
    return userRef!.collection('Cart').get().then((snapshot) {
      for (var element in snapshot.docs) {
        orders.add(element.data());
      }
      logger.d(orders.length);
      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  getDeliveryFee() {
    // Dynamic distance calculation will be done after address is selected.
    // Initialize to 0 by default.
    setState(() {
      deliveryFee = 0;
    });

    if (userRef != null) {
      userRef!.snapshots().listen((val) {
        if (mounted) {
          setState(() {
            couponReward = val['Coupon Reward'] ?? 0;
          });
        }
      });
    }
  }

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  Future<List<AddressModel>> getDeliveryAddresses() {
    return FirebaseFirestore.instance
        .collection('users')
        .doc(id)
        .collection('DeliveryAddress')
        .get()
        .then((event) {
      if (event.docs.isEmpty) {
        setState(() {
          isAddressEmpty = true;
        });
      } else {
        setState(() {
          isAddressEmpty = false;
        });
      }
      return event.docs
          .map((e) => AddressModel.fromMap(e.data(), e.id))
          .toList();
    });
  }

  getSubTotal() {
    userRef!.collection('Cart').get().then((val) {
      num tempTotal = val.docs.fold(0, (tot, doc) => tot + doc.data()['price']);
      setState(() {
        subTotal = tempTotal -
            (couponStatus == true && couponReward != 0
                ? (couponReward * tempTotal / 100)
                : 0);
      });
    });
  }

  bool couponStatus = false;
  getCouponStatus() {
    FirebaseFirestore.instance
        .collection('Coupon System')
        .doc('Coupon System')
        .get()
        .then((value) {
      setState(() {
        couponStatus = value['Status'];
      });
      getSubTotal();
    });
  }

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    User? user = auth.currentUser;
    setState(() {
      userDetails = firestore
          .collection('users')
          .doc(user!.uid)
          .snapshots()
          .listen((value) {
        setState(() {
          id = value['id'];
          fullname = value['fullname'];
          email = value['email'] ?? 'user@example.com';
          phone = value['phone'];
          addressID = value['DeliveryAddressID'];
          currentMarketID = value['CurrentMarketID'];
          deliveryAddress = value['DeliveryAddress'];
          houseNumber = value['HouseNumber'];
          closestBustStop = value['ClosestBustStop'];
          getVendorID();
          getDeliveryLocationLatAndLong();
        });
      }) as DocumentReference?;
    });
  }

  getVendorID() {
    FirebaseFirestore.instance
        .collection('Vendor ID')
        .doc('Vendor ID')
        .snapshots()
        .listen((val) {
      setState(() {
        vendorID = val['Vendor ID'];
        if (vendorID != '') {
          getVendorOrderID();
        }
      });
    });
  }

  getVendorOrderID() {
    FirebaseFirestore.instance
        .collection('vendors')
        .doc(vendorID)
        .snapshots()
        .listen((value) {
      setState(() {
        orderID = value['orderID'];
        vendorToken = value['tokenID'];
        debugPrint('Vendor Token is $orderID');
      });
    });
  }

  updateVendorOrderID() {
    FirebaseFirestore.instance
        .collection('vendors')
        .doc(vendorID)
        .update({'orderID': orderID + 1});
  }

  // Helper method to show professional alert dialogs
  void _showAlertDialog({
    required String title,
    required String message,
    required String buttonText,
    required Color accentColor,
    required IconData icon,
    VoidCallback? onButtonPressed,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            decoration: BoxDecoration(
              color: kPrimary,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: accentColor.withOpacity(0.3), width: 1),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.all(12),
                  child: Icon(
                    icon,
                    color: accentColor,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ).tr(),
                const SizedBox(height: 12),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: kPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    onPressed: () {
                      Navigator.of(dialogContext).pop();
                      onButtonPressed?.call();
                    },
                    child: Text(
                      buttonText,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ).tr(),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _cfPaymentGatewayService.setCallback(verifyPayment, onError);
    _animationController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 300));
    _animation = Tween<double>(begin: 0, end: 1).animate(_animationController!);
    _getUserDoc();
    _getUserDetails();
    if (userRef != null) {
      getMyCart();
      getMyCartToOrders();
    }
    getCurrencySymbol();
    getDeliveryFee();
    getOneSignalDetails();
    getCouponStatus();
  }

  // --- CASHFREE INTEGRATION METHODS ---

  void verifyPayment(String orderId) {
    if (!mounted) return;
    setState(() => isProcessingPayment = false);
    debugPrint("Verify Payment: $orderId");

    // The server already created a "DraftOrders" record with the
    // authoritative, server-calculated delivery fee back when
    // /api/cashfree/create-order was called (same server-side fee logic the
    // website uses, including the road-distance correction). Previously this
    // callback wrote its OWN separate Orders document from locally
    // calculated values here -- which not only used the old, less accurate
    // distance formula, but also created a SECOND, duplicate order once the
    // Cashfree webhook independently promoted the same draft into Orders
    // (the webhook's dedupe check looks for a top-level `cashfreeOrderId`
    // field that this local write never set). Calling the same
    // /api/cashfree/verify endpoint the website's checkout success page uses
    // fixes both problems at once: it re-confirms payment with Cashfree
    // directly and lets the server promote the DraftOrder into the real
    // Orders collection itself, so there's exactly one order record, with
    // the correct fee, on both platforms.
    _confirmOrderServerSide(orderId);
  }

  Future<void> _confirmOrderServerSide(String orderId) async {
    Map<String, dynamic> details =
        cashFreeResponseData ?? const {"payment": "online"};

    // 'success'    -- server explicitly confirmed payment (isPaid: true).
    // 'processing' -- genuinely ambiguous: Cashfree order is still ACTIVE
    //                 (not yet PAID, not confirmed failed either). This
    //                 used to be folded into 'success' -- clearing the cart
    //                 and showing "Order Placed!" -- on the assumption the
    //                 webhook would "catch up" shortly. If the payment
    //                 instead never completes, that left the customer
    //                 believing they had an order (and an empty cart) when
    //                 neither was true. Mirrors the same fix on the
    //                 website's checkout/success page.
    // 'failed'     -- server explicitly confirmed payment did NOT succeed.
    // 'ambiguous'  -- couldn't reach OUR verify endpoint at all (network/
    //                 server hiccup on this specific call). Treated
    //                 optimistically, same as before: the Cashfree SDK
    //                 already reported the checkout completed, and the
    //                 webhook is a durable fallback regardless of whether
    //                 this call ever lands.
    String outcome = 'ambiguous';

    try {
      final response = await http.get(
        Uri.parse(
            'https://falguni-latest.vercel.app/api/cashfree/verify?orderId=$orderId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final bool isPaid = data['isPaid'] == true;
        final bool isActive = data['cfStatus'] == 'ACTIVE';

        if (isPaid) {
          outcome = 'success';
          details = {
            'order_id': data['cfOrderId'] ?? orderId,
            'order_status': data['cfStatus'],
            'order_amount': data['amount'],
            'created_at': data['cfPaymentTime'],
          };
        } else if (isActive) {
          outcome = 'processing';
        } else {
          outcome = 'failed';
          debugPrint(
              'Order verification did not confirm payment: ${response.body}');
        }
      } else {
        // Non-200 from OUR verify endpoint is ambiguous (server hiccup),
        // not a confirmed payment failure -- fall through to the
        // optimistic path below, same as a network exception.
        debugPrint(
            'Order verification request failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      // A network hiccup on this confirmation call shouldn't strand the
      // user -- the Cashfree SDK already reported the checkout completed,
      // and the webhook will independently promote the DraftOrder into a
      // real order even if this call never lands.
      debugPrint('Order verification request threw: $e');
    }

    if (!mounted) return;

    if (outcome == 'failed') {
      // The server explicitly confirmed this payment did NOT go through --
      // showing "Order Placed!" and wiping the cart here would be actively
      // wrong, not just unhelpful: the customer would believe they have an
      // order, or have lost their cart, when neither is true. Leave the
      // cart intact and say so plainly instead.
      setState(() => isProcessingPayment = false);
      _showAlertDialog(
        title: 'Payment Not Confirmed',
        message:
            'We could not confirm this payment went through, so your cart has not been cleared. If money was deducted from your account, please check Order History in a few minutes before trying again -- do not pay twice.',
        buttonText: 'OK',
        accentColor: const Color(0xFFE74C3C),
        icon: Icons.error_outline,
      );
      return;
    }

    if (outcome == 'processing') {
      // Same reasoning as 'failed' above on why the cart stays intact --
      // we genuinely don't know yet whether this succeeded.
      setState(() => isProcessingPayment = false);
      _showAlertDialog(
        title: 'Confirming Payment',
        message:
            "We haven't received final confirmation from your bank yet. If money was deducted, your order will appear automatically -- please check Order History in a few minutes rather than paying again.",
        buttonText: 'OK',
        accentColor: const Color(0xFFD4AF37),
        icon: Icons.access_time,
      );
      return;
    }

    deleteCartCollection().then((_) {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => OrderSuccessPage(
            orderId: orderId,
            cashFreeDetails: details,
          ),
        ),
      );
    });
  }

  void onError(CFErrorResponse errorResponse, String orderId) {
    if (!mounted) return;
    setState(() => isProcessingPayment = false);
    debugPrint("Cashfree Error: ${errorResponse.getMessage()}");
    _showAlertDialog(
      title: 'Payment Failed',
      message: errorResponse.getMessage() ??
          'An unknown error occurred during payment.',
      buttonText: 'Close',
      accentColor: const Color(0xFFE74C3C),
      icon: Icons.error_outline,
    );
  }

  Future<void> _initiateOnlinePayment() async {
    setState(() => isProcessingPayment = true);

    if (!dotenv.isInitialized) {
      try {
        await dotenv.load(fileName: ".env");
      } catch (e) {
        debugPrint("Error loading .env: $e");
      }
    }

    String? apiUrl = dotenv.env['apiUrl'];
    String? clientId = dotenv.env['client_id'];
    String? clientSecret = dotenv.env['client_secret'];
    String? notifyUrl = dotenv.env['notify_url'];

    if (apiUrl == null ||
        clientId == null ||
        clientSecret == null ||
        notifyUrl == null) {
      setState(() => isProcessingPayment = false);
      _showAlertDialog(
        title: 'Configuration Error',
        message:
            'Payment configuration is not set up correctly. Please contact support.',
        buttonText: 'Close',
        accentColor: const Color(0xFFE74C3C),
        icon: Icons.error_outline,
      );
      return;
    }

    num calculatedAmount = subTotal + (deliveryBool == false ? 0 : deliveryFee);
    String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length > 10)
      cleanPhone = cleanPhone.substring(cleanPhone.length - 10);

    if (cleanPhone.length != 10) {
      setState(() => isProcessingPayment = false);
      _showAlertDialog(
        title: 'Invalid Phone Number',
        message:
            'Please add a valid 10-digit phone number in your profile to proceed with online payment.',
        buttonText: 'Close',
        accentColor: const Color(0xFFE74C3C),
        icon: Icons.phone_android,
      );
      return;
    }

    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    Map<String, dynamic> requestBody = {
      "order_id": uuid.v1(),
      "customer_details": {
        "customer_id": id.isEmpty ? uuid.v1() : id,
        "customer_name": fullname,
        "customer_email": email,
        "customer_phone": "+91$cleanPhone"
      },
      "cart_details": {
        "isPickup": pickupBool,
        "isApp": true,
        "deliveryLat": deliveryAddressLat,
        "deliveryLng": deliveryAddressLong,
        "deliveryAddress": deliveryAddress
      },
      "order_meta": {"notify_url": notifyUrl},
      "order_note": "Falguni Application Order",
    };

    try {
      final http.Response response = await http.post(
        Uri.parse('https://falguni-latest.vercel.app/api/cashfree/create-order'),
        headers: headers,
        body: jsonEncode(requestBody),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        var responseData = jsonDecode(response.body);
        cashFreeResponseData = responseData;
        cashFreeOrderID = responseData['order_id'];
        paymentSessionId = responseData["payment_session_id"];

        // Set the custom Honey Gold / Dark Theme for the Web Checkout
        CFThemeBuilder themeBuilder = CFThemeBuilder()
          ..setNavigationBarBackgroundColorColor('#2B1B17') // kBgTop
          ..setNavigationBarTextColor('#FFFFFF')
          ..setButtonBackgroundColor('#D4AF37') // kGold
          ..setButtonTextColor('#000000')
          ..setPrimaryFont('Inter')
          ..setSecondaryFont('Inter');

        CFTheme theme = themeBuilder.build();

        CFSessionBuilder sessionBuilder = CFSessionBuilder()
          ..setEnvironment(CFEnvironment.PRODUCTION)
          ..setOrderId(cashFreeOrderID!)
          ..setPaymentSessionId(paymentSessionId!);

        CFSession session = sessionBuilder.build();

        CFDropCheckoutPaymentBuilder dropCheckoutBuilder =
            CFDropCheckoutPaymentBuilder()
              ..setSession(session)
              ..setTheme(theme);

        CFDropCheckoutPayment dropCheckoutPayment = dropCheckoutBuilder.build();

        try {
          _cfPaymentGatewayService.doPayment(dropCheckoutPayment);
        } on CFException catch (e) {
          setState(() => isProcessingPayment = false);
          debugPrint(e.message);
          _showAlertDialog(
            title: 'Payment SDK Error',
            message: e.message,
            buttonText: 'Close',
            accentColor: const Color(0xFFE74C3C),
            icon: Icons.error_outline,
          );
        }
      } else {
        setState(() => isProcessingPayment = false);
        var errorData = jsonDecode(response.body);
        _showAlertDialog(
          title: 'Initialization Failed',
          message: errorData['message'] ??
              "Could not initialize payment with the server.",
          buttonText: 'Close',
          accentColor: const Color(0xFFE74C3C),
          icon: Icons.error_outline,
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => isProcessingPayment = false);
      _showAlertDialog(
        title: 'Network Error',
        message:
            'A network error occurred while connecting to the payment gateway. Please check your connection and try again.',
        buttonText: 'Close',
        accentColor: const Color(0xFFE74C3C),
        icon: Icons.wifi_off,
      );
    }
  }

  // ----------------------------------------

  getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      setState(() {
        currencySymbol = value['Currency symbol'];
      });
    });
  }

  addToOrder(OrderModel orderModel, String uid) {
    FirebaseFirestore.instance
        .collection('Orders')
        .doc(uid)
        .set(orderModel.toMap())
        .then((value) {
      Fluttertoast.showToast(
          msg: "Your new order has been placed",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          fontSize: 14.0);
    });
  }

  Future deleteCartCollection() async {
    addToRecentlyPurchased();
    userRef!.collection('Cart').get().then((snapshot) {
      for (DocumentSnapshot ds in snapshot.docs) {
        ds.reference.delete();
      }
    });
  }

  deleteVendorsID() {
    userRef!.update({'deliveryFee': 0, 'Coupon Reward': 0});
  }

  updateHistory(HistoryModel historyModel) {
    userRef!.collection('History').add(historyModel.toMap());
  }

  updateHistoryVendor(HistoryModel historyModel) {
    FirebaseFirestore.instance
        .collection('vendors')
        .doc(vendorID)
        .collection('Notifications')
        .add(historyModel.toMap());
  }

  double deliveryAddressLat = 0;
  double deliveryAddressLong = 0;
  bool? stopFetchingData;

  // Straight-line (Haversine) distance -- kept as a pure primitive, same as
  // the website's getDistanceFromLatLonInKm. Use getRoadDistanceEstimateKm
  // below for actual tier/fee decisions.
  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = math.cos;
    var a = 0.5 -
        c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * math.asin(math.sqrt(a)); // 2 * R; R = 6371 km
  }

  // Straight-line distance understates real road distance -- roads bend
  // around blocks and can't cross buildings/rivers directly.
  // DeliveryConfig.roadDistanceFactor comes from the website's
  // /api/delivery-config (falling back to the same 1.3x default if that
  // fetch hasn't completed), so both platforms use the same correction
  // instead of the app carrying its own hardcoded copy.
  double getRoadDistanceEstimateKm(
      double lat1, double lon1, double lat2, double lon2) {
    return calculateDistance(lat1, lon1, lat2, lon2) *
        DeliveryConfig.roadDistanceFactor;
  }

  double parseWeightToKg(String unitString) {
    if (unitString.isEmpty) return 1.0;
    String str = unitString.toLowerCase();
    RegExp regex = RegExp(r'([0-9.]+)\s*(kg|gm|g|ltr|ml)');
    Match? match = regex.firstMatch(str);
    if (match != null) {
      double value = double.parse(match.group(1)!);
      String unit = match.group(2)!;
      if (unit == 'kg' || unit == 'ltr') return value;
      if (unit == 'gm' || unit == 'g' || unit == 'ml') return value / 1000;
    }
    return 1.0;
  }

  double calculateTotalWeight() {
    double totalWeight = 0;
    for (var item in orders) {
      double w = parseWeightToKg(item['selected'] ?? item['unitname1'] ?? '');
      num qty = item['quantity'] ?? 1;
      totalWeight += w * qty;
    }
    return totalWeight;
  }

  getDeliveryLocationLatAndLong() async {
    setState(() {
      deliveryAddressLong = 0;
      deliveryAddressLat = 0;
    });
    if (deliveryAddressLat == 0 && deliveryAddressLong == 0) {
      List<Location> locations = await locationFromAddress(deliveryAddress);
      if (mounted) {
        setState(() {
          for (var element in locations) {
            deliveryAddressLong = element.longitude;
            deliveryAddressLat = element.latitude;
          }
          
          if (deliveryAddressLat != 0 && deliveryAddressLong != 0) {
            double distanceKm = getRoadDistanceEstimateKm(23.0360, 72.5294, deliveryAddressLat, deliveryAddressLong);
            num cartSubTotal = subTotal;
            double weight = calculateTotalWeight();
            // Tier/fee thresholds come from DeliveryConfig (fetched from
            // the website's /api/delivery-config, same numbers
            // calculateDeliveryFee uses in lib/deliveryPricing.ts) instead
            // of a separate hardcoded if/else chain here.
            final result = DeliveryConfig.calculateFee(
                distanceKm, deliveryAddress, cartSubTotal, weight);
            deliveryFee = result.fee;
            deliveryTierName = result.tier;
          } else {
            // Address didn't resolve to a location -- don't leave a stale
            // fee/tier badge from whatever address was selected previously
            // showing next to an address that couldn't actually be geocoded.
            deliveryFee = 0;
            deliveryTierName = null;
          }
        });
        print('Lat is $deliveryAddressLat, Long is $deliveryAddressLong, Fee is $deliveryFee');
      }
    }
  }

  String pickupAddress = '';
  getPickupAddress() async {
    var result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PickupAddressesPage()),
    );
    setState(() {
      deliveryBool = false;
      pickupBool = true;
      pickupAddress = result;
    });
    Fluttertoast.showToast(
        msg: "Select pickup address".tr(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        fontSize: 14.0);
  }

  getDeliveryFeeQuote() async {
    setState(() {
      _index = 1;
      selectedStepper2 = true;
    });
  }

  addToRecentlyPurchased() {
    return userRef!.collection('Cart').get().then((snapshot) {
      for (var snap in snapshot.docs) {
        userRef!.collection('Recent Purchased Products').add(snap.data());
        Analytics().trackProductPurchase(snap.data()['productID'],
            snap.data()['name'], snap.data()['selectedPrice']);
      }
    });
  }

  Widget _buildCustomStepper() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      decoration: BoxDecoration(
        color: kBgTop,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildStepItem(0, 'Delivery', Icons.local_shipping_outlined),
          Expanded(child: _buildStepDivider(0)),
          _buildStepItem(1, 'Payment', Icons.payment_outlined),
          Expanded(child: _buildStepDivider(1)),
          _buildStepItem(2, 'Completed', Icons.check_circle_outline),
        ],
      ),
    );
  }

  Widget _buildStepItem(int index, String title, IconData icon) {
    bool isActive = _index == index;
    bool isCompleted = _index > index;
    // Allow going back if not completed order
    bool isClickable = index < _index && _index != 2;

    Color color = (isActive || isCompleted) ? kGold : Colors.white24;

    return InkWell(
      onTap: isClickable
          ? () {
              setState(() {
                _index = index;
              });
            }
          : null,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isActive ? kGold.withOpacity(0.2) : Colors.transparent,
              shape: BoxShape.circle,
              border: Border.all(color: color, width: 2),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                          color: kGold.withOpacity(0.3),
                          blurRadius: 8,
                          spreadRadius: 1)
                    ]
                  : [],
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
            ),
          ).tr(),
        ],
      ),
    );
  }

  Widget _buildStepDivider(int index) {
    bool isCompleted = _index > index;
    return Container(
      height: 2,
      color: isCompleted ? kGold : Colors.white12,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
    );
  }

  Widget _buildStepContent() {
    if (_index == 0) {
      return CheckoutStep1Delivery(
        deliveryBool: deliveryBool,
        pickupBool: pickupBool,
        deliveryAddress: deliveryAddress,
        pickupAddress: pickupAddress,
        currencySymbol: currencySymbol,
        deliveryAddressLat: deliveryAddressLat,
        deliveryAddressLong: deliveryAddressLong,
        isAddressEmpty: isAddressEmpty,
        getMyCart: getMyCart,
        deliveryTierName: deliveryTierName,
        onDeliveryAddressTap: () {
          Navigator.of(context).pushNamed('/delivery-address').then((value) {
            getDeliveryLocationLatAndLong();
          });
          setState(() {});
        },
        onDeliveryChanged: (value) {
          if (isAddressEmpty == true) {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => const DeliveryAddressesPage()));
          } else {
            setState(() {
              deliveryBool = true;
              pickupBool = false;
            });
          }
          getDeliveryLocationLatAndLong();
        },
        onPickupChanged: (value) {
          setState(() {
            getPickupAddress();
          });
        },
      );
    } else if (_index == 1) {
      return CheckoutStep2Payment(
        payWithCard: payWithCard,
        subTotal: subTotal,
        deliveryFee: deliveryFee,
        deliveryBool: deliveryBool,
        currencySymbol: currencySymbol,
        onOnlinePaymentChanged: (val) {
          setState(() {
            payWithCard = true;
          });
        },
        orders: orders,
        getMyCartToOrders: getMyCartToOrders,
      );
    } else {
      return CheckoutStep3Completed(
        animation: _animation,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    //  getDeliveryLocationLatAndLong();
    return Theme(
        data: Theme.of(context).copyWith(
          brightness: Brightness.dark,
          canvasColor: Colors.transparent,
          colorScheme: const ColorScheme.dark(
            primary: kGold,
            onPrimary: Colors.black,
            secondary: kGold,
            background: kBgTop,
            surface: kBgTop,
            onSurface: Colors.white60,
          ),
        ),
        child: Scaffold(
          extendBodyBehindAppBar: true,
          backgroundColor: Colors.black,
          appBar: AppBar(
              iconTheme: const IconThemeData(color: Colors.white),
              backgroundColor: Colors.transparent,
              centerTitle: true,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
              title: Text(
                'Checkout',
                style: const TextStyle(
                    color: kGold,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5),
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
              child: Stack(
                children: [
                  Column(
                    children: [
                      _buildCustomStepper(),
                      Expanded(
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.only(bottom: 100),
                          child: _buildStepContent(),
                        ),
                      )
                    ],
                  ),
                  _index == 2
                      ? Container()
                      : Align(
                          alignment: Alignment.bottomCenter,
                          child: Container(
                            decoration: BoxDecoration(
                              color: kBgTop,
                              border: Border(
                                  top: BorderSide(
                                      color: Colors.white.withOpacity(0.1))),
                            ),
                            child: SizedBox(
                                height: 80,
                                width: double.infinity,
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceAround,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.info_outline,
                                              color: Colors.white54),
                                          const SizedBox(width: 5),
                                          const Text(
                                            'Total',
                                            style: TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18),
                                          ).tr(),
                                        ],
                                      ),
                                      Text(
                                          '$currencySymbol${Formatter().converter((subTotal + (deliveryBool == false ? 0 : deliveryFee)).toDouble())}',
                                          style: const TextStyle(
                                              color: kGold,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 18)),
                                      _index == 1
                                          ? ElevatedButton(
                                              style: ElevatedButton.styleFrom(
                                                  backgroundColor: kGold,
                                                  foregroundColor: Colors.black,
                                                  shape: RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              12))),
                                              onPressed: isProcessingPayment
                                                  ? null
                                                  : () {
                                                      if (deliveryBool ==
                                                              false &&
                                                          pickupBool == false) {
                                                        _showAlertDialog(
                                                          title:
                                                              'Select Delivery Method',
                                                          message:
                                                              'Please select Pickup or use the Manual Delivery Request option to proceed.',
                                                          buttonText: 'OK',
                                                          accentColor: kGold,
                                                          icon: Icons
                                                              .local_shipping_outlined,
                                                        );
                                                      } else if (isAddressEmpty ==
                                                              true &&
                                                          pickupBool == false) {
                                                        setState(() {
                                                          _index = 0;
                                                        });
                                                        _showAlertDialog(
                                                          title:
                                                              'Delivery Address Required',
                                                          message:
                                                              'Please select or add a delivery address to proceed with your order.',
                                                          buttonText:
                                                              'Add Address',
                                                          accentColor:
                                                              const Color(
                                                                  0xFFC9A86A),
                                                          icon: Icons
                                                              .location_on_outlined,
                                                        );
                                                      } else if (!payWithCard) {
                                                        Fluttertoast.showToast(
                                                            msg:
                                                                'Select Payment Method',
                                                            toastLength: Toast
                                                                .LENGTH_SHORT,
                                                            gravity:
                                                                ToastGravity
                                                                    .BOTTOM,
                                                            timeInSecForIosWeb:
                                                                1,
                                                            backgroundColor:
                                                                Colors.black,
                                                            textColor:
                                                                Colors.white,
                                                            fontSize: 16.0);
                                                      } else {
                                                        // Payment always goes through Cashfree,
                                                        // matching the website -- there is no
                                                        // wallet-payment path anymore.
                                                        _initiateOnlinePayment();
                                                      }
                                                    },
                                              child: isProcessingPayment
                                                  ? const SizedBox(
                                                      height: 20,
                                                      width: 20,
                                                      child:
                                                          CircularProgressIndicator(
                                                        color: Colors.black,
                                                        strokeWidth: 2,
                                                      ),
                                                    )
                                                  : Row(
                                                      children: [
                                                        const Text('PROCEED',
                                                                style: TextStyle(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold,
                                                                    fontSize:
                                                                        18))
                                                            .tr(),
                                                        const SizedBox(
                                                            width: 5),
                                                        const Icon(
                                                            Icons.arrow_forward)
                                                      ],
                                                    ))
                                          : ElevatedButton(
                                              style: ElevatedButton.styleFrom(
                                                  backgroundColor: kGold,
                                                  foregroundColor: Colors.black,
                                                  shape: RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              12))),
                                              onPressed: deliveryAddressLat ==
                                                          0 &&
                                                      deliveryBool == true
                                                  ? null
                                                  : () {
                                                      if (isAddressEmpty ==
                                                              true &&
                                                          pickupBool == false) {
                                                        Fluttertoast.showToast(
                                                            msg: "Please select or add an address"
                                                                .tr(),
                                                            toastLength: Toast
                                                                .LENGTH_SHORT,
                                                            gravity:
                                                                ToastGravity
                                                                    .TOP,
                                                            timeInSecForIosWeb:
                                                                1,
                                                            fontSize: 14.0);
                                                      } else {
                                                        if (deliveryBool ==
                                                            true) {
                                                          if (phone == '') {
                                                            Fluttertoast.showToast(
                                                                msg:
                                                                    "Please add your phone number to continue"
                                                                        .tr(),
                                                                toastLength: Toast
                                                                    .LENGTH_SHORT,
                                                                gravity:
                                                                    ToastGravity
                                                                        .TOP,
                                                                timeInSecForIosWeb:
                                                                    1,
                                                                fontSize: 14.0);
                                                            Navigator.pushNamed(
                                                                context,
                                                                '/profile');
                                                          } else {
                                                            getDeliveryFeeQuote();
                                                          }
                                                        } else {
                                                          setState(() {
                                                            _index = 1;
                                                            selectedStepper2 =
                                                                true;
                                                          });
                                                        }
                                                      }
                                                    },
                                              child: Row(
                                                children: [
                                                  const Text('CONFIRM',
                                                          style: TextStyle(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontSize: 18))
                                                      .tr(),
                                                  const SizedBox(width: 5),
                                                  const Icon(Icons.done)
                                                ],
                                              ))
                                    ],
                                  ),
                                )),
                          )),
                ],
              ),
            ),
          ),
        ));
  }
}
