import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:curved_labeled_navigation_bar/curved_navigation_bar.dart';
import 'package:curved_labeled_navigation_bar/curved_navigation_bar_item.dart';
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
  int _page = 0;
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
  final GlobalKey<CurvedNavigationBarState> _bottomNavigationKey = GlobalKey();
  DocumentReference? userRef;
  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  dynamic themeMode;
  var _lightTheme = true;
  void onThemeChanged(bool value, ThemeNotifier themeNotifier) async {
    (value)
        ? themeNotifier.setTheme(lightTheme)
        : themeNotifier.setTheme(darkTheme);
    var prefs = await SharedPreferences.getInstance();
    prefs.setBool('lightMode', value);
  }

  getThemeDetail() async {
    SharedPreferences.getInstance().then((prefs) {
      var lightModeOn = prefs.getBool('lightMode');
      setState(() {
        themeMode = lightModeOn!;
      });
    });
  }

  @override
  void initState() {
    _getUserDoc();
    _getUserDetails();
    getReferralStatus();
    getAuth();
    super.initState();
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
      }
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

  openDrawerHome() {
    _scaffoldHome.currentState!.openDrawer();
  }

  final GlobalKey<ScaffoldState> _scaffoldHome = GlobalKey<ScaffoldState>();
  @override
  Widget build(BuildContext context) {
    getThemeDetail();
    // ignore: avoid_print
    print(isLogged);
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    return Scaffold(
      key: _scaffoldHome,
      drawer: SizedBox(
        width: double.infinity,
        child: Drawer(
          child: ListView(children: [
            DrawerHeader(
              padding: EdgeInsets.zero,
              child: ClipPath(
                clipper: CustomClipPath(),
                child: Container(
                  height: 200,
                  color: Colors.blue,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                              onPressed: () {
                                Navigator.pop(context);
                              },
                              icon: Icon(Icons.arrow_back,
                                  color: themeMode == true || themeMode == null
                                      ? Colors.black
                                      : Colors.white)),
                          // IconButton(
                          //     color: Colors.black,
                          //     onPressed: () {},
                          //     icon: const Icon(Icons.call)),
                        ],
                      ),
                      isLogged == false
                          ? const Text('Hello, Guest',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 25,
                              )).tr()
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text('Hello,',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 25,
                                    )).tr(),
                                Text(' $fullname',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 25,
                                    )),
                              ],
                            )
                    ],
                  ),
                ),
              ),
            ),
            ListTile(
                title: const Text(
              "Account",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ).tr()),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/orders');
                }
              },
              leading: const Icon(Icons.shopping_bag),
              title: const Text(
                "Orders",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/courier');
                }
              },
              leading: const Icon(Icons.delivery_dining),
              title: const Text(
                "Logistics/Courier",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/profile');
                }
              },
              leading: const Icon(Icons.person),
              title: const Text(
                "Profile",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/delivery-address');
                }
              },
              leading: const Icon(Icons.room),
              title: const Text(
                "Delivery Address",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/wallet');
                }
              },
              leading: const Icon(Icons.wallet),
              title: const Text(
                "Wallet",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/favorites');
                }
              },
              leading: const Icon(Icons.favorite),
              title: const Text(
                "Favorites",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            const Divider(
              endIndent: 10,
              indent: 10,
              color: Colors.grey,
              thickness: 1,
            ),
            referralStatus == false
                ? const SizedBox()
                : ListTile(
                    onTap: () {
                      if (userRef == null) {
                        Navigator.of(context).pushNamed('/login');
                      } else {
                        Navigator.of(context).pushNamed('/referral-page');
                      }
                    },
                    leading: const Icon(Icons.wallet_giftcard),
                    title: const Text(
                      "Share and earn",
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ).tr(),
                    trailing: const Icon(Icons.chevron_right),
                  ),
            ListTile(
              onTap: () {
                Navigator.of(context).pushNamed('/coupon');
              },
              leading: const Icon(Icons.card_giftcard),
              title: const Text(
                "Promo Code",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                Navigator.of(context).pushNamed('/faq');
              },
              leading: const Icon(Icons.help_center_rounded),
              title: const Text(
                "F.A.Q.",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            ListTile(
              onTap: () {
                if (userRef == null) {
                  Navigator.of(context).pushNamed('/login');
                } else {
                  Navigator.of(context).pushNamed('/notifications');
                }
              },
              leading: const Icon(Icons.notifications),
              title: const Text(
                "Notifications",
                style: TextStyle(
                  fontSize: 18,
                ),
              ).tr(),
              trailing: const Icon(Icons.chevron_right),
            ),
            // ListTile(
            //   onTap: () {
            //     Navigator.of(context).pushNamed('/language');
            //   },
            //   leading: const Icon(Icons.language),
            //   title: const Text(
            //     "Language",
            //     style: TextStyle(
            //       fontSize: 18,
            //     ),
            //   ).tr(),
            //   trailing: const Icon(Icons.chevron_right),
            // ),
            ListTileSwitch(
                leading: const Icon(Icons.color_lens),
                title: const Text('Theme Mode',
                    style: TextStyle(
                      fontSize: 18,
                    )).tr(),
                // ignore: prefer_if_null_operators
                value: themeMode == null ? true : themeMode,
                onChanged: (val) {
                  setState(() {
                    _lightTheme = val;
                    themeMode = val;
                  });
                  onThemeChanged(val, themeNotifier);
                  debugPrint(_lightTheme.toString());
                }),
            isLogged == true
                ? ListTile(
                    onTap: () {
                      AuthService().signOut(context);
                    },
                    leading: const Icon(Icons.logout),
                    title: const Text(
                      "Log Out",
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ).tr(),
                  )
                : ListTile(
                    onTap: () {
                      Navigator.of(context).pushNamed('/login');
                    },
                    leading: const Icon(Icons.login),
                    title: const Text(
                      "Log in",
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ).tr(),
                  ),
          ]),
        ),
      ),
      bottomNavigationBar: CurvedNavigationBar(
        key: _bottomNavigationKey,
        height: 60,
        iconPadding: 4,
        index: 0,
        items: const [
          CurvedNavigationBarItem(
            child: Icon(
              Icons.home,
              color: Colors.white,
            ),
            // label: 'Home',
          ),
          CurvedNavigationBarItem(
            child: Icon(Icons.shopping_cart, color: Colors.white),
            //  label: 'Search',
          ),
          CurvedNavigationBarItem(
            child: Icon(Icons.favorite, color: Colors.white),
            // label: 'Chat',
          ),
          CurvedNavigationBarItem(
            child: Icon(Icons.person, color: Colors.white),
            //  label: 'Feed',
          ),
        ],
        color: const Color.fromARGB(255, 67, 10, 10),
        buttonBackgroundColor: const Color.fromARGB(255, 47, 37, 37),
        backgroundColor: Theme.of(context).cardColor,
        animationCurve: Curves.easeInOut,
        animationDuration: const Duration(milliseconds: 400),
        onTap: (index) {
          if (isLogged == false && (index == 1 || index == 2 || index == 3)) {
            setState(() {
              _page = index;
            });
            Navigator.pushNamed(context, '/login');
          } else {
            setState(() {
              _page = index;
            });
          }
        },
        letIndexChange: (index) => true,
      ),
      body: _page == 0
          ? HomePage(
              openDrawer: openDrawerHome,
            )
          : _page == 1
              ? isLogged == false
                  ? const LoadingPage()
                  : const CartPage(
                      isbottomNav: true,
                    )
              : _page == 2
                  ? isLogged == false
                      ? const LoadingPage()
                      : const FavoritesPage(
                          isbottomNav: true,
                        )
                  : isLogged == false
                      ? const LoadingPage()
                      : const ProfileHome(
                          isbottomNav: true,
                        ),
    );
  }
}
