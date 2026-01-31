// ignore_for_file: unused_element, prefer_const_constructors, curly_braces_in_flow_control_structures, prefer_const_literals_to_create_immutables, unnecessary_to_list_in_spreads, unnecessary_brace_in_string_interps

import 'dart:math' as math;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:easy_localization/easy_localization.dart';

import '../Model/history.dart';
import '../Model/formatter.dart';

enum RangeFilter { all, last10, last30 }

enum FlowFilter { all, credits, debits, rewards }

class WalletHistory extends StatefulWidget {
  const WalletHistory({super.key});

  @override
  State<WalletHistory> createState() => _WalletHistoryState();
}

class _WalletHistoryState extends State<WalletHistory> {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);

  DocumentReference? userRef;
  String currencySymbol = '';
  bool _loading = true;
  List<HistoryModel> _all = [];

  RangeFilter _rangeFilter = RangeFilter.all;
  FlowFilter _flowFilter = FlowFilter.all;
  bool sortDescending = true;

  @override
  void initState() {
    super.initState();
    _getCurrencySymbol();
    _getUserDocAndHistory();
  }

  // --- Data Fetching ---

  Future<void> _getCurrencySymbol() async {
    try {
      final snap = await FirebaseFirestore.instance
          .collection('Currency Settings')
          .doc('Currency Settings')
          .get();
      if (mounted)
        setState(() => currencySymbol = snap['Currency symbol'] ?? '');
    } catch (_) {}
  }

  Future<void> _getUserDocAndHistory() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _loading = false);
      return;
    }
    userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    await _loadHistory();
  }

  Future<void> _loadHistory() async {
    if (userRef == null) return;
    try {
      final snapshot = await userRef!.collection('History').get();
      if (mounted) {
        setState(() {
          _all = snapshot.docs
              .map((doc) => HistoryModel.fromMap(doc.data(), doc.id))
              .toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  // --- Logic ---

  double _parseAmount(String raw) {
    final cleaned = raw.replaceAll(RegExp(r'[^\d.]'), '');
    final val = double.tryParse(cleaned) ?? 0.0;
    return raw.contains('-') ? -val : val;
  }

  bool _isReward(HistoryModel h) {
    final msg = h.message.toLowerCase();
    final pay = h.paymentSystem.toLowerCase();
    return msg.contains('reward') ||
        msg.contains('cashback') ||
        pay.contains('reward');
  }

  List<HistoryModel> _getFilteredData() {
    List<HistoryModel> list = List.from(_all);

    // Precise Chronological Sort
    list.sort((a, b) {
      return sortDescending
          ? b.timeCreated.compareTo(a.timeCreated)
          : a.timeCreated.compareTo(b.timeCreated);
    });

    if (_flowFilter != FlowFilter.all) {
      list = list.where((h) {
        final amt = _parseAmount(h.amount);
        final reward = _isReward(h);
        if (_flowFilter == FlowFilter.rewards) return reward;
        if (_flowFilter == FlowFilter.credits) return amt > 0 && !reward;
        if (_flowFilter == FlowFilter.debits) return amt < 0;
        return true;
      }).toList();
    }

    if (_rangeFilter == RangeFilter.last10 && list.length > 10) {
      list = list.sublist(0, 10);
    } else if (_rangeFilter == RangeFilter.last30 && list.length > 30) {
      list = list.sublist(0, 30);
    }
    return list;
  }

  // --- Build ---

  @override
  Widget build(BuildContext context) {
    final filtered = _getFilteredData();
    double c = 0, d = 0, r = 0;
    for (var h in filtered) {
      final val = _parseAmount(h.amount).abs();
      if (_isReward(h))
        r += val;
      else if (_parseAmount(h.amount) > 0)
        c += val;
      else
        d += val;
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text("Wallet History".tr(),
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF1C1515), Color(0xFF2F2525)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: _loading ? _buildShimmer() : _buildContent(filtered, c, d, r),
      ),
    );
  }

  Widget _buildContent(
      List<HistoryModel> filtered, double c, double d, double r) {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAnalyticsCard(c, d, r),
          const SizedBox(height: 24),
          _buildFilterChips(),
          const SizedBox(height: 16),
          _buildTransactionHeader(),
          if (filtered.isEmpty)
            Padding(
                padding: EdgeInsets.all(40),
                child: Center(
                    child: Text("No records found".tr(),
                        style: TextStyle(color: Colors.white38))))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              itemBuilder: (context, index) =>
                  _buildHistoryTile(filtered[index]),
            ),
        ],
      ),
    );
  }

  Widget _buildTransactionHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text("Transactions".tr(),
            style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold)),
        IconButton(
          icon: Icon(sortDescending ? Icons.arrow_downward : Icons.arrow_upward,
              color: kGold),
          onPressed: () => setState(() => sortDescending = !sortDescending),
        ),
      ],
    );
  }

  Widget _buildHistoryTile(HistoryModel h) {
    final amt = _parseAmount(h.amount);
    final reward = _isReward(h);

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(18)),
      child: Row(
        children: [
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(h.message,
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              Text(DateFormat.yMMMMd().add_jm().format(h.timeCreated),
                  style: TextStyle(color: Colors.white38, fontSize: 11)),
            ]),
          ),
          Text(h.amount,
              style: TextStyle(
                color: reward
                    ? kGold
                    : amt > 0
                        ? Colors.greenAccent
                        : Colors.redAccent.withOpacity(0.8),
                fontWeight: FontWeight.bold,
              )),
        ],
      ),
    );
  }

  // --- UI Helpers (Chips/Analytics) ---

  Widget _buildAnalyticsCard(double c, double d, double r) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white10)),
      child: Row(
        children: [
          SizedBox(
              height: 110,
              width: 110,
              child: CustomPaint(painter: _PiePainter(c, d, r))),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              children: [
                _legendItem("Credits", Colors.greenAccent, c),
                _divider(),
                _legendItem("Debits", Colors.redAccent, d),
                _divider(),
                _legendItem("Rewards", kGold, r),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _legendItem(String title, Color col, double val) {
    return Row(
      children: [
        Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: col, shape: BoxShape.circle)),
        const SizedBox(width: 10),
        Text(title.tr(), style: TextStyle(color: Colors.white70, fontSize: 12)),
        const Spacer(),
        Text("$currencySymbol${Formatter().converter(val)}",
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12)),
      ],
    );
  }

  Widget _divider() => Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Divider(color: Colors.white10));

  Widget _buildFilterChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(children: [
        _chip("All", FlowFilter.all, _flowFilter),
        _chip("Credits", FlowFilter.credits, _flowFilter),
        _chip("Debits", FlowFilter.debits, _flowFilter),
        _chip("Rewards", FlowFilter.rewards, _flowFilter),
        const SizedBox(width: 15),
        _chip("Last 10", RangeFilter.last10, _rangeFilter),
      ]),
    );
  }

  Widget _chip(String label, dynamic value, dynamic group) {
    final selected = value == group;
    return GestureDetector(
      onTap: () => setState(() {
        if (value is FlowFilter)
          _flowFilter = value;
        else if (value is RangeFilter)
          _rangeFilter = (_rangeFilter == value) ? RangeFilter.all : value;
      }),
      child: Container(
        margin: EdgeInsets.only(right: 8),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
            color: selected ? kGold : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12)),
        child: Text(label.tr(),
            style: TextStyle(
                color: selected ? Colors.black : Colors.white70,
                fontSize: 12,
                fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[900]!,
      highlightColor: Colors.grey[800]!,
      child: Column(
        children: List.generate(
            6,
            (_) => Container(
                height: 80,
                margin: EdgeInsets.all(10),
                decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(15)))),
      ),
    );
  }
}

class _PiePainter extends CustomPainter {
  final double c, d, r;
  _PiePainter(this.c, this.d, this.r);

  @override
  void paint(Canvas canvas, Size size) {
    final total = c + d + r;
    if (total == 0) return;
    double start = -math.pi / 2;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;

    void draw(double val, Color col) {
      if (val <= 0) return;
      final sweep = (val / total) * 2 * math.pi;
      paint.color = col;
      canvas.drawArc(Rect.fromLTWH(0, 0, size.width, size.height), start, sweep,
          false, paint);
      start += sweep;
    }

    draw(c, Colors.greenAccent);
    draw(d, Colors.redAccent);
    draw(r, Color(0xFFC9A86A));
  }

  @override
  bool shouldRepaint(_) => true;
}
