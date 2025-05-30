// ignore_for_file: avoid_print, use_build_context_synchronously, unused_field

import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:flutter_signin_button/flutter_signin_button.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:gap/gap.dart';
import 'package:google_sign_in/google_sign_in.dart';
// import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:random_string/random_string.dart';
import 'package:rounded_loading_button_plus/rounded_loading_button.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../Database/database.dart';
import '../Providers/auth.dart';
import 'package:flutter_custom_clippers/flutter_custom_clippers.dart';
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

  @override
  void initState() {
    super.initState();
    _retrieveToken();
    _btnController1.stateStream.listen((value) {});
    getOneSignalDetails();

    // oneSignalTimer = Timer.periodic(
    //     const Duration(milliseconds: 100), (Timer t) => initOneSignal());
  }

  // initOneSignal() {
  //   if (getOnesignalKey != '') {
  //     OneSignal.shared.setLogLevel(OSLogLevel.verbose, OSLogLevel.none);
  //     debugPrint('One singal app id is jjjjjj');
  //     OneSignal.shared.setAppId(getOnesignalKey);
  //     debugPrint('$getOnesignalKey is firebase oneSignal key');
  //     OneSignal.shared
  //         .promptUserForPushNotificationPermission()
  //         .then((accepted) {
  //       debugPrint("Accepted permission: $accepted");
  //     });
  //     oneSignalTimer!.cancel();
  //   }
  // }

  // void _handleGetDeviceState() async {
  //   debugPrint("Getting DeviceState");
  //   var deviceState = await OneSignal.shared.getDeviceState();
  //   setState(() {
  //     playerId = deviceState!.userId!;
  //   });

  //   debugPrint('$playerId is your player ID');
  // }

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

  Future<User> signInWithFacebook() async {
    // Start the sign-in process with Facebook
    final LoginResult loginResult = await FacebookAuth.instance.login();

    // Authenticate with Firebase using the Facebook credential
    final AccessToken? accessToken = loginResult.accessToken;
    final AuthCredential credential =
        FacebookAuthProvider.credential(accessToken!.token);
    final User? user = (await auth.signInWithCredential(credential)).user;
    // Check if the user already exists in Firestore
    final DocumentSnapshot<Map<String, dynamic>> documentSnapshot =
        await FirebaseFirestore.instance
            .collection('users')
            .doc(user!.uid)
            .get();
    if (!documentSnapshot.exists) {
      await Database(uid: user.uid)
          .updateUserData(
              user.email!, user.displayName!, user.phoneNumber!, '', '')
          .then((value) {});

      FirebaseFirestore.instance.collection('users').doc(user.uid).update(
          {'personalReferralCode': randomAlphaNumeric(8)}).then((value) {
        Navigator.pushNamed(context, '/bottomNav');
      });
      Fluttertoast.showToast(
          msg: "Your account has been created sucessfully".tr(),
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          fontSize: 14.0);
    } else {
      Fluttertoast.showToast(
              msg: "Welcome".tr(),
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.TOP,
              timeInSecForIosWeb: 1,
              fontSize: 14.0)
          .then((value) {
        Navigator.pushNamed(context, '/bottomNav');
      });
    }

    return user;
  }

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

  // Future<UserCredential> signInWithApple() async {
  //   // To prevent replay attacks with the credential returned from Apple, we
  //   // include a nonce in the credential request. When signing in with
  //   // Firebase, the nonce in the id token returned by Apple, is expected to
  //   // match the sha256 hash of `rawNonce`.
  //   final rawNonce = generateNonce();
  //   final nonce = sha256ofString(rawNonce);

  //   // Request credential for the currently signed in Apple account.
  //   final appleCredential = await SignInWithApple.getAppleIDCredential(
  //     scopes: [
  //       AppleIDAuthorizationScopes.email,
  //       AppleIDAuthorizationScopes.fullName,
  //     ],
  //     nonce: nonce,
  //   );

  //   // Create an OAuthCredential from the credential returned by Apple.
  //   final oauthCredential = OAuthProvider("apple.com").credential(
  //     idToken: appleCredential.identityToken,
  //     rawNonce: rawNonce,
  //   );

  //   // Sign in the user with Firebase.
  //   return await FirebaseAuth.instance.signInWithCredential(oauthCredential);
  // }
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
      // if (user != null) {
      //   // Prepare user data to save in Firestore
      //   // final userData = {
      //   //   'uid': user.uid,
      //   //   'email': appleCredential.email ?? user.email ?? 'No email provided',
      //   //   'displayName':
      //   //       appleCredential.givenName != null && appleCredential.familyName != null
      //   //           ? '${appleCredential.givenName} ${appleCredential.familyName}'
      //   //           : user.displayName ?? 'No name provided',
      //   //   'createdAt': FieldValue.serverTimestamp(), // Timestamp of creation
      //   //   'lastSignIn': FieldValue.serverTimestamp(), // Last sign-in time
      //   // };

      //   // Save user data to Firestore in the 'users' collection
      //   FirebaseFirestore.instance.collection('users').doc(user.uid).set({
      //     'email': user.email,
      //     'fullname': user.displayName,
      //     'created': DateFormat.yMMMMEEEEd().format(DateTime.now()).toString(),
      //     'id': user.uid,
      //     'phone': '',
      //     'photoUrl': '',
      //     'address': '',
      //     'DeliveryAddress': '',
      //     'HouseNumber': '',
      //     'ClosestBustStop': '',
      //     'DeliveryAddressID': '',
      //     'CurrentMarketID': '',
      //     'deliveryFee': 0,
      //     'wallet': 0,
      //     'tokenID': playerId,
      //     'referralCode': '',
      //     'awardReferral': false,
      //     'personalReferralCode': '',
      //     'Coupon Reward': 0
      //   });

      //   print('User data successfully saved to Firestore');
      // } else {
      //   print('No user found after sign-in');
      // }
    } catch (e) {
      print('Error during Apple sign-in or Firestore save: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    // _handleGetDeviceState();
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: FlutterCloseAppPage(
        interval: 2,
        condition: true,
        onCloseFailed: () {
          // The interval is more than 2 seconds, or the return key is pressed for the first time
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Press again to exit'),
          ));
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const SizedBox(height: 100),
            Expanded(
              flex: 1,
              child: Image.asset(
                // 'assets/image/splash-new.png',
                'assets/image/LoginBoy.png',
                height: 110,
                width: 110,
                fit: BoxFit.cover,
              ),
            ),
            Flexible(
              flex: 5,
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(0.0),
                      child: const Text('Login to your account',
                              style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold))
                          .tr(),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          const Flexible(
                              flex: 1,
                              child: Icon(
                                Icons.email_outlined,
                                size: 40,
                                color: Colors.grey,
                              )),
                          const SizedBox(
                            width: 10,
                          ),
                          Flexible(
                            flex: 6,
                            child: TextFormField(
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
                                  hintText: 'Email'.tr(),
                                  focusColor:
                                      const Color.fromARGB(255, 47, 37, 37)),
                            ),
                          )
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          const Flexible(
                              flex: 1,
                              child: Icon(
                                Icons.lock_open_outlined,
                                size: 40,
                                color: Colors.grey,
                              )),
                          const SizedBox(
                            width: 10,
                          ),
                          Flexible(
                            flex: 6,
                            child: TextFormField(
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
                                hintText: 'Password'.tr(),
                                suffixIcon: showPassword == true
                                    ? InkWell(
                                        onTap: () {
                                          setState(() {
                                            showPassword = false;
                                          });
                                        },
                                        child: const Icon(
                                          Icons.visibility,
                                          color: Colors.grey,
                                          size: 30,
                                        ),
                                      )
                                    : InkWell(
                                        onTap: () {
                                          setState(() {
                                            showPassword = true;
                                          });
                                        },
                                        child: const Icon(
                                          Icons.visibility_off,
                                          color: Colors.grey,
                                          size: 30,
                                        ),
                                      ),
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          InkWell(
                            onTap: () {
                              Navigator.pushNamed(context, '/forgot-password');
                            },
                            child: Row(
                              children: [
                                Text('FORGOT PASSWORD',
                                        style: TextStyle(
                                            color: Colors.blue.shade800))
                                    .tr(),
                                Text('?',
                                    style:
                                        TextStyle(color: Colors.blue.shade800))
                              ],
                            ),
                          ),
                          const SizedBox(
                            width: 20,
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    RoundedLoadingButton(
                      color: Colors.blue,
                      successIcon: Icons.done,
                      failedIcon: Icons.error,
                      controller: _btnController1,
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          _doSomething(_btnController1, email, password,
                              context, playerId);
                        } else {
                          _btnController1.reset();
                        }
                      },
                      child: const Text('Login',
                              style: TextStyle(color: Colors.white))
                          .tr(),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            const Text(
                              'New on',
                              style: TextStyle(color: Colors.grey),
                            ).tr(),
                            const SizedBox(
                              width: 5,
                            ),
                            const Text(
                              'Falguni eShop?',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                        const SizedBox(width: 10),
                        InkWell(
                          onTap: () {
                            Navigator.of(context).pushNamed('/signup');
                          },
                          child: Text(
                            'CREATE AN ACCOUNT',
                            style: TextStyle(
                                color: Colors.blue.shade800,
                                fontWeight: FontWeight.bold),
                          ).tr(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Continue as a',
                          style: TextStyle(color: Colors.grey),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pushNamed('/bottomNav');
                          },
                          child: Text(
                            'Guest',
                            style: TextStyle(
                                fontSize: 20,
                                color: Colors.blue.shade800,
                                fontWeight: FontWeight.bold),
                          ).tr(),
                        ),
                      ],
                    ),
                    // SizedBox(
                    //   child: InkWell(
                    //     onTap: () {
                    //       _signInWithGoogle();
                    //     },
                    //     child: Image.asset(
                    //       'assets/image/google.png',
                    //       width: MediaQuery.of(context).size.width * 1.5,
                    //       height: 50,
                    //     ),
                    //   ),
                    // ),
                    // with custom text
                    SizedBox(
                      width: MediaQuery.of(context).size.width / 1.07,
                      height: 50,
                      child: SignInButton(
                        Buttons.Google,
                        text: "Sign up with Google",
                        onPressed: () {
                          _signInWithGoogle();
                        },
                      ),
                    ),
                    const Gap(10),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: SignInWithAppleButton(onPressed: signInWithApple),
                    ),
                  ],
                ),
              ),
            ),
            Flexible(
              flex: 1,
              child: ClipPath(
                clipper: OvalTopBorderClipper(),
                child: Container(color: const Color.fromARGB(255, 47, 37, 37)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
