// ignore_for_file: curly_braces_in_flow_control_structures, use_build_context_synchronously, avoid_print, deprecated_member_use, unused_import, prefer_const_constructors

import 'dart:async';
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
import 'package:falguni_app/Widgets/get_delviery_fee.dart';
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
import 'wallet_page.dart';
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
  bool deliveryBool = false;
  bool pickupBool = false;
  bool isAddressEmpty = false;
  num wallet = 0;
  bool walletBool = false;
  bool payWithCard = false;
  bool cashOnDeliveryBool = false;
  bool selectedStepper3 = false;
  bool cashDatabase = false;
  String currentMarketID = '';
  String deliveryAddress = '';
  String houseNumber = '';
  String closestBustStop = '';
  String vendorID = '';
  int orderID = 0;
  List<Map<String, dynamic>> orders = [];
  AnimationController? _animationController;
  Animation<double>? _animation;
  String uid = DateTime.now().toString();
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
    if (userRef != null) {
      userRef!.snapshots().listen((val) {
        setState(() {
          //  deliveryFee = val['deliveryFee'];
          couponReward = val['Coupon Reward'];
          debugPrint('delivery fee is $deliveryFee');
        });
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
          wallet = value['wallet'];
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

  updateWallet() {
    num totalAmount = subTotal + (deliveryBool == false ? 0 : deliveryFee);
    // Deduct only the available balance (partial or full)
    num amountToDeduct = wallet >= totalAmount ? totalAmount : wallet;
    userRef!.update({'wallet': wallet - amountToDeduct});
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
    getCashOnDeliveryStatus();
    getOneSignalDetails();
    getCouponStatus();
  }

  // --- CASHFREE INTEGRATION METHODS ---

  void verifyPayment(String orderId) {
    if (!mounted) return;
    setState(() => isProcessingPayment = false);
    debugPrint("Verify Payment: $orderId");

    // Success scenario: Save order and history, then navigate to success page
    updateVendorOrderID();
    Week currentWeek = Week.current();
    var day = DateTime.now();
    var dateDay = DateTime.now().day;
    var month = DateTime.now();
    String formattedDate = DateFormat('MMMM').format(month);
    String dayFormatter = DateFormat('EEEE').format(day);
    DateTime now = DateTime.now();
    int currentMonth = now.month;
    int currentYear = now.year;

    addToOrder(
      OrderModel(
        month: currentMonth.toString(),
        year: currentYear.toString(),
        weekNumber: currentWeek.weekNumber,
        day: dayFormatter,
        date: '$dayFormatter, $formattedDate $dateDay',
        pickupAddress: pickupAddress,
        confirmationStatus: false,
        uid: id, // Assuming 'id' is the user's UID
        marketID: currentMarketID,
        orderID: orderID + 1,
        orders: orders,
        acceptDelivery: false,
        deliveryFee: pickupBool == false ? deliveryFee : 0,
        total: subTotal + (deliveryBool == false ? 0 : deliveryFee),
        vendorID: vendorID,
        paymentType: 'Online',
        userID: id,
        timeCreated: DateFormat.yMMMMEEEEd().format(DateTime.now()).toString(),
        deliveryAddress: pickupBool == true ? '' : deliveryAddress,
        houseNumber: pickupBool == true ? '' : houseNumber,
        closesBusStop: pickupBool == true ? '' : closestBustStop,
        deliveryBoyID: '',
        status: 'Received',
        accept: false,
      ),
      id, // Pass user ID here
    );

    updateHistoryVendor(HistoryModel(
      message: 'New order alert Order ID #${orderID + 1}',
      amount:
          '$currencySymbol ${subTotal + (deliveryBool == false ? 0 : deliveryFee)}',
      paymentSystem: 'Online',
      timeCreated: DateTime.now(),
    ));

    deleteCartCollection().then((_) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => OrderSuccessPage(
            orderId: '${orderID + 1}',
            cashFreeDetails: const {"payment": "online"},
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
      'x-client-id': clientId,
      'x-client-secret': clientSecret,
      'x-api-version': '2023-08-01',
      'x-request-id': 'flutter_request',
    };

    Map<String, dynamic> requestBody = {
      "order_amount": calculatedAmount.toDouble(),
      "order_id": uuid.v1(),
      "order_currency": "INR",
      "customer_details": {
        "customer_id": id.isEmpty ? uuid.v1() : id,
        "customer_name": fullname,
        "customer_email": email,
        "customer_phone": "+91$cleanPhone"
      },
      "order_meta": {"notify_url": notifyUrl},
      "order_note": "Falguni Application Order",
    };

    try {
      final http.Response response = await http.post(
        Uri.parse(apiUrl),
        headers: headers,
        body: jsonEncode(requestBody),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        var responseData = jsonDecode(response.body);
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

  getCashOnDeliveryStatus() {
    return FirebaseFirestore.instance
        .collection('Payment System')
        .doc('Cash on delivery')
        .get()
        .then((val) {
      setState(() {
        cashDatabase = val['Cash on delivery'];
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
        });
        print('Lat is $deliveryAddressLat, Long is $deliveryAddressLong');
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
    var result = await Navigator.push(
      context,
      MaterialPageRoute(
          builder: (context) => GetDeliveryFeeWidget(
                customerLat: deliveryAddressLat,
                customerLong: deliveryAddressLong,
                customerName: fullname,
                phone: phone,
              )),
    );
    setState(() {
      deliveryFee = result['deliveryFee'];
      pickupAddress = result['pickupAddress'];
      _index = 1;
      selectedStepper2 = true;
    });

    Fluttertoast.showToast(
        msg: "Select pickup address".tr(),
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        fontSize: 14.0);
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
        walletBool: walletBool,
        payWithCard: payWithCard,
        cashOnDeliveryBool: cashOnDeliveryBool,
        cashDatabase: cashDatabase,
        wallet: wallet,
        subTotal: subTotal,
        deliveryFee: deliveryFee,
        deliveryBool: deliveryBool,
        currencySymbol: currencySymbol,
        onWalletChanged: (val) {
          setState(() {
            walletBool = true;
            cashOnDeliveryBool = false;
            payWithCard = false;
          });
        },
        onOnlinePaymentChanged: (val) {
          setState(() {
            walletBool = false;
            payWithCard = true;
            cashOnDeliveryBool = false;
          });
        },
        onCashOnDeliveryChanged: (val) {
          setState(() {
            walletBool = false;
            cashOnDeliveryBool = true;
            payWithCard = false;
          });
        },
        onWalletTap: () {
          Navigator.of(context)
              .push(MaterialPageRoute(builder: (context) => const WalletPage()))
              .then((value) {
            Fluttertoast.showToast(
                msg: "Please upload more money to continue".tr(),
                toastLength: Toast.LENGTH_SHORT,
                gravity: ToastGravity.TOP,
                timeInSecForIosWeb: 1,
                fontSize: 14.0);
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
                                                      } else {
                                                        // First check if wallet has negative balance
                                                        // if (wallet < 0) {
                                                        //   _showAlertDialog(
                                                        //     title:
                                                        //         'Account Balance Negative',
                                                        //     message:
                                                        //         'Your wallet has a negative balance of $currencySymbol${Formatter().converter(wallet.abs().toDouble())}.\n\nYou must settle this amount before placing new orders.\n\nPlease contact support for payment options.',
                                                        //     buttonText: 'Close',
                                                        //     accentColor: const Color(
                                                        //         0xFFE74C3C),
                                                        //     icon: Icons.error_outline,
                                                        //   );
                                                        // } else if (walletBool ==
                                                        if (walletBool ==
                                                                false &&
                                                            cashOnDeliveryBool ==
                                                                false &&
                                                            payWithCard ==
                                                                false) {
                                                          _showAlertDialog(
                                                            title:
                                                                'Payment Method Required',
                                                            message:
                                                                'Please select a payment method to proceed with your order.',
                                                            buttonText:
                                                                'Got It',
                                                            accentColor:
                                                                const Color(
                                                                    0xFFC9A86A),
                                                            icon: Icons
                                                                .payment_outlined,
                                                          );
                                                        } else if (walletBool ==
                                                                true &&
                                                            wallet <
                                                                (subTotal +
                                                                    (deliveryBool ==
                                                                            false
                                                                        ? 0
                                                                        : deliveryFee)) &&
                                                            payWithCard ==
                                                                false &&
                                                            cashOnDeliveryBool ==
                                                                false) {
                                                          // Wallet selected but insufficient balance and no other payment method
                                                          num shortfall = (subTotal +
                                                                  (deliveryBool ==
                                                                          false
                                                                      ? 0
                                                                      : deliveryFee)) -
                                                              wallet;
                                                          _showAlertDialog(
                                                            title:
                                                                'Insufficient Wallet Balance',
                                                            message:
                                                                'Your wallet has $currencySymbol${Formatter().converter(wallet.toDouble())}, but you need $currencySymbol${Formatter().converter(shortfall.toDouble())} more.\n\nYou can:\n• Add funds to your wallet\n• Select another payment method (Online Payment or Cash on Delivery)',
                                                            buttonText:
                                                                'Understood',
                                                            accentColor:
                                                                const Color(
                                                                    0xFFE74C3C),
                                                            icon: Icons
                                                                .warning_outlined,
                                                          );
                                                        } else if (payWithCard ==
                                                            true) {
                                                          _initiateOnlinePayment();
                                                        } else if (cashOnDeliveryBool ==
                                                            true) {
                                                          Week currentWeek =
                                                              Week.current();

                                                          // Get the current date and time
                                                          var day =
                                                              DateTime.now();
                                                          var dateDay =
                                                              DateTime.now()
                                                                  .day;
                                                          var month =
                                                              DateTime.now();
                                                          // Format the date as a string
                                                          String formattedDate =
                                                              DateFormat('MMMM')
                                                                  .format(
                                                                      month);
                                                          String dayFormatter =
                                                              DateFormat('EEEE')
                                                                  .format(day);
                                                          deleteCartCollection();
                                                          deleteVendorsID();
                                                          updateVendorOrderID();

                                                          if (walletBool ==
                                                              true) {
                                                            num totalAmount = subTotal +
                                                                (deliveryBool ==
                                                                        false
                                                                    ? 0
                                                                    : deliveryFee);
                                                            num amountDeducted =
                                                                wallet >=
                                                                        totalAmount
                                                                    ? totalAmount
                                                                    : wallet;
                                                            updateWallet();
                                                            updateHistory(HistoryModel(
                                                                timeCreated:
                                                                    DateTime
                                                                        .now(),
                                                                message:
                                                                    'Placed an order'
                                                                        .tr(),
                                                                amount:
                                                                    '-$currencySymbol${Formatter().converter(amountDeducted.toDouble())}',
                                                                paymentSystem:
                                                                    ''));
                                                          }
                                                          DateTime now =
                                                              DateTime.now();
                                                          int currentMonth =
                                                              now.month;
                                                          int currentYear =
                                                              now.year;
                                                          addToOrder(
                                                              OrderModel(
                                                                  month: currentMonth
                                                                      .toString(),
                                                                  year: currentYear
                                                                      .toString(),
                                                                  weekNumber: currentWeek
                                                                      .weekNumber,
                                                                  day:
                                                                      dayFormatter,
                                                                  date:
                                                                      '$dayFormatter, $formattedDate $dateDay',
                                                                  pickupAddress:
                                                                      pickupAddress,
                                                                  confirmationStatus:
                                                                      false,
                                                                  uid: id,
                                                                  marketID:
                                                                      currentMarketID,
                                                                  orderID: orderID +
                                                                      1,
                                                                  orders:
                                                                      orders,
                                                                  acceptDelivery:
                                                                      false,
                                                                  deliveryFee: pickupBool == false
                                                                      ? deliveryFee
                                                                      : 0,
                                                                  total: subTotal +
                                                                      (deliveryBool == false
                                                                          ? 0
                                                                          : deliveryFee),
                                                                  vendorID:
                                                                      vendorID,
                                                                  paymentType: cashOnDeliveryBool ==
                                                                          true
                                                                      ? 'Cash on delivery'
                                                                      : 'Wallet',
                                                                  userID: id,
                                                                  timeCreated: DateFormat
                                                                          .yMMMMEEEEd()
                                                                      .format(DateTime
                                                                          .now())
                                                                      .toString(),
                                                                  deliveryAddress:
                                                                      pickupBool ==
                                                                              true
                                                                          ? ''
                                                                          : deliveryAddress,
                                                                  houseNumber:
                                                                      pickupBool ==
                                                                              true
                                                                          ? ''
                                                                          : houseNumber,
                                                                  closesBusStop:
                                                                      pickupBool ==
                                                                              true
                                                                          ? ''
                                                                          : closestBustStop,
                                                                  deliveryBoyID:
                                                                      '',
                                                                  status:
                                                                      'Received',
                                                                  accept:
                                                                      false),
                                                              id);
                                                          updateHistoryVendor(HistoryModel(
                                                              message:
                                                                  'New order alert Order ID #${orderID + 1}',
                                                              amount:
                                                                  '$currencySymbol ${subTotal + (deliveryBool == false ? 0 : deliveryFee)}',
                                                              paymentSystem: '',
                                                              timeCreated:
                                                                  DateTime
                                                                      .now()));
                                                          // _handleSendNotification(
                                                          //     vendorToken,
                                                          //     'New order alert Order ID #${orderID + 1}',
                                                          //     'New order alert');
                                                          setState(() {
                                                            _index = 2;
                                                            selectedStepper3 =
                                                                true;
                                                            selectedStepper1 =
                                                                false;
                                                            selectedStepper2 =
                                                                false;
                                                          });
                                                          _animationController!
                                                              .forward();
                                                        }
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
