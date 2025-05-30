// ignore_for_file: avoid_print, use_build_context_synchronously, duplicate_ignore, deprecated_member_use

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

    // if (walletBool == true) {
    //   // updateWallet();
    //   updateHistory(HistoryModel(
    //       timeCreated:
    //           DateFormat.yMMMMEEEEd().format(DateTime.now()).toString(),
    //       message: 'Placed an order'.tr(),
    //       amount:
    //           '-$currencySymbol${subTotal + (deliveryBool == false ? 0 : deliveryFee)}',
    //       paymentSystem: ''));
    // }
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
        timeCreated:
            DateFormat.yMMMMEEEEd().format(DateTime.now()).toString()));
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
    // Convert the JSON string to a Map
    // Map<String, dynamic> responseData = jsonDecode(widget.response);
    // cashFreeOrderId = responseData['order_id'];
    // paymentSessionId = responseData["payment_session_id"];
    // print('Payment Session is ${responseData['payment_session_id']}');
    return Scaffold(
      appBar: AppBar(
        title: const Text('CashFree Payment Gateway'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          // crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Container(
            //   height: 500,
            //   width: 500,
            //   child: WebViewWidget(controller: controller),
            // )
            // TextButton(onPressed: pay, child: const Text("Pay")),
            ElevatedButton(
                onPressed: webCheckout, child: const Text("Contnue")),
            //  cfCardWidget!,
            // TextButton(onPressed: cardPay, child: const Text("Card Pay")),
            // TextButton(
            //     onPressed: upiCollectPay, child: const Text("UPI Collect Pay")),
            // TextButton(
            //     onPressed: upiIntentPay, child: const Text("UPI Intent Pay")),
            // TextButton(
            //     onPressed: netbankingPay, child: const Text("Netbanking Pay")),
          ],
        ),
      ),
    );
  }

  // "var cardNumber = document.createElement('div');\ncardNumber.id = \"cardNumber\";\nvar cardCvv = document.createElement('div');\ncardCvv.id = \"cardCvv\";\nvar cardExpiry = document.createElement('div');\ncardExpiry.id = \"cardExpiry\";\nvar cardHolder = document.createElement('div');\ncardHolder.id = \"cardHolder\";\nvar payButton = document.createElement('button');\npayButton.id = \"payButton\";\n\n\nconst cashfree = await load({ \n      mode: \"sandbox\", //or production\n    });\n\n    const cardComponent = cashfree.create(\"cardNumber\", {});\n    cardComponent.mount(\"#cardNumber\");\n\n    const cardCvv = cashfree.create(\"cardCvv\", {});\n    cardCvv.mount(\"#cardCvv\");\n\n    const cardExpiry = cashfree.create(\"cardExpiry\", {});\n    cardExpiry.mount(\"#cardExpiry\");\n\n    const cardHolder = cashfree.create(\"cardHolder\", {});\n    cardHolder.mount(\"#cardHolder\");\n\n    const showError = function(e){\n      alert(e.message)\n    }\n\n    document.querySelector(\"#payBtn\").addEventListener(\"click\", async () => {\n      cashfree.pay({\n        paymentMethod: cardComponent,\n        paymentSessionId: \"yourPaymentSession\",\n        returnUrl: \"https://merchantsite.com/return?order_id={order_id}\",\n      }).then(function (data) {\n        if (data != null && data.error) {\n          return showError(data.error)\n        }\n      });\n    })"

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
    // print(cardListener.getMetaData());
  }

  // String cashFreeOrderId = "";
  // String paymentSessionId = "";
  void receivedEvent(String eventName, Map<dynamic, dynamic> metaData) {
    print(eventName);
    print(metaData);
  }

  // String cashFreeOrderId = "order_18482TC1GWfnEYW3gheFhy4mArfynXh";
  // String paymentSessionId = "session_gMej8P4gvNUKLbd3fGWVw7Njg5fj3KK4We0HjCg6Tkzy5yZ8mkghdv7vKels1CJ8fBz9_aVpSoU8n5rqufVQrexzhLW0g0dzgdiTJwmrkZYn";

  // String cashFreeOrderId = "order_18482OupTxSofcClBAlgqyYxUVceHo8";
  // String paymentSessionId = "session_oeYlKCusKyW5pND4Swzn1rE2-gwnoM8MOC2nck9RjIiUQwXcPLWB3U1xHaaItb-uA9H1k6Fwziq9O63DWcfYGy_3B7rl1nDFo3MMeVqiYrBr";
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        backgroundColor: Theme.of(context).cardColor,
        title: Text(
          'Order amount',
          style: TextStyle(color: Theme.of(context).iconTheme.color),
        ),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Text('Order Amount'),
                ],
              ),
            ),
            // const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
                initialValue: widget.subTotal.toString(),
                readOnly: true,
                onChanged: (v) {
                  setState(() {
                    amount = int.parse(v);
                  });
                },
                decoration: const InputDecoration(
                    hintText: 'Enter Amount', border: OutlineInputBorder()),
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Text('Phone'),
                ],
              ),
            ),
            // const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
                maxLength: 10,
                onChanged: (v) {
                  setState(() {
                    phone = v;
                  });
                },
                decoration: const InputDecoration(
                    counterText: '',
                    hintText: 'XXX XXX XXXX',
                    border: OutlineInputBorder()),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
                onPressed: phone.length < 10 || isLoading == true
                    ? null
                    : () {
                        makeHttpPostRequest();
                      },
                child: const Text('Pay'))
          ],
        ),
      ),
    );
  }
}
