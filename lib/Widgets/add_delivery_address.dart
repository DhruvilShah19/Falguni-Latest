// ignore_for_file: deprecated_member_use, avoid_print, use_build_context_synchronously, no_leading_underscores_for_local_identifiers

import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:gap/gap.dart';

import 'package:falguni_app/Model/constant.dart';
import '../Model/address.dart';

class AddDeliveryAddress extends StatefulWidget {
  const AddDeliveryAddress({super.key});

  @override
  State<AddDeliveryAddress> createState() => _AddDeliveryAddressState();
}

class _AddDeliveryAddressState extends State<AddDeliveryAddress> {
  // Theme Palette
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);

  final _formKey = GlobalKey<FormState>();
  String address = '';
  String houseNumber = '';
  String closestBusStop = '';
  String id = '';

  LatLng? _currentLatLng;
  bool _isLocatingUser = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _getUserDetails();
    _initCurrentLocation();
  }

  // ===========================================================================
  // LOGIC & FUNCTIONALITIES (PRESERVED UNCHANGED)
  // ===========================================================================

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();
    setState(() {
      id = (doc.data() != null && doc.data()!.containsKey('id'))
          ? doc.data()!['id'] as String
          : user.uid;
    });
  }

  Future<void> _initCurrentLocation() async {
    try {
      setState(() => _isLocatingUser = true);
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) {
        setState(() => _isLocatingUser = false);
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      final latLng = LatLng(pos.latitude, pos.longitude);
      setState(() {
        _currentLatLng = latLng;
        _isLocatingUser = false;
      });
      final addr = await _reverseGeocode(latLng);
      if (addr != null && addr.isNotEmpty) setState(() => address = addr);
    } catch (e) {
      setState(() => _isLocatingUser = false);
    }
  }

  Future<void> addNewDeliveryAddress(AddressModel addressModel) async {
    if (id.isEmpty) {
      Fluttertoast.showToast(msg: "User not loaded".tr());
      return;
    }
    await FirebaseFirestore.instance
        .collection('users')
        .doc(id)
        .collection('DeliveryAddress')
        .add(addressModel.toMap());
    await FirebaseFirestore.instance.collection('users').doc(id).update({
      'DeliveryAddress': addressModel.address,
      'HouseNumber': addressModel.houseNumber,
      'ClosestBustStop': addressModel.closestbusStop,
      'DeliveryAddressID': addressModel.id,
    });
    Navigator.of(context).pop();
    Fluttertoast.showToast(msg: "Address has been added".tr());
  }

  Future<String?> _reverseGeocode(LatLng latLng) async {
    try {
      final url = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
        'latlng': '${latLng.latitude},${latLng.longitude}',
        'key': googleApiKey
      });
      final res = await http.get(url);
      if (res.statusCode != 200) return null;
      final data = json.decode(res.body);
      final results = data['results'] as List?;
      return (results != null && results.isNotEmpty)
          ? results.first['formatted_address']
          : null;
    } catch (e) {
      return null;
    }
  }

  Future<List<dynamic>> _autocomplete(String input) async {
    if (input.trim().isEmpty) return [];
    final url =
        Uri.https('maps.googleapis.com', '/maps/api/place/autocomplete/json', {
      'input': input,
      'key': googleApiKey,
      'components': 'country:in',
      'types': 'geocode'
    });
    final res = await http.get(url);
    if (res.statusCode != 200) return [];
    return json.decode(res.body)['predictions'] ?? [];
  }

  Future<LatLng?> _getPlaceLatLng(String placeId) async {
    final url = Uri.https('maps.googleapis.com', '/maps/api/place/details/json',
        {'place_id': placeId, 'key': googleApiKey});
    final res = await http.get(url);
    final data = json.decode(res.body);
    final loc = data['result']?['geometry']?['location'];
    return loc != null ? LatLng(loc['lat'], loc['lng']) : null;
  }

  Future<void> _locateMe(GoogleMapController? controller,
      Function(VoidCallback) setModalState) async {
    try {
      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      final newLatLng = LatLng(pos.latitude, pos.longitude);

      // Update current location
      setState(() => _currentLatLng = newLatLng);

      // Update the modal state with the new location
      setModalState(() {
        // This will refresh the modal with new _currentLatLng
      });

      // Animate camera to current location if map is ready
      if (controller != null) {
        await controller.animateCamera(CameraUpdate.newCameraPosition(
            CameraPosition(target: newLatLng, zoom: 16)));
      }

      // Reverse geocode to get the address
      final addr = await _reverseGeocode(newLatLng);
      setState(() {
        address = addr ?? "";
      });
    } catch (e) {
      debugPrint("Location error: $e");
      Fluttertoast.showToast(msg: "Could not get your location".tr());
    }
  }

  // ===========================================================================
  // UI COMPONENTS (BOUTIQUE THEME)
  // ===========================================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, Color(0xFF0D0D0D)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            _buildEliteAppBar(),
            SliverToBoxAdapter(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _sectionHeader("Location Details"),
                      _buildAddressSelector(),
                      const Gap(20),
                      _sectionHeader("Personal Details"),
                      _buildEliteField(
                        label: "House / Flat Number",
                        icon: Icons.home_work_outlined,
                        onChanged: (v) => houseNumber = v,
                      ),
                      const Gap(16),
                      _buildEliteField(
                        label: "Zip Code",
                        icon: Icons.local_post_office_outlined,
                        onChanged: (v) => closestBusStop = v,
                      ),
                      const Gap(40),
                      _buildSaveButton(),
                    ],
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildEliteAppBar() {
    return SliverAppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      pinned: true,
      centerTitle: true,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            color: Colors.white, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        "ADD NEW ADDRESS".tr().toUpperCase(),
        style: const TextStyle(
            color: kGold,
            fontSize: 14,
            fontWeight: FontWeight.w900,
            letterSpacing: 2),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
            color: kGold,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5),
      ),
    );
  }

  Widget _buildAddressSelector() {
    return InkWell(
      onTap: () => _openMapSheet(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            const Icon(Icons.location_on_rounded, color: kGold, size: 28),
            const Gap(16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Location".tr(),
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.4), fontSize: 11)),
                  const Gap(4),
                  Text(
                    address.isEmpty ? "Tap to select location".tr() : address,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white24),
          ],
        ),
      ),
    );
  }

  Widget _buildEliteField(
      {required String label,
      required IconData icon,
      required Function(String) onChanged}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: TextFormField(
        style: const TextStyle(color: Colors.white, fontSize: 14),
        onChanged: onChanged,
        validator: (v) => v == null || v.isEmpty ? "Required".tr() : null,
        decoration: InputDecoration(
          icon: Icon(icon, color: kGold.withOpacity(0.6), size: 20),
          labelText: label.tr(),
          labelStyle:
              TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      height: 55,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: kGold,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        onPressed: () {
          if (_formKey.currentState!.validate() && address.isNotEmpty) {
            addNewDeliveryAddress(AddressModel(
              address: address,
              houseNumber: houseNumber,
              closestbusStop: closestBusStop,
              id: address + houseNumber + closestBusStop,
            ));
          } else {
            Fluttertoast.showToast(msg: "Please Select Your Address".tr());
          }
        },
        child: const Text("SAVE ADDRESS",
            style: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5)),
      ),
    );
  }

  // ===========================================================================
  // MAP SHEET (THEMED)
  // ===========================================================================

  Future<void> _openMapSheet(BuildContext context) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        LatLng? centerLatLng = _currentLatLng;
        String localAddr = address;
        bool isMapLoading = true;
        bool isAddressLoading = false;
        bool isSearching = false;
        List<dynamic> suggestions = [];
        GoogleMapController? mapController;

        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.90,
              decoration: const BoxDecoration(
                  color: Color(0xFF140F0F),
                  borderRadius:
                      BorderRadius.vertical(top: Radius.circular(30))),
              child: Column(
                children: [
                  const Gap(10),
                  Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                          color: Colors.white10,
                          borderRadius: BorderRadius.circular(10))),
                  _buildSheetHeader(context),
                  _buildSheetSearch(setModalState, (prediction) async {
                    final latLng =
                        await _getPlaceLatLng(prediction['place_id']);
                    if (latLng != null) {
                      mapController?.animateCamera(
                          CameraUpdate.newLatLngZoom(latLng, 16));
                      setModalState(() {
                        suggestions = [];
                        centerLatLng = latLng;
                      });
                    }
                  }, (res) => setModalState(() => suggestions = res)),
                  if (suggestions.isNotEmpty)
                    Expanded(
                      child: ListView.builder(
                        itemCount: suggestions.length,
                        itemBuilder: (c, i) => ListTile(
                          leading: const Icon(Icons.location_on, color: kGold),
                          title: Text(suggestions[i]['description'],
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 13)),
                          onTap: () async {
                            final latLng = await _getPlaceLatLng(
                                suggestions[i]['place_id']);
                            if (latLng != null) {
                              mapController?.animateCamera(
                                  CameraUpdate.newLatLngZoom(latLng, 16));
                              setModalState(() {
                                suggestions = [];
                                centerLatLng = latLng;
                              });
                              _searchController.text =
                                  suggestions[i]['description'];
                            }
                          },
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: centerLatLng == null
                          ? _buildNoLocationWidget(setModalState)
                          : Stack(
                              children: [
                                GoogleMap(
                                  // FIX: Allow map to handle gestures inside bottom sheet
                                  gestureRecognizers: <Factory<
                                      OneSequenceGestureRecognizer>>{
                                    Factory<OneSequenceGestureRecognizer>(
                                      () => EagerGestureRecognizer(),
                                    ),
                                  },
                                  initialCameraPosition: CameraPosition(
                                      target: centerLatLng!, zoom: 16),
                                  onMapCreated: (c) {
                                    mapController = c;
                                    setModalState(() => isMapLoading = false);
                                  },
                                  onCameraMove: (pos) =>
                                      centerLatLng = pos.target,
                                  onCameraIdle: () async {
                                    setModalState(
                                        () => isAddressLoading = true);
                                    final a =
                                        await _reverseGeocode(centerLatLng!);
                                    setModalState(() {
                                      localAddr = a ?? "";
                                      isAddressLoading = false;
                                    });
                                    setState(() => address = localAddr);
                                  },
                                  zoomControlsEnabled: false,
                                  myLocationButtonEnabled: false,
                                ),
                                const Center(
                                    child: Padding(
                                        padding: EdgeInsets.only(bottom: 35),
                                        child: Icon(Icons.location_pin,
                                            color: Colors.redAccent,
                                            size: 45))),
                                Positioned(
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    child: _buildConfirmCard(
                                        localAddr, isAddressLoading)),
                                Positioned(
                                    top: 20,
                                    right: 20,
                                    child: FloatingActionButton(
                                      mini: true,
                                      backgroundColor: kGold,
                                      child: const Icon(Icons.my_location,
                                          color: Colors.black),
                                      onPressed: () async {
                                        // Check and request location permissions
                                        LocationPermission permission =
                                            await Geolocator.checkPermission();
                                        if (permission ==
                                            LocationPermission.denied) {
                                          permission = await Geolocator
                                              .requestPermission();
                                        }
                                        if (permission ==
                                            LocationPermission.deniedForever) {
                                          if (mounted) {
                                            Fluttertoast.showToast(
                                                msg:
                                                    "Location permission is required"
                                                        .tr());
                                            await Geolocator
                                                .openLocationSettings();
                                          }
                                          return;
                                        }

                                        if (mapController != null) {
                                          _locateMe(
                                              mapController,
                                              setModalState as Function(
                                                  VoidCallback));
                                        } else {
                                          Fluttertoast.showToast(
                                              msg: "Map is still loading..."
                                                  .tr());
                                        }
                                      },
                                    ))
                              ],
                            ),
                    )
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSheetHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.close, color: Colors.white)),
          const Gap(10),
          Text("SELECT LOCATION".tr(),
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 15)),
        ],
      ),
    );
  }

  Widget _buildSheetSearch(
      Function setModalState, Function onSelect, Function onSearch) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(color: Colors.white),
        onChanged: (v) async {
          final res = await _autocomplete(v);
          onSearch(res);
        },
        decoration: InputDecoration(
          hintText: "Search Location".tr(),
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
          prefixIcon: const Icon(Icons.search, color: kGold),
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: BorderSide.none),
        ),
      ),
    );
  }

  Widget _buildConfirmCard(String addr, bool loading) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
          color: Color(0xFF1C1515),
          borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text("DELIVER TO".tr(),
                  style: TextStyle(
                      color: kGold.withOpacity(0.6),
                      fontSize: 10,
                      fontWeight: FontWeight.bold)),
              if (loading) const Gap(10),
              if (loading)
                const SizedBox(
                    width: 10,
                    height: 10,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: kGold)),
            ],
          ),
          const Gap(8),
          Text(addr.isEmpty ? "Moving to location...".tr() : addr,
              maxLines: 2,
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold)),
          const Gap(20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: kGold,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15))),
              onPressed: addr.isEmpty ? null : () => Navigator.pop(context),
              child: const Text("CONFIRM LOCATION",
                  style: TextStyle(
                      color: Colors.black, fontWeight: FontWeight.w900)),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildNoLocationWidget(Function setModalState) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off_rounded,
              color: Colors.white.withOpacity(0.3), size: 80),
          const Gap(20),
          Text("No Location Found".tr(),
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          const Gap(10),
          Text("Please use 'Locate Me' or search for your location".tr(),
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Colors.white.withOpacity(0.5), fontSize: 13)),
          const Gap(30),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: kGold,
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
            ),
            onPressed: () async {
              // Check and request location permissions
              LocationPermission permission =
                  await Geolocator.checkPermission();
              if (permission == LocationPermission.denied) {
                permission = await Geolocator.requestPermission();
              }
              if (permission == LocationPermission.deniedForever) {
                if (mounted) {
                  Fluttertoast.showToast(
                      msg:
                          "Location permission is required to locate you".tr());
                  // Open app settings
                  await Geolocator.openLocationSettings();
                }
                return;
              }

              // Request location
              _locateMe(null, setModalState as Function(VoidCallback));
            },
            icon: const Icon(Icons.my_location, color: Colors.black),
            label: const Text("Locate Me",
                style: TextStyle(
                    color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
