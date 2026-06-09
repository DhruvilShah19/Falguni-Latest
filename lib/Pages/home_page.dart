// ignore_for_file: deprecated_member_use, unused_local_variable, use_build_context_synchronously, curly_braces_in_flow_control_structures

import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:extended_nested_scroll_view/extended_nested_scroll_view.dart';
import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_close_app/flutter_close_app.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:geolocator/geolocator.dart';
import 'package:falguni_app/Pages/products_page.dart';
import 'package:loader_overlay/loader_overlay.dart';
import '../Widgets/add_delivery_address.dart';
import '../Widgets/categories_intro.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:badges/badges.dart';
import 'package:geocoding/geocoding.dart';
import '../Widgets/flash_sales_slides_home.dart';
import '../Widgets/products_intro.dart';
import '../Widgets/recently_purchased_products_slides.dart';
import '../Widgets/search_products.dart';
import '../Widgets/slider.dart';
import 'flash_sales_page.dart';

class HomePage extends StatefulWidget {
  final Function openDrawer;
  const HomePage({super.key, required this.openDrawer});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  final ScrollController sc = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldHome = GlobalKey<ScaffoldState>();
  DocumentReference? userRef;
  String fullname = '';
  num cartQuantity = 0;
  String deliveryAddress = '';
  String address = '';
  bool flashSales = false;
  bool isLogged = false;
  bool recentlyPurchased = false;
  late StreamSubscription<List<ConnectivityResult>> subscription;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initData();
    });
  }

  void _initData() {
    _getUserDoc();
    _getUserDetails();
    _getAuth();
    _networkStatus();
    _getFlashSales();
    _getDeliveryStatus();
    _getLocation();
    subscription =
        Connectivity().onConnectivityChanged.listen((_) => _networkStatus());
  }

  // --- LOGIC METHODS ---
  String _getGreeting() {
    var hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning'.tr();
    if (hour < 17) return 'Good Afternoon'.tr();
    return 'Good Evening'.tr();
  }

  Future<void> _getUserDoc() async {
    User? user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      setState(() => userRef =
          FirebaseFirestore.instance.collection('users').doc(user.uid));
      userRef!.collection('Cart').snapshots().listen((val) {
        if (mounted) {
          setState(() => cartQuantity =
              val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']));
        }
      });
    }
  }

  void _getFlashSales() {
    FirebaseFirestore.instance
        .collection('Flash Sales Products')
        .snapshots()
        .listen((s) {
      if (mounted) setState(() => flashSales = s.docs.isNotEmpty);
    });
  }

  void _getAuth() {
    FirebaseAuth.instance.authStateChanges().listen((user) {
      if (mounted) {
        setState(() => isLogged = user != null);
        if (user != null) {
          FirebaseFirestore.instance
              .collection('users')
              .doc(user.uid)
              .collection('Recent Purchased Products')
              .get()
              .then((s) {
            if (mounted) setState(() => recentlyPurchased = s.docs.isNotEmpty);
          });
        }
      }
    });
  }

  void _networkStatus() async {
    final List<ConnectivityResult> res =
        await (Connectivity().checkConnectivity());
    if (res.contains(ConnectivityResult.none) && mounted) {
      context.loaderOverlay.show();
    } else if (mounted) context.loaderOverlay.hide();
  }

  void _getDeliveryStatus() {
    User? user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get()
        .then((v) {
      if (v['DeliveryAddress'] == '') {
        showDialog(
            context: context,
            builder: (c) => const Material(child: AddDeliveryAddress()));
      }
    });
  }

  void _getUserDetails() {
    User? user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((v) {
      if (mounted && v.exists) {
        setState(() {
          fullname = v['fullname'].toString().split(' ')[0];
          deliveryAddress = v['DeliveryAddress'] ?? "";
        });
      }
    });
  }

  void _getLocation() async {
    try {
      Position? lastPos = await Geolocator.getLastKnownPosition();
      if (lastPos != null) {
        List<Placemark> p =
            await placemarkFromCoordinates(lastPos.latitude, lastPos.longitude);
        if (mounted) setState(() => address = p.first.street ?? "Locating...");
      }
      Position pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.low);
      List<Placemark> p =
          await placemarkFromCoordinates(pos.latitude, pos.longitude);
      if (mounted) setState(() => address = p.first.street ?? "Locating...");
    } catch (_) {}
  }

  @override
  dispose() {
    subscription.cancel();
    super.dispose();
  }

  // --- BOUTIQUE SECTION HEADER ---
  Widget _buildSectionHeader(
      String title, String subtitle, VoidCallback? onAction) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 25, 20, 15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subtitle.tr().toUpperCase(),
                style: const TextStyle(
                  color: kGold,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    width: 3,
                    height: 16,
                    decoration: BoxDecoration(
                      color: kGold,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    title.tr().toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (onAction != null)
            InkWell(
              onTap: onAction,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  border: Border.all(color: kGold.withOpacity(0.5)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  "VIEW ALL".tr(),
                  style: const TextStyle(
                    color: kGold,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: Scaffold(
        key: _scaffoldHome,
        backgroundColor: Colors.black,
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
                colors: [kBgTop, kBgMid, kBgTop],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter),
          ),
          child: FlutterCloseAppPage(
            condition: true,
            onCloseFailed: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Press again to exit'))),
            child: _buildMainContent(),
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent() {
    return ExtendedNestedScrollView(
      controller: sc,
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        SliverAppBar(
          pinned: true,
          automaticallyImplyLeading: false,
          elevation: 0,
          expandedHeight: 340,
          backgroundColor: innerBoxIsScrolled
              ? kBgTop.withOpacity(0.98)
              : Colors.transparent,
          title: Row(
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_getGreeting().toUpperCase(),
                        style: const TextStyle(
                            color: kGold,
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1)),
                    Text(fullname.isEmpty ? "FALGUNI" : fullname.toUpperCase(),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
              Expanded(
                flex: 4,
                child: InkWell(
                  onTap: () => Navigator.of(context)
                      .pushNamed(isLogged ? '/delivery-address' : '/login'),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_on, color: kGold, size: 12),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          (isLogged && deliveryAddress.isNotEmpty)
                              ? deliveryAddress.toUpperCase()
                              : address.toUpperCase(),
                          style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.w800),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Expanded(
                flex: 3,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.search,
                          color: Colors.white, size: 22),
                      onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (context) => const SearchProductPage(
                                  marketID: '', category: ''))),
                    ),
                    InkWell(
                      onTap: () => Navigator.of(context)
                          .pushNamed(isLogged ? '/cart' : '/login'),
                      child: Badge(
                        badgeStyle: const BadgeStyle(
                            badgeColor: kGold,
                            elevation: 0,
                            padding: EdgeInsets.all(4)),
                        badgeContent: Text(cartQuantity.toString(),
                            style: const TextStyle(
                                color: Colors.black,
                                fontSize: 9,
                                fontWeight: FontWeight.bold)),
                        child: const Icon(Icons.shopping_bag_outlined,
                            color: Colors.white, size: 22),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          flexibleSpace: FlexibleSpaceBar(
            collapseMode: CollapseMode.pin,
            background: Column(
              children: [
                const SizedBox(height: 130),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: RepaintBoundary(
                    child: Container(
                      decoration: BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(25),
                        child: const SizedBox(
                            height: 240, child: SliderWidget(category: '')),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 40, top: 0),
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // 🔹 CATEGORIES
            _buildSectionHeader('Categories', 'Explore by',
                () => Navigator.pushNamed(context, '/categories')),
            const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: CategoriesIntro()),

            // 🔹 FLASH SALES
            if (flashSales) ...[
              _buildSectionHeader(
                  'Flash Sales',
                  'Limited time',
                  () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (c) => const FlashSalesPage()))),
              const SizedBox(height: 250, child: FlashSalesSlidesHome()),
            ],

            // 🔹 RECENTLY PURCHASED
            if (isLogged && recentlyPurchased) ...[
              _buildSectionHeader('Recent Picks', 'Welcome back', null),
              const RecentlyPurchasedProducts(),
            ],

            // 🔹 CURATED FOR YOU
            _buildSectionHeader(
                'Curated For You',
                'Handpicked',
                () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (c) => const ProductsPage()))),
            const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: ProductsIntro()),
          ],
        ),
      ),
    );
  }
}
