import 'dart:ui';
import 'package:flutter/material.dart';

class ProductAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final int cartQuantity;
  final double scrollOffset;
  final VoidCallback onBack;
  final VoidCallback onCartTap;

  const ProductAppBar({
    super.key,
    required this.title,
    required this.cartQuantity,
    required this.scrollOffset,
    required this.onBack,
    required this.onCartTap,
  });

  // SAME COLORS AS BOTTOM SHEET
  static const Color kDark1 = Color(0xFF1C1515);
  static const Color kDark2 = Color(0xFF2F2525);
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    final bool isScrolled = scrollOffset > 30;

    return Container(
      decoration: BoxDecoration(
        // ⭐ When NOT scrolled: premium gradient like bottom sheet
        gradient: !isScrolled
            ? const LinearGradient(
                colors: [kDark1, kDark2],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              )
            : null,

        // ⭐ When scrolled: dense solid background for good readability
        color: isScrolled ? kDark2.withOpacity(0.95) : null,

        // ⭐ Subtle bottom divider
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.12),
            width: 0.6,
          ),
        ),
      ),
      child: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: true,
        automaticallyImplyLeading: false,
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            size: 20,
            color: Colors.white,
          ),
          onPressed: onBack,
        ),
        actions: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(
                  Icons.shopping_cart_outlined,
                  size: 22,
                  color: Colors.white,
                ),
                onPressed: onCartTap,
              ),
              if (cartQuantity > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: kGold,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      cartQuantity.toString(),
                      style: const TextStyle(
                        color: kPrimary,
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 6),
        ],
      ),
    );
  }
}
