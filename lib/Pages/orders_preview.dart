// ignore_for_file: avoid_print, use_build_context_synchronously, deprecated_member_use, prefer_const_constructors

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:falguni_app/Widgets/product_return_detail.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:gap/gap.dart';
import 'package:geocode/geocode.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../Model/formatter.dart';
import '../Model/history.dart';
import '../Model/order_model.dart';
import '../Widgets/map.dart';

class OrdersPreview extends StatefulWidget {
  final OrderModel2 orderModel;
  final String currencySymbol;

  const OrdersPreview({
    required this.orderModel,
    required this.currencySymbol,
    super.key,
  });

  @override
  State<OrdersPreview> createState() => _OrdersPreviewState();
}

class _OrdersPreviewState extends State<OrdersPreview> {
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kDarkBg = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  String marketName = '';
  String marketAddress = '';
  String marketPhone = '';
  String riderName = '';
  String riderAddress = '';
  String riderPhone = '';
  num wallet = 0;
  DocumentReference? userDetails;
  String orderStatus = '';
  bool accepted = false;
  bool acceptDelivery = false;
  String deliveryAddress = '';
  String deliveryBoyID = '';
  num riderWallet = 0;
  bool confirmationStatus = false;
  String getOnesignalKey = '';
  String playerId = '';
  Timer? oneSignalTimer;
  num totalNumberOfUserRatingRider = 0;
  num totalNumberOfUserRatingMarket = 0;
  num totalRatingRider = 0;
  num totalRatingMarket = 0;
  String reviewMarket = '';
  num ratingValMarket = 0;
  String reviewRider = '';
  num ratingValRider = 0;
  String reviewProduct = '';
  num ratingValProduct = 0;
  String userFullname = '';
  String userProfilePic = '';
  num? tip;


  num marketLat = 0;
  num marketLong = 0;

  double deliveryAddressLat = 0;
  double deliveryAddressLong = 0;

  String currentAddress = '';
  double addressLat = 0;
  double addressLong = 0;

  bool pleaseWait = false;

  // ---------------------------------------------------------------------------
  // RATING DIALOGS (unchanged logic, minor UI tweaks)
  // ---------------------------------------------------------------------------

  ratingAndReviewProduct(String productID, num totalRatingProduct,
      num totalNumberOfUserRatingProduct) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Review Product').tr(),
          content: SizedBox(
            height: MediaQuery.of(context).size.height / 3,
            width: double.infinity,
            child: Column(
              children: [
                RatingBar.builder(
                  initialRating: 1,
                  minRating: 1,
                  direction: Axis.horizontal,
                  allowHalfRating: true,
                  itemCount: 5,
                  itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                  itemBuilder: (context, _) => const Icon(
                    Icons.star,
                    color: Colors.amber,
                  ),
                  onRatingUpdate: (rating) {
                    setState(() {
                      ratingValProduct = rating;
                    });
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Review Product'.tr(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      reviewProduct = val;
                    });
                  },
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    FirebaseFirestore.instance
                        .collection('Products')
                        .doc(productID)
                        .update({
                      'totalRating': totalRatingProduct + ratingValProduct,
                      'totalNumberOfUserRating':
                          totalNumberOfUserRatingProduct + 1
                    });
                    FirebaseFirestore.instance
                        .collection('Products')
                        .doc(productID)
                        .collection('Ratings')
                        .add({
                      'rating': ratingValProduct,
                      'review': reviewProduct,
                      'fullname': userFullname,
                      'profilePicture': userProfilePic,
                      'timeCreated': DateFormat.yMMMMEEEEd()
                          .format(DateTime.now())
                          .toString()
                    }).then((value) => Navigator.of(context).pop());
                  },
                  child: const Text('Submit').tr(),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  ratingAndReviewRider() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Rate And Review Rider').tr(),
          content: SizedBox(
            height: MediaQuery.of(context).size.height / 3,
            width: double.infinity,
            child: Column(
              children: [
                RatingBar.builder(
                  initialRating: 1,
                  minRating: 1,
                  direction: Axis.horizontal,
                  allowHalfRating: true,
                  itemCount: 5,
                  itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                  itemBuilder: (context, _) => const Icon(
                    Icons.star,
                    color: Colors.amber,
                  ),
                  onRatingUpdate: (rating) {
                    setState(() {
                      ratingValRider = rating;
                    });
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Review Rider'.tr(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      reviewRider = val;
                    });
                  },
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    FirebaseFirestore.instance
                        .collection('drivers')
                        .doc(deliveryBoyID)
                        .update({
                      'totalRating': totalRatingRider + ratingValRider,
                      'totalNumberOfUserRating':
                          totalNumberOfUserRatingRider + 1
                    });
                    FirebaseFirestore.instance
                        .collection('drivers')
                        .doc(deliveryBoyID)
                        .collection('Ratings')
                        .add({
                      'rating': ratingValRider,
                      'review': reviewRider,
                      'fullname': userFullname,
                      'profilePicture': userProfilePic,
                      'timeCreated': DateFormat.yMMMMEEEEd()
                          .format(DateTime.now())
                          .toString()
                    }).then((value) => Navigator.of(context).pop());
                  },
                  child: const Text('Submit').tr(),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  ratingAndReviewMarket() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Rate And Review Market').tr(),
          content: SizedBox(
            height: MediaQuery.of(context).size.height / 3,
            width: double.infinity,
            child: Column(
              children: [
                RatingBar.builder(
                  initialRating: 1,
                  minRating: 1,
                  direction: Axis.horizontal,
                  allowHalfRating: true,
                  itemCount: 5,
                  itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                  itemBuilder: (context, _) => const Icon(
                    Icons.star,
                    color: Colors.amber,
                  ),
                  onRatingUpdate: (rating) {
                    setState(() {
                      ratingValMarket = rating;
                    });
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Review Market'.tr(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      reviewMarket = val;
                    });
                  },
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    FirebaseFirestore.instance
                        .collection('Markets')
                        .doc(widget.orderModel.marketID)
                        .update({
                      'totalRating': totalRatingMarket + ratingValMarket,
                      'totalNumberOfUserRating':
                          totalNumberOfUserRatingMarket + 1
                    });
                    FirebaseFirestore.instance
                        .collection('Markets')
                        .doc(widget.orderModel.marketID)
                        .collection('Ratings')
                        .add({
                      'rating': ratingValMarket,
                      'review': reviewMarket,
                      'fullname': userFullname,
                      'profilePicture': userProfilePic,
                      'timeCreated': DateFormat.yMMMMEEEEd()
                          .format(DateTime.now())
                          .toString()
                    }).then((value) => Navigator.of(context).pop());
                  },
                  child: const Text('Submit'),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // FIRESTORE / TRACK ORDER LOGIC (unchanged)
  // ---------------------------------------------------------------------------

  getOrderDetails() async {
    FirebaseFirestore.instance
        .collection('Orders')
        .doc(widget.orderModel.uid)
        .snapshots()
        .listen((value) {
      setState(() {
        orderStatus = value['status'];
        accepted = value['accept'];
        acceptDelivery = value['acceptDelivery'];
        deliveryAddress = value['deliveryAddress'];
        deliveryBoyID = value['deliveryBoyID'];
        confirmationStatus = value['confirmationStatus'];
      });
    });
  }

  getRiderDetails(String deliveryBoyID) {
    if (deliveryBoyID != '') {
      FirebaseFirestore.instance
          .collection('drivers')
          .doc(widget.orderModel.deliveryBoyID)
          .snapshots()
          .listen((val) {
        setState(() {
          riderName = val['fullname'];
          riderAddress = val['address'];
          riderPhone = val['phone'];
          riderWallet = val['wallet'];
          totalRatingRider = val['totalRating'];
          totalNumberOfUserRatingRider = val['totalNumberOfUserRating'];
        });
      });
    }
  }

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    User? user = auth.currentUser;
    setState(() {
      userDetails =
          firestore.collection('users').doc(user!.uid).get().then((value) {
        setState(() {
          wallet = value['wallet'];
          userFullname = value['fullname'];
          userProfilePic = value['photoUrl'];
        });
      }) as DocumentReference<Object?>?;
    });
  }

  updateWallet() {
    FirebaseFirestore.instance
        .collection('users')
        .doc(widget.orderModel.userID)
        .update({'wallet': wallet + widget.orderModel.total});
  }

  getOneSignalDetails() {
    if (getOnesignalKey == '') {
      FirebaseFirestore.instance
          .collection('Push notification Settings')
          .doc('OneSignal')
          .snapshots()
          .listen((value) {
        setState(() {
          getOnesignalKey = value['OnesignalKey'];
        });
      });
    }
  }

  updateHistory(HistoryModel historyModel, String collection, String id) {
    FirebaseFirestore.instance
        .collection(collection)
        .doc(id)
        .collection('History')
        .add(historyModel.toMap());
  }

  @override
  void initState() {
    getOneSignalDetails();
    getOrderDetails();
    _getUserDetails();
    super.initState();
  }

  Future<void> updatedriverNotification(HistoryModel historyModel) async {
    await FirebaseFirestore.instance
        .collection('drivers')
        .doc(deliveryBoyID)
        .collection('Notifications')
        .add(historyModel.toMap());
  }

  confirmFunc(bool status) async {
    setState(() {
      pleaseWait = true;
    });
    updatedriverNotification(
      HistoryModel(
        message:
            'Congratulations, Your delivery has been confirmed. Order ID #${widget.orderModel.orderID}',
        timeCreated: DateTime.now(),
        amount: '-${widget.currencySymbol}${widget.orderModel.deliveryFee}',
        paymentSystem: '',
      ),
    );
    FirebaseFirestore.instance
        .collection('Orders')
        .doc(widget.orderModel.uid)
        .update({'confirmationStatus': status}).then((value) {
      Navigator.of(context).pop();
      setState(() {
        pleaseWait = false;
      });
    });
  }

  updateDriverWallet(num wallet) {
    FirebaseFirestore.instance
        .collection('drivers')
        .doc(widget.orderModel.deliveryBoyID)
        .update({'wallet': wallet});
  }

  getDeliveryLocationLatAndLong() async {
    GeoCode geoCode = GeoCode();
    if (deliveryAddressLat == 0 && deliveryAddressLong == 0) {
      Coordinates coordinates = await geoCode.forwardGeocoding(
        address: widget.orderModel.deliveryAddress,
      );
      if (mounted) {
        setState(() {
          deliveryAddressLat = coordinates.latitude!;
          deliveryAddressLong = coordinates.longitude!;
        });
      }
    }
  }

  getCurrentLocationLatAndLong() async {
    if (widget.orderModel.deliveryAddress == '' && currentAddress != '') {
      List<Location> locations = await locationFromAddress(currentAddress);

      setState(() {
        for (var element in locations) {
          deliveryAddressLong = element.longitude;
          deliveryAddressLat = element.latitude;
        }
      });
    }
  }

  getLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }
    if (currentAddress == '') {
      Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.best);
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      for (var element in placemarks) {
        setState(() {
          currentAddress = element.name!;
        });
      }
    }
  }

  Widget _buildReceiptUI() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Center(
          child: Text(
            'Falguni Gruh Udhyog',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 4),
        Center(
          child: Text(
            'ORDER RECEIPT'.tr(),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
        ),
        const Divider(thickness: 1),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Order ID: #${widget.orderModel.orderID}',
                style: const TextStyle(fontSize: 12)),
            if (widget.orderModel.timeCreated != null)
              Text(_formatTimeSafe(widget.orderModel.timeCreated),
                  style: const TextStyle(fontSize: 12)),
          ],
        ),
        const SizedBox(height: 4),
        Text('Status: ${orderStatus.tr()}',
            style: const TextStyle(fontSize: 12)),
        const Divider(),
        if (userFullname.isNotEmpty)
          Text('Customer: $userFullname', style: const TextStyle(fontSize: 13)),
        if (widget.orderModel.deliveryAddress.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text('Delivery Address: ${widget.orderModel.deliveryAddress}',
              style: const TextStyle(fontSize: 13)),
          if (widget.orderModel.houseNumber.isNotEmpty)
            Text('House No: ${widget.orderModel.houseNumber}',
                style: const TextStyle(fontSize: 13)),
        ] else if (widget.orderModel.pickupAddress.isNotEmpty)
          Text('Pickup Address: ${widget.orderModel.pickupAddress}',
              style: const TextStyle(fontSize: 13)),
        const Divider(),
        Text('ITEMS:'.tr(),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 4),
        ...widget.orderModel.orders.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${item.productName} (x${item.quantity})',
                            style: const TextStyle(
                                fontWeight: FontWeight.w500, fontSize: 13)),
                        Text(
                          '  ${item.selected}',
                          style:
                              TextStyle(color: Colors.grey[700], fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${widget.currencySymbol}${Formatter().converter(item.selectedPrice.toDouble())}',
                    style: const TextStyle(fontSize: 13),
                  ),
                ],
              ),
            )),
        const Divider(),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Payment Type:'.tr(), style: const TextStyle(fontSize: 13)),
            Text('Cash Free'.tr(), style: const TextStyle(fontSize: 13)),
          ],
        ),
        if (widget.orderModel.deliveryFee > 0)
          Padding(
            padding: const EdgeInsets.only(top: 4.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Delivery Fee:'.tr(),
                    style: const TextStyle(fontSize: 13)),
                Text(
                    '${widget.currencySymbol}${Formatter().converter(widget.orderModel.deliveryFee.toDouble())}',
                    style: const TextStyle(fontSize: 13)),
              ],
            ),
          ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'TOTAL:'.tr(),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            Text(
              '${widget.currencySymbol}${Formatter().converter(widget.orderModel.total.toDouble())}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
          ],
        ),
        const Divider(thickness: 1),
        Center(
            child: Text('Thank you for your order!'.tr(),
                style: const TextStyle(
                    fontSize: 12, fontStyle: FontStyle.italic))),
      ],
    );
  }

  String _generateReceiptText() {
    final StringBuffer buffer = StringBuffer();
    buffer.writeln('Falguni Gruh Udhyog');
    buffer.writeln('ORDER RECEIPT');
    buffer.writeln('--------------------------------');
    buffer.writeln('Order ID: #${widget.orderModel.orderID}');
    if (widget.orderModel.timeCreated != null) {
      buffer.writeln(
          'Date: ${DateFormat('dd MMM yyyy, hh:mm a').format(widget.orderModel.timeCreated!)}');
    }
    buffer.writeln('Status: ${orderStatus.tr()}');
    buffer.writeln('--------------------------------');
    if (userFullname.isNotEmpty) {
      buffer.writeln('Customer: $userFullname');
    }
    if (widget.orderModel.deliveryAddress.isNotEmpty) {
      buffer.writeln('Delivery Address: ${widget.orderModel.deliveryAddress}');
      if (widget.orderModel.houseNumber.isNotEmpty) {
        buffer.writeln('House No: ${widget.orderModel.houseNumber}');
      }
    } else if (widget.orderModel.pickupAddress.isNotEmpty) {
      buffer.writeln('Pickup Address: ${widget.orderModel.pickupAddress}');
    }
    buffer.writeln('--------------------------------');
    buffer.writeln('ITEMS:');
    for (var item in widget.orderModel.orders) {
      buffer.writeln('${item.productName} (x${item.quantity})');
      buffer.writeln(
          '  ${item.selected} - ${widget.currencySymbol}${Formatter().converter(item.selectedPrice.toDouble())}');
    }
    buffer.writeln('--------------------------------');
    buffer.writeln(
        'Payment Type: ${widget.orderModel.paymentType == 'Wallet' ? 'Wallet'.tr() : 'Cash Free'.tr()}');
    if (widget.orderModel.deliveryFee > 0) {
      buffer.writeln(
          'Delivery Fee: ${widget.currencySymbol}${Formatter().converter(widget.orderModel.deliveryFee.toDouble())}');
    }
    buffer.writeln(
        'TOTAL: ${widget.currencySymbol}${Formatter().converter(widget.orderModel.total.toDouble())}');
    buffer.writeln('--------------------------------');
    buffer.writeln('Thank you for your order!');

    return buffer.toString();
  }

  Future<void> _printReceipt() async {
    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Center(
                child: pw.Text('Falguni Gruh Udhyog',
                    style: pw.TextStyle(
                        fontSize: 24, fontWeight: pw.FontWeight.bold)),
              ),
              pw.SizedBox(height: 10),
              pw.Center(
                child: pw.Text('ORDER RECEIPT',
                    style: pw.TextStyle(
                        fontSize: 18, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Divider(),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Order ID: #${widget.orderModel.orderID}'),
                  if (widget.orderModel.timeCreated != null)
                    pw.Text(
                        'Date: ${DateFormat('dd MMM yyyy, hh:mm a').format(widget.orderModel.timeCreated!)}'),
                ],
              ),
              pw.SizedBox(height: 5),
              pw.Text('Status: ${orderStatus.tr()}'),
              pw.Divider(),
              if (userFullname.isNotEmpty) pw.Text('Customer: $userFullname'),
              if (widget.orderModel.deliveryAddress.isNotEmpty) ...[
                pw.Text(
                    'Delivery Address: ${widget.orderModel.deliveryAddress}'),
                if (widget.orderModel.houseNumber.isNotEmpty)
                  pw.Text('House No: ${widget.orderModel.houseNumber}'),
              ] else if (widget.orderModel.pickupAddress.isNotEmpty)
                pw.Text('Pickup Address: ${widget.orderModel.pickupAddress}'),
              pw.Divider(),
              pw.Text('ITEMS:',
                  style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 5),
              ...widget.orderModel.orders.map(
                (item) => pw.Container(
                  margin: const pw.EdgeInsets.only(bottom: 5),
                  child: pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Expanded(
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text('${item.productName} (x${item.quantity})',
                                style: pw.TextStyle(
                                    fontWeight: pw.FontWeight.bold)),
                            pw.Text('  ${item.selected}',
                                style: const pw.TextStyle(
                                    fontSize: 10, color: PdfColors.grey700)),
                          ],
                        ),
                      ),
                      pw.Text(
                          '${widget.currencySymbol}${Formatter().converter(item.selectedPrice.toDouble())}'),
                    ],
                  ),
                ),
              ),
              pw.Divider(),
              pw.Text(
                  'Payment Type: ${widget.orderModel.paymentType == 'Wallet' ? 'Wallet'.tr() : 'Cash Free'.tr()}'),
              if (widget.orderModel.deliveryFee > 0)
                pw.Text(
                    'Delivery Fee: ${widget.currencySymbol}${Formatter().converter(widget.orderModel.deliveryFee.toDouble())}'),
              pw.SizedBox(height: 5),
              pw.Text(
                  'TOTAL: ${widget.currencySymbol}${Formatter().converter(widget.orderModel.total.toDouble())}',
                  style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Divider(),
              pw.Center(child: pw.Text('Thank you for your order!')),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async => doc.save());
  }

  void _showReceiptDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Order Receipt').tr(),
          content: Container(
            width: double.maxFinite,
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.6,
            ),
            child: SingleChildScrollView(
              child: _buildReceiptUI(),
            ),
          ),
          actions: [
            TextButton.icon(
              onPressed: () {
                _printReceipt();
              },
              icon: const Icon(Icons.print),
              label: const Text('Print/Download').tr(),
            ),
            TextButton.icon(
              onPressed: () {
                String receiptText = _generateReceiptText();
                Clipboard.setData(ClipboardData(text: receiptText));
                Fluttertoast.showToast(msg: "Receipt copied to clipboard".tr());
              },
              icon: const Icon(Icons.copy),
              label: const Text('Copy').tr(),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close').tr(),
            ),
          ],
        );
      },
    );
  }

  Future<Future<bool>> openWhatsApp() async {
    return launchUrl(
      Uri.parse(
        'whatsapp://send?phone=+919328299680',
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // STATUS HELPERS (for modern timeline UI)
  // ---------------------------------------------------------------------------

  bool get _isCancelled => orderStatus == 'Cancelled';

  bool get _stepReceivedActive =>
      orderStatus == 'Received' ||
      orderStatus == 'Processing' ||
      orderStatus == 'On the way' ||
      orderStatus == 'Completed' ||
      accepted;

  bool get _stepAcceptedActive => accepted == true;

  bool get _stepProcessingActive =>
      (acceptDelivery == true &&
          (orderStatus == 'Processing' || orderStatus == 'Completed')) ||
      (accepted == true &&
          deliveryAddress == '' &&
          (orderStatus == 'Processing' || orderStatus == 'Completed'));

  bool get _stepOnTheWayActive {
    if (deliveryAddress != '') {
      return acceptDelivery == true &&
          (orderStatus == 'On the way' || orderStatus == 'Completed');
    } else {
      return accepted == true &&
          deliveryAddress == '' &&
          orderStatus == 'Completed';
    }
  }

  bool get _stepCompletedActive =>
      orderStatus == 'Completed' ||
      (accepted == true && deliveryAddress == '' && orderStatus == 'Completed');

  String get _statusLabel {
    if (_isCancelled) return 'Cancelled'.tr();
    return orderStatus.tr();
  }

  Color get _statusColor {
    if (_isCancelled) return Colors.redAccent;
    if (orderStatus == 'Completed') return Colors.greenAccent;
    if (orderStatus == 'Pending Payment') return Colors.orangeAccent;
    return kGold;
  }

  // ---------------------------------------------------------------------------
  // BUILD UI
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    // Still calling these like your original code
    getCurrentLocationLatAndLong();
    getDeliveryLocationLatAndLong();
    getLocation();

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: kDarkBg,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        title: Text(
          'Order #${widget.orderModel.orderID}',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ).tr(),
        actions: [
          IconButton(
            onPressed: _showReceiptDialog,
            icon: const Icon(Icons.receipt_long),
            tooltip: 'View Receipt'.tr(),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              kDarkBg,
              kBgMid,
              kDarkBg,
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildOrderSummaryCard(),
                if (orderStatus == 'Pending Payment') ...[
                  const Gap(16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orangeAccent.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.orangeAccent.withOpacity(0.3), width: 1),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.payment_outlined, color: Colors.orangeAccent, size: 32),
                        const SizedBox(height: 8),
                        const Text(
                          'Awaiting Payment',
                          style: TextStyle(
                            color: Colors.orangeAccent,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ).tr(),
                        const SizedBox(height: 4),
                        const Text(
                          'This order was not fully paid and has not been confirmed. It will not be processed until payment is received.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ).tr(),
                      ],
                    ),
                  ),
                ],
                const Gap(16),
                _buildTrackingCard(),
                const Gap(16),

                _buildPaymentCard(),
                const Gap(16),
                _buildDeliveryCard(),
                const Gap(16),
                _buildProductsSection(),
                const Gap(20),
                _buildActionsSection(),
                const Gap(20),
                _buildWhatsAppCard(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SECTION WIDGETS
  // ---------------------------------------------------------------------------

  Widget _buildOrderSummaryCard() {
    final timeText = widget.orderModel.timeCreated != null
        ? _formatTimeSafe(widget.orderModel.timeCreated)
        : '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kGold.withOpacity(0.35), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: ID + status badge
          Row(
            children: [
              Expanded(
                child: Text(
                  'Order #${widget.orderModel.orderID}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.16),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: _statusColor, width: 1),
                ),
                child: Row(
                  children: [
                    Icon(
                      _isCancelled
                          ? Icons.error_outline
                          : orderStatus == 'Completed'
                              ? Icons.check_circle_outline
                              : Icons.local_shipping_outlined,
                      size: 16,
                      color: _statusColor,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _statusLabel,
                      style: TextStyle(
                        color: _statusColor,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            timeText,
            style: TextStyle(
              color: Colors.white.withOpacity(0.65),
              fontSize: 12.5,
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Colors.white24),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildSummaryItem(
                icon: Icons.payment,
                label: 'Payment type'.tr(),
                value: 'Cash Free'.tr(),
              ),
              const SizedBox(width: 16),
              _buildSummaryItem(
                icon: Icons.receipt_long_outlined,
                label: 'Total'.tr(),
                value:
                    '${widget.currencySymbol}${Formatter().converter(widget.orderModel.total.toDouble())}',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Expanded(
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 18, color: kGold),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.65),
                    fontSize: 11.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingCard() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: kGold.withOpacity(0.35), width: 1),
        color: Colors.white.withOpacity(0.04),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.30),
            blurRadius: 20,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Row(
              children: [
                Icon(Icons.route_outlined, color: kGold, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Order Tracking'.tr(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Map
          ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: SizedBox(
              height: 220,
              width: double.infinity,
              child: deliveryAddressLat != 0 && deliveryAddressLong != 0
                  ? MapScreen(
                      zoom: 5,
                      userLat: deliveryAddressLat,
                      address: marketAddress,
                      userLong: deliveryAddressLong,
                      marketLong: marketLong,
                      marketLat: marketLat,
                    )
                  : Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            kGold.withOpacity(0.6),
                            Colors.black.withOpacity(0.9),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'Map will appear once location is available'.tr(),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 14),
          // Timeline
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: _buildStatusTimeline(),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTimeline() {
    final bool isPickupFlow = widget.orderModel.deliveryAddress.isEmpty;

    final List<_StepConfig> steps = [
      _StepConfig(label: 'Received'.tr(), active: _stepReceivedActive),
      _StepConfig(label: 'Accepted'.tr(), active: _stepAcceptedActive),
      _StepConfig(label: 'Processing'.tr(), active: _stepProcessingActive),
      _StepConfig(
        label: isPickupFlow ? 'Pick up'.tr() : 'On the way'.tr(),
        active: _stepOnTheWayActive,
      ),
      _StepConfig(label: 'Completed'.tr(), active: _stepCompletedActive),
    ];

    // If cancelled, show compact cancelled UI
    if (_isCancelled) {
      return Row(
        children: [
          Icon(Icons.error_outline, color: Colors.redAccent),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'This order was cancelled.'.tr(),
              style: TextStyle(
                color: Colors.white.withOpacity(0.85),
                fontSize: 13,
              ),
            ),
          )
        ],
      );
    }

    return Column(
      children: [
        Row(
          children: List.generate(steps.length * 2 - 1, (index) {
            if (index.isOdd) {
              // Connector
              final prev = steps[(index - 1) ~/ 2];
              final next = steps[(index + 1) ~/ 2];
              final bool connectorActive = prev.active && next.active;
              return Expanded(
                child: Container(
                  height: 2,
                  color:
                      connectorActive ? kGold : Colors.white.withOpacity(0.25),
                ),
              );
            } else {
              final step = steps[index ~/ 2];
              return _buildStepDot(step);
            }
          }),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: steps
              .map(
                (s) => Expanded(
                  child: Align(
                    alignment: Alignment.center,
                    child: Text(
                      s.label,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: s.active
                            ? Colors.white
                            : Colors.white.withOpacity(0.55),
                        fontSize: 11,
                        fontWeight:
                            s.active ? FontWeight.w600 : FontWeight.w400,
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildStepDot(_StepConfig step) {
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: step.active ? kGold : Colors.white.withOpacity(0.5),
          width: 2,
        ),
        color: step.active ? kGold.withOpacity(0.18) : Colors.transparent,
      ),
      child: Center(
        child: Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: step.active ? kGold : Colors.white.withOpacity(0.5),
          ),
        ),
      ),
    );
  }



  Widget _buildInfoRow(IconData icon, String label, String value,
      {Widget? trailing}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.white70, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.65),
                  fontSize: 11.5,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        if (trailing != null) trailing,
      ],
    );
  }

  Widget _buildPaymentCard() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white24, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.payment, color: kGold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Payment Detail'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(Icons.account_balance_wallet_outlined,
                  color: Colors.white70, size: 18),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.orderModel.paymentType == 'Wallet'
                          ? 'Wallet'.tr()
                          : 'Cash Free'.tr(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Payment type'.tr(),
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.65),
                        fontSize: 11.5,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '${widget.currencySymbol}${Formatter().converter(widget.orderModel.total.toDouble())}',
                style: TextStyle(
                  color: kGold,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          if (widget.orderModel.cashFreeDetails != null) ...[
            const SizedBox(height: 12),
            const Divider(color: Colors.white24),
            const SizedBox(height: 8),
            Text(
              'Cashfree Transaction Details'.tr(),
              style: const TextStyle(
                color: kGold,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow(
                      Icons.receipt_long,
                      'Payment ID'.tr(),
                      widget.orderModel.cashFreeDetails['cf_order_id']
                              ?.toString() ??
                          'N/A'),
                  const SizedBox(height: 8),
                  _buildInfoRow(
                      Icons.tag,
                      'Order Ref'.tr(),
                      widget.orderModel.cashFreeDetails['order_id']
                              ?.toString() ??
                          'N/A'),
                  const SizedBox(height: 8),
                  _buildInfoRow(Icons.payments_outlined, 'Amount'.tr(),
                      '${widget.orderModel.cashFreeDetails['order_currency']} ${widget.orderModel.cashFreeDetails['order_amount']}'),
                  const SizedBox(height: 8),
                  _buildInfoRow(
                      Icons.access_time,
                      'Time'.tr(),
                      widget.orderModel.cashFreeDetails['created_at']
                              ?.toString() ??
                          'N/A'),
                  const SizedBox(height: 8),
                  _buildInfoRow(
                      Icons.info_outline,
                      'Status'.tr(),
                      widget.orderModel.cashFreeDetails['order_status']
                              ?.toString() ??
                          'N/A'),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeliveryCard() {
    final bool isDelivery = widget.orderModel.deliveryAddress.isNotEmpty;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white24, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isDelivery ? Icons.local_shipping_outlined : Icons.storefront,
                color: kGold,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Delivery Detail'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (isDelivery) ...[
            _buildInfoRow(
              Icons.room,
              'Delivery Address'.tr(),
              widget.orderModel.deliveryAddress,
            ),
            const SizedBox(height: 6),
            _buildInfoRow(
              Icons.home,
              'House number'.tr(),
              widget.orderModel.houseNumber,
            ),
            const SizedBox(height: 6),
            _buildInfoRow(
              Icons.bus_alert,
              'Closest Bus stop'.tr(),
              widget.orderModel.closesBusStop,
            ),
          ] else
            _buildInfoRow(
              Icons.room,
              'Pick Up'.tr(),
              widget.orderModel.pickupAddress,
            ),
        ],
      ),
    );
  }

  Widget _buildProductsSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white24, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.shopping_bag_outlined, color: kGold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Products'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Column(
            children: widget.orderModel.orders.map((e) {
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListTile(
                      contentPadding: const EdgeInsets.fromLTRB(12, 4, 12, 4),
                      leading: CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.white12,
                        backgroundImage:
                            e.image.isNotEmpty ? NetworkImage(e.image) : null,
                        child: e.image.isEmpty
                            ? Icon(Icons.image_not_supported_outlined,
                                color: Colors.white70, size: 18)
                            : null,
                      ),
                      title: Text(
                        e.productName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      subtitle: Text(
                        e.selected,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                      trailing: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${widget.currencySymbol}${Formatter().converter(e.selectedPrice.toDouble())}',
                            style: TextStyle(
                              color: kGold,
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'QTY: ${e.quantity}',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Gap(6),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: DefaultTextStyle.merge(
                        style: const TextStyle(color: Colors.white),
                        child: IconTheme.merge(
                          data: const IconThemeData(color: Colors.white),
                          child: ProductReturnDetail(
                            productID: e.productID,
                            orderModel: widget.orderModel,
                            ordersList: e,
                          ),
                        ),
                      ),
                    ),
                    if (orderStatus == 'Completed') ...[
                      const Gap(8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: OutlinedButton(
                          onPressed: () {
                            ratingAndReviewProduct(
                              e.productID,
                              e.totalRating,
                              e.totalNumberOfUserRating,
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: kGold),
                            minimumSize: const Size.fromHeight(34),
                          ),
                          child: Text(
                            'Rate Product'.tr(),
                            style: TextStyle(
                              color: kGold,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                    const Gap(10),
                  ],
                ),
              );
            }).toList(),
          )
        ],
      ),
    );
  }

  Widget _buildActionsSection() {
    final bool canConfirm = acceptDelivery == true &&
        accepted == true &&
        deliveryAddress != '' &&
        orderStatus == 'Completed' &&
        confirmationStatus == false;

    if (!canConfirm) return const SizedBox.shrink();

    return Column(
      children: [
        if (canConfirm)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: pleaseWait
                  ? null
                  : () {
                      showDialog(
                        context: context,
                        builder: (builder) {
                          return AlertDialog(
                            backgroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            title: const Text(
                              'Order Confirmation!!!',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ).tr(),
                            content: const Text(
                              'Are you sure you received all your order?',
                            ).tr(),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text('No').tr(),
                              ),
                              TextButton(
                                onPressed: () async {
                                  confirmFunc(true);
                                },
                                child: const Text('Yes').tr(),
                              ),
                            ],
                          );
                        },
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: kGold,
                foregroundColor: Colors.black,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                pleaseWait
                    ? 'Please wait...'.tr()
                    : 'Confirm order has arrived'.tr(),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildWhatsAppCard() {
    return InkWell(
      onTap: () {
        openWhatsApp();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.greenAccent.withOpacity(0.7)),
          color: Colors.white.withOpacity(0.03),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.greenAccent.withOpacity(0.1),
              ),
              child: Image.asset(
                'assets/image/whatsapp.png',
                height: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Get updates on WhatsApp'.tr(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Say hi and we\'ll keep you posted about this order.'.tr(),
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right_rounded,
                color: Colors.white.withOpacity(0.9)),
          ],
        ),
      ),
    );
  }

  String _formatTimeSafe(dynamic timeVal) {
    if (timeVal == null || timeVal.toString().isEmpty) return '';
    try {
      if (timeVal is Timestamp) {
        return DateFormat('dd MMM yyyy, hh:mm a')
            .format(timeVal.toDate().toLocal());
      }
      // Aggressive coercion: handles both raw strings AND uncasted DateTime objects
      String stringVal = timeVal.toString();
      DateTime parsed = DateTime.parse(stringVal);
      return DateFormat('dd MMM yyyy, hh:mm a').format(parsed.toLocal());
    } catch (e) {
      // If parsing strictly fails, fall back to the exact string payload provided
      return timeVal.toString();
    }
  }
}

// Small helper model for timeline steps
class _StepConfig {
  final String label;
  final bool active;

  _StepConfig({required this.label, required this.active});
}
