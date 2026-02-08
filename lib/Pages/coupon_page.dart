// ignore_for_file: deprecated_member_use, unused_import, prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'dart:ui';
import 'dart:math';
import 'package:clipboard/clipboard.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:confetti/confetti.dart';
import 'package:falguni_app/Model/coupon.dart';
import 'package:fluttertoast/fluttertoast.dart';

class CouponPage extends StatefulWidget {
  const CouponPage({super.key});

  @override
  State<CouponPage> createState() => _CouponPageState();
}

class _CouponPageState extends State<CouponPage> {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  late ConfettiController _confetti;

  @override
  void initState() {
    super.initState();
    _confetti = ConfettiController(duration: const Duration(milliseconds: 800));
  }

  @override
  void dispose() {
    _confetti.dispose();
    super.dispose();
  }

  Stream<List<CouponModel>> getCoupons() {
    return FirebaseFirestore.instance.collection('Coupons').snapshots().map(
        (s) => s.docs.map((d) => CouponModel.fromMap(d.data(), d.id)).toList());
  }

  // NEW premium card
  Widget premiumCouponCard(CouponModel coupon) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0.92, end: 1),
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
      builder: (_, double scale, child) => Transform.scale(
        scale: scale,
        child: child,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 3.2, sigmaY: 3.2),
          child: Container(
            height: 220,
            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: kGold.withOpacity(0.3),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.18),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Title
                Text(
                  coupon.title ?? "Special Offer",
                  style: const TextStyle(
                    fontSize: 20,
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),

                // % OFF
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      "${coupon.percentage}",
                      style: const TextStyle(
                        fontSize: 70,
                        fontWeight: FontWeight.bold,
                        height: 0.9,
                        color: Colors.white,
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Text(
                        "% OFF",
                        style: TextStyle(
                          fontSize: 22,
                          color: kGold,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Copy button
                SizedBox(
                  width: 180,
                  child: ElevatedButton(
                    onPressed: () {
                      FlutterClipboard.copy(coupon.coupon).then((_) {
                        HapticFeedback.mediumImpact();
                        _confetti.play();

                        Fluttertoast.showToast(
                            msg: "Coupon Copied",
                            gravity: ToastGravity.TOP,
                            toastLength: Toast.LENGTH_SHORT);
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(40),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text(
                      "Copy Code",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget emptyState() => Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.local_offer_rounded,
              size: 110, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 10),
          Text(
            "No Coupons Yet",
            style: TextStyle(
                fontSize: 18,
                color: Colors.white38,
                fontWeight: FontWeight.w500),
          )
        ],
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        title: const Text(
          "Coupons",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
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
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confetti,
              blastDirection: pi / 2,
              emissionFrequency: 0.05,
              numberOfParticles: 10,
              maxBlastForce: 10,
              minBlastForce: 4,
              colors: [
                kGold,
                kBgMid,
                Colors.white,
                kPrimary,
              ],
            ),
          ),
          StreamBuilder<List<CouponModel>>(
            stream: getCoupons(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return const Center(
                  child: SpinKitRing(color: kGold, size: 36),
                );
              }

              final coupons = snapshot.data!;
              if (coupons.isEmpty) return emptyState();

              return ListView.builder(
                padding: const EdgeInsets.only(top: 110, left: 16, right: 16),
                itemCount: coupons.length,
                physics: const BouncingScrollPhysics(),
                itemBuilder: (_, i) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: premiumCouponCard(coupons[i]),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
