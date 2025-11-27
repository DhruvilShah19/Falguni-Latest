// ignore_for_file: unused_field, prefer_final_fields, unused_local_variable

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../Providers/auth.dart';

class ProfileHome extends StatefulWidget {
  final bool isbottomNav;
  const ProfileHome({super.key, required this.isbottomNav});

  @override
  State<ProfileHome> createState() => _ProfileHomeState();
}

class _ProfileHomeState extends State<ProfileHome> {
  static const Color kPrimary = Color(0xFF2F2525);

  DocumentReference? userRef;

  String fullname = '';
  String email = '';
  String phone = '';
  String userPic = '';
  String addressMain = '';
  String referralCode = '';

  bool isLogged = false;
  bool referralStatus = false;

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  @override
  void initState() {
    super.initState();
    _listenAuth();
    _getReferralStatus();
    _getUserDoc();
    _loadUserDetails();
  }

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

  // ---------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------

  String _initials() {
    if (fullname.isEmpty) {
      return email.isNotEmpty ? email[0].toUpperCase() : "U";
    }
    final parts = fullname.split(" ");
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts[1][0]).toUpperCase();
  }

  Widget _buildAvatar() {
    if (userPic.isNotEmpty) {
      return CircleAvatar(
        radius: 34,
        backgroundImage: NetworkImage(userPic),
      );
    }
    return CircleAvatar(
      radius: 34,
      backgroundColor: Colors.grey.shade300,
      child: Text(
        _initials(),
        style: const TextStyle(
          color: kPrimary,
          fontSize: 22,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _tile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey.shade700, size: 22),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ).tr(),
      trailing:
          Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 20),
      visualDensity: VisualDensity.compact,
      onTap: onTap,
    );
  }

  Widget _sectionHeader(String text) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 6),
      child: Text(
        text.tr(),
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Colors.grey.shade600,
        ),
      ),
    );
  }

  // ---------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: widget.isbottomNav ? false : true,
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Profile'.tr(),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: kPrimary,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 40),
        children: [
          // -----------------------------------------------------------
          // HEADER CARD
          // -----------------------------------------------------------
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                )
              ],
            ),
            child: Row(
              children: [
                _buildAvatar(),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fullname.isNotEmpty ? fullname : "Guest".tr(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: kPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (email.isNotEmpty)
                          Text(
                            email,
                            style: TextStyle(
                                fontSize: 14, color: Colors.grey.shade600),
                          ),
                        if (addressMain.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.location_on_outlined,
                                  size: 14, color: Colors.grey.shade600),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  addressMain,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.grey.shade600),
                                ),
                              ),
                            ],
                          )
                        ]
                      ]),
                ),
              ],
            ),
          ),

          // -----------------------------------------------------------
          // ACCOUNT SECTION
          // -----------------------------------------------------------
          _sectionHeader("Account"),

          _tile(
            icon: Icons.shopping_bag_outlined,
            label: "Orders",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/orders');
              }
            },
          ),
          _tile(
            icon: Icons.delivery_dining,
            label: "Logistics/Courier",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/courier');
              }
            },
          ),
          _tile(
            icon: Icons.person_outline,
            label: "Profile",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/profile');
              }
            },
          ),
          _tile(
            icon: Icons.room_outlined,
            label: "Delivery Address",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/delivery-address');
              }
            },
          ),
          _tile(
            icon: Icons.wallet_outlined,
            label: "Wallet",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/wallet');
              }
            },
          ),
          _tile(
            icon: Icons.favorite_border,
            label: "Favorites",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/favorites');
              }
            },
          ),

          const Divider(indent: 16, endIndent: 16),

          // -----------------------------------------------------------
          // OTHER SECTION
          // -----------------------------------------------------------
          if (referralStatus)
            _tile(
              icon: Icons.wallet_giftcard_outlined,
              label: "Share and earn",
              onTap: () {
                if (!isLogged) {
                  Navigator.pushNamed(context, '/login');
                } else {
                  Navigator.pushNamed(context, '/referral-page');
                }
              },
            ),

          _tile(
            icon: Icons.card_giftcard_outlined,
            label: "Promo Code",
            onTap: () => Navigator.pushNamed(context, '/coupon'),
          ),

          _tile(
            icon: Icons.help_center_outlined,
            label: "F.A.Q.",
            onTap: () => Navigator.pushNamed(context, '/faq'),
          ),

          _tile(
            icon: Icons.notifications_outlined,
            label: "Notifications",
            onTap: () {
              if (!isLogged) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/notifications');
              }
            },
          ),

          const Divider(indent: 16, endIndent: 16),

          // -----------------------------------------------------------
          // AUTH SECTION
          // -----------------------------------------------------------
          if (isLogged)
            _tile(
              icon: Icons.logout,
              label: "Log Out",
              onTap: () {
                AuthService().signOut(context);
              },
            )
          else
            _tile(
              icon: Icons.login,
              label: "Log In",
              onTap: () {
                Navigator.pushNamed(context, '/login');
              },
            ),
        ],
      ),
    );
  }
}
