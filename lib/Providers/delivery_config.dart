import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

// Distance-based tier (Hyperlocal / Intercity / Interstate) -- a flat fee,
// waived above a subtotal threshold.
class DistanceTierRule {
  final String tier;
  final double maxDistanceKm;
  final num fee;
  final num freeAbove;

  const DistanceTierRule({
    required this.tier,
    required this.maxDistanceKm,
    required this.fee,
    required this.freeAbove,
  });

  factory DistanceTierRule.fromJson(Map<String, dynamic> json) {
    return DistanceTierRule(
      tier: json['tier'] as String,
      maxDistanceKm: (json['maxDistanceKm'] as num).toDouble(),
      fee: json['fee'] as num,
      freeAbove: json['freeAbove'] as num,
    );
  }
}

// Beyond-15km tier (Gujarat Outstation / PAN India) -- priced per kg
// instead of a flat fee, waived above a (higher) subtotal threshold.
class OutstationTierRule {
  final String tier;
  final num feePerKg;
  final num freeAbove;

  const OutstationTierRule({
    required this.tier,
    required this.feePerKg,
    required this.freeAbove,
  });

  factory OutstationTierRule.fromJson(Map<String, dynamic> json) {
    return OutstationTierRule(
      tier: json['tier'] as String,
      feePerKg: json['feePerKg'] as num,
      freeAbove: json['freeAbove'] as num,
    );
  }
}

class DeliveryFeeResult {
  final String tier;
  final num fee;
  const DeliveryFeeResult(this.tier, this.fee);
}

// Fetches the delivery pricing tiers from the same source the website
// itself is built from (lib/deliveryPricing.ts on falguni_web, served via
// /api/delivery-config), so both platforms show the same estimate without
// hand-typing the same numbers in Dart and TypeScript separately. A
// pricing change on the website now reaches app users on their next app
// launch instead of waiting on an app store release.
//
// The hardcoded values below are only a FALLBACK for when the fetch fails
// (e.g. no network at launch) -- they mirror lib/deliveryPricing.ts as of
// the same change that added this file. If they ever drift from the
// website, the fetched values (used whenever the network is up) are what
// customers actually see; the fallback only matters offline.
//
// Either way, this only affects the DISPLAY estimate shown before payment.
// The actual charge is always recalculated independently, server-side, in
// /api/cashfree/create-order -- this class has no bearing on what a
// customer is actually billed.
class DeliveryConfig {
  static const String _configUrl =
      'https://falguni-latest.vercel.app/api/delivery-config';

  static double roadDistanceFactor = 1.3;
  static String hyperlocalDeliveryHours = '11 AM – 8 PM';

  static List<DistanceTierRule> distanceTiers = const [
    DistanceTierRule(
        tier: 'Hyperlocal', maxDistanceKm: 5, fee: 50, freeAbove: 400),
    DistanceTierRule(
        tier: 'Intercity', maxDistanceKm: 10, fee: 100, freeAbove: 1200),
    DistanceTierRule(
        tier: 'Interstate', maxDistanceKm: 15, fee: 150, freeAbove: 1800),
  ];

  static OutstationTierRule gujaratOutstation = const OutstationTierRule(
      tier: 'Gujarat Outstation', feePerKg: 40, freeAbove: 2000);

  static OutstationTierRule panIndia = const OutstationTierRule(
      tier: 'PAN India', feePerKg: 100, freeAbove: 3500);

  static Future<void> init() async {
    try {
      final response = await http
          .get(Uri.parse(_configUrl))
          .timeout(const Duration(seconds: 6));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;

        // Parse everything into locals first, and only assign to the
        // static fields once every piece has parsed successfully. Assigning
        // field-by-field meant a parse failure partway through (e.g. a
        // malformed distanceTiers entry) could leave roadDistanceFactor
        // already updated to the new value while distanceTiers stayed on
        // the old/fallback data -- a mixed, inconsistent state that's worse
        // than either fully-fetched or fully-fallback.
        final newRoadDistanceFactor =
            (data['roadDistanceFactor'] as num).toDouble();
        final newHyperlocalDeliveryHours =
            data['hyperlocalDeliveryHours'] as String? ??
                hyperlocalDeliveryHours;
        final tiersJson = data['distanceTiers'] as List;
        final newDistanceTiers = tiersJson
            .map((e) => DistanceTierRule.fromJson(e as Map<String, dynamic>))
            .toList();
        final outstationJson =
            data['outstationTiers'] as Map<String, dynamic>;
        final newGujaratOutstation = OutstationTierRule.fromJson(
            outstationJson['gujarat'] as Map<String, dynamic>);
        final newPanIndia = OutstationTierRule.fromJson(
            outstationJson['panIndia'] as Map<String, dynamic>);

        roadDistanceFactor = newRoadDistanceFactor;
        hyperlocalDeliveryHours = newHyperlocalDeliveryHours;
        distanceTiers = newDistanceTiers;
        gujaratOutstation = newGujaratOutstation;
        panIndia = newPanIndia;

        debugPrint('DeliveryConfig: loaded live pricing config from server.');
      } else {
        debugPrint(
            'DeliveryConfig: fetch returned ${response.statusCode}, using fallback values.');
      }
    } catch (e) {
      debugPrint(
          'DeliveryConfig: failed to fetch $_configUrl, using fallback values: $e');
    }
  }

  // Same tier + fee logic as calculateDeliveryFee() in deliveryPricing.ts,
  // just walking whichever tier list is currently loaded (fetched or
  // fallback) instead of a hardcoded if/else chain.
  static DeliveryFeeResult calculateFee(
      double distanceKm, String address, num subTotal, double weightKg) {
    for (final rule in distanceTiers) {
      if (distanceKm <= rule.maxDistanceKm) {
        return DeliveryFeeResult(
            rule.tier, subTotal >= rule.freeAbove ? 0 : rule.fee);
      }
    }

    final isGujarat = address.toLowerCase().contains('gujarat');
    final rule = isGujarat ? gujaratOutstation : panIndia;
    return DeliveryFeeResult(
      rule.tier,
      subTotal >= rule.freeAbove ? 0 : weightKg.ceil() * rule.feePerKg,
    );
  }
}
