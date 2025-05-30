// ignore_for_file: unused_field, unused_import, prefer_final_fields, unused_local_variable

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:list_tile_switch/list_tile_switch.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../Providers/auth.dart';
import '../Theme/theme.dart';
import '../Theme/theme_data.dart';

class ProfileHome extends StatefulWidget {
  final bool isbottomNav;
  const ProfileHome({super.key, required this.isbottomNav});

  @override
  State<ProfileHome> createState() => _ProfileHomeState();
}

class _ProfileHomeState extends State<ProfileHome> {
  DocumentReference? userRef;
  DocumentReference? userDetails;
  String fullname = '';
  String email = '';
  String phone = '';
  String password = '';
  String userPic = '';
  String address = 'Address';
  String userPicMain = '';
  String addressMain = '';
  num cartQuantity = 0;
  String referralCode = '';

  @override
  void initState() {
    super.initState();
    getReferralStatus();
    getAuth();
    _getUserDetails();
    _getUserDoc();
  }

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userDetails =
          firestore.collection('users').doc(user!.uid).get().then((value) {
        setState(() {
          email = value['email'];
          fullname = value['fullname'];
          phone = value['phone'];
          userPic = value['photoUrl'];
          addressMain = value['address'];
          referralCode = value['personalReferralCode'];
        });
      }) as DocumentReference<Object?>?;
    });
  }

  // Select and image from the gallery or take a picture with the camera
  // Then upload to Firebase Storage

  whenAddressIsEmpty() {
    if (addressMain == '') {
      return address;
    } else {
      return addressMain;
    }
  }

  whenProfilePicIsempty() {
    if (userPicMain == '') {
      return userPic;
    } else {
      return userPicMain;
    }
  }

  getCart() {
    if (userRef == null) {
      return null;
    } else {
      userRef!.collection('Cart').get().then((val) {
        num tempTotal =
            val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']);

        setState(() {
          cartQuantity = tempTotal;
        });
      });
    }
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

  @override
  Widget build(BuildContext context) {
    getThemeDetail();
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        automaticallyImplyLeading: widget.isbottomNav == true ? false : true,
        iconTheme: Theme.of(context).iconTheme,
        titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
        backgroundColor: Theme.of(context).colorScheme.surface,
        centerTitle: true,
        elevation: 0,
        title: const Text(
          'Profile',
        ).tr(),
      ),
      body: ListView(children: [
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
        // ListTileSwitch(
        //   switchActiveColor: const Color.fromARGB(255, 47, 37, 37),
        //     leading: const Icon(Icons.color_lens),
        //     title: const Text('Theme Mode',
        //         style: TextStyle(
        //           fontSize: 18,
        //         )).tr(),
        //     // ignore: prefer_if_null_operators
        //     value: themeMode == null ? true : themeMode,
        //     onChanged: (val) {
        //       setState(() {
        //         _lightTheme = val;
        //         themeMode = val;
        //       });
        //       onThemeChanged(val, themeNotifier);
        //       debugPrint(_lightTheme.toString());
        //     }),
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
    );
  }
}
