// ignore_for_file: avoid_print, unused_local_variable, use_build_context_synchronously, deprecated_member_use

import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pinelabs_edge_flutter/checkout/edge.dart';
import 'package:uuid/uuid.dart';
import '../Model/history.dart';

class PluralOnline extends StatefulWidget {
  final String pkey;
  final int amount;
  final String id;
  final String sKey;
  final String phone;
  const PluralOnline(
      {super.key,
      required this.pkey,
      required this.id,
      required this.sKey,
      required this.amount,
      required this.phone});

  @override
  State<PluralOnline> createState() => _PluralOnlineState();
}

class _PluralOnlineState extends State<PluralOnline> {
  String currencyCode = '';
  String currencySymbol = '';
  String name = '';
  String email = '';
  String phone = '';
  num wallet = 0;

  getUserName() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    // final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .get()
        .then((value) {
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

  getWallet() {
    final FirebaseAuth auth = FirebaseAuth.instance;

    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .snapshots()
        .listen((value) {
      setState(() {
        wallet = value['wallet'];
      });
    });
    debugPrint('$wallet is your balance');
  }

  updateHistory(HistoryModel historyModel) {
    final FirebaseAuth auth = FirebaseAuth.instance;

    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .collection('History')
        .add(historyModel.toMap());
  }

  updateWallet(num amount) {
    final FirebaseAuth auth = FirebaseAuth.instance;
    User? user = auth.currentUser;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .update({'wallet': wallet + amount}).then((value) {
      updateHistory(HistoryModel(
          timeCreated: DateTime.now(),
          message: 'Wallet Upload.',
          amount: '+$currencySymbol$amount',
          paymentSystem: 'Plural'));

      Fluttertoast.showToast(
          msg: "Wallet has been uploaded with $amount.",
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.CENTER,
          timeInSecForIosWeb: 1,
          fontSize: 16.0);
    });
    Navigator.pop(context);
  }

  @override
  void initState() {
    getWallet();
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
        child: Edge(
          PPC_PROD: false,
          callback: (bool status, response) => {
            print('==== '),
            print(response),
            print(status),
            print('Status is $status'),
            if (status == true)
              {
                updateWallet(widget.amount),
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
          PPC_AMOUNT: '${widget.amount.toString()}00',
          //
          PPC_UNIQUEMERCHANTTXNID: txnId,
          //
          PPC_MERCHANTID: merchantId,
          PPC_MERCHANT_SECRET: merchantSecret,
          PPC_MERCHANTACCESSCODE: merchantAccessCode,
          //
          PPC_PAYMODEONLANDINGPAGE: payModes,
          //
          PPC_CUSTOMERMOBILE: widget.phone,
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

class AmountWidget extends StatefulWidget {
  const AmountWidget({super.key});

  @override
  State<AmountWidget> createState() => _AmountWidgetState();
}

class _AmountWidgetState extends State<AmountWidget> {
  int amount = 0;
  String phone = '';
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        backgroundColor: Theme.of(context).cardColor,
        title: Text(
          'Enter amount',
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
                  Text('Amount'),
                ],
              ),
            ),
            // const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
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
                onPressed: amount == 0 || phone.length < 10
                    ? null
                    : () {
                        Navigator.of(context).push(MaterialPageRoute(
                            builder: (context) => PluralOnline(
                                  phone: phone,
                                  id: '',
                                  pkey: '',
                                  sKey: '',
                                  amount: amount,
                                )));
                      },
                child: const Text('Pay'))
          ],
        ),
      ),
    );
  }
}
