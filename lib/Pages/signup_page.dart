// ignore_for_file: avoid_print

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_pw_validator/flutter_pw_validator.dart';
import 'package:country_pickers/country.dart';
import 'package:rounded_loading_button_plus/rounded_loading_button.dart';
import '../Providers/auth.dart';
import 'package:country_pickers/country_pickers.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  String fullname = '';
  String email = '';
  String phone = '';
  String password = '';
  final _formKey = GlobalKey<FormState>();
  Timer? oneSignalTimer;
  String playerId = '';
  String getOnesignalKey = '';
  String referralCode = '';
  bool referralStatus = false;
  num? reward;
  bool showPassword = true;

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  @override
  void initState() {
    _btnController1.stateStream.listen((value) {});
    super.initState();
    getReferralStatus();
    _retrieveToken();
    getOneSignalDetails();
    // _handleGetDeviceState();

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

  getReferralStatus() {
    FirebaseFirestore.instance
        .collection('Referral System')
        .doc('Referral System')
        .snapshots()
        .listen((value) {
      setState(() {
        referralStatus = value['Status'];
        reward = value['Referral Amount'];
      });
    });
  }

  final RoundedLoadingButtonController _btnController1 =
      RoundedLoadingButtonController();

  void _doSomething(
      RoundedLoadingButtonController controller,
      String email,
      dynamic password,
      String fullname,
      String phone,
      BuildContext context,
      String referralCode,
      num? reward,
      bool referralStatus,
      String playerId) async {
    AuthService()
        .signUp(email, password, fullname, phone, context, referralCode, reward,
            referralStatus, playerId)
        .then((value) {
      if (AuthService().signupStatus == true) {
        controller.success();
      } else {
        controller.reset();
      }
    });
  }

  Widget _buildDialogItem(Country country) => Row(
        mainAxisAlignment: MainAxisAlignment.start,
        // mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          // CountryPickerUtils.getDefaultFlagImage(country),
          Text("+${country.phoneCode}", style: const TextStyle(fontSize: 13)),
          const SizedBox(width: 8.0),
          Flexible(
              child:
                  Text(country.isoCode, style: const TextStyle(fontSize: 13))),
          // const SizedBox(width: 8.0),
        ],
      );
  void _openCountryPickerDialog() => showDialog(
        context: context,
        builder: (context) => Theme(
          data: Theme.of(context).copyWith(primaryColor: Colors.pink),
          child: CountryPickerDialog(
            titlePadding: const EdgeInsets.all(8.0),
            searchCursorColor: Colors.pinkAccent,
            searchInputDecoration: const InputDecoration(hintText: 'Search...'),
            isSearchable: true,
            title: const Text('Select your phone code'),
            onValuePicked: (Country country) {
              setState(() {
                _selectedDialogCountry = country;
                selectedCode = country.phoneCode;
              });
            },
            itemBuilder: _buildDialogItem,
            priorityList: [
              CountryPickerUtils.getCountryByIsoCode('TR'),
              CountryPickerUtils.getCountryByIsoCode('US'),
            ],
          ),
        ),
      );

  String selectedCode = '91';
  Country _selectedDialogCountry =
      CountryPickerUtils.getCountryByPhoneCode('91');
  final GlobalKey<FlutterPwValidatorState> validatorKey =
      GlobalKey<FlutterPwValidatorState>();
  final TextEditingController controller = TextEditingController();
  bool isPasswordCorrect = false;

  void _retrieveToken() async {
    String? token = await FirebaseMessaging.instance.getToken();
    setState(() {
      playerId = token!;
    });

    print('FCM Token: $token');
  }

  @override
  Widget build(BuildContext context) {
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
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                const SizedBox(height: 20),
                const Text(
                  "Create Account",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ).tr(),
                const SizedBox(height: 8),
                const Text(
                  "Sign up to get started",
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
                        keyboardType: TextInputType.name,
                        validator: (value) {
                          if (value!.isEmpty) {
                            return 'Required field'.tr();
                          } else {
                            return null;
                          }
                        },
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.05),
                          hintText: 'Full name'.tr(),
                          hintStyle: const TextStyle(color: Colors.white38),
                          prefixIcon: const Icon(Icons.person_outline,
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
                        onChanged: (value) {
                          setState(() {
                            fullname = value;
                          });
                        },
                      ),
                      const SizedBox(height: 20),
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
                      Row(
                        children: [
                          InkWell(
                            onTap: _openCountryPickerDialog,
                            child: Container(
                              height: 56,
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.transparent),
                              ),
                              child: Row(
                                children: [
                                  Text("+${_selectedDialogCountry.phoneCode}",
                                      style: const TextStyle(
                                          fontSize: 14, color: Colors.white)),
                                  const SizedBox(width: 8.0),
                                  Text(_selectedDialogCountry.isoCode,
                                      style: const TextStyle(
                                          fontSize: 14, color: Colors.white)),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.arrow_drop_down,
                                      color: Colors.white54),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextFormField(
                              style: const TextStyle(color: Colors.white),
                              maxLength: 10,
                              validator: (value) {
                                if (value!.isEmpty) {
                                  return 'Required field'.tr();
                                } else {
                                  return null;
                                }
                              },
                              keyboardType: TextInputType.phone,
                              onChanged: (value) {
                                setState(() {
                                  phone = value;
                                });
                              },
                              decoration: InputDecoration(
                                counterText: '',
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.05),
                                hintText: 'Mobile number'.tr(),
                                hintStyle:
                                    const TextStyle(color: Colors.white38),
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
                          )
                        ],
                      ),
                      if (referralStatus == true) ...[
                        const SizedBox(height: 20),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          onChanged: (value) {
                            setState(() {
                              referralCode = value;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.05),
                            hintText: 'Referral Code'.tr(),
                            hintStyle: const TextStyle(color: Colors.white38),
                            prefixIcon: const Icon(
                                Icons.person_add_alt_1_outlined,
                                color: kGold,
                                size: 22),
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
                      ],
                      const SizedBox(height: 20),
                      TextFormField(
                        style: const TextStyle(color: Colors.white),
                        controller: controller,
                        obscureText: showPassword,
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
                      const SizedBox(height: 20),
                      FlutterPwValidator(
                        key: validatorKey,
                        controller: controller,
                        minLength: 8,
                        uppercaseCharCount: 1,
                        numericCharCount: 1,
                        specialCharCount: 1,
                        normalCharCount: 3,
                        width: MediaQuery.of(context).size.width - 48,
                        height: 130,
                        defaultColor: Colors.white54,
                        successColor: kGold,
                        failureColor: Colors.white54,
                        onSuccess: () {
                          print("MATCHED $isPasswordCorrect");
                          setState(() {
                            isPasswordCorrect = true;
                          });
                        },
                        onFail: () {
                          print("NOT MATCHED");
                        },
                      ),
                      const SizedBox(height: 30),
                      RoundedLoadingButton(
                        color: kGold,
                        successIcon: Icons.done,
                        failedIcon: Icons.error,
                        controller: _btnController1,
                        width: MediaQuery.of(context).size.width,
                        height: 50,
                        borderRadius: 12,
                        onPressed: () {
                          if (_formKey.currentState!.validate() &&
                              isPasswordCorrect == true) {
                            _doSomething(
                                _btnController1,
                                email,
                                password,
                                fullname,
                                '+$selectedCode$phone',
                                context,
                                referralCode,
                                reward,
                                referralStatus,
                                playerId);
                          } else {
                            _btnController1.reset();
                          }
                        },
                        child: const Text('SIGN UP',
                                style: TextStyle(
                                    color: kBgTop,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    letterSpacing: 1))
                            .tr(),
                      ),
                      const SizedBox(height: 30),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text("Already have an account? ",
                                  style: TextStyle(color: Colors.white60))
                              .tr(),
                          GestureDetector(
                            onTap: () {
                              Navigator.pushNamed(context, '/login');
                            },
                            child: const Text(
                              "Login",
                              style: TextStyle(
                                  color: kGold, fontWeight: FontWeight.bold),
                            ).tr(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
