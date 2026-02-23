// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

import '../Widgets/OrdersTab/all_orders.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  // ── FILTERS ──
  String _selectedStatus = 'Placed';
  String _selectedDate = 'Last 3 months';

  static const List<String> _statusOptions = [
    'Placed',
    'Received',
    'Processing',
    'Completed',
    'Cancelled',
  ];

  static final List<String> _dateOptions = [
    'Last 30 days',
    'Last 3 months',
    'Last 6 months',
    ...List.generate(
      DateTime.now().year - 2022,
      (i) => '${DateTime.now().year - i}',
    ),
    'All time',
  ];

  DateTime? get _filterCutoff {
    final now = DateTime.now();
    switch (_selectedDate) {
      case 'Last 30 days':
        return now.subtract(const Duration(days: 30));
      case 'Last 3 months':
        return DateTime(now.year, now.month - 3, now.day);
      case 'Last 6 months':
        return DateTime(now.year, now.month - 6, now.day);
      case 'All time':
        return null;
      default:
        int? year = int.tryParse(_selectedDate);
        if (year != null) return DateTime(year, 1, 1);
        return null;
    }
  }

  DateTime? get _filterEnd {
    int? year = int.tryParse(_selectedDate);
    if (year != null) return DateTime(year + 1, 1, 1);
    return null;
  }

  bool get _hasActiveFilters =>
      _selectedStatus != 'Placed' || _selectedDate != 'Last 3 months';

  // ── BOTTOM SHEET ──
  void _showFilterSheet() {
    // Local copies for the sheet so user can preview before applying
    String tempStatus = _selectedStatus;
    String tempDate = _selectedDate;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          decoration: BoxDecoration(
            color: kBgTop,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: kGold.withOpacity(0.3)),
          ),
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).padding.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Handle + Title ──
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: kGold.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                child: Row(
                  children: [
                    Icon(Icons.tune_rounded, color: kGold, size: 22),
                    const SizedBox(width: 10),
                    const Text(
                      'Filter Orders',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const Spacer(),
                    if (tempStatus != 'Placed' || tempDate != 'Last 3 months')
                      GestureDetector(
                        onTap: () {
                          setSheetState(() {
                            tempStatus = 'Placed';
                            tempDate = 'Last 3 months';
                          });
                        },
                        child: Text(
                          'Reset',
                          style: TextStyle(
                            color: kGold.withOpacity(0.7),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ── ORDER STATUS ──
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'ORDER STATUS',
                  style: TextStyle(
                    color: kGold.withOpacity(0.6),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _statusOptions.map((s) {
                    final sel = s == tempStatus;
                    return GestureDetector(
                      onTap: () => setSheetState(() => tempStatus = s),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 9),
                        decoration: BoxDecoration(
                          gradient: sel
                              ? const LinearGradient(colors: [
                                  Color(0xFFD4AF37),
                                  Color(0xFFE8C252)
                                ])
                              : null,
                          color: sel ? null : Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: sel ? kGold : Colors.white.withOpacity(0.12),
                          ),
                        ),
                        child: Text(
                          s.tr(),
                          style: TextStyle(
                            color: sel ? Colors.black : Colors.white70,
                            fontSize: 13.5,
                            fontWeight: sel ? FontWeight.w700 : FontWeight.w500,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 22),

              // ── TIME PERIOD ──
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'TIME PERIOD',
                  style: TextStyle(
                    color: kGold.withOpacity(0.6),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _dateOptions.map((d) {
                    final sel = d == tempDate;
                    return GestureDetector(
                      onTap: () => setSheetState(() => tempDate = d),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 9),
                        decoration: BoxDecoration(
                          gradient: sel
                              ? const LinearGradient(colors: [
                                  Color(0xFFD4AF37),
                                  Color(0xFFE8C252)
                                ])
                              : null,
                          color: sel ? null : Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: sel ? kGold : Colors.white.withOpacity(0.12),
                          ),
                        ),
                        child: Text(
                          d,
                          style: TextStyle(
                            color: sel ? Colors.black : Colors.white70,
                            fontSize: 13.5,
                            fontWeight: sel ? FontWeight.w700 : FontWeight.w500,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 24),

              // ── APPLY BUTTON ──
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _selectedStatus = tempStatus;
                        _selectedDate = tempDate;
                      });
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Apply Filters',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgTop,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: kBgTop,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          "ORDERS".tr(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
        actions: const [],
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Column(
          children: [
            // ── Filter Toolbar ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withOpacity(0.05),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  // 1. Filter Button (Left Aligned)
                  GestureDetector(
                    onTap: _showFilterSheet,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: _hasActiveFilters
                            ? kGold.withOpacity(0.15)
                            : Colors.white.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _hasActiveFilters
                              ? kGold.withOpacity(0.6)
                              : Colors.white.withOpacity(0.15),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.tune_rounded,
                              color: _hasActiveFilters ? kGold : Colors.white70,
                              size: 16),
                          const SizedBox(width: 6),
                          Text(
                            _hasActiveFilters ? 'Filtered' : 'Filters',
                            style: TextStyle(
                              color: _hasActiveFilters ? kGold : Colors.white70,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.3,
                            ),
                          ),
                          if (_hasActiveFilters) ...[
                            const SizedBox(width: 6),
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: kGold,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  // 2. Space
                  const SizedBox(width: 12),

                  // 3. Active Filters (Scrollable Row)
                  if (_hasActiveFilters)
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        child: Row(
                          children: [
                            if (_selectedStatus != 'Placed')
                              _filterBadge(_selectedStatus.tr(), () {
                                setState(() => _selectedStatus = 'Placed');
                              }),
                            if (_selectedDate != 'Last 3 months') ...[
                              if (_selectedStatus != 'Placed')
                                const SizedBox(width: 8),
                              _filterBadge(_selectedDate, () {
                                setState(() => _selectedDate = 'Last 3 months');
                              }),
                            ],
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // ── Orders list ──
            Expanded(
              child: AllOrders(
                filterStart: _filterCutoff,
                filterEnd: _filterEnd,
                filterStatus:
                    _selectedStatus == 'Placed' ? 'All' : _selectedStatus,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _filterBadge(String label, VoidCallback onRemove) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF3B2820), // standard sleek dark brown
        borderRadius: BorderRadius.circular(20), // pill shape
        border: Border.all(color: kGold.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: kGold,
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onRemove,
            child: Icon(Icons.close_rounded,
                size: 14, color: kGold.withOpacity(0.6)),
          ),
        ],
      ),
    );
  }
}
