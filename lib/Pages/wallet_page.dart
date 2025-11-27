// ignore_for_file: curly_braces_in_flow_control_structures

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shimmer/shimmer.dart';
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
  String addressID = '';
  String currencySymbol = '';
  num wallet = 0;
  bool? themeMode;

  @override
  void initState() {
    super.initState();
    _getUserDoc();
    _getUserDetails();
    _getCurrencySymbol();
    _getThemeDetail();
  }

  Future<void> _getUserDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() {
      userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    });
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
      setState(() {
        id = value['id'];
        addressID = value['DeliveryAddressID'];
        wallet = value['wallet'];
      });
    });
  }

  void _getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      if (!mounted) return;
      setState(() => currencySymbol = value['Currency symbol']);
    });
  }

  Future<List<HistoryModel>> getHistory() async {
    if (userRef == null) return [];
    final snapshot = await userRef!
        .collection('History')
        .orderBy('timeCreated', descending: true)
        .limit(20)
        .get();

    return snapshot.docs
        .map((doc) => HistoryModel.fromMap(doc.data(), doc.id))
        .toList();
  }

  void _getThemeDetail() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => themeMode = prefs.getBool('lightMode'));
  }

  // ---------------------- Parsing + Stats ----------------------

  double _parseRawAmount(String raw) {
    if (raw.isEmpty) return 0;
    final cleaned = raw.replaceAll(RegExp(r'[^0-9\-\+\.]'), '');
    return double.tryParse(cleaned) ?? 0;
  }

  Map<String, double> _computeStats(List<HistoryModel> history) {
    double credits = 0;
    double debits = 0;

    for (final h in history) {
      final v = _parseRawAmount(h.amount);
      if (v > 0)
        credits += v;
      else if (v < 0) debits += -v;
    }

    return {'credits': credits, 'debits': debits, 'net': credits - debits};
  }

  String _formatAmount(double value) {
    final abs = value.abs();
    return "$currencySymbol${Formatter().converter(abs)}";
  }

  // ---------------------- UI Helpers ----------------------

  Widget _buildBalanceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Wallet Balance".tr(),
              style: const TextStyle(
                  color: kGold, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(currencySymbol,
                  style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 20,
                      fontWeight: FontWeight.w500)),
              const SizedBox(width: 6),
              Text(
                Formatter().converter(wallet.toDouble()),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.7,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            "Use this balance to pay for orders in the app.".tr(),
            style: const TextStyle(
                color: Colors.white54, fontSize: 12, height: 1.35),
          ),
        ],
      ),
    );
  }

  // ---------------- ADD MONEY BUTTON ----------------
  Widget _buildAddMoneyButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: kGold,
        foregroundColor: Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 135),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      onPressed: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) {
            return FractionallySizedBox(
              heightFactor: 0.5,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                decoration: BoxDecoration(
                  color: kPrimary,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(28)),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.07),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.6),
                      blurRadius: 25,
                      offset: const Offset(0, -6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Drag handle
                    Center(
                      child: Container(
                        width: 38,
                        height: 5,
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const Text(
                      "Add Money",
                      style: TextStyle(
                        color: kGold,
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Scrollable Methods (more padding + safe height)
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: PaymentListView(id: id),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
      child: const Text(
        "Add Money",
        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _buildSection(String title, {Widget? action}) {
    return Padding(
      padding: const EdgeInsets.only(top: 26, bottom: 10),
      child: Row(
        mainAxisAlignment: action == null
            ? MainAxisAlignment.start
            : MainAxisAlignment.spaceBetween,
        children: [
          Text(title.tr(),
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w700)),
          if (action != null) action,
        ],
      ),
    );
  }

  // 🔹 MISSING EARLIER – NOW ADDED BACK
  Widget _buildSummaryPills(Map<String, double> stats) {
    pill(String label, double value, Color color) {
      return Expanded(
        child: Container(
          padding: const EdgeInsets.all(14),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.tr(),
                  style: const TextStyle(color: Colors.white60, fontSize: 11)),
              const SizedBox(height: 5),
              Text(
                _formatAmount(value),
                style: TextStyle(
                  color: color,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Row(
      children: [
        pill("Credits (in)", stats['credits']!, Colors.greenAccent),
        pill("Debits (out)", stats['debits']!, Colors.redAccent),
        pill("Net", stats['net']!, Colors.tealAccent),
      ],
    );
  }

  Widget _buildTrendCard(List<HistoryModel> history) {
    if (history.isEmpty) {
      return Container(
        margin: const EdgeInsets.only(top: 10),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.07)),
        ),
        child: const Text(
          "No trend available yet",
          style: TextStyle(color: Colors.white38, fontSize: 12),
        ),
      );
    }

    final values = history
        .take(8)
        .toList()
        .reversed
        .map((h) => _parseRawAmount(h.amount))
        .toList();

    double maxVal = values.map((e) => e.abs()).fold(0, (a, b) => a > b ? a : b);
    if (maxVal == 0) maxVal = 1;

    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Last Transactions Trend",
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          SizedBox(
            height: 75,
            width: double.infinity,
            child: CustomPaint(
              painter: _TrendPainter(values: values, maxAbs: maxVal),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            "Based on recent wallet movements.",
            style: TextStyle(color: Colors.white38, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTile(HistoryModel h) {
    final value = _parseRawAmount(h.amount);
    final isCredit = value >= 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        title: Text(
          h.message,
          style: const TextStyle(
              color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          h.timeCreated,
          style: const TextStyle(color: Colors.white38, fontSize: 11),
        ),
        trailing: Text(
          "${isCredit ? '+' : '-'}${_formatAmount(value)}",
          style: TextStyle(
            color: isCredit ? Colors.greenAccent : Colors.redAccent,
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerHistory() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[800]!,
      highlightColor: Colors.grey[600]!,
      enabled: true,
      child: ListView.builder(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        itemCount: 3,
        itemBuilder: (_, __) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          height: 75,
          decoration: BoxDecoration(
            color: Colors.white10,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  // ---------------------- Build UI ----------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          "Wallet".tr(),
          style: const TextStyle(
              color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 30),
            child: FutureBuilder<List<HistoryModel>>(
              future: getHistory(),
              builder: (context, snapshot) {
                final history = snapshot.data ?? [];
                final stats = _computeStats(history);
                final isLoading =
                    snapshot.connectionState == ConnectionState.waiting;

                final recent = history.take(3).toList();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildAddMoneyButton(),
                    const SizedBox(height: 20),
                    _buildBalanceCard(),
                    const SizedBox(height: 18),
                    _buildSummaryPills(stats),
                    _buildTrendCard(history),
                    _buildSection(
                      "Recent Transactions",
                      action: InkWell(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const WalletHistory()),
                        ),
                        child: const Text(
                          "See all →",
                          style: TextStyle(color: Colors.white60, fontSize: 13),
                        ),
                      ),
                    ),
                    if (isLoading)
                      _buildShimmerHistory()
                    else if (recent.isEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 22),
                        child: Center(
                          child: Text(
                            "No recent transactions".tr(),
                            style: const TextStyle(
                                color: Colors.white54, fontSize: 14),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        itemCount: recent.length,
                        itemBuilder: (context, i) =>
                            _buildHistoryTile(recent[i]),
                      ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------- Trend Chart Painter ----------------------

class _TrendPainter extends CustomPainter {
  final List<double> values;
  final double maxAbs;

  _TrendPainter({required this.values, required this.maxAbs});

  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;

    final paintLine = Paint()
      ..color = Colors.white70
      ..strokeWidth = 1.7
      ..style = PaintingStyle.stroke;

    final paintDot = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final path = Path();
    final stepX = size.width / (values.length - 1);
    final centerY = size.height / 2;

    for (int i = 0; i < values.length; i++) {
      final v = values[i];
      final normalized = v / maxAbs;
      final x = stepX * i;
      final y = centerY - normalized * (size.height / 2.2);

      if (i == 0)
        path.moveTo(x, y);
      else
        path.lineTo(x, y);

      canvas.drawCircle(Offset(x, y), 2.6, paintDot);
    }

    canvas.drawPath(path, paintLine);
  }

  @override
  bool shouldRepaint(_TrendPainter old) =>
      old.values != values || old.maxAbs != maxAbs;
}
