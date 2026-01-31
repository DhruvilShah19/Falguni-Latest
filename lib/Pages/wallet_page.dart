// // ignore_for_file: curly_braces_in_flow_control_structures, prefer_const_constructors

// import 'dart:math' as math;
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:shared_preferences/shared_preferences.dart';
// import 'package:shimmer/shimmer.dart';
// import 'package:easy_localization/easy_localization.dart';
// import 'package:intl/intl.dart';

// import '../Model/formatter.dart';
// import '../Model/history.dart';
// import '../Widgets/payment_list_view.dart';
// import '../Widgets/wallet_history.dart';

// class WalletPage extends StatefulWidget {
//   const WalletPage({super.key});

//   @override
//   State<WalletPage> createState() => _WalletPageState();
// }

// class _WalletPageState extends State<WalletPage> {
//   static const Color kPrimary = Color(0xFF2F2525);
//   static const Color kGold = Color(0xFFC9A86A);
//   static const Color kBgTop = Color(0xFF1C1515);
//   static const Color kBgMid = Color(0xFF2F2525);

//   DocumentReference? userRef;
//   String id = '';
//   String currencySymbol = '';
//   num wallet = 0;

//   @override
//   void initState() {
//     super.initState();
//     _getUserDoc();
//     _getUserDetails();
//     _getCurrencySymbol();
//   }

//   // ---------------------------------------------------------------------------
//   // DATA LOGIC
//   // ---------------------------------------------------------------------------

//   Future<void> _getUserDoc() async {
//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) return;
//     setState(() =>
//         userRef = FirebaseFirestore.instance.collection('users').doc(user.uid));
//   }

//   Future<void> _getUserDetails() async {
//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) return;
//     FirebaseFirestore.instance
//         .collection('users')
//         .doc(user.uid)
//         .snapshots()
//         .listen((value) {
//       if (!mounted) return;
//       setState(() {
//         id = value['id'];
//         wallet = value['wallet'] ?? 0;
//       });
//     });
//   }

//   void _getCurrencySymbol() {
//     FirebaseFirestore.instance
//         .collection('Currency Settings')
//         .doc('Currency Settings')
//         .get()
//         .then((value) {
//       if (!mounted) return;
//       setState(() => currencySymbol = value['Currency symbol'] ?? '');
//     });
//   }

//   Future<List<HistoryModel>> getAllHistory() async {
//     if (userRef == null) return [];

//     // Fetch a large enough batch to ensure we have all recent data
//     final snapshot = await userRef!.collection('History').get();

//     List<HistoryModel> list = snapshot.docs
//         .map((doc) => HistoryModel.fromMap(doc.data(), doc.id))
//         .toList();

//     // STRICT SORTING: Using the DateTime objects to ensure newest are truly at the top
//     list.sort((a, b) => b.timeCreated.compareTo(a.timeCreated));

//     return list;
//   }

//   double _parseAmount(String raw) {
//     final cleaned = raw.replaceAll(RegExp(r'[^\d.]'), '');
//     final val = double.tryParse(cleaned) ?? 0.0;
//     return raw.contains('-') ? -val : val;
//   }

//   // ---------------------------------------------------------------------------
//   // UI WIDGETS
//   // ---------------------------------------------------------------------------

//   Widget _buildSummaryPills(List<HistoryModel> history) {
//     double credits = 0;
//     double debits = 0;
//     for (var h in history) {
//       final v = _parseAmount(h.amount);
//       if (v > 0)
//         credits += v;
//       else if (v < 0) debits += v.abs();
//     }

//     pill(String label, double value, Color color) => Expanded(
//           child: Container(
//             padding: const EdgeInsets.all(14),
//             margin: const EdgeInsets.symmetric(horizontal: 4),
//             decoration: BoxDecoration(
//               color: Colors.white.withOpacity(0.04),
//               borderRadius: BorderRadius.circular(16),
//               border: Border.all(color: Colors.white.withOpacity(0.08)),
//             ),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Text(label.tr(),
//                     style:
//                         const TextStyle(color: Colors.white60, fontSize: 11)),
//                 const SizedBox(height: 5),
//                 Text("$currencySymbol${Formatter().converter(value)}",
//                     style: TextStyle(
//                         color: color,
//                         fontSize: 16,
//                         fontWeight: FontWeight.bold)),
//               ],
//             ),
//           ),
//         );

//     return Row(children: [
//       pill("Credits", credits, Colors.greenAccent),
//       pill("Debits", debits, Colors.redAccent),
//     ]);
//   }

//   Widget _buildTrendCard(List<HistoryModel> history) {
//     // Trend focused on spending (Debits)
//     final debitValues = history
//         .where((h) => _parseAmount(h.amount) < 0)
//         .take(6)
//         .toList()
//         .reversed
//         .map((h) => _parseAmount(h.amount).abs())
//         .toList();

//     if (debitValues.length < 2) return SizedBox.shrink();
//     double maxVal = debitValues.reduce(math.max);

//     return Container(
//       padding: EdgeInsets.all(16),
//       decoration: BoxDecoration(
//           color: Colors.white.withOpacity(0.04),
//           borderRadius: BorderRadius.circular(20)),
//       child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//         Text("Spending Trend".tr(),
//             style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
//         const SizedBox(height: 14),
//         SizedBox(
//             height: 70,
//             width: double.infinity,
//             child: CustomPaint(
//                 painter: _SpendingPainter(
//                     values: debitValues, maxVal: maxVal == 0 ? 1 : maxVal))),
//       ]),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: Colors.black,
//       appBar: AppBar(
//         backgroundColor: Colors.transparent,
//         elevation: 0,
//         title: Text("Wallet".tr(),
//             style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
//         centerTitle: true,
//       ),
//       body: Container(
//         decoration: BoxDecoration(
//             gradient: LinearGradient(
//                 colors: [kBgTop, kBgMid],
//                 begin: Alignment.topCenter,
//                 end: Alignment.bottomCenter)),
//         child: SafeArea(
//           child: FutureBuilder<List<HistoryModel>>(
//             future: getAllHistory(),
//             builder: (context, snapshot) {
//               final history = snapshot.data ?? [];
//               final recent3 =
//                   history.take(3).toList(); // Truly the newest 3 after sorting

//               return SingleChildScrollView(
//                 padding: EdgeInsets.all(18),
//                 child: Column(
//                   children: [
//                     _buildBalanceHeader(),
//                     const SizedBox(height: 20),
//                     _buildSummaryPills(history),
//                     const SizedBox(height: 20),
//                     _buildTrendCard(history),
//                     const SizedBox(height: 25),
//                     _buildRecentHeader(),
//                     const SizedBox(height: 12),
//                     ...recent3.map((h) => _buildTile(h)).toList(),
//                   ],
//                 ),
//               );
//             },
//           ),
//         ),
//       ),
//     );
//   }

//   Widget _buildBalanceHeader() {
//     return Container(
//       width: double.infinity,
//       padding: EdgeInsets.all(24),
//       decoration: BoxDecoration(
//         color: Colors.white.withOpacity(0.05),
//         borderRadius: BorderRadius.circular(24),
//         border: Border.all(color: Colors.white10),
//       ),
//       child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//         Text("Total Balance".tr(),
//             style: TextStyle(color: kGold, fontSize: 14)),
//         const SizedBox(height: 8),
//         Text("$currencySymbol${Formatter().converter(wallet.toDouble())}",
//             style: TextStyle(
//                 color: Colors.white,
//                 fontSize: 32,
//                 fontWeight: FontWeight.w800)),
//       ]),
//     );
//   }

//   Widget _buildRecentHeader() {
//     return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
//       Text("Recent Transactions".tr(),
//           style: TextStyle(
//               color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
//       InkWell(
//         onTap: () => Navigator.push(
//             context, MaterialPageRoute(builder: (_) => WalletHistory())),
//         child: Text("See all →".tr(),
//             style: TextStyle(color: kGold, fontSize: 13)),
//       ),
//     ]);
//   }

//   Widget _buildTile(HistoryModel h) {
//     final val = _parseAmount(h.amount);
//     return Container(
//       margin: EdgeInsets.only(bottom: 10),
//       padding: EdgeInsets.all(16),
//       decoration: BoxDecoration(
//           color: Colors.white.withOpacity(0.04),
//           borderRadius: BorderRadius.circular(16)),
//       child: Row(children: [
//         Expanded(
//             child:
//                 Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//           Text(h.message,
//               style:
//                   TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
//           Text(DateFormat.yMMMMd().format(h.timeCreated),
//               style: TextStyle(color: Colors.white38, fontSize: 11)),
//         ])),
//         Text(h.amount,
//             style: TextStyle(
//                 color: val > 0 ? Colors.greenAccent : Colors.redAccent,
//                 fontWeight: FontWeight.bold)),
//       ]),
//     );
//   }
// }

// // ---------------------------------------------------------------------------
// // SPENDING TREND PAINTER
// // ---------------------------------------------------------------------------

// class _SpendingPainter extends CustomPainter {
//   final List<double> values;
//   final double maxVal;
//   _SpendingPainter({required this.values, required this.maxVal});

//   @override
//   void paint(Canvas canvas, Size size) {
//     final paint = Paint()
//       ..color = Colors.redAccent.withOpacity(0.6)
//       ..strokeWidth = 2.5
//       ..style = PaintingStyle.stroke;
//     final path = Path();
//     final stepX = size.width / (values.length - 1);

//     for (int i = 0; i < values.length; i++) {
//       final x = stepX * i;
//       final y = size.height - (values[i] / maxVal) * size.height;
//       if (i == 0)
//         path.moveTo(x, y);
//       else
//         path.lineTo(x, y);
//       canvas.drawCircle(Offset(x, y), 3, Paint()..color = Colors.redAccent);
//     }
//     canvas.drawPath(path, paint);
//   }

//   @override
//   bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
// }

// ignore_for_file: curly_braces_in_flow_control_structures, prefer_const_constructors, prefer_const_literals_to_create_immutables, unnecessary_to_list_in_spreads

import 'dart:math' as math;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

import '../Model/formatter.dart';
import '../Model/history.dart';
import '../Widgets/payment_list_view.dart';
import '../Widgets/wallet_history.dart';

class WalletPage extends StatefulWidget {
  const WalletPage({super.key});

  @override
  State<WalletPage> createState() => _WalletPageState();
}

class _WalletPageState extends State<WalletPage> {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  DocumentReference? userRef;
  String id = '';
  String currencySymbol = '';
  num wallet = 0;

  @override
  void initState() {
    super.initState();
    _getUserDoc();
    _getUserDetails();
    _getCurrencySymbol();
  }

  // ---------------------------------------------------------------------------
  // DATA & DIALOG LOGIC
  // ---------------------------------------------------------------------------

  Future<void> _getUserDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() =>
        userRef = FirebaseFirestore.instance.collection('users').doc(user.uid));
  }

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((value) {
      if (!mounted) return;
      num currentWallet = value['wallet'] ?? 0;
      setState(() {
        id = value['id'] ?? '';
        wallet = currentWallet;
      });
      if (currentWallet < 0) _showNegativeBalanceDialog(currentWallet);
    });
  }

  void _showNegativeBalanceDialog(num balance) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: EdgeInsets.all(24),
          decoration: BoxDecoration(
              color: kBgMid,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.redAccent.withOpacity(0.3))),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, color: Colors.redAccent, size: 32),
              const SizedBox(height: 16),
              Text('Account Balance Negative'.tr(),
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18)),
              const SizedBox(height: 12),
              Text(
                  'You must settle the balance of $currencySymbol${Formatter().converter(balance.abs().toDouble())} before ordering.'
                      .tr(),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 13)),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: kGold),
                onPressed: () => Navigator.pop(context),
                child: Text('Understood'.tr(),
                    style: TextStyle(
                        color: Colors.black, fontWeight: FontWeight.bold)),
              )
            ],
          ),
        ),
      ),
    );
  }

  void _getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      if (!mounted) return;
      setState(() => currencySymbol = value['Currency symbol'] ?? '');
    });
  }

  Future<List<HistoryModel>> getAllHistory() async {
    if (userRef == null) return [];
    final snapshot = await userRef!.collection('History').get();
    List<HistoryModel> list = snapshot.docs
        .map((doc) => HistoryModel.fromMap(doc.data(), doc.id))
        .toList();
    list.sort((a, b) => b.timeCreated.compareTo(a.timeCreated));
    return list;
  }

  double _parseAmount(String raw) {
    final cleaned = raw.replaceAll(RegExp(r'[^\d.]'), '');
    final val = double.tryParse(cleaned) ?? 0.0;
    return raw.contains('-') ? -val : val;
  }

  // ---------------------------------------------------------------------------
  // UI COMPONENTS
  // ---------------------------------------------------------------------------

  Widget _buildAddMoneyButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: kGold,
        foregroundColor: Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 100),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      onPressed: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => Container(
            height: MediaQuery.of(context).size.height * 0.6,
            padding: EdgeInsets.all(18),
            decoration: BoxDecoration(
                color: kPrimary,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
            child: Column(children: [
              Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(10))),
              const SizedBox(height: 20),
              Text("Select Payment Method".tr(),
                  style: TextStyle(
                      color: kGold, fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 20),
              Expanded(child: PaymentListView(id: id)),
            ]),
          ),
        );
      },
      child: Text("Add Money to wallet".tr(),
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
    );
  }

  Widget _buildSummaryPills(List<HistoryModel> history) {
    double credits = 0;
    double debits = 0;
    for (var h in history) {
      final v = _parseAmount(h.amount);
      if (v > 0)
        credits += v;
      else if (v < 0) debits += v.abs();
    }
    return Row(children: [
      _pill("Credits", credits, Colors.greenAccent),
      _pill("Debits", debits, Colors.redAccent),
    ]);
  }

  Widget _pill(String label, double val, Color col) => Expanded(
        child: Container(
          padding: EdgeInsets.all(14),
          margin: EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white10)),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label.tr(),
                style: TextStyle(color: Colors.white60, fontSize: 11)),
            const SizedBox(height: 4),
            Text("$currencySymbol${Formatter().converter(val)}",
                style: TextStyle(
                    color: col, fontSize: 16, fontWeight: FontWeight.bold)),
          ]),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Wallet".tr(),
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Container(
        decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [kBgTop, kBgMid],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter)),
        child: SafeArea(
          child: FutureBuilder<List<HistoryModel>>(
            future: getAllHistory(),
            builder: (context, snapshot) {
              final history = snapshot.data ?? [];
              final recent3 = history.take(3).toList();

              return SingleChildScrollView(
                padding: EdgeInsets.all(18),
                child: Column(
                  children: [
                    _buildAddMoneyButton(),
                    const SizedBox(height: 20),
                    _buildBalanceHeader(),
                    const SizedBox(height: 18),
                    _buildSummaryPills(history),
                    const SizedBox(height: 24),
                    _buildTrendCard(history),
                    const SizedBox(height: 24),
                    _buildRecentHeader(),
                    const SizedBox(height: 12),
                    if (snapshot.connectionState == ConnectionState.waiting)
                      CircularProgressIndicator(color: kGold)
                    else
                      ...recent3.map((h) => _buildTile(h)).toList(),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildBalanceHeader() {
    bool isNegative = wallet < 0;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
              color: isNegative
                  ? Colors.redAccent.withOpacity(0.4)
                  : Colors.white10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(isNegative ? "Amount Due".tr() : "Total Balance".tr(),
            style: TextStyle(
                color: isNegative ? Colors.redAccent : kGold, fontSize: 14)),
        const SizedBox(height: 8),
        Text("$currencySymbol${Formatter().converter(wallet.toDouble().abs())}",
            style: TextStyle(
                color: isNegative ? Colors.redAccent : Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.w800)),
      ]),
    );
  }

  Widget _buildRecentHeader() {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text("Recent Transactions".tr(),
          style: TextStyle(
              color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      InkWell(
          onTap: () => Navigator.push(
              context, MaterialPageRoute(builder: (_) => WalletHistory())),
          child: Text("See all →".tr(),
              style: TextStyle(color: kGold, fontSize: 13))),
    ]);
  }

  Widget _buildTile(HistoryModel h) {
    final val = _parseAmount(h.amount);
    return Container(
      margin: EdgeInsets.only(bottom: 10),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(16)),
      child: Row(children: [
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(h.message,
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
          Text(DateFormat.yMMMMd().format(h.timeCreated),
              style: TextStyle(color: Colors.white38, fontSize: 11)),
        ])),
        Text(h.amount,
            style: TextStyle(
                color: val > 0 ? Colors.greenAccent : Colors.redAccent,
                fontWeight: FontWeight.bold)),
      ]),
    );
  }

  Widget _buildTrendCard(List<HistoryModel> history) {
    final debitValues = history
        .where((h) => _parseAmount(h.amount) < 0)
        .take(6)
        .toList()
        .reversed
        .map((h) => _parseAmount(h.amount).abs())
        .toList();
    if (debitValues.length < 2) return SizedBox.shrink();
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text("Spending Trend".tr(),
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        SizedBox(
            height: 70,
            width: double.infinity,
            child: CustomPaint(painter: _SpendingPainter(values: debitValues))),
      ]),
    );
  }
}

// ---------------------------------------------------------------------------
// TREND PAINTER
// ---------------------------------------------------------------------------

class _SpendingPainter extends CustomPainter {
  final List<double> values;
  _SpendingPainter({required this.values});
  @override
  void paint(Canvas canvas, Size size) {
    if (values.length < 2) return;
    double maxV = values.reduce(math.max);
    if (maxV == 0) maxV = 1;
    final paint = Paint()
      ..color = Colors.redAccent
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    final path = Path();
    final stepX = size.width / (values.length - 1);
    for (int i = 0; i < values.length; i++) {
      final x = stepX * i;
      final y = size.height - (values[i] / maxV) * size.height;
      if (i == 0)
        path.moveTo(x, y);
      else
        path.lineTo(x, y);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
