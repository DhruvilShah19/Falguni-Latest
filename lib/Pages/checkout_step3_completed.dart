import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:animated_check/animated_check.dart';

class CheckoutStep3Completed extends StatelessWidget {
  // Design constants
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  final Animation<double>? animation;

  const CheckoutStep3Completed({
    super.key,
    required this.animation,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kBgTop, kBgMid, kBgTop],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              AnimatedCheck(
                color: kGold,
                progress: animation!,
                size: 180,
              ),
              const SizedBox(height: 24),
              Text(
                "Order Placed Successfully!".tr(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                "Thank you for your purchase. Your order is being processed.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 14,
                ),
              ).tr(),
              const SizedBox(height: 60),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kGold,
                    foregroundColor: kBgTop,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                  ),
                  onPressed: () {
                    Navigator.pushNamed(context, '/orders');
                  },
                  child: const Text(
                    'View in orders page',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ).tr(),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: kGold.withOpacity(0.5)),
                    foregroundColor: kGold,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pushNamed(context, '/bottomNav');
                  },
                  child: const Text(
                    'Go back home',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ).tr(),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
