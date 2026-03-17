// ignore_for_file: avoid_print, use_build_context_synchronously, unused_field, deprecated_member_use

import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:random_string/random_string.dart';
import 'package:rounded_loading_button_plus/rounded_loading_button.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../Providers/auth.dart';
import 'package:flutter_close_app/flutter_close_app.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String email = '';
  String password = '';
  final _formKey = GlobalKey<FormState>();
  Timer? oneSignalTimer;
  String playerId = '';
  String getOnesignalKey = '';
  bool showPassword = true;

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  @override
  void initState() {
    super.initState();
    _retrieveToken();
    _btnController1.stateStream.listen((value) {});
    getOneSignalDetails();
  }

  getOneSignalDetails() {
    if (getOnesignalKey == '') {
      FirebaseFirestore.instance
          .collection('Push notification Settings')
          .doc('OneSignal')
          .snapshots()
          .listen((value) {
        setState(() {
          getOnesignalKey = value['OnesignalKey'];
        });
      });
    }
  }

  final RoundedLoadingButtonController _btnController1 =
      RoundedLoadingButtonController();

  void _doSomething(RoundedLoadingButtonController controller, String email,
      String password, BuildContext context, String playerId) async {
    AuthService().signIn(email, password, context, playerId).then((value) {
      if (AuthService().loginStatus == true) {
        controller.success();
      } else {
        controller.reset();
      }
    });
  }

  final GoogleSignIn googleSignIn = GoogleSignIn(scopes: ['profile', 'email']);
  final FirebaseAuth auth = FirebaseAuth.instance;
  final FirebaseFirestore firestore = FirebaseFirestore.instance;

  Future<User> _signInWithGoogle() async {
    // Start the sign-in process with Google
    final GoogleSignInAccount? googleUser = await googleSignIn.signIn();

    // Authenticate with Firebase using the Google credential
    final GoogleSignInAuthentication googleAuth =
        await googleUser!.authentication;
    final AuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    UserCredential authResult = await auth.signInWithCredential(credential);
    User? user = authResult.user;

    await FirebaseFirestore.instance
        .collection('users')
        .doc(user!.uid)
        .get()
        .then((value) async {
      if (value.exists) {
        Fluttertoast.showToast(
                msg: "Welcome.".tr(),
                toastLength: Toast.LENGTH_SHORT,
                gravity: ToastGravity.TOP,
                timeInSecForIosWeb: 1,
                fontSize: 14.0)
            .then((value) {
          Navigator.pushNamed(context, '/bottomNav');
        });
      } else {
        print('User name is ${user.uid}');
        FirebaseFirestore.instance.collection('users').doc(user.uid).set({
          'email': user.email,
          'fullname': user.displayName,
          'created': DateFormat.yMMMMEEEEd().format(DateTime.now()).toString(),
          'id': user.uid,
          'phone': '',
          'photoUrl': '',
          'address': '',
          'DeliveryAddress': '',
          'HouseNumber': '',
          'ClosestBustStop': '',
          'DeliveryAddressID': '',
          'CurrentMarketID': '',
          'deliveryFee': 0,
          'wallet': 0,
          'tokenID': playerId,
          'referralCode': '',
          'awardReferral': false,
          'personalReferralCode': '',
          'Coupon Reward': 0
        });

        FirebaseFirestore.instance.collection('users').doc(user.uid).update(
            {'personalReferralCode': randomAlphaNumeric(8)}).then((value) {
          Navigator.pushNamed(context, '/bottomNav');
        });
        Fluttertoast.showToast(
            msg: "Please update your phone number in your profile".tr(),
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.TOP,
            timeInSecForIosWeb: 1,
            fontSize: 14.0);
      }
    });

    return user;
  }

  // Future<User> signInWithFacebook() async {
  //   // Start the sign-in process with Facebook
  //   final LoginResult loginResult = await FacebookAuth.instance.login();

  //   // Authenticate with Firebase using the Facebook credential
  //   final AccessToken? accessToken = loginResult.accessToken;
  //   final AuthCredential credential =
  //       FacebookAuthProvider.credential(accessToken!.token);
  //   final User? user = (await auth.signInWithCredential(credential)).user;
  //   // Check if the user already exists in Firestore
  //   final DocumentSnapshot<Map<String, dynamic>> documentSnapshot =
  //       await FirebaseFirestore.instance
  //           .collection('users')
  //           .doc(user!.uid)
  //           .get();
  //   if (!documentSnapshot.exists) {
  //     await Database(uid: user.uid)
  //         .updateUserData(
  //             user.email!, user.displayName!, user.phoneNumber!, '', '')
  //         .then((value) {});

  //     FirebaseFirestore.instance.collection('users').doc(user.uid).update(
  //         {'personalReferralCode': randomAlphaNumeric(8)}).then((value) {
  //       Navigator.pushNamed(context, '/bottomNav');
  //     });
  //     Fluttertoast.showToast(
  //         msg: "Your account has been created sucessfully".tr(),
  //         toastLength: Toast.LENGTH_SHORT,
  //         gravity: ToastGravity.TOP,
  //         timeInSecForIosWeb: 1,
  //         fontSize: 14.0);
  //   } else {
  //     Fluttertoast.showToast(
  //             msg: "Welcome".tr(),
  //             toastLength: Toast.LENGTH_SHORT,
  //             gravity: ToastGravity.TOP,
  //             timeInSecForIosWeb: 1,
  //             fontSize: 14.0)
  //         .then((value) {
  //       Navigator.pushNamed(context, '/bottomNav');
  //     });
  //   }

  //   return user;
  // }

  void _retrieveToken() async {
    String? token = await FirebaseMessaging.instance.getToken();
    setState(() {
      playerId = token!;
    });

    print('FCM Token: $token');
  }

  String? _statusMessage;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  String generateNonce([int length = 32]) {
    const charset =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)])
        .join();
  }

  /// Returns the sha256 hash of [input] in hex notation.
  String sha256ofString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  Future<void> signInWithApple() async {
    try {
      // To prevent replay attacks with the credential returned from Apple, we
      // include a nonce in the credential request.
      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      // Request credential for the currently signed in Apple account.
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      // Create an OAuthCredential from the credential returned by Apple.
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
        rawNonce: rawNonce,
      );
      // return await FirebaseAuth.instance.signInWithCredential(oauthCredential);
      // Sign in the user with Firebase.
      final UserCredential userCredential =
          await FirebaseAuth.instance.signInWithCredential(oauthCredential);

      // Get the authenticated user
      final User? user = userCredential.user;
      await FirebaseFirestore.instance
          .collection('users')
          .doc(user!.uid)
          .get()
          .then((value) {
        if (value.exists) {
          Fluttertoast.showToast(
                  msg: "Welcome.".tr(),
                  toastLength: Toast.LENGTH_SHORT,
                  gravity: ToastGravity.TOP,
                  timeInSecForIosWeb: 1,
                  fontSize: 14.0)
              .then((value) {
            Navigator.pushNamed(context, '/bottomNav');
          });
        } else {
          print('User name is ${user.uid}');
          FirebaseFirestore.instance.collection('users').doc(user.uid).set({
            'email': user.email,
            'fullname': user.displayName,
            'created':
                DateFormat.yMMMMEEEEd().format(DateTime.now()).toString(),
            'id': user.uid,
            'phone': '',
            'photoUrl': '',
            'address': '',
            'DeliveryAddress': '',
            'HouseNumber': '',
            'ClosestBustStop': '',
            'DeliveryAddressID': '',
            'CurrentMarketID': '',
            'deliveryFee': 0,
            'wallet': 0,
            'tokenID': playerId,
            'referralCode': '',
            'awardReferral': false,
            'personalReferralCode': randomAlphaNumeric(8),
            'Coupon Reward': 0
          }).then((value) {
            Navigator.pushNamed(context, '/bottomNav');
          });
          Fluttertoast.showToast(
              msg: "Please update your phone number in your profile".tr(),
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.TOP,
              timeInSecForIosWeb: 1,
              fontSize: 14.0);
        }
      });
    } catch (e) {
      print('Error during Apple sign-in or Firestore save: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    // _handleGetDeviceState();
    return Scaffold(
      backgroundColor: kBgTop,
      body: Container(
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: FlutterCloseAppPage(
          interval: 2,
          condition: true,
          onCloseFailed: () {
            // The interval is more than 2 seconds, or the return key is pressed for the first time
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Press again to exit'),
            ));
          },
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),
                  const Text(
                    "Welcome Back",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ).tr(),
                  const SizedBox(height: 8),
                  const Text(
                    "Sign in to continue",
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 16,
                    ),
                  ).tr(),
                  const SizedBox(height: 40),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          keyboardType: TextInputType.emailAddress,
                          validator: (value) {
                            if (value!.isEmpty) {
                              return 'Required field'.tr();
                            } else {
                              return null;
                            }
                          },
                          onChanged: (value) {
                            setState(() {
                              email = value;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.05),
                            hintText: 'Email'.tr(),
                            hintStyle: const TextStyle(color: Colors.white38),
                            prefixIcon: const Icon(Icons.email_outlined,
                                color: kGold, size: 22),
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 16, horizontal: 20),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: kGold),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          validator: (value) {
                            if (value!.isEmpty) {
                              return 'Required field'.tr();
                            } else {
                              return null;
                            }
                          },
                          onChanged: (value) {
                            setState(() {
                              password = value;
                            });
                          },
                          obscureText: showPassword,
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.05),
                            hintText: 'Password'.tr(),
                            hintStyle: const TextStyle(color: Colors.white38),
                            prefixIcon: const Icon(Icons.lock_outline,
                                color: kGold, size: 22),
                            suffixIcon: IconButton(
                              icon: Icon(
                                showPassword
                                    ? Icons.visibility
                                    : Icons.visibility_off,
                                color: Colors.white38,
                                size: 20,
                              ),
                              onPressed: () {
                                setState(() {
                                  showPassword = !showPassword;
                                });
                              },
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 16, horizontal: 20),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: kGold),
                            ),
                          ),
                        ),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {
                              Navigator.pushNamed(context, '/forgot-password');
                            },
                            child: const Text(
                              'Forgot Password?',
                              style: TextStyle(
                                  color: kGold, fontWeight: FontWeight.w600),
                            ).tr(),
                          ),
                        ),
                        const SizedBox(height: 20),
                        RoundedLoadingButton(
                          color: kGold,
                          successIcon: Icons.done,
                          failedIcon: Icons.error,
                          controller: _btnController1,
                          width: MediaQuery.of(context).size.width,
                          height: 50,
                          borderRadius: 12,
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {
                              _doSomething(_btnController1, email, password,
                                  context, playerId);
                            } else {
                              _btnController1.reset();
                            }
                          },
                          child: const Text(
                            'LOGIN',
                            style: TextStyle(
                                color: kBgTop,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                letterSpacing: 1),
                          ).tr(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  const Row(
                    children: [
                      Expanded(child: Divider(color: Colors.white24)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text("Or continue with",
                            style:
                                TextStyle(color: Colors.white54, fontSize: 12)),
                      ),
                      Expanded(child: Divider(color: Colors.white24)),
                    ],
                  ),
                  const SizedBox(height: 30),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      InkWell(
                        onTap: () {
                          _signInWithGoogle();
                        },
                        borderRadius: BorderRadius.circular(50),
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white12),
                          ),
                          child: Center(
                            child: Image.network(
                              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png',
                              height: 24,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 24),
                      InkWell(
                        onTap: signInWithApple,
                        borderRadius: BorderRadius.circular(50),
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white12),
                          ),
                          child: const Center(
                            child: Icon(Icons.apple,
                                color: Colors.white, size: 28),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? ",
                              style: TextStyle(color: Colors.white60))
                          .tr(),
                      GestureDetector(
                        onTap: () {
                          Navigator.of(context).pushNamed('/signup');
                        },
                        child: const Text(
                          "Sign Up",
                          style: TextStyle(
                              color: kGold, fontWeight: FontWeight.bold),
                        ).tr(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: () {
                        Navigator.of(context).pushNamed('/bottomNav');
                      },
                      child: const Text(
                        "Continue as Guest",
                        style: TextStyle(color: Colors.white54, fontSize: 14),
                      ).tr(),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
