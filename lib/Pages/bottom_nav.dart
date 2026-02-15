// ignore_for_file: prefer_if_null_operators, deprecated_member_use

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:list_tile_switch/list_tile_switch.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:falguni_app/Pages/cart_page.dart';
import 'package:falguni_app/Pages/favorites.dart';
import 'package:falguni_app/Pages/home_page.dart';
import 'package:falguni_app/Pages/profile_home.dart';

import '../Providers/auth.dart';
import '../Theme/theme.dart';
import '../Theme/theme_data.dart';
import '../Widgets/drawer_clippath.dart';
import 'loading.dart';

class BottomNavPage extends StatefulWidget {
  const BottomNavPage({super.key});

  @override
  State<BottomNavPage> createState() => _BottomNavPageState();
}

class _BottomNavPageState extends State<BottomNavPage> {
  /// Brand accent (brown) – used only as highlight, not full backgrounds
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop =
      Color.fromARGB(255, 45, 31, 28); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  int _page = 0;

  DocumentReference? userDetails;
  DocumentReference? userRef;

  String fullname = '';
  String email = '';
  String userPic = '';
  num wallet = 0;
  String deliveryAddress = '';
  bool referralStatus = false;
  bool isLogged = false;

  dynamic themeMode;
  bool _lightTheme = true;

  final GlobalKey<ScaffoldState> _scaffoldHome = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _getUserDoc();
    _getUserDetails();
    _getReferralStatus();
    _listenAuth();
    _loadTheme();
  }

  // ---------------------------------------------------------------------------
  // INIT / DATA
  // ---------------------------------------------------------------------------

  Future<void> _getUserDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() {
      userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    });
  }

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    // Listen to user document
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((value) {
      if (!mounted || !value.exists) return;
      setState(() {
        fullname = (value['fullname'] ?? '').toString().split(' ')[0].trim();
        email = value['email'] ?? '';
        userPic = value['photoUrl'] ?? '';
        wallet = value['wallet'] ?? 0;
        deliveryAddress = value['DeliveryAddress'] ?? '';
      });
    });
  }

  void _getReferralStatus() {
    FirebaseFirestore.instance
        .collection('Referral System')
        .doc('Referral System')
        .snapshots()
        .listen((value) {
      if (!mounted || !value.exists) return;
      setState(() {
        referralStatus = value['Status'] ?? false;
      });
    });
  }

  void _listenAuth() {
    FirebaseAuth.instance.authStateChanges().listen((User? user) {
      if (!mounted) return;
      setState(() {
        isLogged = user != null;
      });
    });
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final lightModeOn = prefs.getBool('lightMode');
    if (!mounted) return;
    setState(() {
      themeMode = lightModeOn ?? true;
      _lightTheme = themeMode;
    });
  }

  // ---------------------------------------------------------------------------
  // THEME
  // ---------------------------------------------------------------------------

  void _onThemeChanged(bool value, ThemeNotifier themeNotifier) async {
    value
        ? themeNotifier.setTheme(lightTheme)
        : themeNotifier.setTheme(darkTheme);
    final prefs = await SharedPreferences.getInstance();
    prefs.setBool('lightMode', value);
  }

  // ---------------------------------------------------------------------------
  // DRAWER HELPERS
  // ---------------------------------------------------------------------------

  void _openDrawerHome() {
    _scaffoldHome.currentState?.openDrawer();
  }

  String _initials() {
    final base = (fullname.isNotEmpty ? fullname : email).trim();
    if (base.isEmpty) return "U";
    final parts = base.split(" ");
    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }
    return (parts.first[0] + parts[1][0]).toUpperCase();
  }

  Widget _buildUserAvatar() {
    if (userPic.isNotEmpty) {
      return CircleAvatar(
        radius: 28,
        backgroundImage: NetworkImage(userPic),
        backgroundColor: Colors.grey.shade200,
      );
    }
    return CircleAvatar(
      radius: 28,
      backgroundColor: Colors.grey.shade200,
      child: Text(
        _initials(),
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 18,
          color: kBgTop,
        ),
      ),
    );
  }

  Widget _drawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? iconColor,
    Color? textColor,
  }) {
    return ListTile(
      dense: false,
      leading: Icon(icon, color: iconColor ?? kGold, size: 22),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: textColor ?? Colors.white,
        ),
      ),
      trailing:
          const Icon(Icons.chevron_right, color: Colors.white24, size: 20),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
    );
  }

  // ---------------------------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    final isLight = themeMode == null ? true : (themeMode as bool);

    return Scaffold(
      key: _scaffoldHome,

      // -----------------------------------------------------------------------
      // MODERN MINIMAL DRAWER
      // -----------------------------------------------------------------------
      drawer: SizedBox(
        width: MediaQuery.of(context).size.width * 0.82,
        child: Drawer(
          backgroundColor: kBgTop,
          child: SafeArea(
            child: Column(
              children: [
                // Header
                DrawerHeader(
                  margin: EdgeInsets.zero,
                  padding: EdgeInsets.zero,
                  child: ClipPath(
                    clipper: CustomClipPath(),
                    child: Container(
                      color: kBgMid,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Top row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                IconButton(
                                  onPressed: () => Navigator.pop(context),
                                  icon: const Icon(
                                    Icons.arrow_back,
                                    color: Colors.white,
                                  ),
                                ),
                                Icon(
                                  isLight
                                      ? Icons.light_mode_outlined
                                      : Icons.dark_mode_outlined,
                                  color: kGold,
                                  size: 20,
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                _buildUserAvatar(),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        isLogged
                                            ? 'Hello, $fullname'
                                            : 'Hello, Guest'.tr(),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white,
                                        ),
                                      ),
                                      if (isLogged && email.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          email,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            color: Colors.white70,
                                          ),
                                        ),
                                      ],
                                      if (isLogged &&
                                          deliveryAddress.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.location_on_outlined,
                                              size: 14,
                                              color: kGold,
                                            ),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(
                                                deliveryAddress,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.white70,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // Body list (scrollable)
                Expanded(
                  child: ListView(
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 16.0, bottom: 6, top: 4),
                        child: Text(
                          "Account".tr(),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: kGold,
                          ),
                        ),
                      ),
                      _drawerItem(
                        icon: Icons.shopping_bag_outlined,
                        title: "Orders".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context).pushNamed('/orders');
                          }
                        },
                      ),
                      _drawerItem(
                        icon: Icons.delivery_dining,
                        title: "Logistics/Courier".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context).pushNamed('/courier');
                          }
                        },
                      ),
                      _drawerItem(
                        icon: Icons.person_outline,
                        title: "Profile".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context).pushNamed('/profile');
                          }
                        },
                      ),
                      _drawerItem(
                        icon: Icons.room_outlined,
                        title: "Delivery Address".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context)
                                .pushNamed('/delivery-address');
                          }
                        },
                      ),
                      _drawerItem(
                        icon: Icons.wallet_outlined,
                        title: "Wallet".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context).pushNamed('/wallet');
                          }
                        },
                      ),
                      _drawerItem(
                        icon: Icons.favorite_border,
                        title: "Favorites".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context).pushNamed('/favorites');
                          }
                        },
                      ),

                      const Divider(
                          indent: 16, endIndent: 16, color: Colors.white24),

                      if (referralStatus)
                        _drawerItem(
                          icon: Icons.wallet_giftcard_outlined,
                          title: "Share and earn".tr(),
                          onTap: () {
                            if (userRef == null) {
                              Navigator.of(context).pushNamed('/login');
                            } else {
                              Navigator.of(context).pushNamed('/referral-page');
                            }
                          },
                        ),
                      _drawerItem(
                        icon: Icons.card_giftcard_outlined,
                        title: "Promo Code".tr(),
                        onTap: () => Navigator.of(context).pushNamed('/coupon'),
                      ),
                      _drawerItem(
                        icon: Icons.help_center_outlined,
                        title: "F.A.Q.".tr(),
                        onTap: () => Navigator.of(context).pushNamed('/faq'),
                      ),
                      _drawerItem(
                        icon: Icons.notifications_outlined,
                        title: "Notifications".tr(),
                        onTap: () {
                          if (userRef == null) {
                            Navigator.of(context).pushNamed('/login');
                          } else {
                            Navigator.of(context).pushNamed('/notifications');
                          }
                        },
                      ),

                      // Theme switch
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0),
                        child: ListTileSwitch(
                          leading: const Icon(Icons.color_lens_outlined,
                              color: kGold),
                          title: const Text(
                            'Theme Mode',
                            style: TextStyle(fontSize: 15, color: Colors.white),
                          ).tr(),
                          value: themeMode == null ? true : themeMode,
                          onChanged: (val) {
                            setState(() {
                              _lightTheme = val;
                              themeMode = val;
                            });
                            _onThemeChanged(val, themeNotifier);
                          },
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Login / Logout
                      isLogged
                          ? _drawerItem(
                              icon: Icons.logout,
                              title: "Log Out".tr(),
                              onTap: () {
                                AuthService().signOut(context);
                              },
                              iconColor: Colors.redAccent,
                              textColor: Colors.redAccent,
                            )
                          : _drawerItem(
                              icon: Icons.login,
                              title: "Log in".tr(),
                              onTap: () {
                                Navigator.of(context).pushNamed('/login');
                              },
                            ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),

      // -----------------------------------------------------------------------
      // MODERN MINIMAL BOTTOM NAV
      // -----------------------------------------------------------------------
      // -----------------------------------------------------------------------
      // ELITE BOUTIQUE FLOATING BOTTOM NAV
      // -----------------------------------------------------------------------
      // -----------------------------------------------------------------------
      // ELITE BOUTIQUE FLOATING BOTTOM NAV (FIXED)
      // -----------------------------------------------------------------------
      bottomNavigationBar: Container(
        color: kBgTop,
        child: SafeArea(
          // 🔹 SafeArea removes the "extra space" at the very bottom
          child: Container(
            // 🔹 Removed fixed height to prevent pixel overflow
            margin: const EdgeInsets.fromLTRB(16, 10, 16, 5),
            padding: const EdgeInsets.symmetric(vertical: 4), // Slimmer padding
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05), // Glassmorphism
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 25,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(30),
              child: BottomNavigationBar(
                currentIndex: _page,
                onTap: (index) {
                  if (!isLogged && (index == 1 || index == 2 || index == 3)) {
                    setState(() => _page = index);
                    Navigator.pushNamed(context, '/login');
                  } else {
                    setState(() => _page = index);
                  }
                },
                type: BottomNavigationBarType.fixed,
                backgroundColor: Colors.transparent,
                selectedItemColor: kGold, // Boutique Gold
                unselectedItemColor: Colors.white24,
                showSelectedLabels: false,
                showUnselectedLabels: false,
                elevation: 0,
                // 🔹 Icons sizes adjusted for a cleaner professional look
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.grid_view_rounded, size: 22),
                    activeIcon: Icon(Icons.grid_view_rounded, size: 24),
                    label: 'Home',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.shopping_bag_outlined, size: 22),
                    activeIcon: Icon(Icons.shopping_bag, size: 24),
                    label: 'Cart',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.favorite_outline_rounded, size: 22),
                    activeIcon: Icon(Icons.favorite_rounded, size: 24),
                    label: 'Favorites',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.person_2_outlined, size: 22),
                    activeIcon: Icon(Icons.person_2, size: 24),
                    label: 'Profile',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),

      // -----------------------------------------------------------------------
      // BODY – unchanged logic, just using _page
      // -----------------------------------------------------------------------
      body: _page == 0
          ? HomePage(openDrawer: _openDrawerHome)
          : _page == 1
              ? (!isLogged
                  ? const LoadingPage()
                  : const CartPage(isbottomNav: true))
              : _page == 2
                  ? (!isLogged
                      ? const LoadingPage()
                      : const FavoritesPage(isbottomNav: true))
                  : (!isLogged
                      ? const LoadingPage()
                      : const ProfileHome(isbottomNav: true)),
    );
  }
}
