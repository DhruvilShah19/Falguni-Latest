// ignore_for_file: unused_element, prefer_const_constructors

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

  @override
  void initState() {
    super.initState();
    _getCurrencySymbol();
    _getUserDocAndHistory();
  }

  // ---------------------------------------------------------------------------
  // FIREBASE
  // ---------------------------------------------------------------------------

  Future<void> _getCurrencySymbol() async {
    try {
      final snap = await FirebaseFirestore.instance
          .collection('Currency Settings')
          .doc('Currency Settings')
          .get();
      if (!mounted) return;
      setState(() {
        currencySymbol = snap['Currency symbol'] ?? '';
      });
    } catch (_) {
      // ignore; fallback to empty symbol
    }
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
    if (userRef == null) {
      setState(() => _loading = false);
      return;
    }

    try {
      final snapshot = await userRef!
          .collection('History')
          .orderBy('timeCreated', descending: true) // newest → oldest
          .get();

      setState(() {
        _all = snapshot.docs
            .map((doc) => HistoryModel.fromMap(doc.data(), doc.id))
            .toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  // ---------------------------------------------------------------------------
  // AMOUNT PARSING (ROBUST)
  // ---------------------------------------------------------------------------

  /// Parse the amount string from Firestore into a signed double.
  /// Handles formats like "+₹1,000", "-INR200", "+200", "200", etc.
  double _parseAmount(String raw) {
    if (raw.trim().isEmpty) return 0.0;

    // Determine sign
    final hasMinus = raw.contains('-');
    final hasPlus = raw.contains('+');

    // Strip everything except digits and decimal separator
    String cleaned = raw.replaceAll(RegExp(r'[^\d.]'), '');
    if (cleaned.isEmpty) return 0.0;

    final val = double.tryParse(cleaned);
    if (val == null) return 0.0;

    if (hasMinus) return -val;
    // If explicitly plus or no sign, treat as positive
    return val.abs();
  }

  FlowFilter _classifyFlow(HistoryModel h) {
    final v = _parseAmount(h.amount);
    final msg = h.message.toLowerCase();
    final pay = h.paymentSystem.toLowerCase();

    final rewardish = msg.contains('reward') ||
        msg.contains('cashback') ||
        msg.contains('bonus') ||
        pay.contains('reward') ||
        pay.contains('cashback');

    if (rewardish) return FlowFilter.rewards;
    if (v > 0) return FlowFilter.credits;
    if (v < 0) return FlowFilter.debits;
    return FlowFilter.all;
  }

  // ---------------------------------------------------------------------------
  // FILTERS & SUMMARY
  // ---------------------------------------------------------------------------

  List<HistoryModel> _applyFilters(List<HistoryModel> all) {
    List<HistoryModel> filtered = List.from(all);

    // 1) Range filter based on count (already sorted newest → oldest)
    switch (_rangeFilter) {
      case RangeFilter.last10:
        if (filtered.length > 10) {
          filtered = filtered.sublist(0, 10);
        }
        break;
      case RangeFilter.last30:
        if (filtered.length > 30) {
          filtered = filtered.sublist(0, 30);
        }
        break;
      case RangeFilter.all:
        break;
    }

    // 2) Flow filter
    if (_flowFilter != FlowFilter.all) {
      filtered = filtered.where((h) {
        final flow = _classifyFlow(h);
        return flow == _flowFilter;
      }).toList();
    }

    return filtered;
  }

  /// Compute totals (credits, debits, rewards) based on the *filtered* list.
  Map<String, double> _computeTotals(List<HistoryModel> list) {
    double credits = 0;
    double debits = 0;
    double rewards = 0;

    for (final h in list) {
      final val = _parseAmount(h.amount);
      final flow = _classifyFlow(h);

      if (flow == FlowFilter.rewards) {
        rewards += val.abs();
      } else if (val > 0) {
        credits += val;
      } else if (val < 0) {
        debits += val.abs();
      }
    }

    return {
      'credits': credits,
      'debits': debits,
      'rewards': rewards,
    };
  }

  String _formatAmount(double value) {
    final sign = value >= 0 ? '+' : '-';
    final absVal = value.abs();
    final formatted = Formatter().converter(absVal);
    return '$sign$currencySymbol$formatted';
  }

  String _formatBare(double value) {
    final absVal = value.abs();
    return Formatter().converter(absVal);
  }

  // ---------------------------------------------------------------------------
  // WIDGET HELPERS
  // ---------------------------------------------------------------------------

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 16, 4, 8),
      child: Text(
        title.tr(),
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16.5,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  /// Modern filters card (range + flow) with segmented buttons
  Widget _buildFiltersCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(top: 4, bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white12, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Filter Transactions".tr(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14.5,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),

          // Range selector
          Row(
            children: [
              _segmentedButton("All", RangeFilter.all, _rangeFilter),
              _segmentedButton("Last 10", RangeFilter.last10, _rangeFilter),
              _segmentedButton("Last 30", RangeFilter.last30, _rangeFilter),
            ],
          ),
          const SizedBox(height: 14),

          Divider(color: Colors.white12, height: 1),

          const SizedBox(height: 14),

          // Flow selector
          Row(
            children: [
              _segmentedButton("All Types", FlowFilter.all, _flowFilter),
              _segmentedButton("Credits", FlowFilter.credits, _flowFilter),
              _segmentedButton("Debits", FlowFilter.debits, _flowFilter),
              _segmentedButton("Rewards", FlowFilter.rewards, _flowFilter),
            ],
          ),
        ],
      ),
    );
  }

  Widget _segmentedButton(String label, dynamic value, dynamic group) {
    final bool selected = value == group;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            if (value is RangeFilter) {
              _rangeFilter = value;
            } else if (value is FlowFilter) {
              _flowFilter = value;
            }
          });
        },
        child: Container(
          alignment: Alignment.center,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: selected ? kGold : Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? kGold : Colors.white24,
              width: 1,
            ),
          ),
          child: Text(
            label.tr(),
            textAlign: TextAlign.center,
            style: TextStyle(
              color: selected ? Colors.black : Colors.white70,
              fontWeight: FontWeight.w600,
              fontSize: 11.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerList() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 10.0),
      child: Shimmer.fromColors(
        baseColor: Colors.grey[800]!,
        highlightColor: Colors.grey[600]!,
        enabled: true,
        child: ListView.builder(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          itemBuilder: (_, __) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            height: 70,
            decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          itemCount: 8,
        ),
      ),
    );
  }

  Widget _buildHistoryTile(HistoryModel h) {
    final val = _parseAmount(h.amount);
    final flow = _classifyFlow(h);

    final bool isCredit =
        flow == FlowFilter.credits || flow == FlowFilter.rewards;
    final Color amountColor = flow == FlowFilter.rewards
        ? kGold
        : (isCredit ? Colors.greenAccent : Colors.redAccent);

    final sign = val > 0
        ? '+'
        : val < 0
            ? '-'
            : '';

    final String labelAmount =
        '$sign$currencySymbol${Formatter().converter(val.abs())}';

    // Tag extraction
    String chip = '';
    final msg = h.message.toLowerCase();
    if (msg.contains('order')) chip = 'Order'.tr();
    if (msg.contains('refund')) chip = 'Refund'.tr();
    if (msg.contains('wallet') ||
        msg.contains('topup') ||
        msg.contains('top-up')) {
      chip = 'Top-up'.tr();
    }
    if (_classifyFlow(h) == FlowFilter.rewards) {
      chip = 'Reward'.tr();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12, width: 0.8),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white10,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            flow == FlowFilter.rewards
                ? Icons.emoji_events_outlined
                : isCredit
                    ? Icons.arrow_downward_rounded
                    : Icons.arrow_upward_rounded,
            color: amountColor,
            size: 18,
          ),
        ),
        title: Text(
          h.message,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13.5,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                if (chip.isNotEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: Colors.white24, width: 0.8),
                    ),
                    child: Text(
                      chip,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                      ),
                    ),
                  ),
                if (chip.isNotEmpty) const SizedBox(width: 6),
                if (h.paymentSystem.isNotEmpty)
                  Text(
                    h.paymentSystem,
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 11,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              h.timeCreated, // assuming this is formatted string from model
              style: const TextStyle(
                color: Colors.white38,
                fontSize: 10,
              ),
            ),
          ],
        ),
        trailing: Text(
          labelAmount,
          style: TextStyle(
            color: amountColor,
            fontWeight: FontWeight.w700,
            fontSize: 14.5,
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // CHARTS & HELPERS
  // ---------------------------------------------------------------------------

  Widget _emptyChartText(String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text.tr(),
        style: const TextStyle(
          color: Colors.white38,
          fontSize: 11,
        ),
      ),
    );
  }

  Widget _legendRow({
    required Color color,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label.tr(),
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 11.5,
              ),
            ),
          ),
          Text(
            '$currencySymbol$value',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCharts(
    Map<String, double> totals,
    List<HistoryModel> filtered,
  ) {
    final credits = totals['credits'] ?? 0;
    final debits = totals['debits'] ?? 0;
    final rewards = totals['rewards'] ?? 0;
    final total = credits + debits + rewards;

    final points = _buildTimelinePoints(filtered);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // PIE + LEGEND
        Container(
          height: 200,
          margin: const EdgeInsets.only(top: 8, bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white12, width: 0.8),
          ),
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          child: Row(
            children: [
              Expanded(
                flex: 4,
                child: Center(
                  child: total > 0
                      ? CustomPaint(
                          size: const Size(140, 140),
                          painter: _WalletPiePainter(
                            credits: credits,
                            debits: debits,
                            rewards: rewards,
                          ),
                        )
                      : _emptyChartText("No data"),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 5,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Wallet breakdown".tr(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _legendRow(
                      color: Colors.greenAccent,
                      label: "Credits (in)",
                      value: _formatBare(credits),
                    ),
                    _legendRow(
                      color: Colors.redAccent,
                      label: "Debits (out)",
                      value: _formatBare(debits),
                    ),
                    _legendRow(
                      color: kGold,
                      label: "Rewards",
                      value: _formatBare(rewards),
                    ),
                    const Spacer(),
                    Text(
                      "All values are based on the filtered list above.".tr(),
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 9.5,
                      ),
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  List<_TimelinePoint> _buildTimelinePoints(List<HistoryModel> list) {
    final points = <_TimelinePoint>[];
    if (list.isEmpty) return points;

    // Firestore query: newest → oldest
    // For timeline we want oldest → newest
    final ordered = list.reversed.toList();

    double cumulative = 0;

    for (int i = 0; i < ordered.length; i++) {
      final h = ordered[i];
      cumulative += _parseAmount(h.amount);

      final label = h.timeCreated.length > 10
          ? h.timeCreated.substring(0, 10)
          : h.timeCreated;

      points.add(
        _TimelinePoint(
          x: i.toDouble(),
          value: cumulative,
          label: label,
        ),
      );
    }

    return points;
  }

  Widget _buildEmptyScreen() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 40.0),
        child: Text(
          "No transactions yet".tr(),
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------------------------

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
          "Wallet History".tr(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: .4,
          ),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF1C1515),
              Color(0xFF2F2525),
              Color(0xFF1C1515),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: _loading
              ? _buildShimmerList()
              : _all.isEmpty
                  ? _buildEmptyScreen()
                  : SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
                      child: _buildHistoryContent(),
                    ),
        ),
      ),
    );
  }

  Widget _buildHistoryContent() {
    final filtered = _applyFilters(_all);
    final totals = _computeTotals(filtered);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle("Filters"),
        _buildFiltersCard(),
        const SizedBox(height: 8),
        _buildSectionTitle("Analytics"),
        SizedBox(
          width: double.infinity,
          child: _buildCharts(totals, filtered),
        ),
        const SizedBox(height: 25),
        _buildSectionTitle("All Transactions"),
        const SizedBox(height: 10),
        if (filtered.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.only(top: 24.0),
              child: Text(
                "No transactions for this filter".tr(),
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 13,
                ),
              ),
            ),
          )
        else
          Column(
            children: List.generate(
              filtered.length,
              (index) => _buildHistoryTile(filtered[index]),
            ),
          ),
        const SizedBox(height: 40),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// PIE CHART PAINTER
// ---------------------------------------------------------------------------

class _WalletPiePainter extends CustomPainter {
  final double credits;
  final double debits;
  final double rewards;

  _WalletPiePainter({
    required this.credits,
    required this.debits,
    required this.rewards,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final total = credits + debits + rewards;
    if (total <= 0) return;

    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final double strokeWidth = size.width * 0.18;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    double startAngle = -math.pi / 2;

    void drawSegment(double value, Color color) {
      if (value <= 0) return;
      final sweepAngle = (value / total) * 2 * math.pi;
      paint.color = color;
      canvas.drawArc(
        rect.deflate(strokeWidth / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
      startAngle += sweepAngle;
    }

    drawSegment(credits, Colors.greenAccent);
    drawSegment(debits, Colors.redAccent);
    drawSegment(rewards, _WalletHistoryState.kGold);
  }

  @override
  bool shouldRepaint(covariant _WalletPiePainter oldDelegate) {
    return credits != oldDelegate.credits ||
        debits != oldDelegate.debits ||
        rewards != oldDelegate.rewards;
  }
}

// ---------------------------------------------------------------------------
// SIMPLE BAR CHART PAINTER
// ---------------------------------------------------------------------------

class _WalletBarPainter extends CustomPainter {
  final double credits;
  final double debits;
  final double rewards;

  _WalletBarPainter({
    required this.credits,
    required this.debits,
    required this.rewards,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final values = [credits, debits, rewards];
    final maxVal = values.fold<double>(
      0,
      (prev, el) => el > prev ? el : prev,
    );

    if (maxVal <= 0) return;

    final barWidth = size.width * 0.12;
    final spacing = size.width * 0.25;

    final baseline = size.height * 0.9;
    final scale = (size.height * 0.6) / maxVal;

    void drawBar(int index, double value, Color color) {
      if (value <= 0) return;
      final x = spacing * (index + 1);
      final barHeight = value * scale;
      final rect = Rect.fromLTWH(
        x - barWidth / 2,
        baseline - barHeight,
        barWidth,
        barHeight,
      );

      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      canvas.drawRRect(
        RRect.fromRectAndRadius(rect, const Radius.circular(6)),
        paint,
      );
    }

    drawBar(0, credits, Colors.greenAccent);
    drawBar(1, debits, Colors.redAccent);
    drawBar(2, rewards, _WalletHistoryState.kGold);
  }

  @override
  bool shouldRepaint(covariant _WalletBarPainter oldDelegate) {
    return credits != oldDelegate.credits ||
        debits != oldDelegate.debits ||
        rewards != oldDelegate.rewards;
  }
}

// ---------------------------------------------------------------------------
// TIMELINE (LINE) CHART PAINTER
// ---------------------------------------------------------------------------

class _TimelinePoint {
  final double x;
  final double value;
  final String label;

  _TimelinePoint({
    required this.x,
    required this.value,
    required this.label,
  });
}

class _WalletTimelinePainter extends CustomPainter {
  final List<_TimelinePoint> points;

  _WalletTimelinePainter({required this.points});

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    const paddingLeft = 8.0;
    const paddingRight = 8.0;
    const paddingTop = 8.0;
    const paddingBottom = 18.0;

    final chartWidth = size.width - paddingLeft - paddingRight;
    final chartHeight = size.height - paddingTop - paddingBottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Compute min/max including zero for baseline
    double minVal = points.first.value;
    double maxVal = points.first.value;
    for (final p in points) {
      if (p.value < minVal) minVal = p.value;
      if (p.value > maxVal) maxVal = p.value;
    }

    minVal = math.min(minVal, 0);
    maxVal = math.max(maxVal, 0);

    final range = maxVal - minVal;

    double valueToY(double v) {
      if (range == 0) {
        return paddingTop + chartHeight / 2;
      }
      final t = (v - maxVal) / range; // 0 at max -> top, 1 at min -> bottom
      return paddingTop + t * chartHeight;
    }

    double indexToX(int index) {
      if (points.length == 1) {
        return paddingLeft + chartWidth / 2;
      }
      final dx = chartWidth / (points.length - 1);
      return paddingLeft + dx * index;
    }

    final zeroY = valueToY(0);

    // Paints
    final axisPaint = Paint()
      ..color = Colors.white24
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    final linePaint = Paint()
      ..color = Colors.greenAccent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final fillPaint = Paint()
      ..color = Colors.greenAccent.withOpacity(0.15)
      ..style = PaintingStyle.fill;

    final pointPaint = Paint()
      ..color = Colors.greenAccent
      ..style = PaintingStyle.fill;

    // Draw horizontal zero line
    canvas.drawLine(
      const Offset(paddingLeft, 0),
      Offset(size.width - paddingRight, 0),
      axisPaint,
    );

    final path = Path();
    for (int i = 0; i < points.length; i++) {
      final p = points[i];
      final x = indexToX(i);
      final y = valueToY(p.value);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    final fillPath = Path.from(path)
      ..lineTo(indexToX(points.length - 1), zeroY)
      ..lineTo(indexToX(0), zeroY)
      ..close();

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, linePaint);

    for (int i = 0; i < points.length; i++) {
      final x = indexToX(i);
      final y = valueToY(points[i].value);
      canvas.drawCircle(Offset(x, y), 3.0, pointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _WalletTimelinePainter oldDelegate) {
    if (points.length != oldDelegate.points.length) return true;
    for (int i = 0; i < points.length; i++) {
      if (points[i].value != oldDelegate.points[i].value) return true;
    }
    return false;
  }
}
