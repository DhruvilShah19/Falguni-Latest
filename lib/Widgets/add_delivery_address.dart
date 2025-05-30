// ignore_for_file: avoid_print, unused_local_variable, use_build_context_synchronously

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_open_street_map/flutter_open_street_map.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:falguni_app/Model/constant.dart';
import 'package:map_location_picker/map_location_picker.dart';
import '../Model/address.dart';

class AddDeliveryAddress extends StatefulWidget {
  const AddDeliveryAddress({super.key});

  @override
  State<AddDeliveryAddress> createState() => _AddDeliveryAddressState();
}

class _AddDeliveryAddressState extends State<AddDeliveryAddress> {
  final _formKey = GlobalKey<FormState>();
  String address = '';
  String houseNumber = '';
  String closestBusStop = '';
  DocumentReference? userDetails;
  String id = '';

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
                  // selectedPlace = result;
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

  Future<void> _getUserDetails() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userDetails =
          firestore.collection('users').doc(user!.uid).get().then((value) {
        setState(() {
          id = value['id'];
        });
      }) as DocumentReference<Object?>?;
    });
  }

  bool useMap = false;
  @override
  void initState() {
    _getUserDetails();
    super.initState();
  }

  addNewDeliveryAddress(AddressModel addressModel) {
    FirebaseFirestore.instance
        .collection('users')
        .doc(id)
        .collection('DeliveryAddress')
        .add(addressModel.toMap())
        .then((value) {
      Navigator.of(context).pop();
      FirebaseFirestore.instance.collection('users').doc(id).update({
        'DeliveryAddress': addressModel.address,
        'HouseNumber': addressModel.houseNumber,
        'ClosestBustStop': addressModel.closestbusStop,
        'DeliveryAddressID': addressModel.id
      });
      Fluttertoast.showToast(
          msg: "Address has been added".tr(),
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          fontSize: 14.0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
        backgroundColor: Theme.of(context).colorScheme.surface,
        centerTitle: true,
        elevation: 0,
        title: const Text('Add A New Delivery Address').tr(),
      ),
      body: SingleChildScrollView(
        child: useMap == false
            ? Form(
                key: _formKey,
                child: Column(
                  children: [
                    const SizedBox(
                      height: 20,
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
                          const SizedBox(
                            width: 10,
                          ),
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
                                  title: Text(
                                          address == ''
                                              ? 'Address'.tr()
                                              : address,
                                          style: TextStyle(
                                              color: Colors.grey[600]))
                                      .tr(),
                                ),
                              ))
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
                                Icons.home,
                                size: 40,
                                color: Colors.grey,
                              )),
                          const SizedBox(
                            width: 10,
                          ),
                          Flexible(
                            flex: 6,
                            child: TextFormField(
                              keyboardType: TextInputType.streetAddress,
                              validator: (value) {
                                if (value!.isEmpty) {
                                  return 'Required field'.tr();
                                } else {
                                  return null;
                                }
                              },
                              decoration: InputDecoration(
                                  hintText: 'House Number'.tr(),
                                  focusColor:
                                      const Color.fromARGB(255, 47, 37, 37)),
                              onChanged: (value) {
                                setState(() {
                                  houseNumber = value;
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
                                Icons.home,
                                size: 40,
                                color: Colors.grey,
                              )),
                          const SizedBox(
                            width: 10,
                          ),
                          Flexible(
                            flex: 6,
                            child: TextFormField(
                              keyboardType: TextInputType.name,
                              validator: (value) {
                                if (value!.isEmpty) {
                                  return 'Required field'.tr();
                                } else {
                                  return null;
                                }
                              },
                              decoration: InputDecoration(
                                  hintText: 'Zip code'.tr(),
                                  focusColor:
                                      const Color.fromARGB(255, 47, 37, 37)),
                              onChanged: (value) {
                                setState(() {
                                  closestBusStop = value;
                                });
                              },
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 50),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: SizedBox(
                          height: 50,
                          width: double.infinity,
                          child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                  backgroundColor:
                                      const Color.fromARGB(255, 47, 37, 37)),
                              onPressed: () async {
                                if (_formKey.currentState!.validate() &&
                                    address != '') {
                                  addNewDeliveryAddress(AddressModel(
                                      address: address,
                                      houseNumber: houseNumber,
                                      closestbusStop: closestBusStop,
                                      id: address +
                                          houseNumber +
                                          closestBusStop));
                                } else {
                                  Fluttertoast.showToast(
                                      msg: "Please Select Your Address".tr(),
                                      toastLength: Toast.LENGTH_SHORT,
                                      gravity: ToastGravity.TOP,
                                      timeInSecForIosWeb: 1,
                                      fontSize: 14.0);
                                }
                              },
                              child: const Text('Save',
                                      style: TextStyle(
                                          fontSize: 20, color: Colors.white))
                                  .tr())),
                    ),
                    const SizedBox(height: 20),
                    // TextButton(
                    //     onPressed: () {
                    //       setState(() {
                    //         useMap = true;
                    //       });
                    //     },
                    //     child: const Text('Select Address From Map'))
                  ],
                ),
              )
            : Column(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height / 1.4,
                    width: double.infinity,
                    child: MaterialApp(
                      debugShowCheckedModeBanner: false,
                      home: Scaffold(
                        body: FlutterOpenStreetMap(
                            primaryColor: Colors.blue,
                            showZoomButtons: true,
                            center: LatLong(20.5937, 78.9629),
                            onPicked: (pickedData) {
                              addNewDeliveryAddress(AddressModel(
                                  address: pickedData.addressName,
                                  houseNumber: 'Data not provided',
                                  closestbusStop: 'Data not provided',
                                  id: '${pickedData.address}Data not providedData not provided'));
                            }),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        useMap = false;
                      });
                    },
                    child: const Text('Back to address form'),
                  )
                ],
              ),
      ),
    );
  }
}
