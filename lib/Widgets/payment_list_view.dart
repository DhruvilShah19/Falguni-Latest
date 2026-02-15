// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:flutter/material.dart';
// import 'package:falguni_app/Pages/cash_free_page.dart';
// // import 'package:falguni_app/Widgets/ccavenue.dart';
// import 'package:falguni_app/Widgets/plural.dart';
// // import 'flutterwave.dart';
// // import '../Pages/cashfree_payment.dart';
// // import 'paystack.dart';
// import 'package:easy_localization/easy_localization.dart';

// class PaymentListView extends StatefulWidget {
//   final String id;
//   const PaymentListView({super.key, required this.id});

//   @override
//   State<PaymentListView> createState() => _PaymentListViewState();
// }

// class _PaymentListViewState extends State<PaymentListView> {
//   bool stripe = false;
//   bool flutterwave = false;
//   bool paystack = false;
//   num wallet = 0;

//   getFlutterwaveStatus() {
//     return FirebaseFirestore.instance
//         .collection('Payment System')
//         .doc('Flutterwave')
//         .get()
//         .then((val) {
//       setState(() {
//         flutterwave = val['Flutterwave'];
//       });
//     });
//   }

//   getPaystackStatus() {
//     return FirebaseFirestore.instance
//         .collection('Payment System')
//         .doc('Paystack')
//         .get()
//         .then((val) {
//       setState(() {
//         paystack = val['Paystack'];
//       });
//     });
//   }

//   getStripeStatus() {
//     return FirebaseFirestore.instance
//         .collection('Payment System')
//         .doc('Stripe')
//         .get()
//         .then((val) {
//       setState(() {
//         stripe = val['Stripe'];
//       });
//     });
//   }

//   @override
//   void initState() {
//     getStripeStatus();
//     getPaystackStatus();
//     getPaystackDetails();
//     getFlutterwaveStatus();
//     getStripeDetails();
//     super.initState();
//   }

//   String backendUrl = '';
//   String paystackPublicKey = '';
//   String pKey = '';
//   String sKey = '';

//   getStripeDetails() {
//     FirebaseFirestore.instance
//         .collection('Payment System Details')
//         .doc('Stripe')
//         .get()
//         .then((value) {
//       setState(() {
//         pKey = value['Publishable key'];
//         sKey = value['Secret Key'];
//       });
//     });
//   }

//   getPaystackDetails() {
//     return FirebaseFirestore.instance
//         .collection('Payment System Details')
//         .doc('Paystack')
//         .get()
//         .then((value) {
//       setState(() {
//         backendUrl = value['banckendUrl'];
//         paystackPublicKey = value['Public key'];
//       });
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return ListView(
//       scrollDirection: Axis.horizontal,
//       shrinkWrap: true,
//       children: [
//         InkWell(
//           onTap: () {
//             Navigator.of(context).push(MaterialPageRoute(
//                 builder: (context) => const CashFreeAmountWidget(
//                     // id: widget.id,
//                     // pkey: pKey,
//                     // sKey: sKey,
//                     )));
//           },
//           child: SizedBox(
//             height: 120,
//             width: 160,
//             child: Card(
//               elevation: 10,
//               child: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     Padding(
//                       padding: const EdgeInsets.all(8.0),
//                       child: const Text('Tap To Upload Money In Wallet With',
//                               textAlign: TextAlign.center)
//                           .tr(),
//                     ),
//                     Padding(
//                       padding: const EdgeInsets.only(left: 8, right: 8),
//                       child: Image.asset(
//                         'assets/image/cashfree.png',
//                         scale: 4,
//                       ),
//                     ),
//                   ]),
//             ),
//           ),
//         ),
//         InkWell(
//           onTap: () {
//             Navigator.of(context).push(MaterialPageRoute(
//                 builder: (context) => const AmountWidget(
//                     // id: widget.id,
//                     // pkey: pKey,
//                     // sKey: sKey,
//                     )));
//           },
//           child: SizedBox(
//             height: 120,
//             width: 160,
//             child: Card(
//               elevation: 10,
//               child: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     Padding(
//                       padding: const EdgeInsets.all(8.0),
//                       child: const Text('Tap To Upload Money In Wallet With',
//                               textAlign: TextAlign.center)
//                           .tr(),
//                     ),
//                     Padding(
//                       padding: const EdgeInsets.only(left: 8, right: 8),
//                       child: Image.asset(
//                         'assets/image/p-logo.png',
//                         scale: 4,
//                       ),
//                     ),
//                   ]),
//             ),
//           ),
//         ),

//         // flutterwave == false
//         //     ? Container()
//         //     : InkWell(
//         //         onTap: () {
//         //           Navigator.of(context).push(MaterialPageRoute(
//         //               builder: (context) => FlutterwavePage(id: widget.id)));
//         //         },
//         //         child: SizedBox(
//         //           height: 120,
//         //           width: 160,
//         //           child: Card(
//         //             elevation: 10,
//         //             child: Column(
//         //                 mainAxisAlignment: MainAxisAlignment.center,
//         //                 children: [
//         //                   Padding(
//         //                     padding: const EdgeInsets.all(8.0),
//         //                     child: const Text(
//         //                             'Tap To Upload Money In Wallet With',
//         //                             textAlign: TextAlign.center)
//         //                         .tr(),
//         //                   ),
//         //                   Padding(
//         //                     padding: const EdgeInsets.only(left: 8, right: 8),
//         //                     child: Image.asset(
//         //                       'assets/image/flutterwave.png',
//         //                       height: 70,
//         //                       scale: 4,
//         //                     ),
//         //                   ),
//         //                 ]),
//         //           ),
//         //         ),
//         //       ),
//         // paystack == false
//         //     ? Container()
//         //     : InkWell(
//         //         onTap: () {
//         //           Navigator.of(context).push(MaterialPageRoute(
//         //               builder: (context) => PaystackPage(
//         //                     id: widget.id,
//         //                     backendUrl: backendUrl,
//         //                     paystackPublicKey: paystackPublicKey,
//         //                   )));
//         //         },
//         //         child: SizedBox(
//         //           height: 120,
//         //           width: 160,
//         //           child: Card(
//         //             elevation: 10,
//         //             child: Column(
//         //                 mainAxisAlignment: MainAxisAlignment.center,
//         //                 children: [
//         //                   Padding(
//         //                     padding: const EdgeInsets.all(8.0),
//         //                     child: const Text(
//         //                             'Tap To Upload Money In Wallet With',
//         //                             textAlign: TextAlign.center)
//         //                         .tr(),
//         //                   ),
//         //                   Padding(
//         //                     padding: const EdgeInsets.only(left: 8, right: 8),
//         //                     child: Image.asset('assets/image/paystack.png',
//         //                         scale: 1, height: 70),
//         //                   ),
//         //                 ]),
//         //           ),
//         //         ),
//         //       ),
//         // paystack == false
//         //     ? Container()
//         //     : InkWell(
//         //         onTap: () {
//         //           Navigator.of(context).push(
//         //               MaterialPageRoute(builder: (context) => BrainTreePage()));
//         //         },
//         //         child: Container(
//         //           height: 120,
//         //           width: 160,
//         //           child: Card(
//         //             elevation: 10,
//         //             child: Column(children: [
//         //               Padding(
//         //                 padding: const EdgeInsets.all(8.0),
//         //                 child: Text('Tap To Upload Money In Wallet With',
//         //                         textAlign: TextAlign.center)
//         //                     .tr(),
//         //               ),
//         //               Image.asset('assets/image/Braintree_Payments_Logo.png',
//         //                   width: 70, height: 70),
//         //             ]),
//         //           ),
//         //         ),
//         //       )
//       ],
//     );
//   }
// }

// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:falguni_app/Pages/cash_free_page.dart';

class PaymentListView extends StatelessWidget {
  final String id;
  const PaymentListView({super.key, required this.id});

  static const Color kGold = Color(0xFFC9A86A);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // INFO CARD
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cashfree Logo
              Center(
                child: Image.asset(
                  "assets/image/cashfree.png",
                  height: 60,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 18),

              const Text(
                "We use CashFree for secure payments.",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 10),

              const Text(
                "Your payments are processed through trusted UPI, card, and netbanking partners.",
                style: TextStyle(
                  color: Colors.white60,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 18),

              const Row(
                children: [
                  Icon(Icons.lock_outline, color: Colors.greenAccent, size: 18),
                  SizedBox(width: 6),
                  Text(
                    "Secure • Verified • Encrypted",
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 22),

        // CONTINUE BUTTON
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: kGold,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const CashFreeAmountWidget(),
                ),
              );
            },
            child: const Text(
              "Continue",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        const Center(
          child: Text(
            "By continuing, you agree to secure processing by CashFree.",
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white38, fontSize: 11),
          ),
        ),
      ],
    );
  }
}
