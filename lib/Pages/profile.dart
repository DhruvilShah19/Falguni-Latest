// // ignore_for_file: avoid_print, unused_local_variable

// import 'dart:async';
// import 'dart:io';
// import 'package:cached_network_image/cached_network_image.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:firebase_storage/firebase_storage.dart';
// import 'package:flutter/material.dart';
// import 'package:easy_localization/easy_localization.dart';
// import 'package:flutter_custom_clippers/flutter_custom_clippers.dart';
// import 'package:flutter_spinkit/flutter_spinkit.dart';
// import 'package:image_picker/image_picker.dart';
// import 'package:falguni_app/Model/constant.dart';
// import 'package:map_location_picker/map_location_picker.dart';
// import '../Providers/auth.dart';

// class ProfilePage extends StatefulWidget {
//   final bool isbottomNav;
//   const ProfilePage({super.key, required this.isbottomNav});

//   @override
//   State<ProfilePage> createState() => _ProfilePageState();
// }

// class _ProfilePageState extends State<ProfilePage> {
//   DocumentReference? userRef;
//   DocumentReference? userDetails;
//   String fullname = '';
//   String email = '';
//   String phone = '';
//   String password = '';
//   final _formKey = GlobalKey<FormState>();
//   String userPic = '';
//   String address = 'Address';
//   String userPicMain = '';
//   String addressMain = '';
//   num cartQuantity = 0;
//   String referralCode = '';

//   @override
//   void initState() {
//     super.initState();
//     _getUserDetails();
//     _getUserDoc();
//   }

//   Future<void> _getUserDoc() async {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     final FirebaseFirestore firestore = FirebaseFirestore.instance;

//     User? user = auth.currentUser;
//     setState(() {
//       userRef = firestore.collection('users').doc(user!.uid);
//     });
//   }

//   Future<void> _getUserDetails() async {
//     final FirebaseAuth auth = FirebaseAuth.instance;
//     final FirebaseFirestore firestore = FirebaseFirestore.instance;

//     User? user = auth.currentUser;
//     setState(() {
//       userDetails = firestore
//           .collection('users')
//           .doc(user!.uid)
//           .snapshots()
//           .listen((value) {
//         setState(() {
//           email = value['email'];
//           fullname = value['fullname'];
//           phone = value['phone'];
//           userPic = value['photoUrl'];
//           address = value['address'];
//           referralCode = value['personalReferralCode'];
//         });
//       }) as DocumentReference<Object?>?;
//     });
//   }

//   _navigateAndDisplaySelection(BuildContext context) async {
//     final result = await Navigator.push(
//       context,
//       MaterialPageRoute(
//         builder: (context) {
//           return MapLocationPicker(
//             apiKey: googleApiKey,
//             popOnNextButtonTaped: true,
//             currentLatLng: const LatLng(29.146727, 76.464895),
//             onNext: (GeocodingResult? result) {
//               if (result != null) {
//                 setState(() {
//                   address = result.formattedAddress ?? "";
//                 });
//               }
//             },
//             onSuggestionSelected: (PlacesDetailsResponse? result) {
//               if (result != null) {
//                 setState(() {
//                   // selectedPlace = result;
//                   address = result.result.formattedAddress ?? "";
//                   Navigator.of(context).pop();
//                   print('Seleceted Address is$address');
//                 });
//               }
//             },
//           );
//         },
//       ),
//     );
//     // setState(() {
//     //   address = result ?? '';
//     //   debugPrint(address);
//     // });
//   }

//   // Select and image from the gallery or take a picture with the camera
//   // Then upload to Firebase Storage

//   XFile? imageFile;
//   bool? loading;
//   Future<void> _upload() async {
//     final ImagePicker picker = ImagePicker();
//     final XFile? image = await picker.pickImage(source: ImageSource.gallery);

//     setState(() {
//       imageFile = image;
//       loading = true;
//     });
//     if (imageFile != null) {
//       var snapshot = await FirebaseStorage.instance
//           .ref()
//           .child(imageFile!.path)
//           .putFile(File(imageFile!.path));
//       String downloadUrl =
//           await snapshot.ref.getDownloadURL().whenComplete(() => setState(() {
//                 loading = false;
//               }));

//       setState(() {
//         userPicMain = downloadUrl;
//       });
//       debugPrint(userPicMain);
//     }
//   }

//   whenProfilePicIsempty() {
//     if (userPicMain == '') {
//       return userPic;
//     } else {
//       return userPicMain;
//     }
//   }

//   getCart() {
//     if (userRef == null) {
//       return null;
//     } else {
//       userRef!.collection('Cart').get().then((val) {
//         num tempTotal =
//             val.docs.fold(0, (tot, doc) => tot + doc.data()['quantity']);

//         setState(() {
//           cartQuantity = tempTotal;
//         });
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       resizeToAvoidBottomInset: true,
//       appBar: AppBar(
//         automaticallyImplyLeading: widget.isbottomNav == true ? false : true,
//         iconTheme: Theme.of(context).iconTheme,
//         titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
//         backgroundColor: Theme.of(context).colorScheme.surface,
//         centerTitle: true,
//         elevation: 0,
//         title: const Text(
//           'PROFILE',
//         ).tr(),
//       ),
//       body: SingleChildScrollView(
//         child: SizedBox(
//           height: MediaQuery.of(context).size.height,
//           child: Column(
//             children: [
//               Form(
//                 key: _formKey,
//                 child: Expanded(
//                   flex: 7,
//                   child: Column(
//                     children: [
//                       Padding(
//                         padding: const EdgeInsets.all(8.0),
//                         child: Row(
//                           children: [
//                             const Text('YOUR PERSONAL DATA',
//                                     style: TextStyle(
//                                         color: Colors.grey,
//                                         fontWeight: FontWeight.bold))
//                                 .tr(),
//                           ],
//                         ),
//                       ),
//                       Stack(
//                         children: [
//                           imageFile != null
//                               ? ClipOval(
//                                   child: Image.file(
//                                   File(imageFile!.path),
//                                   fit: BoxFit.cover,
//                                   height: 120,
//                                   width: 120,
//                                 ))
//                               : ClipOval(
//                                   child: CachedNetworkImage(
//                                     height: 120,
//                                     fit: BoxFit.cover,
//                                     width: 120,
//                                     imageUrl: userPic == ''
//                                         ? "https://eitrawmaterials.eu/wp-content/uploads/2016/09/person-icon.png"
//                                         : userPic,
//                                     placeholder: (context, url) =>
//                                         const SpinKitRing(
//                                       color: Color.fromARGB(255, 47, 37, 37),
//                                       size: 30,
//                                       lineWidth: 3,
//                                     ),
//                                     errorWidget: (context, url, error) =>
//                                         const Icon(Icons.error),
//                                   ),
//                                 ),
//                           Positioned(
//                               bottom: 0,
//                               right: 0,
//                               child: Container(
//                                 decoration: const BoxDecoration(
//                                   shape: BoxShape.circle,
//                                   color: Color.fromARGB(255, 47, 37, 37),
//                                 ),
//                                 child: IconButton(
//                                   icon: const Icon(
//                                     Icons.camera_alt,
//                                     color: Colors.white,
//                                   ),
//                                   onPressed: () async {
//                                     _upload();
//                                   },
//                                 ),
//                               ))
//                         ],
//                       ),
//                       const SizedBox(height: 10),
//                       Padding(
//                         padding: const EdgeInsets.all(12.0),
//                         child: Row(
//                           children: [
//                             const Flexible(
//                                 flex: 1,
//                                 child: Icon(
//                                   Icons.person,
//                                   size: 40,
//                                   color: Colors.grey,
//                                 )),
//                             const SizedBox(
//                               width: 10,
//                             ),
//                             Flexible(
//                               flex: 6,
//                               child: TextFormField(
//                                 keyboardType: TextInputType.name,
//                                 validator: (value) {
//                                   if (value!.isEmpty && fullname.isEmpty) {
//                                     return 'Required field'.tr();
//                                   } else {
//                                     return null;
//                                   }
//                                 },
//                                 decoration: InputDecoration(
//                                     hintText: fullname,
//                                     focusColor: Color.fromARGB(255, 47, 37, 37)),
//                                 onChanged: (value) {
//                                   setState(() {
//                                     fullname = value;
//                                   });
//                                 },
//                               ),
//                             )
//                           ],
//                         ),
//                       ),
//                       Padding(
//                         padding: const EdgeInsets.all(12.0),
//                         child: Row(
//                           children: [
//                             const Flexible(
//                                 flex: 1,
//                                 child: Icon(
//                                   Icons.email_outlined,
//                                   size: 40,
//                                   color: Colors.grey,
//                                 )),
//                             const SizedBox(
//                               width: 10,
//                             ),
//                             Flexible(
//                               flex: 6,
//                               child: TextFormField(
//                                 readOnly: true,
//                                 keyboardType: TextInputType.emailAddress,
//                                 decoration: InputDecoration(
//                                     hintText: email, focusColor: Color.fromARGB(255, 47, 37, 37)),
//                               ),
//                             )
//                           ],
//                         ),
//                       ),
//                       Padding(
//                         padding: const EdgeInsets.all(12.0),
//                         child: Row(
//                           children: [
//                             const Flexible(
//                                 flex: 1,
//                                 child: Icon(
//                                   Icons.phone,
//                                   size: 40,
//                                   color: Colors.grey,
//                                 )),
//                             const SizedBox(
//                               width: 10,
//                             ),
//                             Flexible(
//                               flex: 6,
//                               child: TextFormField(
//                                 maxLength: 10,
//                                 // onTap: () {
//                                 //   Fluttertoast.showToast(
//                                 //       msg: "Phone number can't be changed".tr(),
//                                 //       toastLength: Toast.LENGTH_SHORT,
//                                 //       gravity: ToastGravity.CENTER,
//                                 //       timeInSecForIosWeb: 1,
//                                 //       fontSize: 14.0);
//                                 // },
//                                 // readOnly: true,
//                                 validator: (value) {
//                                   if (value!.isEmpty && phone.isEmpty) {
//                                     return 'Required field'.tr();
//                                   } else {
//                                     return null;
//                                   }
//                                 },
//                                 keyboardType: TextInputType.phone,
//                                 onChanged: (value) {
//                                   setState(() {
//                                     phone = value;
//                                   });
//                                 },
//                                 decoration: InputDecoration(
//                                     hintText:
//                                         phone == '' ? '+91 XXXX XXXXXX' : phone,
//                                     focusColor: Color.fromARGB(255, 47, 37, 37)),
//                               ),
//                             )
//                           ],
//                         ),
//                       ),
//                       Padding(
//                         padding: const EdgeInsets.all(12.0),
//                         child: Row(
//                           children: [
//                             const Flexible(
//                                 flex: 1,
//                                 child: Icon(
//                                   Icons.location_city,
//                                   size: 40,
//                                   color: Colors.grey,
//                                 )),
//                             const SizedBox(
//                               width: 10,
//                             ),
//                             Flexible(
//                                 flex: 6,
//                                 child: Container(
//                                   decoration: BoxDecoration(
//                                     border: Border(
//                                       bottom: BorderSide(
//                                           width: 2,
//                                           color: Colors.grey.shade400),
//                                     ),
//                                   ),
//                                   child: ListTile(
//                                     onTap: () {
//                                       _navigateAndDisplaySelection(context);
//                                     },
//                                     title: Text(address,
//                                             style: TextStyle(
//                                                 color: Colors.grey[600]))
//                                         .tr(),
//                                   ),
//                                 ))
//                           ],
//                         ),
//                       ),
//                       const SizedBox(height: 20),
//                       loading == true
//                           ? Padding(
//                               padding: const EdgeInsets.all(8.0),
//                               child: SizedBox(
//                                   height: 50,
//                                   width: double.infinity,
//                                   child: ElevatedButton(
//                                       style: ElevatedButton.styleFrom(
//                                           backgroundColor: Color.fromARGB(255, 47, 37, 37)),
//                                       onPressed: null,
//                                       child: const Text('Save',
//                                               style: TextStyle(
//                                                   fontSize: 20,
//                                                   color: Colors.white))
//                                           .tr())),
//                             )
//                           : Padding(
//                               padding: const EdgeInsets.all(8.0),
//                               child: SizedBox(
//                                   height: 50,
//                                   width: double.infinity,
//                                   child: ElevatedButton(
//                                       style: ElevatedButton.styleFrom(
//                                           backgroundColor: Color.fromARGB(255, 47, 37, 37)),
//                                       onPressed: () async {
//                                         if (_formKey.currentState!.validate()) {
//                                           AuthService().updateProfile(
//                                               fullname,
//                                               phone == '' ? phone : '+91$phone',
//                                               context,
//                                               userPicMain,
//                                               address);
//                                         }
//                                       },
//                                       child: const Text('Save',
//                                               style: TextStyle(
//                                                   fontSize: 20,
//                                                   color: Colors.white))
//                                           .tr())),
//                             ),
//                     ],
//                   ),
//                 ),
//               ),
//               Expanded(
//                 flex: 2,
//                 child: ClipPath(
//                   clipper: OvalTopBorderClipper(),
//                   child:
//                       Container(color: const Color.fromARGB(255, 47, 37, 37)),
//                 ),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

// ignore_for_file: avoid_print, unused_local_variable, use_build_context_synchronously

import 'dart:async';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:falguni_app/Pages/login_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_custom_clippers/flutter_custom_clippers.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:image_picker/image_picker.dart';
import 'package:falguni_app/Model/constant.dart';
import 'package:map_location_picker/map_location_picker.dart';
import '../Providers/auth.dart';

class ProfilePage extends StatefulWidget {
  final bool isbottomNav;
  const ProfilePage({super.key, required this.isbottomNav});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  DocumentReference? userRef;
  DocumentReference? userDetails;
  String fullname = '';
  String email = '';
  String phone = '';
  String password = '';
  final _formKey = GlobalKey<FormState>();
  String userPic = '';
  String address = 'Address';
  String userPicMain = '';
  String addressMain = '';
  num cartQuantity = 0;
  String referralCode = '';

  @override
  void initState() {
    super.initState();
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
      userDetails = firestore
          .collection('users')
          .doc(user!.uid)
          .snapshots()
          .listen((value) {
        setState(() {
          email = value['email'];
          fullname = value['fullname'];
          phone = value['phone'];
          userPic = value['photoUrl'];
          address = value['address'];
          referralCode = value['personalReferralCode'];
        });
      }) as DocumentReference<Object?>?;
    });
  }

  _navigateAndDisplaySelection(BuildContext context) async {
    final result = await Navigator.push(
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
                  address = result.formattedAddress ?? "";
                });
              }
            },
            onSuggestionSelected: (PlacesDetailsResponse? result) {
              if (result != null) {
                setState(() {
                  address = result.result.formattedAddress ?? "";
                  Navigator.of(context).pop();
                  print('Seleceted Address is$address');
                });
              }
            },
          );
        },
      ),
    );
  }

  XFile? imageFile;
  bool? loading;
  Future<void> _upload() async {
    final ImagePicker picker = ImagePicker();
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
        userPicMain = downloadUrl;
      });
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        automaticallyImplyLeading: widget.isbottomNav == true ? false : true,
        iconTheme: Theme.of(context).iconTheme,
        titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
        backgroundColor: Theme.of(context).colorScheme.surface,
        centerTitle: true,
        elevation: 0,
        title: const Text('PROFILE').tr(),
      ),
      body: SingleChildScrollView(
        child: SizedBox(
          height: MediaQuery.of(context).size.height,
          child: Column(
            children: [
              Form(
                key: _formKey,
                child: Expanded(
                  flex: 7,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            const Text('YOUR PERSONAL DATA',
                                    style: TextStyle(
                                        color: Colors.grey,
                                        fontWeight: FontWeight.bold))
                                .tr(),
                          ],
                        ),
                      ),
                      Stack(
                        children: [
                          imageFile != null
                              ? ClipOval(
                                  child: Image.file(
                                  File(imageFile!.path),
                                  fit: BoxFit.cover,
                                  height: 120,
                                  width: 120,
                                ))
                              : ClipOval(
                                  child: CachedNetworkImage(
                                    height: 120,
                                    fit: BoxFit.cover,
                                    width: 120,
                                    imageUrl: userPic == ''
                                        ? "https://eitrawmaterials.eu/wp-content/uploads/2016/09/person-icon.png"
                                        : userPic,
                                    placeholder: (context, url) =>
                                        const SpinKitRing(
                                      color: Color.fromARGB(255, 47, 37, 37),
                                      size: 30,
                                      lineWidth: 3,
                                    ),
                                    errorWidget: (context, url, error) =>
                                        const Icon(Icons.error),
                                  ),
                                ),
                          Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Color.fromARGB(255, 47, 37, 37),
                                ),
                                child: IconButton(
                                  icon: const Icon(
                                    Icons.camera_alt,
                                    color: Colors.white,
                                  ),
                                  onPressed: () async {
                                    _upload();
                                  },
                                ),
                              ))
                        ],
                      ),
                      const SizedBox(height: 10),
                      Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Row(
                          children: [
                            const Flexible(
                                flex: 1,
                                child: Icon(
                                  Icons.person,
                                  size: 40,
                                  color: Colors.grey,
                                )),
                            const SizedBox(width: 10),
                            Flexible(
                              flex: 6,
                              child: TextFormField(
                                keyboardType: TextInputType.name,
                                validator: (value) {
                                  if (value!.isEmpty && fullname.isEmpty) {
                                    return 'Required field'.tr();
                                  } else {
                                    return null;
                                  }
                                },
                                decoration: InputDecoration(
                                    hintText: fullname,
                                    focusColor:
                                        const Color.fromARGB(255, 47, 37, 37)),
                                onChanged: (value) {
                                  setState(() {
                                    fullname = value;
                                  });
                                },
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
                                  Icons.email_outlined,
                                  size: 40,
                                  color: Colors.grey,
                                )),
                            const SizedBox(width: 10),
                            Flexible(
                              flex: 6,
                              child: TextFormField(
                                readOnly: true,
                                keyboardType: TextInputType.emailAddress,
                                decoration: InputDecoration(
                                    hintText: email,
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
                                  Icons.phone,
                                  size: 40,
                                  color: Colors.grey,
                                )),
                            const SizedBox(width: 10),
                            Flexible(
                              flex: 6,
                              child: TextFormField(
                                maxLength: 10,
                                validator: (value) {
                                  if (value!.isEmpty && phone.isEmpty) {
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
                                    hintText:
                                        phone == '' ? '+91 XXXX XXXXXX' : phone,
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
                                  Icons.location_city,
                                  size: 40,
                                  color: Colors.grey,
                                )),
                            const SizedBox(width: 10),
                            Flexible(
                              flex: 6,
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border(
                                    bottom: BorderSide(
                                        width: 2, color: Colors.grey.shade400),
                                  ),
                                ),
                                child: ListTile(
                                  onTap: () {
                                    _navigateAndDisplaySelection(context);
                                  },
                                  title: Text(address,
                                          style: TextStyle(
                                              color: Colors.grey[600]))
                                      .tr(),
                                ),
                              ),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      loading == true
                          ? Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: SizedBox(
                                  height: 50,
                                  width: double.infinity,
                                  child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color.fromARGB(
                                              255, 47, 37, 37)),
                                      onPressed: null,
                                      child: const Text('Save',
                                              style: TextStyle(
                                                  fontSize: 20,
                                                  color: Colors.white))
                                          .tr())),
                            )
                          : Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: SizedBox(
                                  height: 50,
                                  width: double.infinity,
                                  child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color.fromARGB(
                                              255, 47, 37, 37)),
                                      onPressed: () async {
                                        if (_formKey.currentState!.validate()) {
                                          AuthService().updateProfile(
                                              fullname,
                                              phone == '' ? phone : '+91$phone',
                                              context,
                                              userPicMain,
                                              address);
                                        }
                                      },
                                      child: const Text('Save',
                                              style: TextStyle(
                                                  fontSize: 20,
                                                  color: Colors.white))
                                          .tr())),
                            ),
                      // 👇👇 Delete My Account button
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0),
                        child: SizedBox(
                          height: 50,
                          width: double.infinity,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.red),
                            ),
                            onPressed: () async {
                              bool isChecked = false;

                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (context) {
                                  return StatefulBuilder(
                                    builder: (context, setState) => AlertDialog(
                                      title: const Text('Delete Account'),
                                      content: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Text(
                                              'Are you sure you want to delete your account? This cannot be undone.'),
                                          const SizedBox(height: 16),
                                          CheckboxListTile(
                                            value: isChecked,
                                            onChanged: (value) {
                                              setState(() {
                                                isChecked = value ?? false;
                                              });
                                            },
                                            title: const Text(
                                              'I understand and want to delete my account.',
                                              style: TextStyle(fontSize: 14),
                                            ),
                                            controlAffinity:
                                                ListTileControlAffinity.leading,
                                          ),
                                        ],
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () =>
                                              Navigator.of(context).pop(false),
                                          child: const Text('Cancel'),
                                        ),
                                        TextButton(
                                          onPressed: isChecked
                                              ? () => Navigator.of(context)
                                                  .pop(true)
                                              : null,
                                          child: const Text(
                                            'Delete',
                                            style: TextStyle(color: Colors.red),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              );

                              if (confirm == true) {
                                try {
                                  final user =
                                      FirebaseAuth.instance.currentUser;

                                  await FirebaseFirestore.instance
                                      .collection('users')
                                      .doc(user!.uid)
                                      .delete();

                                  await user.delete();

                                  // Sign out and redirect to initial screen
                                  await AuthService().signOut(context);

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                          'Your account has been deleted.'),
                                    ),
                                  );

                                  await Future.delayed(
                                      const Duration(milliseconds: 300));

                                  Navigator.pushAndRemoveUntil(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) =>
                                            const LoginPage()),
                                    (route) => false,
                                  );
                                } catch (e) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content:
                                            Text('Error deleting account: $e')),
                                  );
                                }
                              }
                            },
                            child: const Text(
                              'Delete My Account',
                              style: TextStyle(color: Colors.red, fontSize: 16),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Expanded(
                flex: 2,
                child: ClipPath(
                  clipper: OvalTopBorderClipper(),
                  child:
                      Container(color: const Color.fromARGB(255, 47, 37, 37)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
