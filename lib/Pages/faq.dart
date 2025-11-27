// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class FaqPage extends StatefulWidget {
  const FaqPage({super.key});

  @override
  State<FaqPage> createState() => _FaqPageState();
}

class _FaqPageState extends State<FaqPage> with SingleTickerProviderStateMixin {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);

  late AnimationController _bgController;
  late List<_Particle> _particles;

  final int _particleCount = 30;

  @override
  void initState() {
    super.initState();

    _bgController =
        AnimationController(vsync: this, duration: Duration(seconds: 22))
          ..repeat();

    _initParticles();

    _bgController.addListener(() {
      setState(() {
        for (final p in _particles) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
        }
      });
    });
  }

  void _initParticles() {
    final rand = Random();
    _particles = List.generate(_particleCount, (i) {
      return _Particle(
        x: rand.nextDouble(),
        y: rand.nextDouble(),
        vx: (rand.nextDouble() - 0.5) * 0.002,
        vy: (rand.nextDouble() - 0.5) * 0.002,
        radius: 3 + rand.nextDouble() * 3,
        color: i.isEven
            ? kPrimary.withOpacity(0.15)
            : Colors.white.withOpacity(0.18),
      );
    });
  }

  @override
  void dispose() {
    _bgController.dispose();
    super.dispose();
  }

  // -----------------------------------------------------
  // Build UI
  // -----------------------------------------------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: kPrimary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
        centerTitle: true,
        title: Text(
          "FAQ",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            letterSpacing: .5,
          ),
        ).tr(),
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: _ParticlesPainter(_particles)),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF1B1414),
                    Color(0xFF2A2121),
                    Color(0xFF1A1515),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),
          _buildContent(),
        ],
      ),
    );
  }

  // -----------------------------------------------------
  // Main Content
  // -----------------------------------------------------
  Widget _buildContent() {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(18, 110, 18, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Frequently Asked Questions",
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: .3,
            ),
          ),
          SizedBox(height: 14),
          Text(
            "Find quick answers to common doubts and queries.",
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 15,
            ),
          ),

          SizedBox(height: 28),

          // FAQ ITEMS
          _faq(
            "Should I create an account to shop here?",
            "Yes. Creating an account enhances your shopping experience, provides order tracking, faster checkout, and exclusive offers.",
          ),
          _faq(
            "What online payment options are available?",
            "Debit/Credit Cards, Net Banking, and other common payment modes depending on your region.",
          ),
          _faq(
            "What is the shelf life of your products?",
            "Shelf life varies by product and is mentioned on the packaging. You may inquire individually if needed.",
          ),
          _faq(
            "Do you deliver overseas?",
            "Yes, international delivery is supported for selected products. Check availability based on your region.",
          ),
          _faq(
            "Do you offer refunds or cancellations?",
            "Please review our Refunds & Returns policy for full details on the eligible items and process.",
          ),
          _faq(
            "When will I receive my order?",
            "Local orders: 2–3 days. Outside Gujarat: 3–4 days. International orders: Based on destination shipping policies.",
          ),

          SizedBox(height: 50),
        ],
      ),
    );
  }

  // -----------------------------------------------------
  // PREMIUM FAQ CARD
  // -----------------------------------------------------
  Widget _faq(String question, String answer) {
    return PremiumFaqTile(question: question, answer: answer);
  }
}

// -----------------------------------------------------
// PREMIUM EXPANDABLE FAQ TILE WIDGET
// -----------------------------------------------------
class PremiumFaqTile extends StatefulWidget {
  final String question;
  final String answer;

  const PremiumFaqTile({
    super.key,
    required this.question,
    required this.answer,
  });

  @override
  State<PremiumFaqTile> createState() => _PremiumFaqTileState();
}

class _PremiumFaqTileState extends State<PremiumFaqTile>
    with SingleTickerProviderStateMixin {
  bool expanded = false;

  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 260),
      curve: Curves.easeOut,
      margin: EdgeInsets.only(bottom: 18),
      padding: EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        border: Border.all(
          color: kGold.withOpacity(0.22),
          width: 1.2,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.18),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => expanded = !expanded),
            borderRadius: BorderRadius.circular(12),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    widget.question,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Icon(
                  expanded ? Icons.remove : Icons.add,
                  color: kGold,
                ),
              ],
            ),
          ),

          // Expanded Answer
          AnimatedCrossFade(
            firstChild: SizedBox.shrink(),
            secondChild: Padding(
              padding: EdgeInsets.only(top: 12),
              child: Text(
                widget.answer,
                style: TextStyle(
                  height: 1.4,
                  fontSize: 15,
                  color: Colors.white.withOpacity(0.80),
                ),
              ),
            ),
            crossFadeState:
                expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: Duration(milliseconds: 260),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------
// PARTICLE MODEL + PAINTER
// -----------------------------------------------------
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
