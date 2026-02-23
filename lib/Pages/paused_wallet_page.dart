// ignore_for_file: curly_braces_in_flow_control_structures, prefer_const_constructors, prefer_const_literals_to_create_immutables, unnecessary_to_list_in_spreads, deprecated_member_use

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import '../Model/formatter.dart';
import '../Model/history.dart';

class TransactionItem {
  final String title;
  final String subtitle;
  final DateTime date;
  final double amount;
  final bool isCredit;
  final String status;
  final String paymentType;

  TransactionItem({
    required this.title,
    required this.subtitle,
    required this.date,
    required this.amount,
    required this.isCredit,
    required this.status,
    required this.paymentType,
  });
}

class PausedWalletPage extends StatefulWidget {
  const PausedWalletPage({super.key});

  @override
  State<PausedWalletPage> createState() => _PausedWalletPageState();
}

class _PausedWalletPageState extends State<PausedWalletPage> {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  DocumentReference? userRef;
  String id = '';
  String currencySymbol = '';
  num wallet = 0;
  String selectedFilter = 'All'; // 'All', 'Credits', 'Debits'

  @override
  void initState() {
    super.initState();
    _getUserDetails();
  }

  // ---------------------------------------------------------------------------
  // DATA LOGIC
  // ---------------------------------------------------------------------------

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((value) {
      if (!mounted) return;
      setState(() {
        userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
        id = value['id'] ?? '';
        wallet = value['wallet'] ?? 0;
      });
    });
  }

  double _parseAmount(String raw) {
    final cleaned = raw.replaceAll(RegExp(r'[^\d.]'), '');
    final val = double.tryParse(cleaned) ?? 0.0;
    return raw.contains('-') ? -val : val;
  }

  Future<List<TransactionItem>> getTransactions() async {
    if (userRef == null || id.isEmpty) return [];
    List<TransactionItem> items = [];

    try {
      final historySnap = await userRef!.collection('History').get();
      for (var doc in historySnap.docs) {
        final h = HistoryModel.fromMap(doc.data(), doc.id);
        final amt = _parseAmount(h.amount);
        if (amt > 0) {
          items.add(TransactionItem(
            title: "Wallet Credit".tr(),
            subtitle: h.message,
            date: h.timeCreated,
            amount: amt,
            isCredit: true,
            status: "Completed",
            paymentType: "Wallet",
          ));
        }
      }

      final ordersSnap = await FirebaseFirestore.instance
          .collection('Orders')
          .where('userID', isEqualTo: id)
          .get();

      for (var doc in ordersSnap.docs) {
        final data = doc.data();
        final total = (data['total'] ?? 0).toDouble();
        final status = data['status'] ?? 'Received';
        final orderID = data['orderID'] ?? '';

        DateTime date;
        if (data['timeCreated'] is Timestamp) {
          date = (data['timeCreated'] as Timestamp).toDate();
        } else {
          date = DateTime.tryParse(data['uid'] ?? '') ?? DateTime.now();
        }

        String displayStatus = "Debited";
        if (status == "Cancelled") {
          displayStatus = "Returned back";
        } else if (status == "Received" || status == "Processing") {
          displayStatus = "Pending";
        }

        String paymentType = data['paymentType'] ?? '';

        if (paymentType == 'Wallet') {
          items.add(TransactionItem(
            title: "Order #$orderID",
            subtitle: status,
            date: date,
            amount: total,
            isCredit: false,
            status: displayStatus,
            paymentType: paymentType,
          ));
        }
      }

      items.sort((a, b) => b.date.compareTo(a.date));
    } catch (e) {
      debugPrint("Error fetching transactions: $e");
    }
    return items;
  }

  // ---------------------------------------------------------------------------
  // UI COMPONENTS
  // ---------------------------------------------------------------------------

  Widget _buildCombinedNotice() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: kGold.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline_rounded, color: kGold, size: 26),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  "Important Notice: Wallet Services".tr(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            "Dear Customer,\n\nTo ensure a secure and streamlined payment experience, we are transitioning away from the Wallet feature. You can continue placing orders seamlessly using Cashfree for direct payments.\n\nYour existing wallet data has been safely archived below for your reference. If you have any remaining balance or payment queries, please reach out to our support team with your transaction details.\n\nWe appreciate your understanding and continued trust in Falguni Gruhudhyog."
                .tr(),
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _emailSupport,
              icon: const Icon(Icons.email_outlined,
                  color: Colors.black, size: 20),
              label: Text(
                "Contact Support".tr(),
                style: const TextStyle(
                    color: Colors.black, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: kGold,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _emailSupport() async {
    final String subject =
        Uri.encodeComponent("Wallet Dispute/Enquiry - User ID: $id");
    final String body = Uri.encodeComponent("Hi Support Team,\n\n"
        "I would like to request a refund for my remaining wallet balance.\n\n"
        "My Details:\n"
        "- User ID: $id\n"
        "- Remaining Wallet Balance: $currencySymbol$wallet\n\n"
        "Please find the attached proof of deposit (e.g., bank statement, UPI screenshot) for your reference.\n\n"
        "Thank you.");
    final Uri emailUri = Uri.parse(
        "mailto:falgunigruhudhyog.sales@gmail.com?subject=$subject&body=$body");

    try {
      if (await canLaunchUrl(emailUri)) {
        await launchUrl(emailUri);
      } else {
        debugPrint("Could not launch email client");
      }
    } catch (e) {
      debugPrint("Error launching email client: $e");
    }
  }

  Widget _buildTile(TransactionItem t) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(16)),
      child: Row(children: [
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(t.title,
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.w500)),
          Text("${t.subtitle} • ${DateFormat.yMMMMd().format(t.date)}",
              style: const TextStyle(color: Colors.white38, fontSize: 11)),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text("${t.isCredit ? '+' : '-'}${Formatter().converter(t.amount)}",
              style: TextStyle(
                color: t.isCredit
                    ? Colors.greenAccent
                    : (t.status == "Returned back"
                        ? Colors.grey
                        : Colors.redAccent),
                fontWeight: FontWeight.bold,
                decoration: t.status == "Returned back"
                    ? TextDecoration.lineThrough
                    : null,
              )),
          if (!t.isCredit)
            Text(t.status.tr(),
                style: const TextStyle(color: Colors.white54, fontSize: 10)),
        ]),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
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
        height: double.infinity,
        decoration: const BoxDecoration(
            gradient: LinearGradient(
                colors: [kBgTop, kBgMid, kBgTop],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter)),
        child: SafeArea(
          child: FutureBuilder<List<TransactionItem>>(
            future: getTransactions(),
            builder: (context, snapshot) {
              final history = snapshot.data ?? [];

              return SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    _buildCombinedNotice(),
                    if (wallet > 0) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.redAccent.withOpacity(0.4)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Remaining Balance",
                              style: TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "$currencySymbol${Formatter().converter(wallet.toDouble())}",
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              "Security Notice: Due to unauthorized and fraudulent activities detected on the platform, wallet services have been permanently halted to protect our customers.\n\nTo claim your remaining balance, please Contact Support with proof of your initial deposit (e.g., bank statement or UPI screenshot). Once verified, the exact amount will be refunded directly to your original payment source.",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    Theme(
                      data: Theme.of(context)
                          .copyWith(dividerColor: Colors.transparent),
                      child: ExpansionTile(
                        initiallyExpanded: false,
                        tilePadding: EdgeInsets.zero,
                        iconColor: kGold,
                        collapsedIconColor: Colors.white54,
                        title: Text(
                          "Archived Transactions".tr(),
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold),
                        ),
                        children: [
                          if (snapshot.connectionState ==
                              ConnectionState.waiting)
                            const Padding(
                              padding: EdgeInsets.all(20),
                              child: CircularProgressIndicator(color: kGold),
                            )
                          else if (history.isEmpty &&
                              snapshot.connectionState == ConnectionState.done)
                            Padding(
                              padding: const EdgeInsets.all(20),
                              child: Text(
                                  "No archived transactions found.".tr(),
                                  style:
                                      const TextStyle(color: Colors.white60)),
                            )
                          else
                            ...history.map((h) => _buildTile(h)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
