// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class FaqPage extends StatefulWidget {
  const FaqPage({super.key});

  @override
  State<FaqPage> createState() => _FaqPageState();
}

class _FaqPageState extends State<FaqPage> {
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  // -----------------------------------------------------
  // Build UI
  // -----------------------------------------------------
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
          "FAQ",
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
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: .3,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            "Find quick answers to common doubts and queries.",
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 15,
            ),
          ),

          const SizedBox(height: 28),

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

          const SizedBox(height: 50),
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
  static const Color kGold = Color(0xFFD4AF37);

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOut,
      margin: const EdgeInsets.only(bottom: 18),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        border: Border.all(
          color: kGold.withOpacity(0.3),
          width: 1.2,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.18),
            blurRadius: 16,
            offset: const Offset(0, 6),
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
                    style: const TextStyle(
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
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsets.only(top: 12),
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
            duration: const Duration(milliseconds: 260),
          ),
        ],
      ),
    );
  }
}
