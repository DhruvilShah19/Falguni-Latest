// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../Providers/delivery_config.dart';

// Simple thousands-separator formatter (no intl locale dependency) -- all
// the values here are small enough (under a lakh) that Indian and Western
// grouping produce the same output, so this stays intentionally basic.
String _inr(num n) {
  final digits = n.toInt().toString();
  final buffer = StringBuffer();
  for (int i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(',');
    buffer.write(digits[i]);
  }
  return '₹$buffer';
}

// Mirrors falguni_web/app/delivery-charges/page.tsx exactly -- same zones,
// fees, thresholds, and examples. This is customer-facing copy, not a live
// calculation, so if the real pricing logic (lib/deliveryPricing.ts on the
// website, checkout.dart's getDeliveryLocationLatAndLong on the app) ever
// changes, update the numbers below on BOTH platforms to match.
class _DeliveryZone {
  final Color color;
  final String tier;
  final String range;
  final String charge;
  final String chargeNote;
  final String freeAbove;
  final List<List<String>>? weightTable; // [weight, charge] rows
  final List<List<String>> examples; // [label, result] rows

  const _DeliveryZone({
    required this.color,
    required this.tier,
    required this.range,
    required this.charge,
    required this.chargeNote,
    required this.freeAbove,
    this.weightTable,
    required this.examples,
  });
}

class DeliveryChargesPage extends StatelessWidget {
  const DeliveryChargesPage({super.key});

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  // Built from DeliveryConfig (loaded from the website's
  // /api/delivery-config, same source lib/deliveryPricing.ts serves) rather
  // than hardcoded literals -- only the presentational bits (colors, the
  // worked examples, the small weight tables) stay as static content here,
  // since those aren't pricing data. If DeliveryConfig is still on its
  // fallback values (fetch not finished yet, or failed), this shows those
  // fallback numbers instead -- same values as of the change that wired
  // this up, so it's never actually wrong, just possibly not the latest.
  static List<_DeliveryZone> get _zones {
    final tiers = DeliveryConfig.distanceTiers;
    final hyperlocal = tiers[0];
    final intercity = tiers[1];
    final interstate = tiers[2];
    final gujarat = DeliveryConfig.gujaratOutstation;
    final panIndia = DeliveryConfig.panIndia;

    return [
      _DeliveryZone(
        color: const Color(0xFF4ADE80),
        tier: 'Hyperlocal Delivery',
        range: 'Within ${hyperlocal.maxDistanceKm.toInt()} km',
        charge: _inr(hyperlocal.fee),
        chargeNote: 'flat fee',
        freeAbove: _inr(hyperlocal.freeAbove),
        examples: const [
          ['Order Value ₹300', 'Delivery ₹50'],
          ['Order Value ₹650', 'FREE Delivery'],
        ],
      ),
      _DeliveryZone(
        color: const Color(0xFF60A5FA),
        tier: 'Intercity Delivery',
        range:
            '${hyperlocal.maxDistanceKm.toInt()} – ${intercity.maxDistanceKm.toInt()} km',
        charge: _inr(intercity.fee),
        chargeNote: 'flat fee',
        freeAbove: _inr(intercity.freeAbove),
        examples: const [
          ['Order Value ₹900', 'Delivery ₹100'],
          ['Order Value ₹1,500', 'FREE Delivery'],
        ],
      ),
      _DeliveryZone(
        color: const Color(0xFFFB923C),
        tier: 'Interstate Delivery',
        range:
            '${intercity.maxDistanceKm.toInt()} – ${interstate.maxDistanceKm.toInt()} km',
        charge: _inr(interstate.fee),
        chargeNote: 'flat fee',
        freeAbove: _inr(interstate.freeAbove),
        examples: const [
          ['Order Value ₹1,400', 'Delivery ₹150'],
          ['Order Value ₹2,000', 'FREE Delivery'],
        ],
      ),
      _DeliveryZone(
        color: kGold,
        tier: 'Gujarat Outstation',
        range: 'Above ${interstate.maxDistanceKm.toInt()} km — anywhere in Gujarat',
        charge: _inr(gujarat.feePerKg),
        chargeNote: 'per kg',
        freeAbove: _inr(gujarat.freeAbove),
        weightTable: [
          ['2 kg', _inr(2 * gujarat.feePerKg)],
          ['5 kg', _inr(5 * gujarat.feePerKg)],
          ['8 kg', _inr(8 * gujarat.feePerKg)],
        ],
        examples: [
          ['Order Value ₹1,700 (4 kg)', 'Delivery ${_inr(4 * gujarat.feePerKg)}'],
          const ['Order Value ₹2,300 (4 kg)', 'FREE Delivery'],
        ],
      ),
      _DeliveryZone(
        color: const Color(0xFFF87171),
        tier: 'PAN India Delivery',
        range: 'Above ${interstate.maxDistanceKm.toInt()} km — outside Gujarat',
        charge: _inr(panIndia.feePerKg),
        chargeNote: 'per kg',
        freeAbove: _inr(panIndia.freeAbove),
        weightTable: [
          ['1 kg', _inr(1 * panIndia.feePerKg)],
          ['3 kg', _inr(3 * panIndia.feePerKg)],
          ['5 kg', _inr(5 * panIndia.feePerKg)],
        ],
        examples: [
          ['Order Value ₹2,800 (3 kg)', 'Delivery ${_inr(3 * panIndia.feePerKg)}'],
          const ['Order Value ₹3,800 (3 kg)', 'FREE Delivery'],
        ],
      ),
    ];
  }

  static const List<String> _notes = [
    'Distance is calculated from the Falguni Gruh Udhyog store to the delivery address.',
    'Weight-based shipping is calculated on the final packed weight.',
    'Free delivery is automatically applied when your order meets the eligible value.',
    'Orders above the free-delivery threshold are delivered free irrespective of weight.',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        title: Text(
          "Delivery Charges",
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            letterSpacing: .5,
          ),
        ).tr(),
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [kBgTop, kBgMid, kBgTop],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          _buildContent(),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 110, 18, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "A simple breakdown",
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: .3,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            "How delivery fees are worked out, wherever you're ordering from.",
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 28),
          for (final zone in _zones) ...[
            _ZoneCard(zone: zone),
            const SizedBox(height: 18),
          ],
          _ComparisonTable(zones: _zones),
          const SizedBox(height: 18),
          _NotesCard(notes: _notes),
          const SizedBox(height: 50),
        ],
      ),
    );
  }
}

class _ZoneCard extends StatelessWidget {
  final _DeliveryZone zone;
  const _ZoneCard({required this.zone});

  static const Color kGold = DeliveryChargesPage.kGold;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 10,
                height: 10,
                margin: const EdgeInsets.only(top: 5, right: 10),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: zone.color,
                  boxShadow: [
                    BoxShadow(
                      color: zone.color.withOpacity(0.5),
                      blurRadius: 8,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      zone.tier,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined,
                            size: 13, color: kGold.withOpacity(0.7)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            zone.range,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _StatPill(
                value: zone.charge,
                label: zone.chargeNote,
                valueColor: kGold,
              ),
              const SizedBox(width: 10),
              _StatPill(
                value: 'Above ${zone.freeAbove}',
                label: 'Free delivery',
                valueColor: Colors.greenAccent,
              ),
            ],
          ),
          if (zone.weightTable != null) ...[
            const SizedBox(height: 14),
            _MiniTable(rows: zone.weightTable!),
          ],
          const SizedBox(height: 14),
          Container(height: 1, color: Colors.white.withOpacity(0.08)),
          const SizedBox(height: 12),
          Column(
            children: [
              for (final ex in zone.examples)
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          ex[0],
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12.5,
                          ),
                        ),
                      ),
                      Text(
                        ex[1],
                        style: TextStyle(
                          color: ex[1] == 'FREE Delivery'
                              ? Colors.greenAccent
                              : kGold,
                          fontWeight: FontWeight.w700,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String value;
  final String label;
  final Color valueColor;
  const _StatPill(
      {required this.value, required this.label, required this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                color: valueColor,
                fontWeight: FontWeight.w900,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                color: Colors.white.withOpacity(0.4),
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniTable extends StatelessWidget {
  final List<List<String>> rows;
  const _MiniTable({required this.rows});

  @override
  Widget build(BuildContext context) {
    return Table(
      columnWidths: const {0: FlexColumnWidth(1), 1: FlexColumnWidth(1)},
      children: [
        TableRow(children: [
          _cell('ORDER WEIGHT', isHeader: true),
          _cell('DELIVERY CHARGE', isHeader: true),
        ]),
        for (final row in rows)
          TableRow(children: [
            _cell(row[0]),
            _cell(row[1]),
          ]),
      ],
    );
  }

  Widget _cell(String text, {bool isHeader = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Text(
        text,
        style: TextStyle(
          color: isHeader ? Colors.white.withOpacity(0.4) : Colors.white70,
          fontSize: isHeader ? 9 : 12.5,
          fontWeight: isHeader ? FontWeight.w700 : FontWeight.w500,
          letterSpacing: isHeader ? 0.5 : 0,
        ),
      ),
    );
  }
}

class _ComparisonTable extends StatelessWidget {
  final List<_DeliveryZone> zones;
  const _ComparisonTable({required this.zones});

  static const Color kGold = DeliveryChargesPage.kGold;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_shipping_outlined, color: kGold, size: 20),
              const SizedBox(width: 8),
              const Text(
                'How We Calculate Delivery',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          for (final zone in zones)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(top: 4, right: 8),
                    decoration:
                        BoxDecoration(shape: BoxShape.circle, color: zone.color),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      zone.tier.replaceAll(' Delivery', ''),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12.5,
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 4,
                    child: Text(
                      '${zone.range}\n${zone.charge} ${zone.chargeNote} · Free above ${zone.freeAbove}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 11.5,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _NotesCard extends StatelessWidget {
  final List<String> notes;
  const _NotesCard({required this.notes});

  static const Color kGold = DeliveryChargesPage.kGold;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: kGold, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Notes',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          for (final note in notes)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.check_circle_outline,
                      size: 14, color: kGold.withOpacity(0.7)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      note,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12.5,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
