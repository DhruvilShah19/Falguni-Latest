// ignore_for_file: unused_local_variable, avoid_print, use_build_context_synchronously, prefer_const_constructors

import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:geocode/geocode.dart';
import 'package:image_picker/image_picker.dart';
import 'package:map_location_picker/map_location_picker.dart';
// import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:falguni_app/Model/constant.dart';
import '../Model/courier.dart';
import '../Model/history.dart';

class AddCourier extends StatefulWidget {
  const AddCourier({super.key});

  @override
  State<AddCourier> createState() => _AddCourierState();
}

class _AddCourierState extends State<AddCourier> {
  // THEME
  static const Color kPrimary = Color(0xFF2F2525); // Espresso
  static const Color kGold = Color(0xFFC9A86A); // Premium gold
  static const Color kDark = Color(0xFF1C1515);

  String userAddress = '';
  String recipientAddress = '';
  num perKm = 0;
  num perKg = 0;
  String deliveryBoyID = '';

  // ---------------------------------------------------------------------------
  // MAP PICKERS
  // ---------------------------------------------------------------------------

  _navigateAndDisplaySelection(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return MapLocationPicker(
            apiKey: googleApiKey,
            popOnNextButtonTaped: true,
            currentLatLng: const LatLng(29.146727, 76.464895),
            onNext: (GeocodingResult? result) {
              if (result != null) {
                setState(() {
                  userAddress = result.formattedAddress ?? "";
                });
              }
            },
            onSuggestionSelected: (PlacesDetailsResponse? result) {
              if (result != null) {
                setState(() {
                  userAddress = result.result.formattedAddress ?? "";
                  Navigator.of(context).pop();
                  print('Selected Address is $userAddress');
                });
              }
            },
          );
        },
      ),
    );
  }

  _navigateAndDisplaySelection2(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return MapLocationPicker(
            apiKey: googleApiKey,
            popOnNextButtonTaped: true,
            currentLatLng: const LatLng(29.146727, 76.464895),
            onNext: (GeocodingResult? result) {
              if (result != null) {
                setState(() {
                  recipientAddress = result.formattedAddress ?? "";
                });
              }
            },
            onSuggestionSelected: (PlacesDetailsResponse? result) {
              if (result != null) {
                setState(() {
                  recipientAddress = result.result.formattedAddress ?? "";
                  Navigator.of(context).pop();
                  print('Selected Address is $recipientAddress');
                });
              }
            },
          );
        },
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // FIRESTORE CONFIG / PRICING
  // ---------------------------------------------------------------------------

  bool kgStatus = false;
  getKgStatus() {
    FirebaseFirestore.instance
        .collection('Courier System')
        .doc('Kg Courier')
        .get()
        .then((value) {
      setState(() {
        kgStatus = value['Kg Courier'];
      });
    });
  }

  num deliveryCommissionKg = 0;
  num deliveryCommissionKm = 0;
  num kg = 0;
  num km = 0;
  getCourierDetails() {
    FirebaseFirestore.instance
        .collection('Courier System')
        .doc('Courier Details')
        .get()
        .then((value) {
      setState(() {
        kg = value['kg'];
        km = value['km'];
        deliveryCommissionKg = value['deliveryCommissionKg'];
        deliveryCommissionKm = value['deliveryCommissionKm'];
      });
    });
  }

  num parcelID = 0;
  getParcelID() {
    FirebaseFirestore.instance
        .collection('Admin')
        .doc('Admin')
        .get()
        .then((value) {
      setState(() {
        parcelID = value['ParcelID'];
      });
    });
  }

  updateParcelID() {
    FirebaseFirestore.instance
        .collection('Admin')
        .doc('Admin')
        .update({'ParcelID': parcelID + 1});
  }

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------

  @override
  initState() {
    super.initState();
    getuserID();
    getKgStatus();
    getCourierDetails();
    getCurrencyDetails();
    assignRider();
    getOneSignalDetails();
    getParcelID();
  }

  String getOnesignalKey = '';
  String playerId = '';
  Timer? oneSignalTimer;
  String vendorToken = '';

  getOneSignalDetails() {
    FirebaseFirestore.instance
        .collection('Push notification Settings')
        .doc('OneSignal')
        .get()
        .then((value) {
      setState(() {
        getOnesignalKey = value['OnesignalKey'];
      });
    });
  }

  // ---------------------------------------------------------------------------
  // PRICING / DISTANCE
  // ---------------------------------------------------------------------------

  num distance = 0;
  num priceKg = 0;
  num priceKm = 0;
  num weight = 0;
  String getcurrencyName = '';
  String getcurrencyCode = '';
  String getcurrencySymbol = '';
  String parcelName = '';
  String sendersName = '';
  String sendersPhone = '';
  String sendersAddress = '';
  String recipientName = '';
  String deliveryDate = '';
  String deliveryBoysName = '';
  String deliveryBoysPhone = '';
  String deliveryBoysAddress = '';
  String recipientPhone = '';
  num price = 0;
  String parcelDescription = '';
  String parcelImage = '';
  String userName = '';
  String userPhone = '';
  String tokenID = '';

  getCurrencyDetails() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      setState(() {
        getcurrencyName = value['Currency name'];
        getcurrencyCode = value['Currency code'];
        getcurrencySymbol = value['Currency symbol'];
      });
    });
  }

  convertToCoordinate() async {
    GeoCode geoCode = GeoCode();
    if (userAddress != '' && recipientAddress != '') {
      Coordinates coordinates = await geoCode.forwardGeocoding(
        address: userAddress,
      );
      Coordinates coordinates2 = await geoCode.forwardGeocoding(
        address: recipientAddress,
      );

      double distanceInMeters = Geolocator.distanceBetween(
        coordinates.latitude!,
        coordinates.longitude!,
        coordinates2.latitude!,
        coordinates2.longitude!,
      );

      setState(() {
        distance = distanceInMeters;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // IMAGE
  // ---------------------------------------------------------------------------

  XFile? imageFile;
  bool? loading;
  final picker = ImagePicker();

  Future<void> getImage(context) async {
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    setState(() {
      imageFile = image;
      loading = true;
    });
    if (imageFile != null) {
      var snapshot = await FirebaseStorage.instance
          .ref()
          .child(imageFile!.path)
          .putFile(File(imageFile!.path));
      String downloadUrl =
          await snapshot.ref.getDownloadURL().whenComplete(() => setState(() {
                loading = false;
              }));

      setState(() {
        parcelImage = downloadUrl;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // FIRESTORE WRITE
  // ---------------------------------------------------------------------------

  final formKey = GlobalKey<FormState>();

  addCourier(CourierModel courierModel) {
    FirebaseFirestore.instance
        .collection('Courier')
        .add(courierModel.toMap())
        .then((value) => updateParcelID());

    updateHistoryDriver(
      HistoryModel(
        amount: '',
        paymentSystem: '',
        message: 'Hello, You have a logistics order please preview.',
        timeCreated: DateTime.now(),
      ),
    );
  }

  updateHistoryDriver(HistoryModel historyModel) {
    FirebaseFirestore.instance
        .collection('drivers')
        .doc(deliveryBoyID)
        .collection('Notifications')
        .add(historyModel.toMap());
  }

  DocumentReference? userRef;
  String userID = '';

  getuserID() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    User? user = auth.currentUser;
    firestore
        .collection('users')
        .doc(user!.uid)
        .snapshots()
        .listen((value) async {
      setState(() {
        userID = value['id'];
        userName = value['fullname'];
        userPhone = value['phonenumber'];
      });
    });
  }

  updateComission() {
    if (kgStatus == true) {
      return deliveryCommissionKg;
    } else {
      return deliveryCommissionKm;
    }
  }

  List<String> riders = [];
  int randomIndex = 0;

  assignRider() {
    return FirebaseFirestore.instance.collection('drivers').get().then((value) {
      for (var element in value.docs) {
        riders.add(element['id']);
        debugPrint('Delivery boys are $riders');
        if (riders.isEmpty) {
          Fluttertoast.showToast(
              msg: "Assigning a rider please wait...".tr(),
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.TOP,
              timeInSecForIosWeb: 1,
              backgroundColor: Theme.of(context).primaryColor,
              textColor: Colors.white,
              fontSize: 14.0);
        } else if (riders.isNotEmpty) {
          debugPrint(riders[randomIndex]);
          FirebaseFirestore.instance
              .collection('drivers')
              .doc(riders[randomIndex])
              .get()
              .then((value) {
            setState(() {
              deliveryBoysName = value['fullname'];
              deliveryBoyID = value['id'];
              deliveryBoysPhone = value['phone'];
              tokenID = value['tokenID'];
            });
          });

          Fluttertoast.showToast(
              msg: "Rider has been selected".tr(),
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.TOP,
              timeInSecForIosWeb: 1,
              backgroundColor: Theme.of(context).primaryColor,
              textColor: Colors.white,
              fontSize: 14.0);
        }

        setState(() {
          randomIndex = Random().nextInt(riders.length);
        });
      }
    });
  }

  Future<void> _callRider(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    await launchUrl(launchUri);
  }

  // ---------------------------------------------------------------------------
  // SMALL UI HELPERS
  // ---------------------------------------------------------------------------

  Widget _sectionTitle(String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text.tr(),
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 13,
          fontWeight: FontWeight.w600,
          letterSpacing: .4,
        ),
      ),
    );
  }

  InputDecoration _fieldDecoration(String hint) {
    return InputDecoration(
      hintText: hint.tr(),
      hintStyle: const TextStyle(color: Colors.white54, fontSize: 14),
      filled: true,
      fillColor: Colors.white.withOpacity(0.06),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.16)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.18)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: kGold, width: 1.2),
      ),
    );
  }

  Widget _addressChip({
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    final bool empty = value.isEmpty;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: empty ? Colors.white24 : kGold.withOpacity(0.7),
            width: 1,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Row(
          children: [
            Icon(Icons.location_on_outlined,
                color: empty ? Colors.white54 : kGold, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label.tr(),
                        style: const TextStyle(
                            color: Colors.white54, fontSize: 11)),
                    const SizedBox(height: 2),
                    Text(
                      empty ? "Tap to select".tr() : value,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style:
                          const TextStyle(color: Colors.white, fontSize: 13.5),
                    ),
                  ]),
            ),
            const SizedBox(width: 6),
            Icon(Icons.edit_location_alt_outlined,
                color: Colors.white54, size: 18),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    // still using your distance computation
    convertToCoordinate();

    final priceValue =
        kgStatus == false ? (distance.round() / 1000 * km) : (weight * kg);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          'Add New Courier'.tr(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w700,
            letterSpacing: .3,
          ),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF1C1515),
              Color(0xFF2F2525),
              Color(0xFF1C1515),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Form(
              key: formKey,
              child: Column(
                children: [
                  // MAIN CARD
                  Container(
                    padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.12),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.4),
                          blurRadius: 18,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // FROM ADDRESS
                        _sectionTitle('From:'),
                        const SizedBox(height: 8),
                        _addressChip(
                          label: "Sender Address",
                          value: userAddress.isEmpty ? "" : userAddress,
                          onTap: () => _navigateAndDisplaySelection(context),
                        ),

                        const SizedBox(height: 20),

                        // RECIPIENT ADDRESS
                        _sectionTitle('Recipient Address:'),
                        const SizedBox(height: 8),
                        _addressChip(
                          label: "Recipient Address",
                          value:
                              recipientAddress.isEmpty ? "" : recipientAddress,
                          onTap: () => _navigateAndDisplaySelection2(context),
                        ),

                        const SizedBox(height: 22),

                        // RECIPIENT NAME
                        _sectionTitle('Recipient Name'),
                        const SizedBox(height: 6),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          onChanged: (value) => setState(() {
                            recipientName = value;
                          }),
                          validator: (String? val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Required field'.tr();
                            }
                            return null;
                          },
                          decoration: _fieldDecoration('Recipient Name'),
                        ),

                        const SizedBox(height: 18),

                        // RECIPIENT PHONE
                        _sectionTitle('Recipient Phone'),
                        const SizedBox(height: 6),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          keyboardType: TextInputType.phone,
                          onChanged: (value) => setState(() {
                            recipientPhone = value;
                          }),
                          validator: (String? val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Required field'.tr();
                            }
                            return null;
                          },
                          decoration: _fieldDecoration('Recipient Phone'),
                        ),

                        const SizedBox(height: 18),

                        // PARCEL NAME
                        _sectionTitle('Parcel Name'),
                        const SizedBox(height: 6),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          onChanged: (value) => setState(() {
                            parcelName = value;
                          }),
                          validator: (String? val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Required field'.tr();
                            }
                            return null;
                          },
                          decoration: _fieldDecoration('Parcel Name'),
                        ),

                        const SizedBox(height: 18),

                        // WEIGHT
                        _sectionTitle('Parcel Weight In Kg'),
                        const SizedBox(height: 6),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          keyboardType: TextInputType.number,
                          onChanged: (value) {
                            setState(() {
                              weight = int.tryParse(value) ?? 0;
                            });
                          },
                          validator: (String? val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Required field'.tr();
                            }
                            return null;
                          },
                          decoration: _fieldDecoration('Parcel Weight In Kg'),
                        ),

                        const SizedBox(height: 18),

                        // DESCRIPTION
                        _sectionTitle('Parcel Description'),
                        const SizedBox(height: 6),
                        TextFormField(
                          style: const TextStyle(color: Colors.white),
                          maxLines: 4,
                          onChanged: (value) => setState(() {
                            parcelDescription = value;
                          }),
                          validator: (String? val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Required field'.tr();
                            }
                            return null;
                          },
                          decoration: _fieldDecoration('Parcel Description'),
                        ),

                        const SizedBox(height: 22),

                        // IMAGE
                        _sectionTitle('Parcel Image'),
                        const SizedBox(height: 10),
                        Center(
                          child: Column(
                            children: [
                              Container(
                                width: 140,
                                height: 140,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: Colors.white24,
                                    width: 1.2,
                                  ),
                                  color: Colors.white.withOpacity(0.04),
                                ),
                                child: parcelImage == ''
                                    ? Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: const [
                                          Icon(Icons.image_outlined,
                                              size: 38, color: Colors.white54),
                                          SizedBox(height: 8),
                                          Text(
                                            "No image selected",
                                            style: TextStyle(
                                                color: Colors.white60,
                                                fontSize: 12),
                                          ),
                                        ],
                                      )
                                    : ClipRRect(
                                        borderRadius: BorderRadius.circular(18),
                                        child: Image.file(
                                          File(imageFile!.path),
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                              ),
                              const SizedBox(height: 12),
                              InkWell(
                                onTap: () => getImage(context),
                                borderRadius: BorderRadius.circular(999),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: kGold,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: const [
                                      Icon(Icons.camera_alt,
                                          size: 18, color: kPrimary),
                                      SizedBox(width: 8),
                                      Text(
                                        "Upload Image",
                                        style: TextStyle(
                                          color: kPrimary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 22),

                        // PRICING + DISTANCE
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.16),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Admin selected calculation format:'.tr(),
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                kgStatus == true ? 'Per Kg $kg' : 'Per Km $km',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Distance:  ${distance.round() / 1000} Km',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Text(
                                    'Price:',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '$getcurrencySymbol ${priceValue.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      color: kGold,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 22),

                        // RIDER DETAILS
                        Text(
                          "Assigned Rider's Detail".tr(),
                          style: const TextStyle(
                            color: Colors.white70,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.12),
                            ),
                          ),
                          child: Column(
                            children: [
                              ListTile(
                                leading: const CircleAvatar(
                                  radius: 18,
                                  backgroundColor: Colors.white12,
                                  child: Icon(Icons.person,
                                      color: Colors.white, size: 18),
                                ),
                                title: Text(
                                  deliveryBoysName.isEmpty
                                      ? '-'
                                      : deliveryBoysName,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600),
                                ),
                                subtitle: Text(
                                  "Rider's name".tr(),
                                  style: const TextStyle(
                                      color: Colors.white60, fontSize: 12),
                                ),
                              ),
                              const Divider(
                                height: 0,
                                color: Colors.white10,
                              ),
                              ListTile(
                                leading: const Icon(Icons.phone,
                                    color: Colors.white70),
                                title: Text(
                                  deliveryBoysPhone.isEmpty
                                      ? '-'
                                      : deliveryBoysPhone,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w500),
                                ),
                                subtitle: Text(
                                  "Rider's phone".tr(),
                                  style: const TextStyle(
                                      color: Colors.white60, fontSize: 12),
                                ),
                                trailing: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: kGold),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                  ),
                                  onPressed: deliveryBoysPhone.isEmpty
                                      ? null
                                      : () => _callRider(deliveryBoysPhone),
                                  child: Text(
                                    'Call Rider'.tr(),
                                    style: const TextStyle(
                                      color: kGold,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // SUBMIT BUTTON
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: kGold,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 6,
                        shadowColor: Colors.black.withOpacity(0.6),
                      ),
                      onPressed: () {
                        if (formKey.currentState!.validate() &&
                            recipientAddress != '' &&
                            deliveryBoyID != '' &&
                            userAddress != '' &&
                            parcelImage != '') {
                          addCourier(
                            CourierModel(
                              status: false,
                              parcelName: parcelName,
                              sendersName: userName,
                              sendersPhone: userPhone,
                              sendersAddress: userAddress,
                              recipientName: recipientName,
                              recipientAddress: recipientAddress,
                              recipientPhone: recipientPhone,
                              deliveryDate: DateTime.now().toString(),
                              deliveryBoysName: '',
                              deliveryBoyID: deliveryBoyID,
                              deliveryBoysPhone: '',
                              deliveryBoysAddress: '',
                              weight: weight,
                              comission: (price * updateComission()) / 100,
                              price: priceValue,
                              km: km,
                              parcelDescription: parcelDescription,
                              parcelID: parcelID + 1,
                              parcelImage: parcelImage,
                              userUID: userID,
                            ),
                          );
                          Navigator.of(context).pop();
                        } else {
                          Fluttertoast.showToast(
                            msg: "Some fields are empty".tr(),
                            toastLength: Toast.LENGTH_SHORT,
                            gravity: ToastGravity.TOP,
                            timeInSecForIosWeb: 1,
                            backgroundColor: Theme.of(context).primaryColor,
                            textColor: Colors.white,
                            fontSize: 14.0,
                          );
                        }
                      },
                      child: Text(
                        'Submit'.tr(),
                        style: const TextStyle(
                          color: kPrimary,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
