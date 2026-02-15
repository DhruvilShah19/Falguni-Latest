// ignore_for_file: deprecated_member_use

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:tab_indicator_styler/tab_indicator_styler.dart';

import '../Widgets/OrdersTab/all_orders.dart';
import '../Widgets/OrdersTab/cancelled_orders.dart';
import '../Widgets/OrdersTab/completed_orders.dart';
import '../Widgets/OrdersTab/processing_orders.dart';
import '../Widgets/OrdersTab/received_orders.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage>
    with SingleTickerProviderStateMixin {
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        extendBodyBehindAppBar: true,
        backgroundColor: kBgTop,

        // 🌟 GLASS APPBAR
        appBar: AppBar(
          elevation: 0,
          backgroundColor: kBgTop.withGreen(50).withOpacity(0.5),
          centerTitle: true,
          iconTheme: const IconThemeData(color: Colors.white),
          flexibleSpace: ClipRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(color: Colors.transparent),
            ),
          ),

          title: Text(
            "ORDERS".tr(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),

          // ✨ PREMIUM TABBAR AREA
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(65),
            child: Container(
              padding: const EdgeInsets.only(bottom: 12, left: 4, right: 4),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: kGold.withOpacity(0.3),
                  ),
                ),
                child: TabBar(
                  isScrollable: true,
                  physics: const BouncingScrollPhysics(),
                  labelPadding: const EdgeInsets.symmetric(horizontal: 18),

                  labelColor: kGold,
                  unselectedLabelColor: Colors.white70,

                  labelStyle: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: .3,
                  ),
                  unselectedLabelStyle: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w500,
                  ),

                  // 🌟 GOLD CAPSULE INDICATOR
                  indicator: RectangularIndicator(
                    color: kGold.withOpacity(0.20),
                    topLeftRadius: 12,
                    topRightRadius: 12,
                    bottomLeftRadius: 12,
                    bottomRightRadius: 12,
                    verticalPadding: 4,
                    horizontalPadding: 14,
                    paintingStyle: PaintingStyle.fill,
                  ),

                  tabs: [
                    Tab(text: "All".tr()),
                    Tab(text: "Received".tr()),
                    Tab(text: "Processing".tr()),
                    Tab(text: "Completed".tr()),
                    Tab(text: "Cancelled".tr()),
                  ],
                ),
              ),
            ),
          ),
        ),

        // 🌌 GRADIENT BACKGROUND FOR CONTENT
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [kBgTop, kBgMid, kBgTop],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: const TabBarView(
            physics: BouncingScrollPhysics(),
            children: [
              AllOrders(),
              ReceivedOrders(),
              ProcessingOrders(),
              CompletedOrders(),
              CancelledOrders(),
            ],
          ),
        ),
      ),
    );
  }
}
