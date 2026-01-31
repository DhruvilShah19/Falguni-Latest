// ignore_for_file: avoid_print, use_build_context_synchronously, duplicate_ignore, deprecated_member_use, prefer_const_constructors

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:falguni_app/Model/order_model.dart';
import 'package:falguni_app/Pages/bottom_nav.dart';
import 'package:falguni_app/Providers/analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfcard/cfcardlistener.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfcard/cfcardwidget.dart';
import 'package:flutter_cashfree_pg_sdk/api/cferrorresponse/cferrorresponse.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfcard.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfcardpayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfdropcheckoutpayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfnetbanking.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfnetbankingpayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfupi.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfupipayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfwebcheckoutpayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpaymentcomponents/cfpaymentcomponent.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpaymentgateway/cfpaymentgatewayservice.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfsession/cfsession.dart';
import 'package:flutter_cashfree_pg_sdk/api/cftheme/cftheme.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfupi/cfupiutils.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfenums.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfexceptions.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:falguni_app/Model/history.dart';
import 'package:isoweek/isoweek.dart';
import 'package:logger/logger.dart';
import 'package:uuid/uuid.dart';

class CashFreePageDirect extends StatefulWidget {
  final dynamic response;
  final String paymentSessionId;
  final String cashFreeOrderID;
  final num amount;
  final num deliveryFee;
  final bool deliveryBool;
  final bool pickupBool;
  final bool cashOnDeliveryBool;
  final String currentMarketID;
  final String deliveryAddress;
  final String houseNumber;
  final String closestBustStop;
  final String vendorID;
  final int orderID;
  final List<Map<String, dynamic>> orders;
  final String uid;
  final String getOnesignalKey;
  final String vendorToken;
  final String pickupAddress;
  final num subTotal;

  const CashFreePageDirect(
      {super.key,
      this.response,
      required this.paymentSessionId,
      required this.cashFreeOrderID,
      required this.deliveryFee,
      required this.deliveryBool,
      required this.pickupBool,
      required this.cashOnDeliveryBool,
      required this.currentMarketID,
      required this.deliveryAddress,
      required this.houseNumber,
      required this.closestBustStop,
      required this.vendorID,
      required this.orderID,
      required this.orders,
      required this.uid,
      required this.getOnesignalKey,
      required this.vendorToken,
      required this.pickupAddress,
      required this.subTotal,
      required this.amount});

  @override
  State<CashFreePageDirect> createState() => _CashFreePageDirectState();
}

class _CashFreePageDirectState extends State<CashFreePageDirect> {
  var cfPaymentGatewayService = CFPaymentGatewayService();

  CFCardWidget? cfCardWidget;
  String currencyCode = '';
  String currencySymbol = '';
  String name = '';
  String email = '';
  String phone = '';
  num wallet = 0;
  String id = '';
  bool isLoading = true;
  dynamic orderID = 0;

  static const Color kGold = Color(0xFFC9A86A);

  getUserName() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    // final FirebaseFirestore firestore = FirebaseFirestore.instance;
    var logger = Logger();
    logger.d(
        '${(widget.subTotal + (widget.deliveryBool == false ? 0 : widget.deliveryFee))}');
    User? user = auth.currentUser;
    setState(() {
      isLoading = true;
    });
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .get()
        .then((value) {
      isLoading = false;
      logger.d('Phone is ${value['phone']}');
      id = user.uid;
      name = value['fullname'];
      phone = value['phone'];
      email = value['email'];
    });
  }

  getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      setState(() {
        currencyCode = value['Currency code'];
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

  updateVendorOrderID() {
    FirebaseFirestore.instance
        .collection('vendors')
        .doc(widget.vendorID)
        .update({'orderID': orderID + 1});
  }

  Future deleteCartCollection() async {
    addToRecentlyPurchased();
    final FirebaseAuth auth = FirebaseAuth.instance;
    // final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .collection('Cart')
        .get()
        .then((snapshot) {
      for (DocumentSnapshot ds in snapshot.docs) {
        ds.reference.delete();
      }
    });
  }

  addToRecentlyPurchased() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    // final FirebaseFirestore firestore = FirebaseFirestore.instance;
    User? user = auth.currentUser;
    return FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .collection('Cart')
        .get()
        .then((snapshot) {
      for (var snap in snapshot.docs) {
        FirebaseFirestore.instance
            .collection('users')
            .doc(user.uid)
            .collection('Recent Purchased Products')
            .add(snap.data());
        Analytics().trackProductPurchase(snap.data()['productID'],
            snap.data()['name'], snap.data()['selectedPrice']);
      }
    });
  }

  deleteVendorsID() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    // final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .update({'deliveryFee': 0, 'Coupon Reward': 0});
  }

  updateHistory(HistoryModel historyModel) {
    final FirebaseAuth auth = FirebaseAuth.instance;
    // final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .collection('History')
        .add(historyModel.toMap());
  }

  updateHistoryVendor(HistoryModel historyModel) {
    FirebaseFirestore.instance
        .collection('vendors')
        .doc(widget.vendorID)
        .collection('Notifications')
        .add(historyModel.toMap())
        .then((v) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const BottomNavPage()),
        (Route<dynamic> route) => false,
      );
    });
  }

  pushOrder() {
    Week currentWeek = Week.current();

    // Get the current date and time
    var day = DateTime.now();
    var dateDay = DateTime.now().day;
    var month = DateTime.now();
    // Format the date as a string
    String formattedDate = DateFormat('MMMM').format(month);
    String dayFormatter = DateFormat('EEEE').format(day);
    deleteCartCollection();
    deleteVendorsID();
    updateVendorOrderID();

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
            pickupAddress: widget.pickupAddress,
            confirmationStatus: false,
            uid: widget.uid,
            marketID: widget.currentMarketID,
            orderID: orderID + 1,
            orders: widget.orders,
            acceptDelivery: false,
            deliveryFee: widget.pickupBool == false ? widget.deliveryFee : 0,
            total: widget.subTotal +
                (widget.deliveryBool == false ? 0 : widget.deliveryFee),
            vendorID: widget.vendorID,
            paymentType: widget.cashOnDeliveryBool == true
                ? 'Cash on delivery'
                : 'Wallet',
            userID: id,
            timeCreated:
                DateFormat.yMMMMEEEEd().format(DateTime.now()).toString(),
            deliveryAddress:
                widget.pickupBool == true ? '' : widget.deliveryAddress,
            houseNumber: widget.pickupBool == true ? '' : widget.houseNumber,
            closesBusStop:
                widget.pickupBool == true ? '' : widget.closestBustStop,
            deliveryBoyID: '',
            status: 'Received',
            accept: false),
        widget.uid);
    updateHistoryVendor(HistoryModel(
        message: 'New order alert Order ID #${orderID + 1}',
        amount:
            '$currencySymbol ${widget.subTotal + (widget.deliveryBool == false ? 0 : widget.deliveryFee)}',
        paymentSystem: '',
        timeCreated: DateTime.now()));
  }

  getVendorID() {
    FirebaseFirestore.instance
        .collection('Vendor ID')
        .doc('Vendor ID')
        .snapshots()
        .listen((val) {
      setState(() {
        getVendorOrderID(val['Vendor ID']);
      });
    });
  }

  getVendorOrderID(String vendorID) {
    FirebaseFirestore.instance
        .collection('vendors')
        .doc(vendorID)
        .snapshots()
        .listen((value) {
      setState(() {
        orderID = value['orderID'];
      });
    });
  }

  @override
  void initState() {
    super.initState();
    getCurrencySymbol();
    getVendorID();
    getUserName();
    cfPaymentGatewayService.setCallback(verifyPayment, onError);
    final GlobalKey<CFCardWidgetState> myWidgetKey =
        GlobalKey<CFCardWidgetState>();
    try {
      var session = createSession();
      cfCardWidget = CFCardWidget(
        key: myWidgetKey,
        textStyle: null,
        inputDecoration: InputDecoration(
          hintText: 'XXXX XXXX XXXX XXXX',
          contentPadding:
              const EdgeInsets.all(15.0), // Adjust padding as needed
          counterText: "",
          border: OutlineInputBorder(
            borderRadius:
                BorderRadius.circular(5.0), // Adjust the radius as needed
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius:
                BorderRadius.circular(5.0), // Adjust the radius as needed
            borderSide: const BorderSide(
              color: Colors.green, // Set your desired tint color here
              width: 2.0, // Adjust the border width as needed
            ),
          ),
        ),
        cardListener: cardListener, cfSession: session,
        // cfSession: session,
      );
    } on CFException catch (e) {
      print(e.message);
    }

    CFUPIUtils().getUPIApps().then((value) {
      print("value");
      print(value);
      for (var i = 0; i < (value?.length ?? 0); i++) {
        var a = value?[i]["id"] as String;
        if (a.contains("phonepe")) {
          selectedId = value?[i]["id"];
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1D1A1A),
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        backgroundColor: const Color(0xFF2F2525),
        title: const Text(
          'Final Step',
          style: TextStyle(color: Colors.white),
        ),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.security, color: kGold, size: 64),
              const SizedBox(height: 24),
              const Text(
                'Complete Your Payment',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'You will be redirected to our secure payment partner, CashFree, to complete your transaction.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: webCheckout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kGold,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Continue to Secure Payment',
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void verifyPayment(String cashFreeOrderId) {
    print("Verify Payment");
    pushOrder();
  }

  void onError(CFErrorResponse errorResponse, String cashFreeOrderId) {
    print(errorResponse.getMessage());
    print("Error while making payment");
  }

  void cardListener(CFCardListener cardListener) {
    print("Card Listener triggered");
    print(cardListener.getNumberOfCharacters());
    print(cardListener.getType());
  }

  void receivedEvent(String eventName, Map<dynamic, dynamic> metaData) {
    print(eventName);
    print(metaData);
  }

  CFEnvironment environment = CFEnvironment.PRODUCTION;
  String selectedId = "";

  upiCollectPay() async {
    try {
      var session = createSession();
      var upi = CFUPIBuilder()
          .setChannel(CFUPIChannel.COLLECT)
          .setUPIID("suhasg6@ybl")
          .build();
      var upiPayment =
          CFUPIPaymentBuilder().setSession(session!).setUPI(upi).build();
      cfPaymentGatewayService.doPayment(upiPayment);
    } on CFException catch (e) {
      print(e.message);
    }
  }

  netbankingPay() async {
    try {
      var session = createSession();
      var netbanking =
          CFNetbankingBuilder().setChannel("link").setBankCode(3003).build();
      var netbankingPayment = CFNetbankingPaymentBuilder()
          .setSession(session!)
          .setNetbanking(netbanking)
          .build();
      cfPaymentGatewayService.doPayment(netbankingPayment);
    } on CFException catch (e) {
      print(e.message);
    }
  }

  upiIntentPay() async {
    try {
      cfPaymentGatewayService.setCallback(verifyPayment, onError);
      var session = createSession();
      var upi = CFUPIBuilder()
          .setChannel(CFUPIChannel.INTENT)
          .setUPIID(selectedId)
          .build();
      var upiPayment =
          CFUPIPaymentBuilder().setSession(session!).setUPI(upi).build();
      cfPaymentGatewayService.doPayment(upiPayment);
    } on CFException catch (e) {
      print(e.message);
    }
  }

  cardPay() async {
    try {
      cfPaymentGatewayService.setCallback(verifyPayment, onError);
      var session = createSession();
      var card = CFCardBuilder()
          .setInstrumentId("db178aff-b8cf-420e-b0ba-7af89f0d2263")
          .setCardCVV("123")
          .build();
      var cardPayment = CFCardPaymentBuilder()
          .setSession(session!)
          .setCard(card)
          .savePaymentMethod(true)
          .build();
      cfPaymentGatewayService.doPayment(cardPayment);
    } on CFException catch (e) {
      print(e.message);
    }
  }

  pay() async {
    try {
      var session = createSession();
      List<CFPaymentModes> components = <CFPaymentModes>[];
      components.add(CFPaymentModes.UPI);
      var paymentComponent =
          CFPaymentComponentBuilder().setComponents(components).build();

      var theme = CFThemeBuilder()
          .setNavigationBarBackgroundColorColor("#FF0000")
          .setPrimaryFont("Menlo")
          .setSecondaryFont("Futura")
          .build();

      var cfDropCheckoutPayment = CFDropCheckoutPaymentBuilder()
          .setSession(session!)
          .setPaymentComponent(paymentComponent)
          .setTheme(theme)
          .build();

      cfPaymentGatewayService.doPayment(cfDropCheckoutPayment);
    } on CFException catch (e) {
      print(e.message);
    }
  }

  CFSession? createSession() {
    try {
      var session = CFSessionBuilder()
          .setEnvironment(environment)
          .setOrderId(widget.cashFreeOrderID)
          .setPaymentSessionId(widget.paymentSessionId)
          .build();
      return session;
    } on CFException catch (e) {
      print(e.message);
    }
    return null;
  }

  newPay() async {
    cfPaymentGatewayService = CFPaymentGatewayService();
    cfPaymentGatewayService.setCallback((p0) async {
      print(p0);
    }, (p0, p1) async {
      print(p0);
      print(p1);
    });
    webCheckout();
  }

  webCheckout() async {
    try {
      var session = createSession();
      var theme = CFThemeBuilder()
          .setNavigationBarBackgroundColorColor("#ff00ff")
          .setNavigationBarTextColor("#ffffff")
          .build();
      var cfWebCheckout = CFWebCheckoutPaymentBuilder()
          .setSession(session!)
          .setTheme(theme)
          .build();
      cfPaymentGatewayService.doPayment(cfWebCheckout);
    } on CFException catch (e) {
      print(e.message);
    }
  }
}

class CashFreeAmountWidgetDirect extends StatefulWidget {
  final num deliveryFee;
  final bool deliveryBool;
  final bool pickupBool;
  final bool cashOnDeliveryBool;
  final String currentMarketID;
  final String deliveryAddress;
  final String houseNumber;
  final String closestBustStop;
  final String vendorID;
  final int orderID;
  final List<Map<String, dynamic>> orders;
  final String uid;
  final String getOnesignalKey;
  final String vendorToken;
  final String pickupAddress;
  final num subTotal;
  const CashFreeAmountWidgetDirect({
    super.key,
    required this.deliveryFee,
    required this.deliveryBool,
    required this.pickupBool,
    required this.cashOnDeliveryBool,
    required this.currentMarketID,
    required this.deliveryAddress,
    required this.houseNumber,
    required this.closestBustStop,
    required this.vendorID,
    required this.orderID,
    required this.orders,
    required this.uid,
    required this.getOnesignalKey,
    required this.vendorToken,
    required this.pickupAddress,
    required this.subTotal,
  });

  @override
  State<CashFreeAmountWidgetDirect> createState() =>
      _CashFreeAmountWidgetDirectState();
}

class _CashFreeAmountWidgetDirectState
    extends State<CashFreeAmountWidgetDirect> {
  var uuid = const Uuid();
  var uuid2 = const Uuid();
  int amount = 0;
  String phone = '';
  dynamic responseData;
  bool isLoading = false;
  String fullname = '';
  String email = '';

  static const Color kGold = Color(0xFFC9A86A);

  getUserDetail() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    firestore.collection('users').doc(user!.uid).get().then((value) {
      setState(() {
        fullname = value['fullname'];
        email = value['email'];
      });
    });
  }

  void makeHttpPostRequest() async {
    setState(() {
      isLoading = true;
    });
    String apiUrl = dotenv.env['apiUrl']!;

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'x-client-id': dotenv.env['client_id']!,
      'x-client-secret': dotenv.env['client_secret']!,
      'x-api-version': '2023-08-01',
      'x-request-id': 'developer_name',
    };

    Map<String, dynamic> requestBody = {
      "order_amount": widget.subTotal.toDouble(),
      "order_id": uuid.v1(),
      "order_currency": "INR",
      "customer_details": {
        "customer_id": uuid2.v1(),
        "customer_name": fullname,
        "customer_email": email,
        "customer_phone": "+91$phone"
      },
      "order_meta": {"notify_url": dotenv.env['notify_url']!},
      "order_note": "some order note here",
    };

    try {
      final http.Response response = await http.post(
        Uri.parse(apiUrl),
        headers: headers,
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        setState(() {
          isLoading = false;
        });
        print('Request successful');
        print('Response: ${response.body}');
        setState(() {
          responseData = response.body;
        });
        // Convert the JSON string to a Map
        var responseDataRequest = jsonDecode(response.body);
        if (responseData != null) {
          // ignore: use_build_context_synchronously
          Navigator.push(context, MaterialPageRoute(builder: (context) {
            return CashFreePageDirect(
              deliveryFee: widget.deliveryFee,
              deliveryBool: widget.deliveryBool,
              pickupBool: widget.pickupBool,
              cashOnDeliveryBool: widget.cashOnDeliveryBool,
              currentMarketID: widget.currentMarketID,
              deliveryAddress: widget.deliveryAddress,
              houseNumber: widget.houseNumber,
              closestBustStop: widget.closestBustStop,
              vendorID: widget.vendorID,
              orderID: widget.orderID,
              orders: widget.orders,
              uid: widget.uid,
              getOnesignalKey: widget.getOnesignalKey,
              vendorToken: widget.vendorToken,
              pickupAddress: widget.pickupAddress,
              subTotal: widget.subTotal,
              amount: widget.subTotal,
              response: responseData,
              cashFreeOrderID: responseDataRequest['order_id'],
              paymentSessionId: responseDataRequest["payment_session_id"],
            );
          }));
        }
      } else {
        setState(() {
          isLoading = false;
        });
        print('Request failed with status: ${response.statusCode}');
        print('Response: ${response.body}');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      print('Error during HTTP request: $e');
    }
  }

  @override
  void initState() {
    getUserDetail();
    super.initState();
  }

  Widget _buildPaymentMethodIcon(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
      decoration: BoxDecoration(
        color: Color(0xFF2F2525),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kGold.withOpacity(0.5), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: kGold.withOpacity(0.18),
            blurRadius: 5,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: kGold.withOpacity(0.85)),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
                color: kGold.withOpacity(0.9),
                fontWeight: FontWeight.w600,
                fontSize: 12),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1D1A1A),
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        backgroundColor: const Color(0xFF2F2525),
        title: const Text(
          'Confirm Order',
          style: TextStyle(color: Colors.white),
        ),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Order Amount",
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 10),
            TextFormField(
              initialValue: widget.subTotal.toString(),
              readOnly: true,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              "Phone Number",
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 8),
            TextFormField(
              style: const TextStyle(color: Colors.white),
              maxLength: 10,
              keyboardType: TextInputType.phone,
              onChanged: (v) => setState(() => phone = v),
              decoration: InputDecoration(
                counterText: "",
                hintText: "Enter your 10-digit phone number",
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (phone.length < 10 || isLoading)
                    ? null
                    : () => makeHttpPostRequest(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: kGold,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  disabledForegroundColor: Colors.black.withOpacity(0.5),
                  disabledBackgroundColor: kGold.withOpacity(0.4),
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          color: Colors.black,
                          strokeWidth: 3,
                        ),
                      )
                    : const Text(
                        "Proceed to Pay",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 25),
            Column(
              children: [
                const SizedBox(height: 28),
                Divider(
                  color: kGold.withOpacity(0.35),
                  thickness: 1.2,
                  indent: 40,
                  endIndent: 40,
                ),
                const SizedBox(height: 14),
                Text(
                  "Payments secured by CashFree",
                  style: TextStyle(
                    color: kGold.withOpacity(0.85),
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 14,
                  runSpacing: 10,
                  children: [
                    _buildPaymentMethodIcon(Icons.qr_code_2_rounded, "UPI"),
                    _buildPaymentMethodIcon(
                        Icons.credit_card_rounded, "Credit / Debit Cards"),
                    _buildPaymentMethodIcon(
                        Icons.account_balance_rounded, "Netbanking"),
                    _buildPaymentMethodIcon(
                        Icons.account_balance_wallet_rounded, "Wallets"),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  "Fast • Secure • 256-bit Encrypted",
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 10),
              ],
            )
          ],
        ),
      ),
    );
  }
}
