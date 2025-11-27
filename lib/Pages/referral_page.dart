// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:confetti/confetti.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:clipboard/clipboard.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class ReferralPage extends StatefulWidget {
  const ReferralPage({super.key});

  @override
  State<ReferralPage> createState() => _ReferralPageState();
}

class _ReferralPageState extends State<ReferralPage>
    with SingleTickerProviderStateMixin {
  static const Color kPrimary = Color(0xFF2F2525); // Deep espresso
  static const Color kGold = Color(0xFFC9A86A); // Soft luxury gold
  static const Color kBg = Color(0xFFF7F6F4); // Soft off-white

  DocumentReference? userRef;
  String referralCode = '';
  bool referralStatus = false;
  num? reward;
  String currencySymbol = '';

  late ConfettiController _confetti;
  late AnimationController _bgController;
  late List<_Particle> _particles;
  final int _particleCount = 26;

  @override
  void initState() {
    super.initState();

    // Confetti for copy/share success
    _confetti = ConfettiController(duration: const Duration(milliseconds: 900));

    // Background particles
    _bgController =
        AnimationController(vsync: this, duration: Duration(seconds: 18))
          ..repeat();
    _initParticles();
    _bgController.addListener(_updateParticles);

    _getUserDoc();
    _getUserDetails();
    _listenReferralSettings();
    _loadCurrencySettings();
  }

  // ----------------------------------------------------
  // PARTICLES INITIALIZATION + MOVEMENT
  // ----------------------------------------------------
  void _initParticles() {
    final rand = Random();
    _particles = List.generate(_particleCount, (index) {
      return _Particle(
        x: rand.nextDouble(),
        y: rand.nextDouble(),
        vx: (rand.nextDouble() - 0.5) * 0.002,
        vy: (rand.nextDouble() - 0.5) * 0.002,
        radius: 3 + rand.nextDouble() * 3,
        color: index.isEven
            ? kPrimary.withOpacity(0.12)
            : Colors.grey.withOpacity(0.18),
      );
    });
  }

  void _updateParticles() {
    setState(() {
      for (final p in _particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > 1) p.vx = -p.vx;
        if (p.y < 0 || p.y > 1) p.vy = -p.vy;

        p.x = p.x.clamp(0.0, 1.0);
        p.y = p.y.clamp(0.0, 1.0);
      }
    });
  }

  @override
  void dispose() {
    _confetti.dispose();
    _bgController.dispose();
    super.dispose();
  }

  // ----------------------------------------------------
  // FIRESTORE DATA
  // ----------------------------------------------------
  Future<void> _getUserDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    }
  }

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final doc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();

      if (doc.exists) {
        setState(() {
          referralCode = doc['personalReferralCode'] ?? "";
        });
      }
    }
  }

  void _listenReferralSettings() {
    FirebaseFirestore.instance
        .collection('Referral System')
        .doc('Referral System')
        .snapshots()
        .listen((value) {
      setState(() {
        referralStatus = value['Status'] ?? false;
        reward = value['Referral Amount'] ?? 0;
      });
    });
  }

  void _loadCurrencySettings() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((v) {
      currencySymbol = v['Currency symbol'] ?? '';
    });
  }

  // ----------------------------------------------------
  // SHARE FUNCTIONS
  // ----------------------------------------------------
  String _shareMessage() =>
      "Use my referral code $referralCode & we both earn $currencySymbol$reward. 🚀";

  void _copyCode() {
    FlutterClipboard.copy(referralCode);
    _confetti.play();

    Fluttertoast.showToast(
      msg: "Referral Code Copied".tr(),
      gravity: ToastGravity.TOP,
    );
  }

  Future<void> _shareOnWhatsApp() async {
    final text = _shareMessage();
    final uri = Uri.parse("whatsapp://send?text=${Uri.encodeComponent(text)}");

    if (!await launchUrl(uri)) Share.share(text);
    _confetti.play();
  }

  Future<void> _shareOnSMS() async {
    final uri = Uri(
      scheme: 'sms',
      queryParameters: {'body': _shareMessage()},
    );

    if (!await launchUrl(uri)) Share.share(_shareMessage());
    _confetti.play();
  }

  Future<void> _shareInstagram() async {
    Share.share(_shareMessage());
    _confetti.play();
  }

  void _shareMore() {
    Share.share(_shareMessage());
    _confetti.play();
  }

  void _openShareOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (_) => _buildShareSheet(),
    );
  }

  // ----------------------------------------------------
  // BUILD UI
  // ----------------------------------------------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text(
          "Referral",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            letterSpacing: .3,
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // MATTE PREMIUM BACKGROUND
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
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
            ),
          ),

          // PARTICLES
          Positioned.fill(
            child: CustomPaint(painter: _ParticlesPainter(_particles)),
          ),

          // CONFETTI
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confetti,
              blastDirection: pi / 2,
              numberOfParticles: 14,
              emissionFrequency: 0.04,
              gravity: 0.25,
              colors: [kGold, Colors.white, kPrimary],
              maxBlastForce: 13,
              minBlastForce: 6,
            ),
          ),

          // MAIN CONTENT
          _buildPageContent(),
        ],
      ),
      bottomNavigationBar: _buildBottomShareButton(),
    );
  }

  // ----------------------------------------------------
  // PREMIUM CONTENT
  // ----------------------------------------------------
  Widget _buildPageContent() {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(22, 110, 22, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // GOLDEN ICON WRAPPER
          Container(
            padding: EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: kGold.withOpacity(0.15),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.12),
                width: 1.5,
              ),
            ),
            child: Icon(Icons.card_giftcard,
                size: 48, color: Colors.white.withOpacity(0.9)),
          ),

          SizedBox(height: 28),

          Text(
            "Invite Friends & Earn Rewards",
            style: TextStyle(
              fontSize: 23,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              letterSpacing: .4,
            ),
            textAlign: TextAlign.center,
          ),

          SizedBox(height: 12),

          Text(
            "Earn $currencySymbol$reward when friends join using your code.",
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.75),
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),

          SizedBox(height: 40),

          _premiumReferralCard(),

          SizedBox(height: 40),

          _buildSteps(),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // PREMIUM REFERRAL CARD
  // ----------------------------------------------------
  Widget _premiumReferralCard() {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: .95, end: 1),
      duration: Duration(milliseconds: 280),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 22, vertical: 24),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.10),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: kGold.withOpacity(0.20),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.18),
              blurRadius: 18,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              "Your Referral Code",
              style: TextStyle(
                color: Colors.white.withOpacity(0.85),
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 14),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Colors.white.withOpacity(0.09),
                border: Border.all(color: kGold.withOpacity(0.25)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      referralCode,
                      style: TextStyle(
                        fontSize: 22,
                        letterSpacing: 1.2,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: _copyCode,
                    child: Icon(Icons.copy,
                        size: 22, color: Colors.white.withOpacity(0.9)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      builder: (_, double scale, child) =>
          Transform.scale(scale: scale, child: child),
    );
  }

  // ----------------------------------------------------
  // STEPS SECTION
  // ----------------------------------------------------
  Widget _buildSteps() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "How It Works",
          style: TextStyle(
            color: Colors.white.withOpacity(0.94),
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: .3,
          ),
        ),
        SizedBox(height: 22),
        _step(Icons.person_add_alt_1,
            "Share the code with your friends via WhatsApp, SMS, or Instagram."),
        _step(Icons.check_circle,
            "Friends join the app using your unique referral code."),
        _step(Icons.currency_rupee,
            "You earn $currencySymbol$reward instantly when they join."),
      ],
    );
  }

  Widget _step(IconData icon, String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: Colors.white.withOpacity(0.12),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          SizedBox(width: 14),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: Colors.white.withOpacity(0.75),
                fontSize: 14.5,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // SHARE BUTTON (BOTTOM)
  // ----------------------------------------------------
  Widget _buildBottomShareButton() {
    return Container(
      padding: EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Color(0xFF1C1515),
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.30),
            blurRadius: 20,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SizedBox(
        height: 52,
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _openShareOptions,
          style: ElevatedButton.styleFrom(
            backgroundColor: kGold,
            foregroundColor: Colors.black87,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child: Text(
            "Share Referral Code",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ),
      ),
    );
  }

  // ----------------------------------------------------
  // SHARE SHEET (BOTTOM MODAL)
  // ----------------------------------------------------
  Widget _buildShareSheet() {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 20, horizontal: 22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 42,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.grey.shade400,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            SizedBox(height: 18),
            Text(
              "Share your referral code",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: kPrimary,
              ),
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _shareOption(Icons.message, "WhatsApp", Color(0xFF25D366),
                    _shareOnWhatsApp),
                _shareOption(Icons.sms, "SMS", Colors.blueGrey, _shareOnSMS),
                _shareOption(Icons.camera_alt_outlined, "Instagram",
                    Colors.purple, _shareInstagram),
                _shareOption(
                    Icons.more_horiz, "More", Colors.grey.shade600, _shareMore),
              ],
            ),
            SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  // Share Grid Option
  Widget _shareOption(
      IconData icon, String label, Color color, VoidCallback action) {
    return Column(
      children: [
        InkWell(
          onTap: action,
          child: Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.10),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
        ),
        SizedBox(height: 6),
        Text(label,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade800)),
      ],
    );
  }
}

// ---------------------------------------------------------------------
// PARTICLE MODEL & PAINTER (Same as your version, untouched logic)
// ---------------------------------------------------------------------
class _Particle {
  double x, y, vx, vy, radius;
  Color color;

  _Particle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.radius,
    required this.color,
  });
}

class _ParticlesPainter extends CustomPainter {
  final List<_Particle> particles;

  _ParticlesPainter(this.particles);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    for (final p in particles) {
      paint.color = p.color;
      canvas.drawCircle(
          Offset(p.x * size.width, p.y * size.height), p.radius, paint);
    }
  }

  @override
  bool shouldRepaint(_) => true;
}
