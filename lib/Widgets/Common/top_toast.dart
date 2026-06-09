// lib/Widgets/Common/top_toast.dart

// ignore_for_file: unused_element_parameter, unnecessary_null_comparison, unused_element, deprecated_member_use

import 'package:flutter/material.dart';

class TopToast {
  static OverlayEntry? _entry;

  static void show(BuildContext context, String message,
      {Duration duration = const Duration(seconds: 2)}) {
    _entry?.remove(); // remove previous toast if any

    final overlay = Overlay.of(context);
    if (overlay == null) return;

    final topPadding = MediaQuery.of(context).padding.top + 80;

    _entry = OverlayEntry(
      builder: (context) => Positioned(
        top: topPadding,
        left: 60,
        right: 60,
        child: _ToastContainer(message: message),
      ),
    );

    overlay.insert(_entry!);

    // Auto hide
    Future.delayed(duration, () {
      _entry?.remove();
      _entry = null;
    });
  }
}

class _ToastContainer extends StatelessWidget {
  final String message;

  const _ToastContainer({super.key, required this.message});

  static const Color kGold = Color(0xFFC9A86A);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: AnimatedSlide(
        duration: const Duration(milliseconds: 250),
        offset: const Offset(0, -0.1),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1C1515), Color(0xFF2F2525)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: kGold, width: 1.3),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.6),
                blurRadius: 12,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Row(
            children: [
              const Icon(Icons.check_circle, color: kGold, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    height: 1.3,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
