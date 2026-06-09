// ignore_for_file: unused_field, prefer_final_fields, unused_local_variable, deprecated_member_use

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:gap/gap.dart';
import '../Providers/auth.dart';
import 'package:falguni_app/Pages/audit_orders_page.dart';

class ProfileHome extends StatefulWidget {
  final bool isbottomNav;
  const ProfileHome({super.key, required this.isbottomNav});

  @override
  State<ProfileHome> createState() => _ProfileHomeState();
}

class _ProfileHomeState extends State<ProfileHome> {
  // Theme Palette
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  DocumentReference? userRef;

  String fullname = '';
  String email = '';
  String phone = '';
  String userPic = '';
  String addressMain = '';
  String referralCode = '';

  bool isLogged = false;
  bool referralStatus = false;

  @override
  void initState() {
    super.initState();
    _listenAuth();
    _getReferralStatus();
    _getUserDoc();
    _loadUserDetails();
  }

  // ---------------------------------------------------------
  // LOGIC (PRESERVED)
  // ---------------------------------------------------------
  void _listenAuth() {
    FirebaseAuth.instance.authStateChanges().listen((user) {
      if (!mounted) return;
      setState(() => isLogged = user != null);
    });
  }

  Future<void> _getUserDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
  }

  Future<void> _loadUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((value) {
      if (!mounted || !value.exists) return;
      setState(() {
        fullname = value['fullname'] ?? '';
        email = value['email'] ?? '';
        phone = value['phone'] ?? '';
        userPic = value['photoUrl'] ?? '';
        addressMain = value['address'] ?? '';
        referralCode = value['personalReferralCode'] ?? '';
      });
    });
  }

  void _getReferralStatus() {
    FirebaseFirestore.instance
        .collection('Referral System')
        .doc('Referral System')
        .snapshots()
        .listen((value) {
      if (!mounted) return;
      setState(() => referralStatus = value['Status'] ?? false);
    });
  }

  String _initials() {
    if (fullname.isEmpty) {
      return email.isNotEmpty ? email[0].toUpperCase() : "U";
    }
    final parts = fullname.trim().split(" ");
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  // ---------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // 🔹 Elite AppBar without Back Button
            SliverAppBar(
              automaticallyImplyLeading: false, // Back button removed
              backgroundColor: Colors.transparent,
              elevation: 0,
              pinned: true,
              centerTitle: true,
              title: Text(
                'Profile'.tr().toUpperCase(),
                style: const TextStyle(
                  color: kGold,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildMembershipCard(),
                    const Gap(25),
                    _sectionHeader("Account Settings"),
                    _buildMenuCard([
                      _menuItem(
                          Icons.shopping_bag_outlined, "Orders", '/orders'),
                      _menuItem(Icons.delivery_dining_outlined, "Logistics",
                          '/courier'),
                      _menuItem(Icons.person_outline_rounded, "Profile Details",
                          '/profile'),
                      _menuItem(Icons.map_outlined, "Delivery Address",
                          '/delivery-address'),
                      _walletMenuItem(),
                      _menuItem(Icons.favorite_outline_rounded, "Favorites",
                          '/favorites'),
                      _auditMenuItem(),
                    ]),
                    const Gap(20),
                    _sectionHeader("Promotions & Support"),
                    _buildMenuCard([
                      if (referralStatus)
                        _menuItem(Icons.card_giftcard_rounded, "Share & Earn",
                            '/referral-page'),
                      _menuItem(Icons.confirmation_number_outlined,
                          "Promo Codes", '/coupon'),
                      _menuItem(Icons.help_outline_rounded, "F.A.Q.", '/faq'),
                      _menuItem(Icons.notifications_none_rounded,
                          "Notifications", '/notifications'),
                    ]),
                    const Gap(30),
                    _buildLogoutButton(),
                    const Gap(120), // Spacer for Floating Bottom Nav
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------
  // UI COMPONENTS
  // ---------------------------------------------------------

  Widget _buildMembershipCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          _buildAvatar(),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fullname.isNotEmpty ? fullname : "Guest Member".tr(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  email.isNotEmpty ? email : "Login to sync data".tr(),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 13,
                  ),
                ),
                if (addressMain.isNotEmpty) ...[
                  const Gap(8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: kGold, size: 14),
                      const Gap(4),
                      Expanded(
                        child: Text(
                          addressMain,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  )
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: const BoxDecoration(shape: BoxShape.circle, color: kGold),
      child: CircleAvatar(
        radius: 35,
        backgroundColor: const Color(0xFF2F2525),
        backgroundImage: userPic.isNotEmpty ? NetworkImage(userPic) : null,
        child: userPic.isEmpty
            ? Text(
                _initials(),
                style: const TextStyle(
                  color: kGold,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              )
            : null,
      ),
    );
  }

  Widget _buildMenuCard(List<Widget> children) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(children: children),
    );
  }

  Widget _menuItem(IconData icon, String label, String route) {
    return ListTile(
      leading: Icon(icon, color: kGold.withOpacity(0.8), size: 22),
      title: Text(
        label.tr(),
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: Colors.white24,
        size: 20,
      ),
      onTap: () {
        HapticFeedback.lightImpact();
        if (!isLogged && route != '/faq' && route != '/coupon') {
          Navigator.pushNamed(context, '/login');
        } else {
          Navigator.pushNamed(context, route);
        }
      },
    );
  }

  Widget _walletMenuItem() {
    return ListTile(
      leading: Icon(Icons.account_balance_wallet_outlined,
          color: kGold.withOpacity(0.8), size: 22),
      title: Row(
        children: [
          Text(
            'Wallet'.tr(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.redAccent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
            ),
            child: const Text(
              'Deprecating soon',
              style: TextStyle(
                color: Colors.redAccent,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: Colors.white24,
        size: 20,
      ),
      onTap: () {
        HapticFeedback.lightImpact();
        if (!isLogged) {
          Navigator.pushNamed(context, '/login');
        } else {
          Navigator.pushNamed(context, '/wallet');
        }
      },
    );
  }

  Widget _auditMenuItem() {
    return ListTile(
      leading: Icon(Icons.verified_user_outlined,
          color: kGold.withOpacity(0.8), size: 22),
      title: const Text(
        'Transaction Data',
        style: TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: Colors.white24,
        size: 20,
      ),
      onTap: () {
        HapticFeedback.lightImpact();
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => const AuditOrdersPage()));
      },
    );
  }

  Widget _sectionHeader(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: kGold,
          fontSize: 10,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return InkWell(
      onTap: () {
        HapticFeedback.mediumImpact();
        isLogged
            ? AuthService().signOut(context)
            : Navigator.pushNamed(context, '/login');
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isLogged
                ? Colors.redAccent.withOpacity(0.3)
                : kGold.withOpacity(0.3),
          ),
        ),
        child: Center(
          child: Text(
            isLogged ? "Sign Out".toUpperCase() : "Sign In".toUpperCase(),
            style: TextStyle(
              color: isLogged ? Colors.redAccent : kGold,
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
        ),
      ),
    );
  }
}
