import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:animated_check/animated_check.dart';

class CheckoutStep3Completed extends StatelessWidget {
  final Animation<double>? animation;

  const CheckoutStep3Completed({
    super.key,
    required this.animation,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          AnimatedCheck(
            color: Colors.green,
            progress: animation!,
            size: 200,
          ),
          ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/orders');
              },
              child: const Text('View in orders page').tr()),
          ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 47, 37, 37)),
              onPressed: () {
                Navigator.pushNamed(context, '/bottomNav');
              },
              child: const Text('Go back home').tr())
        ],
      ),
    );
  }
}
