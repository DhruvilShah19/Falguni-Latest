// // ignore_for_file: avoid_print, deprecated_member_use

// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfcard/cfcardlistener.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfcard/cfcardwidget.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cferrorresponse/cferrorresponse.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfcard.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfcardpayment.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfdropcheckoutpayment.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfnetbanking.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfnetbankingpayment.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfupi.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfupipayment.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfwebcheckoutpayment.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpaymentcomponents/cfpaymentcomponent.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfpaymentgateway/cfpaymentgatewayservice.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfsession/cfsession.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cftheme/cftheme.dart';
// import 'package:flutter_cashfree_pg_sdk/api/cfupi/cfupiutils.dart';
// import 'package:flutter_cashfree_pg_sdk/utils/cfenums.dart';
// import 'package:flutter_cashfree_pg_sdk/utils/cfexceptions.dart';
// import 'package:flutter_dotenv/flutter_dotenv.dart';
// import 'package:fluttertoast/fluttertoast.dart';
// import 'dart:convert';
// import 'package:http/http.dart' as http;
// import 'package:falguni_app/Model/history.dart';
// import 'package:uuid/uuid.dart';

// class CashFreePage extends StatefulWidget {
//   final dynamic response;
//   final String paymentSessionId;
//   final String orderID;
//   final num amount;

//   const CashFreePage(
//       {super.key,
//       this.response,
//       required this.paymentSessionId,
//       required this.orderID,
//       required this.amount});

//   @override
//   State<CashFreePage> createState() => _CashFreePageState();
// }

// class _CashFreePageState extends State<CashFreePage> {
//   var cfPaymentGatewayService = CFPaymentGatewayService();

//   CFCardWidget? cfCardWidget;
//   num wallet = 0;
//   getWallet() {
//     final FirebaseAuth auth = FirebaseAuth.instance;

//     User? user = auth.currentUser;
//     FirebaseFirestore.instance
//         .collection('users')
//         .doc(user!.uid)
//         .snapshots()
//         .listen((value) {
//       setState(() {
//         wallet = value['wallet'];
//       });
//     });
//     debugPrint('$wallet is your balance');
//   }

//   updateHistory(HistoryModel historyModel) {
//     final FirebaseAuth auth = FirebaseAuth.instance;

//     User? user = auth.currentUser;
//     FirebaseFirestore.instance
//         .collection('users')
//         .doc(user!.uid)
//         .collection('History')
//         .add(historyModel.toMap());
//   }

//   updateWallet(num amount) {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     User? user = auth.currentUser;
//     FirebaseFirestore.instance
//         .collection('users')
//         .doc(user!.uid)
//         .update({'wallet': wallet + amount}).then((value) {
//       updateHistory(HistoryModel(
//           timeCreated: DateTime.now(),
//           message: 'Wallet Upload.',
//           amount: '+INR$amount',
//           paymentSystem: 'Cash Free'));

//       Fluttertoast.showToast(
//           msg: "Wallet has been uploaded with $amount.",
//           toastLength: Toast.LENGTH_LONG,
//           gravity: ToastGravity.CENTER,
//           timeInSecForIosWeb: 1,
//           fontSize: 16.0);
//     });
//     Navigator.pop(context);
//   }

//   @override
//   void initState() {
//     super.initState();
//     getWallet();
//     cfPaymentGatewayService.setCallback(verifyPayment, onError);
//     final GlobalKey<CFCardWidgetState> myWidgetKey =
//         GlobalKey<CFCardWidgetState>();
//     try {
//       var session = createSession();
//       cfCardWidget = CFCardWidget(
//         key: myWidgetKey,
//         textStyle: null,
//         inputDecoration: InputDecoration(
//           hintText: 'XXXX XXXX XXXX XXXX',
//           contentPadding:
//               const EdgeInsets.all(15.0), // Adjust padding as needed
//           counterText: "",
//           border: OutlineInputBorder(
//             borderRadius:
//                 BorderRadius.circular(5.0), // Adjust the radius as needed
//           ),
//           focusedBorder: OutlineInputBorder(
//             borderRadius:
//                 BorderRadius.circular(5.0), // Adjust the radius as needed
//             borderSide: const BorderSide(
//               color: Colors.green, // Set your desired tint color here
//               width: 2.0, // Adjust the border width as needed
//             ),
//           ),
//         ),
//         cardListener: cardListener, cfSession: session,
//         // cfSession: session,
//       );
//     } on CFException catch (e) {
//       print(e.message);
//     }

//     CFUPIUtils().getUPIApps().then((value) {
//       print("value");
//       print(value);
//       for (var i = 0; i < (value?.length ?? 0); i++) {
//         var a = value?[i]["id"] as String;
//         if (a.contains("phonepe")) {
//           selectedId = value?[i]["id"];
//         }
//       }
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     // Convert the JSON string to a Map
//     // Map<String, dynamic> responseData = jsonDecode(widget.response);
//     // orderId = responseData['order_id'];
//     // paymentSessionId = responseData["payment_session_id"];
//     // print('Payment Session is ${responseData['payment_session_id']}');
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('CashFree Payment Gateway'),
//       ),
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           // crossAxisAlignment: CrossAxisAlignment.center,
//           children: [
//             // Container(
//             //   height: 500,
//             //   width: 500,
//             //   child: WebViewWidget(controller: controller),
//             // )
//             // TextButton(onPressed: pay, child: const Text("Pay")),
//             ElevatedButton(
//                 onPressed: webCheckout, child: const Text("Contnue")),
//             //  cfCardWidget!,
//             // TextButton(onPressed: cardPay, child: const Text("Card Pay")),
//             // TextButton(
//             //     onPressed: upiCollectPay, child: const Text("UPI Collect Pay")),
//             // TextButton(
//             //     onPressed: upiIntentPay, child: const Text("UPI Intent Pay")),
//             // TextButton(
//             //     onPressed: netbankingPay, child: const Text("Netbanking Pay")),
//           ],
//         ),
//       ),
//     );
//   }

//   // "var cardNumber = document.createElement('div');\ncardNumber.id = \"cardNumber\";\nvar cardCvv = document.createElement('div');\ncardCvv.id = \"cardCvv\";\nvar cardExpiry = document.createElement('div');\ncardExpiry.id = \"cardExpiry\";\nvar cardHolder = document.createElement('div');\ncardHolder.id = \"cardHolder\";\nvar payButton = document.createElement('button');\npayButton.id = \"payButton\";\n\n\nconst cashfree = await load({ \n      mode: \"sandbox\", //or production\n    });\n\n    const cardComponent = cashfree.create(\"cardNumber\", {});\n    cardComponent.mount(\"#cardNumber\");\n\n    const cardCvv = cashfree.create(\"cardCvv\", {});\n    cardCvv.mount(\"#cardCvv\");\n\n    const cardExpiry = cashfree.create(\"cardExpiry\", {});\n    cardExpiry.mount(\"#cardExpiry\");\n\n    const cardHolder = cashfree.create(\"cardHolder\", {});\n    cardHolder.mount(\"#cardHolder\");\n\n    const showError = function(e){\n      alert(e.message)\n    }\n\n    document.querySelector(\"#payBtn\").addEventListener(\"click\", async () => {\n      cashfree.pay({\n        paymentMethod: cardComponent,\n        paymentSessionId: \"yourPaymentSession\",\n        returnUrl: \"https://merchantsite.com/return?order_id={order_id}\",\n      }).then(function (data) {\n        if (data != null && data.error) {\n          return showError(data.error)\n        }\n      });\n    })"

//   void verifyPayment(String orderId) {
//     print("Verify Payment");
//     updateWallet(widget.amount);
//   }

//   void onError(CFErrorResponse errorResponse, String orderId) {
//     print(errorResponse.getMessage());
//     print("Error while making payment");
//   }

//   void cardListener(CFCardListener cardListener) {
//     print("Card Listener triggered");
//     print(cardListener.getNumberOfCharacters());
//     print(cardListener.getType());
//     // print(cardListener.getMetaData());
//   }

//   // String orderId = "";
//   // String paymentSessionId = "";
//   void receivedEvent(String eventName, Map<dynamic, dynamic> metaData) {
//     print(eventName);
//     print(metaData);
//   }

//   // String orderId = "order_18482TC1GWfnEYW3gheFhy4mArfynXh";
//   // String paymentSessionId = "session_gMej8P4gvNUKLbd3fGWVw7Njg5fj3KK4We0HjCg6Tkzy5yZ8mkghdv7vKels1CJ8fBz9_aVpSoU8n5rqufVQrexzhLW0g0dzgdiTJwmrkZYn";

//   // String orderId = "order_18482OupTxSofcClBAlgqyYxUVceHo8";
//   // String paymentSessionId = "session_oeYlKCusKyW5pND4Swzn1rE2-gwnoM8MOC2nck9RjIiUQwXcPLWB3U1xHaaItb-uA9H1k6Fwziq9O63DWcfYGy_3B7rl1nDFo3MMeVqiYrBr";
//   CFEnvironment environment = CFEnvironment.PRODUCTION;
//   String selectedId = "";

//   upiCollectPay() async {
//     try {
//       var session = createSession();
//       var upi = CFUPIBuilder()
//           .setChannel(CFUPIChannel.COLLECT)
//           .setUPIID("suhasg6@ybl")
//           .build();
//       var upiPayment =
//           CFUPIPaymentBuilder().setSession(session!).setUPI(upi).build();
//       cfPaymentGatewayService.doPayment(upiPayment);
//     } on CFException catch (e) {
//       print(e.message);
//     }
//   }

//   netbankingPay() async {
//     try {
//       var session = createSession();
//       var netbanking =
//           CFNetbankingBuilder().setChannel("link").setBankCode(3003).build();
//       var netbankingPayment = CFNetbankingPaymentBuilder()
//           .setSession(session!)
//           .setNetbanking(netbanking)
//           .build();
//       cfPaymentGatewayService.doPayment(netbankingPayment);
//     } on CFException catch (e) {
//       print(e.message);
//     }
//   }

//   upiIntentPay() async {
//     try {
//       cfPaymentGatewayService.setCallback(verifyPayment, onError);
//       var session = createSession();
//       var upi = CFUPIBuilder()
//           .setChannel(CFUPIChannel.INTENT)
//           .setUPIID(selectedId)
//           .build();
//       var upiPayment =
//           CFUPIPaymentBuilder().setSession(session!).setUPI(upi).build();
//       cfPaymentGatewayService.doPayment(upiPayment);
//     } on CFException catch (e) {
//       print(e.message);
//     }
//   }

//   cardPay() async {
//     try {
//       cfPaymentGatewayService.setCallback(verifyPayment, onError);
//       var session = createSession();
//       var card = CFCardBuilder()
//           .setInstrumentId("db178aff-b8cf-420e-b0ba-7af89f0d2263")
//           .setCardCVV("123")
//           .build();
//       var cardPayment = CFCardPaymentBuilder()
//           .setSession(session!)
//           .setCard(card)
//           .savePaymentMethod(true)
//           .build();
//       cfPaymentGatewayService.doPayment(cardPayment);
//     } on CFException catch (e) {
//       print(e.message);
//     }
//   }

//   pay() async {
//     try {
//       var session = createSession();
//       List<CFPaymentModes> components = <CFPaymentModes>[];
//       components.add(CFPaymentModes.UPI);
//       var paymentComponent =
//           CFPaymentComponentBuilder().setComponents(components).build();

//       var theme = CFThemeBuilder()
//           .setNavigationBarBackgroundColorColor("#FF0000")
//           .setPrimaryFont("Menlo")
//           .setSecondaryFont("Futura")
//           .build();

//       var cfDropCheckoutPayment = CFDropCheckoutPaymentBuilder()
//           .setSession(session!)
//           .setPaymentComponent(paymentComponent)
//           .setTheme(theme)
//           .build();

//       cfPaymentGatewayService.doPayment(cfDropCheckoutPayment);
//     } on CFException catch (e) {
//       print(e.message);
//     }
//   }

//   CFSession? createSession() {
//     try {
//       var session = CFSessionBuilder()
//           .setEnvironment(environment)
//           .setOrderId(widget.orderID)
//           .setPaymentSessionId(widget.paymentSessionId)
//           .build();
//       return session;
//     } on CFException catch (e) {
//       print(e.message);
//     }
//     return null;
//   }

//   newPay() async {
//     cfPaymentGatewayService = CFPaymentGatewayService();
//     cfPaymentGatewayService.setCallback((p0) async {
//       print(p0);
//     }, (p0, p1) async {
//       print(p0);
//       print(p1);
//     });
//     webCheckout();
//   }

//   webCheckout() async {
//     try {
//       var session = createSession();
//       var theme = CFThemeBuilder()
//           .setNavigationBarBackgroundColorColor("#ff00ff")
//           .setNavigationBarTextColor("#ffffff")
//           .build();
//       var cfWebCheckout = CFWebCheckoutPaymentBuilder()
//           .setSession(session!)
//           .setTheme(theme)
//           .build();
//       cfPaymentGatewayService.doPayment(cfWebCheckout);
//     } on CFException catch (e) {
//       print(e.message);
//     }
//   }
// }

// class CashFreeAmountWidget extends StatefulWidget {
//   const CashFreeAmountWidget({super.key});

//   @override
//   State<CashFreeAmountWidget> createState() => _CashFreeAmountWidgetState();
// }

// class _CashFreeAmountWidgetState extends State<CashFreeAmountWidget> {
//   var uuid = const Uuid();
//   var uuid2 = const Uuid();
//   int amount = 0;
//   String phone = '';
//   dynamic responseData;
//   bool isLoading = false;
//   String fullname = '';
//   String email = '';
//   getUserDetail() {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     final FirebaseFirestore firestore = FirebaseFirestore.instance;

//     User? user = auth.currentUser;
//     firestore.collection('users').doc(user!.uid).get().then((value) {
//       setState(() {
//         fullname = value['fullname'];
//         email = value['email'];
//       });
//     });
//   }

//   void makeHttpPostRequest() async {
//     setState(() {
//       isLoading = true;
//     });
//     String apiUrl = dotenv.env['apiUrl']!;

//     Map<String, String> headers = {
//       'Content-Type': 'application/json',
//       'x-client-id': dotenv.env['client_id']!,
//       'x-client-secret': dotenv.env['client_secret']!,
//       'x-api-version': '2023-08-01',
//       'x-request-id': 'developer_name',
//     };

//     Map<String, dynamic> requestBody = {
//       "order_amount": amount.toDouble(),
//       "order_id": uuid.v1(),
//       "order_currency": "INR",
//       "customer_details": {
//         "customer_id": uuid2.v1(),
//         "customer_name": fullname,
//         "customer_email": email,
//         "customer_phone": "+91$phone"
//       },
//       "order_meta": {"notify_url": dotenv.env['notify_url']!},
//       "order_note": "some order note here",
//     };

//     try {
//       final http.Response response = await http.post(
//         Uri.parse(apiUrl),
//         headers: headers,
//         body: jsonEncode(requestBody),
//       );

//       if (response.statusCode == 200) {
//         setState(() {
//           isLoading = false;
//         });
//         print('Request successful');
//         print('Response: ${response.body}');
//         setState(() {
//           responseData = response.body;
//         });
//         // Convert the JSON string to a Map
//         var responseDataRequest = jsonDecode(response.body);
//         if (responseData != null) {
//           // ignore: use_build_context_synchronously
//           Navigator.push(context, MaterialPageRoute(builder: (context) {
//             return CashFreePage(
//               amount: amount,
//               response: responseData,
//               orderID: responseDataRequest['order_id'],
//               paymentSessionId: responseDataRequest["payment_session_id"],
//             );
//           }));
//         }
//       } else {
//         setState(() {
//           isLoading = false;
//         });
//         print('Request failed with status: ${response.statusCode}');
//         print('Response: ${response.body}');
//       }
//     } catch (e) {
//       setState(() {
//         isLoading = false;
//       });
//       print('Error during HTTP request: $e');
//     }
//   }

//   @override
//   void initState() {
//     getUserDetail();
//     super.initState();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         iconTheme: Theme.of(context).iconTheme,
//         backgroundColor: Theme.of(context).cardColor,
//         title: Text(
//           'Enter amount',
//           style: TextStyle(color: Theme.of(context).iconTheme.color),
//         ),
//         elevation: 0,
//       ),
//       body: SingleChildScrollView(
//         child: Column(
//           children: [
//             const SizedBox(height: 20),
//             const Padding(
//               padding: EdgeInsets.all(8.0),
//               child: Row(
//                 children: [
//                   Text('Amount'),
//                 ],
//               ),
//             ),
//             // const SizedBox(height: 10),
//             Padding(
//               padding: const EdgeInsets.all(8.0),
//               child: TextFormField(
//                 onChanged: (v) {
//                   setState(() {
//                     amount = int.parse(v);
//                   });
//                 },
//                 decoration: const InputDecoration(
//                     hintText: 'Enter Amount', border: OutlineInputBorder()),
//               ),
//             ),
//             const Padding(
//               padding: EdgeInsets.all(8.0),
//               child: Row(
//                 children: [
//                   Text('Phone'),
//                 ],
//               ),
//             ),
//             // const SizedBox(height: 10),
//             Padding(
//               padding: const EdgeInsets.all(8.0),
//               child: TextFormField(
//                 maxLength: 10,
//                 onChanged: (v) {
//                   setState(() {
//                     phone = v;
//                   });
//                 },
//                 decoration: const InputDecoration(
//                     counterText: '',
//                     hintText: 'XXX XXX XXXX',
//                     border: OutlineInputBorder()),
//               ),
//             ),
//             const SizedBox(height: 20),
//             ElevatedButton(
//                 onPressed: amount == 0 || phone.length < 10 || isLoading == true
//                     ? null
//                     : () {
//                         makeHttpPostRequest();
//                       },
//                 child: const Text('Pay'))
//           ],
//         ),
//       ),
//     );
//   }
// }

// ignore_for_file: avoid_print, deprecated_member_use, prefer_const_constructors

import 'package:cloud_firestore/cloud_firestore.dart';
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
import 'package:falguni_app/Model/history.dart';
import 'package:uuid/uuid.dart';

class CashFreePage extends StatefulWidget {
  final dynamic response;
  final String paymentSessionId;
  final String orderID;
  final num amount;

  const CashFreePage(
      {super.key,
      this.response,
      required this.paymentSessionId,
      required this.orderID,
      required this.amount});

  @override
  State<CashFreePage> createState() => _CashFreePageState();
}

class _CashFreePageState extends State<CashFreePage> {
  var cfPaymentGatewayService = CFPaymentGatewayService();

  CFCardWidget? cfCardWidget;
  num wallet = 0;
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
          amount: '+INR$amount',
          paymentSystem: 'Cash Free'));

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
    super.initState();
    getWallet();
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
    // orderId = responseData['order_id'];
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

  void verifyPayment(String orderId) {
    print("Verify Payment");
    updateWallet(widget.amount);
  }

  void onError(CFErrorResponse errorResponse, String orderId) {
    print(errorResponse.getMessage());
    print("Error while making payment");
  }

  void cardListener(CFCardListener cardListener) {
    print("Card Listener triggered");
    print(cardListener.getNumberOfCharacters());
    print(cardListener.getType());
    // print(cardListener.getMetaData());
  }

  // String orderId = "";
  // String paymentSessionId = "";
  void receivedEvent(String eventName, Map<dynamic, dynamic> metaData) {
    print(eventName);
    print(metaData);
  }

  // String orderId = "order_18482TC1GWfnEYW3gheFhy4mArfynXh";
  // String paymentSessionId = "session_gMej8P4gvNUKLbd3fGWVw7Njg5fj3KK4We0HjCg6Tkzy5yZ8mkghdv7vKels1CJ8fBz9_aVpSoU8n5rqufVQrexzhLW0g0dzgdiTJwmrkZYn";

  // String orderId = "order_18482OupTxSofcClBAlgqyYxUVceHo8";
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
          .setOrderId(widget.orderID)
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

final TextEditingController amountController = TextEditingController();

class CashFreeAmountWidget extends StatefulWidget {
  const CashFreeAmountWidget({super.key});

  @override
  State<CashFreeAmountWidget> createState() => _CashFreeAmountWidgetState();
}

class _CashFreeAmountWidgetState extends State<CashFreeAmountWidget> {
  var uuid = const Uuid();
  var uuid2 = const Uuid();
  int amount = 0;
  String phone = '';
  dynamic responseData;
  bool isLoading = false;
  String fullname = '';
  String email = '';

  static const Color kGold = Color(0xFFC9A86A);

  @override
  void initState() {
    getUserDetail();
    super.initState();
  }

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

  // -------------------- PAYMENT REQUEST --------------------
  void makeHttpPostRequest() async {
    setState(() => isLoading = true);

    String apiUrl = dotenv.env['apiUrl']!;
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'x-client-id': dotenv.env['client_id']!,
      'x-client-secret': dotenv.env['client_secret']!,
      'x-api-version': '2023-08-01',
      'x-request-id': 'developer_name',
    };

    Map<String, dynamic> requestBody = {
      "order_amount": amount.toDouble(),
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

      setState(() => isLoading = false);

      if (response.statusCode == 200) {
        responseData = response.body;
        var responseDataRequest = jsonDecode(response.body);

        // IGNORE BUILD CONTEXT WARNING
        // ignore: use_build_context_synchronously
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return CashFreePage(
            amount: amount,
            response: responseData,
            orderID: responseDataRequest['order_id'],
            paymentSessionId: responseDataRequest["payment_session_id"],
          );
        }));
      } else {
        print("Payment API Error: ${response.body}");
      }
    } catch (e) {
      setState(() => isLoading = false);
      print("Payment Exception: $e");
    }
  }

  // -------------------- UI --------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1D1A1A),
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        backgroundColor: const Color(0xFF2F2525),
        title: const Text(
          'Add Money',
          style: TextStyle(color: Colors.white),
        ),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ---------- LABEL ----------
            const Text(
              "Enter Amount",
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 10),

            // ---------- INPUT FIELD ----------
// Amount Input Field
            TextFormField(
              controller: amountController,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.number,
              onChanged: (v) {
                setState(() => amount = int.tryParse(v) ?? 0);
              },
              decoration: InputDecoration(
                hintText: "Enter Amount",
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
              ),
            ),

            const SizedBox(height: 20),
// QUICK AMOUNT PILLS
            Wrap(
              spacing: 15,
              children: [100, 200, 500, 1000].map((amt) {
                bool selected = amount == amt;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      amount = amt;
                      amountController.text =
                          amt.toString(); // <-- UPDATE TEXT FIELD
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 12),
                    decoration: BoxDecoration(
                      color: selected ? kGold : Colors.white.withOpacity(0.09),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(
                        color: selected ? kGold : Colors.white24,
                        width: selected ? 2 : 1,
                      ),
                      boxShadow: selected
                          ? [
                              BoxShadow(
                                color: kGold.withOpacity(0.5),
                                blurRadius: 5,
                                offset: const Offset(0, 4),
                              )
                            ]
                          : [],
                    ),
                    child: Text(
                      "₹$amt",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: selected ? Colors.black : Colors.white70,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 30),

            // ---------- PHONE FIELD ----------
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
                hintText: "XXX XXX XXXX",
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
              ),
            ),

            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (amount <= 0 || phone.length < 10 || isLoading)
                    ? null
                    : () => makeHttpPostRequest(),
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      (amount <= 0 || phone.length < 10 || isLoading)
                          ? Colors.grey.withOpacity(0.35) // Disabled color
                          : kGold,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  disabledForegroundColor: Colors.white70.withOpacity(0.6),
                  disabledBackgroundColor: Colors.grey.withOpacity(0.25),
                ),
                child: Text(
                  (amount <= 0 || phone.length < 10 || isLoading)
                      ? "Fill out all the fields to continue"
                      : "Continue to Pay",
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 25),

            // ---------- INFO TEXT ----------
            Column(
              children: [
                const SizedBox(height: 28),

                // Gold Divider
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

                // INLINE SUPPORT METHODS (NO EXTRA WIDGETS)
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 14,
                  runSpacing: 10,
                  children: [
                    // UPI
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 15, vertical: 10),
                      decoration: BoxDecoration(
                        color: Color(0xFF2F2525),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: kGold.withOpacity(0.5), width: 1.2),
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
                          Icon(Icons.qr_code_2_rounded,
                              size: 16, color: kGold.withOpacity(0.85)),
                          const SizedBox(width: 8),
                          Text(
                            "UPI",
                            style: TextStyle(
                                color: kGold.withOpacity(0.9),
                                fontWeight: FontWeight.w600,
                                fontSize: 12),
                          ),
                        ],
                      ),
                    ),

                    // CARDS
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 15, vertical: 10),
                      decoration: BoxDecoration(
                        color: Color(0xFF2F2525),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: kGold.withOpacity(0.5), width: 1.2),
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
                          Icon(Icons.credit_card_rounded,
                              size: 16, color: kGold.withOpacity(0.85)),
                          const SizedBox(width: 8),
                          Text(
                            "Credit / Debit Cards",
                            style: TextStyle(
                                color: kGold.withOpacity(0.9),
                                fontWeight: FontWeight.w600,
                                fontSize: 12),
                          ),
                        ],
                      ),
                    ),

                    // NETBANKING
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 15, vertical: 10),
                      decoration: BoxDecoration(
                        color: Color(0xFF2F2525),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: kGold.withOpacity(0.5), width: 1.2),
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
                          Icon(Icons.account_balance_rounded,
                              size: 16, color: kGold.withOpacity(0.85)),
                          const SizedBox(width: 8),
                          Text(
                            "Netbanking",
                            style: TextStyle(
                                color: kGold.withOpacity(0.9),
                                fontWeight: FontWeight.w600,
                                fontSize: 12),
                          ),
                        ],
                      ),
                    ),

                    // WALLETS
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 15, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2F2525),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: kGold.withOpacity(0.5), width: 1.2),
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
                          Icon(Icons.account_balance_wallet_rounded,
                              size: 16, color: kGold.withOpacity(0.85)),
                          const SizedBox(width: 8),
                          Text(
                            "Wallets",
                            style: TextStyle(
                                color: kGold.withOpacity(0.9),
                                fontWeight: FontWeight.w600,
                                fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                Text(
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
