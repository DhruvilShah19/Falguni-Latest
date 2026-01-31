// ignore_for_file: avoid_print, unused_local_variable, use_build_context_synchronously

import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:falguni_app/Model/history.dart';
import 'package:falguni_app/Model/order_model.dart';
import 'package:falguni_app/Pages/bottom_nav.dart';
import 'package:falguni_app/Providers/analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:isoweek/isoweek.dart';
import 'package:logger/logger.dart';
import 'package:pinelabs_edge_flutter/checkout/edge.dart';
import 'package:uuid/uuid.dart';

class PluralOnlineDirect extends StatefulWidget {
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

  const PluralOnlineDirect({
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
  State<PluralOnlineDirect> createState() => _PluralOnlineDirectState();
}

class _PluralOnlineDirectState extends State<PluralOnlineDirect> {
  String currencyCode = '';
  String currencySymbol = '';
  String name = '';
  String email = '';
  String phone = '';
  num wallet = 0;
  String id = '';
  bool isLoading = true;

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
        .update({'orderID': widget.orderID + 1});
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
            orderID: widget.orderID + 1,
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
        message: 'New order alert Order ID #${widget.orderID + 1}',
        amount:
            '$currencySymbol ${widget.subTotal + (widget.deliveryBool == false ? 0 : widget.deliveryFee)}',
        paymentSystem: '',
        timeCreated: DateTime.now()));
  }

  @override
  void initState() {
    getCurrencySymbol();
    var uuid = const Uuid();
    orderID = uuid.v1();
    getUserName();
    border = OutlineInputBorder(
      borderSide: BorderSide(
        color: Colors.grey.withOpacity(0.7),
        width: 2.0,
      ),
    );
    super.initState();
  }

  String orderID = '';
  String cardNumber = '';
  String expiryDate = '';
  String cardHolderName = '';
  String cvvCode = '';
  bool isCvvFocused = false;
  bool useGlassMorphism = true;
  bool useBackgroundImage = true;
  OutlineInputBorder? border;
  num amount = 0;
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();

  String hash() {
    return "tht";
  }

  @override
  Widget build(BuildContext context) {
    //   print(phone.substring(3));
    String generateHash(String input) {
      var bytes = utf8.encode(input); // Convert input string to bytes
      var hash = sha256.convert(bytes); // Generate SHA-256 hash
      return hash.toString();
    }

    String txnId = generateHash("98765432${Random().nextInt(9876543)}");

    const String merchantId = "325629";
    const String merchantAccessCode = "649ac8de-8c47-4ea5-b470-bdc4e24732be";
    const String merchantSecret = "1E02100063B54C97895E45010AC68543";

    // const String _customer_mobile = "8447358656";
    // const String _customer_email = email;
    // const String _customer_name = "Harsh Kumar";
    const String customerAddress = "hno 15";
    const String customPincode = "411037";

    const String productCode = "40";

    const String payModes = "1,4,10";

    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        backgroundColor: Theme.of(context).cardColor,
        title: Text(
          'Plural Online Payment',
          style: TextStyle(color: Theme.of(context).iconTheme.color),
        ),
        elevation: 0,
      ),
      body: Center(
        child: isLoading == true
            ? const CircularProgressIndicator()
            : Edge(
                PPC_PROD: false,
                callback: (bool status, response) => {
                  print('==== '),
                  print(response),
                  print(status),
                  print('Status is $status'),
                  if (status == true)
                    {
                      pushOrder()
                      // updateHistory(HistoryModel(
                      //     message: 'Upload',
                      //     amount: amount,
                      //     paymentSystem: paymentSystem,
                      //     timeCreated: D))
                    }
                  else
                    {
                      Fluttertoast.showToast(
                              msg: "Transaction unsuccessful",
                              toastLength: Toast.LENGTH_LONG,
                              gravity: ToastGravity.CENTER,
                              timeInSecForIosWeb: 1,
                              fontSize: 16.0)
                          .then((value) {
                        Navigator.pop(context);
                      }),
                    }
                },
                PPC_AMOUNT:
                    '${(widget.subTotal + (widget.deliveryBool == false ? 0 : widget.deliveryFee)).toString()}00',
                //
                PPC_UNIQUEMERCHANTTXNID: txnId,
                //
                PPC_MERCHANTID: merchantId,
                PPC_MERCHANT_SECRET: merchantSecret,
                PPC_MERCHANTACCESSCODE: merchantAccessCode,
                //
                PPC_PAYMODEONLANDINGPAGE: payModes,
                //
                PPC_CUSTOMERMOBILE: phone,
                PPC_CUSTOMEREMAIL: email,
                //  PPC_CUSTOMERADDRESS: _customer_address, // optional
                // PPC_CUSTOMERPINCODE: _custom_pincode, // optional
                // PPC_CUSTOMER_ID: "786", // optional
                //
                //  PPC_PRODUCT_CODE: _product_code, // optional
              ),
      ),
    );
  }
}
