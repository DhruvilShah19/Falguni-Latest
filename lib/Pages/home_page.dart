// ignore_for_file: deprecated_member_use, unused_local_variable, use_build_context_synchronously

import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:extended_nested_scroll_view/extended_nested_scroll_view.dart';
import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_close_app/flutter_close_app.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:fluttertoast/fluttertoast.dart';
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
  final ScrollController sc = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldHome = GlobalKey<ScaffoldState>();
  DocumentReference? userRef;
  DocumentReference? userDetails;
  String fullname = '';
  String email = '';
  String userPic = '';
  num wallet = 0;
  String currencySymbol = '';
  bool courier = false;
  num cartQuantity = 0;
  String deliveryAddress = '';
  String address = '';
  double addressLat = 0;
  double addressLong = 0;
  String search = 'Search your favorite Snacks'.tr();

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  getCart() {
    if (userRef != null) {
      userRef!.collection('Cart').snapshots().listen((val) {
        num tempTotal =
            val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']);
        setState(() {
          cartQuantity = tempTotal;
        });
      });
    }
  }

  getCourierStatus() {
    FirebaseFirestore.instance
        .collection('Courier System')
        .doc('Courier System')
        .get()
        .then((v) {
      setState(() {
        courier = v['Enable Courier'];
      });
    });
  }

  Timer? _timer;
  @override
  void initState() {
    getCourierStatus();
    _getUserDetails();
    networkStatus();
    StreamSubscription<List<ConnectivityResult>> subscription = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> result) {
      // Received changes in available connectivity types!
      networkStatus();
    });
    _getUserDeliveryStatus();
    getLocation();
    getMyFlashSalesProducts();
    getReferralStatus();
    EasyLoading.addStatusCallback((status) {
      if (status == EasyLoadingStatus.dismiss) {
        _timer?.cancel();
      }
    });
    getAuth();
    _getUserDoc();
    super.initState();
  }

  networkStatus() async {
    final List<ConnectivityResult> connectivityResult =
        await (Connectivity().checkConnectivity());
// ignore: avoid_print
    print('Connectivity Result is $connectivityResult');
// This condition is for demo purposes only to explain every connection type.
// Use conditions which work for your requirements.
    if (connectivityResult.contains(ConnectivityResult.mobile)) {
      // No available network types
      if (mounted) {
        context.loaderOverlay.hide();
      }
      // Mobile network available.
    } else if (connectivityResult.contains(ConnectivityResult.wifi)) {
      // No available network types
      if (mounted) {
        context.loaderOverlay.hide();
      }
      // Wi-fi is available.
      // Note for Android:
      // When both mobile and Wi-Fi are turned on system will return Wi-Fi only as active network type
    } else if (connectivityResult.contains(ConnectivityResult.ethernet)) {
      // No available network types
      if (mounted) {
        context.loaderOverlay.hide();
      }
      // Ethernet connection available.
    } else if (connectivityResult.contains(ConnectivityResult.vpn)) {
      // No available network types
      if (mounted) {
        context.loaderOverlay.hide();
      }
      // Vpn connection active.
      // Note for iOS and macOS:
      // There is no separate network interface type for [vpn].
      // It returns [other] on any device (also simulator)
    }
    // } else if (connectivityResult.contains(ConnectivityResult.bluetooth)) {
    //   setState(() {
    //     isNetworkAvailable = true;
    //   });
    //   // Bluetooth connection available.
    // } else if (connectivityResult.contains(ConnectivityResult.other)) {
    //   // Connected to a network which is not in the above mentioned networks.
    // }
    else if (connectivityResult.contains(ConnectivityResult.none)) {
      // No available network types
      if (mounted) {
        context.loaderOverlay.show();
      }
    }
  }

  @override
  dispose() {
    subscription.cancel();
    super.dispose();
  }

  late StreamSubscription<List<ConnectivityResult>> subscription;

  openDrawerHome() {
    _scaffoldHome.currentState!.openDrawer();
  }

  bool flashSales = false;
  getMyFlashSalesProducts() {
    return FirebaseFirestore.instance
        .collection('Flash Sales Products')
        .snapshots()
        .listen((snapshot) {
      if (snapshot.docs.isEmpty) {
        setState(() {
          flashSales = false;
        });
      } else {
        setState(() {
          flashSales = true;
        });
      }
    });
  }

  launchLoader() async {
    _timer?.cancel();
    await EasyLoading.show(
      status: 'Please wait...',
      maskType: EasyLoadingMaskType.black,
    );
  }

  Future<void> _getUserDeliveryStatus() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userDetails =
          firestore.collection('users').doc(user!.uid).get().then((value) {
        getCart();
        if (value['DeliveryAddress'] == '') {
          launchLoader();
          Future.delayed(const Duration(seconds: 3), () async {
            _timer?.cancel();
            await EasyLoading.dismiss().then((value) {
              Fluttertoast.showToast(
                  msg: "Please Add Your Delivery Address.".tr(),
                  toastLength: Toast.LENGTH_SHORT,
                  gravity: ToastGravity.TOP,
                  timeInSecForIosWeb: 1,
                  fontSize: 14.0);
              showDialog(
                  context: context,
                  builder: (context) {
                    return const Material(child: AddDeliveryAddress());
                  });
            });
          });
        }
      }) as DocumentReference<Object?>?;
    });
  }

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userDetails = firestore
          .collection('users')
          .doc(user!.uid)
          .snapshots()
          .listen((value) {
        setState(() {
          fullname = value['fullname'].split(' ')[0].trim();
          email = value['email'];
          userPic = value['photoUrl'];
          wallet = value['wallet'];
          deliveryAddress = value['DeliveryAddress'];
        });
      }) as DocumentReference<Object?>?;
    });
  }

  bool isLogged = false;
  getAuth() {
    FirebaseAuth.instance.authStateChanges().listen((User? user) async {
      if (user == null) {
        setState(() {
          isLogged = false;
        });
      } else {
        setState(() {
          isLogged = true;
        });
        getMyRecentlyPurchasedProducts();
      }
    });
  }

  getLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }

    await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.best)
        .then((value) async {
      getAddress(value.latitude, value.longitude);
      setState(() {
        addressLat = value.latitude;
        addressLong = value.longitude;
      });
    });
  }

  getAddress(double lat, double long) async {
    List<Placemark> placemarks = await placemarkFromCoordinates(lat, long);
    for (var element in placemarks) {
      setState(() {
        address = element.street!;
      });
    }
  }

  bool referralStatus = false;
  getReferralStatus() {
    FirebaseFirestore.instance
        .collection('Referral System')
        .doc('Referral System')
        .snapshots()
        .listen((value) {
      setState(() {
        referralStatus = value['Status'];
      });
    });
  }
//theme code was here earlier - To Add in future if needed

  bool recentlyPurchased = false;
  getMyRecentlyPurchasedProducts() {
    final FirebaseAuth auth = FirebaseAuth.instance;
    User? user = auth.currentUser;
    return FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .collection('Recent Purchased Products')
        .get()
        .then((snapshot) {
      if (snapshot.docs.isNotEmpty) {
        setState(() {
          recentlyPurchased = true;
        });
      } else {
        setState(() {
          recentlyPurchased = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // getThemeDetail();
    // final themeNotifier = Provider.of<ThemeNotifier>(context);
    // ignore: avoid_print
    print('Recently purchased is $recentlyPurchased');
    return WillPopScope(
      onWillPop: () async {
        if (_scaffoldHome.currentState!.isDrawerOpen) {
          Navigator.of(context).pop();
          return false;
        }
        return true;
      },
      child: Scaffold(
        key: _scaffoldHome,
        //To Add if needed to change the design - New Code down below in commented - for future reference
        body: FlutterCloseAppPage(
            interval: 2,
            condition: true,
            onCloseFailed: () {
              // The interval is more than 2 seconds, or the return key is pressed for the first time
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Press again to exit'),
              ));
            },
            child: _buildScaffoldBody(openDrawerHome)),
      ),
    );
  }

  late double pinnedHeaderHeight;
  Widget _buildScaffoldBody(Function openDrawerHome) {
    final double statusBarHeight = MediaQuery.of(context).padding.top;
    pinnedHeaderHeight = statusBarHeight + kToolbarHeight;
    return Padding(
      padding: const EdgeInsets.fromLTRB(0.0, 4.0, 0.0, 4.0),
      child: ExtendedNestedScrollView(
        controller: sc,
        headerSliverBuilder: (BuildContext c, bool f) {
          return <Widget>[
            SliverAppBar(
                backgroundColor: Theme.of(context).colorScheme.background,
                automaticallyImplyLeading: false,
                pinned: true,
                centerTitle: true,
                expandedHeight: 390,
                //line 399
                actions: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: InkWell(
                      onTap: () {
                        if (userRef == null) {
                          Navigator.of(context).pushNamed('/login');
                        } else {
                          Navigator.of(context).pushNamed('/cart');
                        }
                      },
                      child: Container(
                        height: 60,
                        width: 60,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color.fromARGB(255, 236, 230, 230),
                          border: Border.all(
                            color: const Color.fromARGB(
                                255, 67, 10, 10), // Border color
                            width: 1.0, // Border width
                          ),
                          boxShadow: [
                            BoxShadow(
                              color:
                                  Colors.grey.withOpacity(0.3), // Shadow color
                              spreadRadius: 1.3, // Spread radius
                              blurRadius: 3, // Blur radius
                              offset: const Offset(
                                  0, 3), // Offset in the x and y directions
                            ),
                          ],
                        ),
                        child: Center(
                          child: Badge(
                            badgeStyle: const BadgeStyle(
                              badgeColor: Color.fromARGB(255, 67, 10, 10),
                            ),
                            badgeContent: Text(
                              cartQuantity.toString(),
                              style: const TextStyle(color: Colors.white),
                            ),
                            child: const Icon(
                              Icons.shopping_cart,
                              color: Colors.black,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
                title: SizedBox(
                    width: MediaQuery.of(context).size.width / 1.2,
                    height: 65,
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                      child: TextFormField(
                        readOnly: true,
                        expands: false,
                        autofocus: false,
                        onTap: () {
                          Navigator.of(context).push(MaterialPageRoute(
                              builder: (context) => const SearchProductPage(
                                    marketID: '',
                                    category: '',
                                  )));
                        },
                        decoration: InputDecoration(
                          fillColor: Colors.white,
                          contentPadding:
                              const EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                          prefixIcon: const Icon(Icons.search),
                          hintText: search,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(40.0),
                            borderSide: const BorderSide(
                              color: Color.fromARGB(255, 84, 83, 83),
                              style: BorderStyle.solid,
                            ),
                          ),
                        ),
                      ),
                    )),
                flexibleSpace: Padding(
                  padding: const EdgeInsets.fromLTRB(0.0, 8.0, 0.0, 8.0),
                  child: FlexibleSpaceBar(
                    background: SingleChildScrollView(
                      physics: const NeverScrollableScrollPhysics(),
                      child: Column(
                        children: [
                          const SizedBox(height: 100),
                          TextButton(
                            onPressed: () {
                              if (userRef == null) {
                                Navigator.of(context).pushNamed('/login');
                              } else {
                                Navigator.of(context)
                                    .pushNamed('/delivery-address');
                              }
                            },
                            child: Text(
                              '${(userRef == null ? address : deliveryAddress).toUpperCase()} ▼',
                              style: TextStyle(
                                color: Theme.of(context).indicatorColor,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                wordSpacing: 1.2,
                                letterSpacing: 1.2,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 0),
                          const Padding(
                            padding: EdgeInsets.only(left: 8, right: 8),
                            child: SizedBox(
                                height: 360, child: SliderWidget(category: '')),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ))
          ];
        },
        //1.[pinned sliver header issue](https://github.com/flutter/flutter/issues/22393)
        pinnedHeaderSliverHeightBuilder: () {
          return pinnedHeaderHeight;
        },
        body: Container(
            color: Theme.of(context).colorScheme.background,
            child: SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.only(left: 20, right: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'CATEGORIES',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 1.2),
                          textAlign: TextAlign.center,
                        ).tr(),
                        TextButton(
                            child: const Text(
                              'VIEW ALL',
                              style: TextStyle(
                                  color: Color.fromARGB(255, 47, 37, 37),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w400,
                                  letterSpacing: 1.2),
                              textAlign: TextAlign.center,
                            ).tr(),
                            onPressed: () {
                              Navigator.pushNamed(context, '/categories');
                            })
                      ],
                    ),
                  ),
                  Padding(
                    padding: MediaQuery.of(context).size.width >= 1100
                        ? const EdgeInsets.only(left: 200, right: 200)
                        : const EdgeInsets.only(left: 8, right: 8, bottom: 20),
                    child: SizedBox(
                        height: 480,
                        width: double.infinity,
                        child: Padding(
                            padding: MediaQuery.of(context).size.width >= 1100
                                ? const EdgeInsets.only(left: 200, right: 200)
                                : const EdgeInsets.only(bottom: 20),
                            child: const CategoriesIntro())),
                  ),
                  if (flashSales == true)
                    Padding(
                      padding: const EdgeInsets.only(
                        left: 20,
                        right: 20,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Flash sales',
                            style: TextStyle(
                                fontSize: 15, fontWeight: FontWeight.w400),
                            textAlign: TextAlign.center,
                          ).tr(),
                          TextButton(
                              child: const Text(
                                'View All',
                                style: TextStyle(
                                    color: Color.fromARGB(255, 47, 37, 37),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w400),
                                textAlign: TextAlign.center,
                              ).tr(),
                              onPressed: () {
                                Navigator.of(context).push(
                                    MaterialPageRoute(builder: ((context) {
                                  return const FlashSalesPage();
                                })));
                              })
                        ],
                      ),
                    ),
                  if (flashSales == true)
                    const SizedBox(
                        height: 260,
                        width: double.infinity,
                        child: FlashSalesSlidesHome()),
                  if (isLogged == true && recentlyPurchased == true)
                    const Divider(
                      height: 12,
                      thickness: 0.5,
                      indent: 20,
                      endIndent: 20,
                      color: Colors.black,
                    ),
                  Padding(
                    padding: const EdgeInsets.only(
                      left: 20,
                      right: 20,
                      top: 10,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'RECENTLY PURCHASED PRODUCTS',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 1.2,
                              wordSpacing: 1.2),
                          textAlign: TextAlign.center,
                        ).tr(),
                      ],
                    ),
                  ),
                  if (isLogged == true && recentlyPurchased == true)
                    const SizedBox(
                        height: 250,
                        width: double.infinity,
                        child: RecentlyPurchasedProducts()),
                  const Divider(
                    height: 12,
                    thickness: 0.5,
                    indent: 20,
                    endIndent: 20,
                    color: Colors.black,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(
                      left: 20,
                      right: 20,
                      top: 0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'IN THE MOOD FOR',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 1.2,
                              wordSpacing: 1.2),
                          textAlign: TextAlign.center,
                        ).tr(),
                        TextButton(
                            child: const Text(
                              'VIEW ALL',
                              style: TextStyle(
                                  color: Color.fromARGB(255, 47, 37, 37),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w400,
                                  letterSpacing: 1.2),
                              textAlign: TextAlign.center,
                            ).tr(),
                            onPressed: () {
                              Navigator.of(context)
                                  .push(MaterialPageRoute(builder: ((context) {
                                return const ProductsPage();
                              })));
                            })
                      ],
                    ),
                  ),
                  SizedBox(
                      // height: MediaQuery.of(context).size.height / 1,
                      width: double.infinity,
                      child: Padding(
                          padding: MediaQuery.of(context).size.width >= 1100
                              ? const EdgeInsets.only(left: 200, right: 200)
                              : const EdgeInsets.all(0),
                          child: const ProductsIntro())),
                  const SizedBox(
                    height: 20,
                  )
                ],
              ),
            )),
      ),
    );
  }
}
