// ignore_for_file: deprecated_member_use, use_super_parameters

import 'package:flutter/material.dart';
import 'package:falguni_app/Pages/bottom_nav.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:falguni_app/Model/formatter.dart';

class OrderSuccessPage extends StatelessWidget {
  final dynamic cashFreeDetails;
  final String orderId;

  const OrderSuccessPage({
    Key? key,
    required this.cashFreeDetails,
    required this.orderId,
  }) : super(key: key);

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kDarkBg = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kDarkBg,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Order Placed!'.tr(),
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kDarkBg, kBgMid, kDarkBg],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 20),
                const Icon(
                  Icons.check_circle,
                  color: Colors.greenAccent,
                  size: 100,
                ),
                const SizedBox(height: 24),
                Text(
                  'Thank You!'.tr(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Your order #$orderId has been placed successfully.'.tr(),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 40),
                if (cashFreeDetails != null) ...[
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Transaction Details'.tr(),
                      style: const TextStyle(
                        color: kGold,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white24, width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildDetailRow(
                            'Payment ID'.tr(),
                            _extractString(cashFreeDetails, 'cf_order_id',
                                    'cf_payment_id') ??
                                'N/A'),
                        const SizedBox(height: 8),
                        _buildDetailRow(
                            'Order Ref'.tr(),
                            _extractString(cashFreeDetails, 'order_id',
                                    'referenceId') ??
                                'N/A'),
                        const SizedBox(height: 8),
                        _buildDetailRow('Amount'.tr(),
                            '${_extractString(cashFreeDetails, 'order_currency', 'currency') ?? 'INR'} ${_formatAmount(_extractString(cashFreeDetails, 'order_amount', 'amount'))}'),
                        const SizedBox(height: 8),
                        _buildDetailRow(
                            'Time'.tr(), _formatTimestamp(cashFreeDetails)),
                        const SizedBox(height: 8),
                        _buildDetailRow(
                            'Status'.tr(),
                            _extractString(cashFreeDetails, 'order_status',
                                        'txStatus')
                                    ?.toUpperCase() ??
                                'PAID'),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(
                            builder: (context) => const BottomNavPage()),
                        (Route<dynamic> route) => false,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      'Back to Home'.tr(),
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
        ),
        const Text(
          ': ',
          style: TextStyle(color: Colors.white70, fontSize: 14),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  // --- Helper Methods for Cashfree V3 Payload Variations ---

  String? _extractString(dynamic payload, String key1, String key2) {
    if (payload == null) return null;
    if (payload is Map) {
      if (payload.containsKey(key1) && payload[key1] != null) {
        return payload[key1].toString();
      }
      if (payload.containsKey(key2) && payload[key2] != null) {
        return payload[key2].toString();
      }
      // Try looking inside common nested wrappers
      if (payload.containsKey('order_meta') && payload['order_meta'] is Map) {
        Map meta = payload['order_meta'];
        if (meta.containsKey(key1) && meta[key1] != null) {
          return meta[key1].toString();
        }
      }
      if (payload.containsKey('payment') && payload['payment'] is Map) {
        Map payment = payload['payment'];
        if (payment.containsKey(key1) && payment[key1] != null) {
          return payment[key1].toString();
        }
      }
    }
    return null;
  }

  String _formatAmount(String? rawAmount) {
    if (rawAmount == null || rawAmount.isEmpty) return '0.00';
    try {
      double amount = double.parse(rawAmount);
      return Formatter().converter(amount);
    } catch (e) {
      return rawAmount;
    }
  }

  String _formatTimestamp(dynamic payload) {
    String? rawTime = _extractString(payload, 'created_at', 'txTime');
    if (rawTime != null && rawTime.isNotEmpty) {
      try {
        DateTime dateTime = DateTime.parse(rawTime);
        return DateFormat('dd MMM yyyy, hh:mm a').format(dateTime.toLocal());
      } catch (e) {
        return rawTime;
      }
    }
    return DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.now());
  }
}
