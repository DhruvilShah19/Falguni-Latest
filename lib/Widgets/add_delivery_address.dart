// // ignore_for_file: deprecated_member_use, avoid_print, use_build_context_synchronously, no_leading_underscores_for_local_identifiers

// import 'dart:convert';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:easy_localization/easy_localization.dart';
// import 'package:flutter/material.dart';
// import 'package:fluttertoast/fluttertoast.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:shimmer/shimmer.dart';
// import 'package:http/http.dart' as http;
// import 'package:geolocator/geolocator.dart';

// import 'package:falguni_app/Model/constant.dart'; // must expose googleApiKey
// import '../Model/address.dart';

// class AddDeliveryAddress extends StatefulWidget {
//   const AddDeliveryAddress({super.key});

//   @override
//   State<AddDeliveryAddress> createState() => _AddDeliveryAddressState();
// }

// class _AddDeliveryAddressState extends State<AddDeliveryAddress> {
//   final _formKey = GlobalKey<FormState>();

//   String address = '';
//   String houseNumber = '';
//   String closestBusStop = '';
//   String id = '';

//   /// Fallback (Delhi) if GPS fails
//   static const LatLng _fallbackLatLng = LatLng(28.6139, 77.2090);

//   LatLng? _currentLatLng;
//   bool _isLocatingUser = false;

//   final TextEditingController _searchController = TextEditingController();

//   @override
//   void initState() {
//     super.initState();
//     _getUserDetails();
//     _initCurrentLocation();
//   }

//   // ===========================
//   // USER + LOCATION INIT
//   // ===========================

//   Future<void> _getUserDetails() async {
//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) return;

//     final doc = await FirebaseFirestore.instance
//         .collection('users')
//         .doc(user.uid)
//         .get();

//     setState(() {
//       id = (doc.data() != null && doc.data()!.containsKey('id'))
//           ? doc.data()!['id'] as String
//           : user.uid;
//     });
//   }

//   Future<void> _initCurrentLocation() async {
//     try {
//       setState(() => _isLocatingUser = true);

//       LocationPermission permission = await Geolocator.checkPermission();
//       if (permission == LocationPermission.denied ||
//           permission == LocationPermission.deniedForever) {
//         permission = await Geolocator.requestPermission();
//       }

//       if (permission == LocationPermission.denied ||
//           permission == LocationPermission.deniedForever) {
//         setState(() => _isLocatingUser = false);
//         return;
//       }

//       final pos = await Geolocator.getCurrentPosition(
//         desiredAccuracy: LocationAccuracy.high,
//       );

//       final latLng = LatLng(pos.latitude, pos.longitude);

//       setState(() {
//         _currentLatLng = latLng;
//         _isLocatingUser = false;
//       });

//       // Optionally set a default address from current location
//       final addr = await _reverseGeocode(latLng);
//       if (addr != null && addr.isNotEmpty) {
//         setState(() => address = addr);
//       }
//     } catch (e) {
//       print('Error getting current location: $e');
//       setState(() => _isLocatingUser = false);
//     }
//   }

//   // ===========================
//   // FIRESTORE: ADD NEW ADDRESS
//   // ===========================

//   Future<void> addNewDeliveryAddress(AddressModel addressModel) async {
//     if (id.isEmpty) {
//       Fluttertoast.showToast(
//         msg: "User not loaded, please try again".tr(),
//         gravity: ToastGravity.TOP,
//       );
//       return;
//     }

//     await FirebaseFirestore.instance
//         .collection('users')
//         .doc(id)
//         .collection('DeliveryAddress')
//         .add(addressModel.toMap());

//     await FirebaseFirestore.instance.collection('users').doc(id).update({
//       'DeliveryAddress': addressModel.address,
//       'HouseNumber': addressModel.houseNumber,
//       'ClosestBustStop': addressModel.closestbusStop,
//       'DeliveryAddressID': addressModel.id,
//     });

//     Navigator.of(context).pop();

//     Fluttertoast.showToast(
//       msg: "Address has been added".tr(),
//       gravity: ToastGravity.TOP,
//     );
//   }

//   // ===========================
//   // GOOGLE GEOCODING & PLACES
//   // ===========================

//   Future<String?> _reverseGeocode(LatLng latLng) async {
//     try {
//       final url = Uri.https(
//         'maps.googleapis.com',
//         '/maps/api/geocode/json',
//         {
//           'latlng': '${latLng.latitude},${latLng.longitude}',
//           'key': googleApiKey,
//         },
//       );

//       final res = await http.get(url);
//       if (res.statusCode != 200) return null;

//       final data = json.decode(res.body) as Map<String, dynamic>;
//       final results = data['results'] as List<dynamic>?;

//       if (results == null || results.isEmpty) return null;

//       return results.first['formatted_address'] as String?;
//     } catch (e) {
//       print('Reverse geocoding failed: $e');
//       return null;
//     }
//   }

//   /// Autocomplete biased to India
//   Future<List<dynamic>> _autocomplete(String input) async {
//     if (input.trim().isEmpty) return [];
//     try {
//       final url = Uri.https(
//         'maps.googleapis.com',
//         '/maps/api/place/autocomplete/json',
//         {
//           'input': input,
//           'key': googleApiKey,
//           'components': 'country:in',
//           'types': 'geocode',
//         },
//       );

//       final res = await http.get(url);
//       if (res.statusCode != 200) return [];

//       final data = json.decode(res.body) as Map<String, dynamic>;
//       return data['predictions'] as List<dynamic>? ?? [];
//     } catch (e) {
//       print('Autocomplete error: $e');
//       return [];
//     }
//   }

//   Future<LatLng?> _getPlaceLatLng(String placeId) async {
//     try {
//       final url = Uri.https(
//         'maps.googleapis.com',
//         '/maps/api/place/details/json',
//         {
//           'place_id': placeId,
//           'key': googleApiKey,
//         },
//       );

//       final res = await http.get(url);
//       if (res.statusCode != 200) return null;

//       final data = json.decode(res.body) as Map<String, dynamic>;
//       final result = data['result'] as Map<String, dynamic>?;
//       final geometry = result?['geometry'] as Map<String, dynamic>?;
//       final location = geometry?['location'] as Map<String, dynamic>?;

//       if (location == null) return null;

//       return LatLng(
//         (location['lat'] as num).toDouble(),
//         (location['lng'] as num).toDouble(),
//       );
//     } catch (e) {
//       print('Place details error: $e');
//       return null;
//     }
//   }

//   // Locate Me inside sheet
//   Future<void> _locateMe(GoogleMapController controller) async {
//     try {
//       LocationPermission permission = await Geolocator.checkPermission();
//       if (permission == LocationPermission.denied ||
//           permission == LocationPermission.deniedForever) {
//         permission = await Geolocator.requestPermission();
//       }

//       if (permission == LocationPermission.denied ||
//           permission == LocationPermission.deniedForever) {
//         Fluttertoast.showToast(
//           msg: "Location permission denied".tr(),
//           gravity: ToastGravity.TOP,
//         );
//         return;
//       }

//       final pos = await Geolocator.getCurrentPosition(
//         desiredAccuracy: LocationAccuracy.high,
//       );
//       final latLng = LatLng(pos.latitude, pos.longitude);

//       controller.animateCamera(
//         CameraUpdate.newCameraPosition(
//           CameraPosition(target: latLng, zoom: 16),
//         ),
//       );
//     } catch (e) {
//       print('Locate me error: $e');
//     }
//   }

//   // ===========================
//   // MAP BOTTOM SHEET (Uber/Zomato style)
//   // ===========================

//   Future<void> _openMapSheet(BuildContext context) async {
//     await showModalBottomSheet(
//       context: context,
//       isScrollControlled: true,
//       backgroundColor: Colors.transparent,
//       builder: (bottomSheetContext) {
//         final theme = Theme.of(bottomSheetContext);

//         // Local state inside sheet
//         LatLng centerLatLng = _currentLatLng ?? _fallbackLatLng;
//         String selectedAddressLocal = address;
//         bool isMapLoading = true; // ONLY for initial map load shimmer
//         bool isAddressLoading = false; // bottom card spinner
//         bool isSearching = false; // tiny loader inside Go button
//         List<dynamic> suggestions = [];

//         GoogleMapController? sheetMapController;

//         return StatefulBuilder(
//           builder: (context, setModalState) {
//             Future<void> _updateAddressFromLatLng(LatLng latLng) async {
//               setModalState(() {
//                 isAddressLoading = true;
//               });

//               final addr = await _reverseGeocode(latLng);

//               if (addr != null && addr.isNotEmpty) {
//                 setModalState(() {
//                   selectedAddressLocal = addr;
//                   isAddressLoading = false;
//                 });
//                 setState(() {
//                   address = addr;
//                 });
//               } else {
//                 setModalState(() {
//                   isAddressLoading = false;
//                 });
//               }
//             }

//             Future<void> _onCameraIdle() async {
//               await _updateAddressFromLatLng(centerLatLng);
//             }

//             // Handles both suggestion tap & internal place jump
//             Future<void> _goToPlaceFromPrediction(
//               Map<String, dynamic> prediction,
//             ) async {
//               final placeId = prediction['place_id'] as String;
//               final description = prediction['description'] as String? ?? '';

//               setModalState(() {
//                 isSearching = true;
//                 suggestions = [];
//               });

//               final latLng = await _getPlaceLatLng(placeId);
//               if (latLng != null && sheetMapController != null) {
//                 centerLatLng = latLng;

//                 await sheetMapController?.animateCamera(
//                   CameraUpdate.newCameraPosition(
//                     CameraPosition(target: latLng, zoom: 16),
//                   ),
//                 );

//                 final addr = await _reverseGeocode(latLng);

//                 setModalState(() {
//                   selectedAddressLocal =
//                       addr?.isNotEmpty == true ? addr! : description;
//                   isSearching = false;
//                 });

//                 setState(() {
//                   address = selectedAddressLocal;
//                 });
//               } else {
//                 setModalState(() {
//                   isSearching = false;
//                 });
//                 Fluttertoast.showToast(
//                   msg: "Unable to move to selected location".tr(),
//                 );
//               }
//             }

//             Future<void> _onGoPressed() async {
//               final query = _searchController.text.trim();
//               if (query.isEmpty) {
//                 Fluttertoast.showToast(
//                   msg: "Enter a location to search".tr(),
//                   gravity: ToastGravity.TOP,
//                 );
//                 return;
//               }

//               setModalState(() {
//                 isSearching = true;
//               });

//               final results = await _autocomplete(query);
//               if (results.isEmpty) {
//                 setModalState(() {
//                   isSearching = false;
//                   suggestions = [];
//                 });
//                 Fluttertoast.showToast(
//                   msg: "No matching location found".tr(),
//                   gravity: ToastGravity.TOP,
//                 );
//                 return;
//               }

//               final firstPrediction = results.first as Map<String, dynamic>;
//               await _goToPlaceFromPrediction(firstPrediction);
//             }

//             return AnimatedPadding(
//               duration: const Duration(milliseconds: 250),
//               curve: Curves.easeOut,
//               padding: EdgeInsets.only(
//                 bottom: MediaQuery.of(context).viewInsets.bottom,
//               ),
//               child: Container(
//                 height: MediaQuery.of(context).size.height * 0.90,
//                 decoration: BoxDecoration(
//                   color: theme.colorScheme.background,
//                   borderRadius: const BorderRadius.vertical(
//                     top: Radius.circular(24),
//                   ),
//                 ),
//                 child: Column(
//                   children: [
//                     const SizedBox(height: 10),

//                     // Drag handle
//                     Container(
//                       width: 45,
//                       height: 4,
//                       decoration: BoxDecoration(
//                         color: Colors.grey.shade400,
//                         borderRadius: BorderRadius.circular(100),
//                       ),
//                     ),
//                     const SizedBox(height: 10),

//                     // Header
//                     Padding(
//                       padding: const EdgeInsets.symmetric(horizontal: 16),
//                       child: Row(
//                         children: [
//                           IconButton(
//                             icon: const Icon(Icons.close),
//                             onPressed: () => Navigator.pop(context),
//                           ),
//                           const SizedBox(width: 8),
//                           Text(
//                             "Select Address".tr(),
//                             style: theme.textTheme.titleMedium!.copyWith(
//                               fontWeight: FontWeight.w600,
//                             ),
//                           ),
//                         ],
//                       ),
//                     ),

//                     // ===============================
//                     // TOP: Search + Go + Locate Me
//                     // ===============================
//                     Padding(
//                       padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
//                       child: Row(
//                         children: [
//                           // Search bar
//                           Expanded(
//                             child: Container(
//                               decoration: BoxDecoration(
//                                 color: Colors.white,
//                                 borderRadius: BorderRadius.circular(14),
//                                 boxShadow: [
//                                   BoxShadow(
//                                     color: Colors.black.withOpacity(0.06),
//                                     blurRadius: 6,
//                                     offset: const Offset(0, 2),
//                                   ),
//                                 ],
//                               ),
//                               child: TextField(
//                                 controller: _searchController,
//                                 onChanged: (value) async {
//                                   if (value.trim().isEmpty) {
//                                     setModalState(() {
//                                       suggestions = [];
//                                     });
//                                     return;
//                                   }
//                                   final res = await _autocomplete(value);
//                                   setModalState(() {
//                                     suggestions = res;
//                                   });
//                                 },
//                                 decoration: InputDecoration(
//                                   hintText: "Search location".tr(),
//                                   prefixIcon: const Icon(Icons.search),
//                                   border: InputBorder.none,
//                                   contentPadding: const EdgeInsets.symmetric(
//                                     horizontal: 12,
//                                     vertical: 12,
//                                   ),
//                                 ),
//                               ),
//                             ),
//                           ),
//                           const SizedBox(width: 6),

//                           // Go button with inline loader (B4)
//                           SizedBox(
//                             height: 42,
//                             child: ElevatedButton(
//                               onPressed: isSearching ? null : _onGoPressed,
//                               style: ElevatedButton.styleFrom(
//                                 padding:
//                                     const EdgeInsets.symmetric(horizontal: 14),
//                                 shape: RoundedRectangleBorder(
//                                   borderRadius: BorderRadius.circular(12),
//                                 ),
//                               ),
//                               child: AnimatedSwitcher(
//                                 duration: const Duration(milliseconds: 180),
//                                 child: isSearching
//                                     ? const SizedBox(
//                                         key: ValueKey('go_loading'),
//                                         width: 18,
//                                         height: 18,
//                                         child: CircularProgressIndicator(
//                                           strokeWidth: 2,
//                                           valueColor:
//                                               AlwaysStoppedAnimation<Color>(
//                                             Colors.white,
//                                           ),
//                                         ),
//                                       )
//                                     : const Text(
//                                         "Go",
//                                         key: ValueKey('go_text'),
//                                         style: TextStyle(
//                                           color: Colors.white,
//                                           fontWeight: FontWeight.w600,
//                                         ),
//                                       ),
//                               ),
//                             ),
//                           ),
//                           const SizedBox(width: 6),

//                           // Locate me
//                           GestureDetector(
//                             onTap: () async {
//                               if (sheetMapController != null) {
//                                 await _locateMe(sheetMapController!);
//                                 setModalState(() {
//                                   suggestions = [];
//                                 });
//                               }
//                             },
//                             child: Container(
//                               padding: const EdgeInsets.all(10),
//                               decoration: BoxDecoration(
//                                 color: theme.colorScheme.primary,
//                                 shape: BoxShape.circle,
//                                 boxShadow: [
//                                   BoxShadow(
//                                     color: Colors.black.withOpacity(0.15),
//                                     blurRadius: 6,
//                                     offset: const Offset(0, 2),
//                                   ),
//                                 ],
//                               ),
//                               child: const Icon(
//                                 Icons.my_location,
//                                 color: Colors.white,
//                                 size: 20,
//                               ),
//                             ),
//                           ),
//                         ],
//                       ),
//                     ),

//                     // Suggestions only while actively searching
//                     if (suggestions.isNotEmpty)
//                       Expanded(
//                         child: ListView.builder(
//                           itemCount: suggestions.length,
//                           itemBuilder: (context, index) {
//                             final prediction =
//                                 suggestions[index] as Map<String, dynamic>;
//                             final description =
//                                 prediction['description'] as String;

//                             return ListTile(
//                               leading: const Icon(Icons.location_on_outlined),
//                               title: Text(description),
//                               onTap: () async {
//                                 _searchController.text = description;
//                                 await _goToPlaceFromPrediction(prediction);
//                                 setModalState(() {
//                                   suggestions = [];
//                                 });
//                               },
//                             );
//                           },
//                         ),
//                       )
//                     else
//                       Expanded(
//                         child: Stack(
//                           children: [
//                             // Google Map
//                             Positioned.fill(
//                               child: GoogleMap(
//                                 initialCameraPosition: CameraPosition(
//                                   target: _currentLatLng ?? _fallbackLatLng,
//                                   zoom: 16,
//                                 ),
//                                 onMapCreated: (controller) {
//                                   sheetMapController = controller;
//                                   setModalState(() {
//                                     isMapLoading = false;
//                                   });

//                                   // If current GPS came in after open, move there
//                                   if (_currentLatLng != null) {
//                                     controller.animateCamera(
//                                       CameraUpdate.newCameraPosition(
//                                         CameraPosition(
//                                           target: _currentLatLng!,
//                                           zoom: 16,
//                                         ),
//                                       ),
//                                     );
//                                   }
//                                 },
//                                 onCameraMove: (position) {
//                                   centerLatLng = position.target;
//                                 },
//                                 onCameraIdle: _onCameraIdle,
//                                 onTap: (_) {
//                                   // Hide suggestions & keyboard on map tap
//                                   setModalState(() {
//                                     suggestions = [];
//                                   });
//                                   FocusScope.of(context).unfocus();
//                                 },
//                                 zoomControlsEnabled: false,
//                                 myLocationButtonEnabled: false,
//                                 mapToolbarEnabled: false,
//                                 compassEnabled: false,
//                                 trafficEnabled: false,
//                                 buildingsEnabled: true,
//                                 myLocationEnabled: false,
//                               ),
//                             ),

//                             // Center pin (visual)
//                             IgnorePointer(
//                               ignoring: true,
//                               child: Center(
//                                 child: Column(
//                                   mainAxisSize: MainAxisSize.min,
//                                   children: [
//                                     const Icon(
//                                       Icons.location_on,
//                                       size: 44,
//                                       color: Colors.redAccent,
//                                     ),
//                                     Container(
//                                       width: 12,
//                                       height: 12,
//                                       decoration: BoxDecoration(
//                                         color:
//                                             Colors.redAccent.withOpacity(0.2),
//                                         shape: BoxShape.circle,
//                                       ),
//                                     ),
//                                   ],
//                                 ),
//                               ),
//                             ),

//                             // Initial shimmer ONLY while map is first loading
//                             if (isMapLoading)
//                               Positioned.fill(
//                                 child: IgnorePointer(
//                                   child: Container(
//                                     color: theme.colorScheme.background
//                                         .withOpacity(0.6),
//                                     child: Center(
//                                       child: Shimmer.fromColors(
//                                         baseColor: Colors.grey[300]!,
//                                         highlightColor: Colors.grey[100]!,
//                                         child: Container(
//                                           width: MediaQuery.of(context)
//                                                   .size
//                                                   .width *
//                                               0.6,
//                                           height: 80,
//                                           decoration: BoxDecoration(
//                                             color: Colors.white,
//                                             borderRadius:
//                                                 BorderRadius.circular(16),
//                                           ),
//                                         ),
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                               ),

//                             // Bottom confirm card
//                             Positioned(
//                               bottom: 0,
//                               left: 0,
//                               right: 0,
//                               child: Container(
//                                 padding:
//                                     const EdgeInsets.fromLTRB(16, 14, 16, 20),
//                                 decoration: BoxDecoration(
//                                   color: theme.colorScheme.surface,
//                                   borderRadius: const BorderRadius.vertical(
//                                     top: Radius.circular(22),
//                                   ),
//                                   boxShadow: [
//                                     BoxShadow(
//                                       color: Colors.black.withOpacity(0.12),
//                                       blurRadius: 12,
//                                       offset: const Offset(0, -4),
//                                     ),
//                                   ],
//                                 ),
//                                 child: Column(
//                                   crossAxisAlignment: CrossAxisAlignment.start,
//                                   mainAxisSize: MainAxisSize.min,
//                                   children: [
//                                     Row(
//                                       crossAxisAlignment:
//                                           CrossAxisAlignment.center,
//                                       children: [
//                                         Text(
//                                           "Deliver to".tr(),
//                                           style: theme.textTheme.labelMedium!
//                                               .copyWith(
//                                             color: Colors.grey.shade600,
//                                           ),
//                                         ),
//                                         const SizedBox(width: 8),
//                                         if (isAddressLoading)
//                                           SizedBox(
//                                             width: 16,
//                                             height: 16,
//                                             child: CircularProgressIndicator(
//                                               strokeWidth: 2,
//                                               valueColor:
//                                                   AlwaysStoppedAnimation<Color>(
//                                                 theme.colorScheme.primary,
//                                               ),
//                                             ),
//                                           ),
//                                       ],
//                                     ),
//                                     const SizedBox(height: 4),
//                                     Text(
//                                       selectedAddressLocal.isEmpty
//                                           ? "Drag the map to adjust your location"
//                                               .tr()
//                                           : selectedAddressLocal,
//                                       maxLines: 2,
//                                       overflow: TextOverflow.ellipsis,
//                                       style:
//                                           theme.textTheme.bodyMedium!.copyWith(
//                                         fontWeight: selectedAddressLocal.isEmpty
//                                             ? FontWeight.w400
//                                             : FontWeight.w600,
//                                       ),
//                                     ),
//                                     const SizedBox(height: 14),
//                                     SizedBox(
//                                       width: double.infinity,
//                                       height: 46,
//                                       child: AnimatedSwitcher(
//                                         duration:
//                                             const Duration(milliseconds: 220),
//                                         child: selectedAddressLocal.isEmpty
//                                             ? ElevatedButton(
//                                                 key: const ValueKey(
//                                                     "disabled_confirm"),
//                                                 onPressed: null,
//                                                 style: ElevatedButton.styleFrom(
//                                                   backgroundColor:
//                                                       Colors.grey.shade400,
//                                                   shape: RoundedRectangleBorder(
//                                                     borderRadius:
//                                                         BorderRadius.circular(
//                                                             14),
//                                                   ),
//                                                 ),
//                                                 child: Text(
//                                                   "Confirm your location".tr(),
//                                                   style: const TextStyle(
//                                                     color: Colors.white,
//                                                     fontWeight: FontWeight.w600,
//                                                   ),
//                                                 ),
//                                               )
//                                             : ElevatedButton(
//                                                 key: const ValueKey(
//                                                     "enabled_confirm"),
//                                                 style: ElevatedButton.styleFrom(
//                                                   backgroundColor:
//                                                       theme.colorScheme.primary,
//                                                   shape: RoundedRectangleBorder(
//                                                     borderRadius:
//                                                         BorderRadius.circular(
//                                                             14),
//                                                   ),
//                                                 ),
//                                                 onPressed: () {
//                                                   Navigator.pop(context);
//                                                 },
//                                                 child: Text(
//                                                   "Confirm your location".tr(),
//                                                   style: const TextStyle(
//                                                     color: Colors.white,
//                                                     fontWeight: FontWeight.w600,
//                                                   ),
//                                                 ),
//                                               ),
//                                       ),
//                                     ),
//                                   ],
//                                 ),
//                               ),
//                             ),
//                           ],
//                         ),
//                       ),
//                   ],
//                 ),
//               ),
//             );
//           },
//         );
//       },
//     );
//   }

//   // ===========================
//   // MAIN UI
//   // ===========================

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);

//     return Scaffold(
//       appBar: AppBar(
//         backgroundColor: theme.colorScheme.background,
//         elevation: 0,
//         centerTitle: true,
//         iconTheme: IconThemeData(
//           color:
//               theme.brightness == Brightness.dark ? Colors.white : Colors.black,
//         ),
//         title: Text(
//           "Add A New Delivery Address".tr(),
//           style: theme.textTheme.titleMedium!.copyWith(
//             color: theme.brightness == Brightness.dark
//                 ? Colors.white
//                 : Colors.black,
//             fontWeight: FontWeight.w600,
//           ),
//         ),
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
//         child: Form(
//           key: _formKey,
//           child: Column(
//             children: [
//               _buildCard(
//                 child: ListTile(
//                   onTap: () => _openMapSheet(context),
//                   leading: Icon(
//                     Icons.location_on,
//                     size: 28,
//                     color: theme.colorScheme.primary,
//                   ),
//                   trailing: const Icon(
//                     Icons.chevron_right,
//                     color: Colors.grey,
//                   ),
//                   title: Text(
//                     address.isEmpty ? "Select Address".tr() : address,
//                     style: TextStyle(
//                       color: address.isEmpty
//                           ? Colors.grey
//                           : theme.textTheme.bodyLarge!.color,
//                       fontWeight:
//                           address.isEmpty ? FontWeight.w400 : FontWeight.w600,
//                     ),
//                   ),
//                 ),
//               ),
//               const SizedBox(height: 16),
//               _buildCard(
//                 child: Padding(
//                   padding:
//                       const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
//                   child: TextFormField(
//                     validator: (value) => value == null || value.isEmpty
//                         ? "Required field".tr()
//                         : null,
//                     decoration: InputDecoration(
//                       prefixIcon: const Icon(Icons.home_outlined),
//                       labelText: "House Number".tr(),
//                       border: InputBorder.none,
//                     ),
//                     onChanged: (value) => houseNumber = value,
//                   ),
//                 ),
//               ),
//               const SizedBox(height: 16),
//               _buildCard(
//                 child: Padding(
//                   padding:
//                       const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
//                   child: TextFormField(
//                     validator: (value) => value == null || value.isEmpty
//                         ? "Required field".tr()
//                         : null,
//                     decoration: InputDecoration(
//                       prefixIcon: const Icon(Icons.local_post_office_outlined),
//                       labelText: "Zip Code".tr(),
//                       border: InputBorder.none,
//                     ),
//                     onChanged: (value) => closestBusStop = value,
//                   ),
//                 ),
//               ),
//               const SizedBox(height: 30),
//               SizedBox(
//                 width: double.infinity,
//                 height: 52,
//                 child: ElevatedButton(
//                   style: ElevatedButton.styleFrom(
//                     backgroundColor: theme.colorScheme.primary,
//                     shape: RoundedRectangleBorder(
//                       borderRadius: BorderRadius.circular(14),
//                     ),
//                   ),
//                   onPressed: () {
//                     if (_formKey.currentState!.validate() &&
//                         address.isNotEmpty) {
//                       addNewDeliveryAddress(
//                         AddressModel(
//                           address: address,
//                           houseNumber: houseNumber,
//                           closestbusStop: closestBusStop,
//                           id: address + houseNumber + closestBusStop,
//                         ),
//                       );
//                     } else {
//                       Fluttertoast.showToast(
//                         msg: "Please Select Your Address".tr(),
//                         gravity: ToastGravity.TOP,
//                       );
//                     }
//                   },
//                   child: const Text(
//                     "Save",
//                     style: TextStyle(
//                       fontWeight: FontWeight.w600,
//                       color: Colors.white,
//                     ),
//                   ),
//                 ),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   // Card builder
//   Widget _buildCard({required Widget child}) {
//     return Container(
//       decoration: BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.circular(16),
//         boxShadow: [
//           BoxShadow(
//             color: Colors.black.withOpacity(0.05),
//             blurRadius: 8,
//             offset: const Offset(0, 3),
//           ),
//         ],
//       ),
//       child: child,
//     );
//   }
// }

// ignore_for_file: deprecated_member_use, avoid_print, use_build_context_synchronously, no_leading_underscores_for_local_identifiers

import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
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

  static const LatLng _fallbackLatLng = LatLng(28.6139, 77.2090);
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

  Future<void> _locateMe(GoogleMapController controller) async {
    final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    controller.animateCamera(CameraUpdate.newCameraPosition(
        CameraPosition(target: LatLng(pos.latitude, pos.longitude), zoom: 16)));
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
        LatLng centerLatLng = _currentLatLng ?? _fallbackLatLng;
        String localAddr = address;
        bool isMapLoading = true;
        bool isAddressLoading = false;
        bool isSearching = false;
        List<dynamic> suggestions = [];
        GoogleMapController? mapController;

        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.9,
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
                      child: Stack(
                        children: [
                          GoogleMap(
                            initialCameraPosition:
                                CameraPosition(target: centerLatLng, zoom: 16),
                            onMapCreated: (c) {
                              mapController = c;
                              setModalState(() => isMapLoading = false);
                            },
                            onCameraMove: (pos) => centerLatLng = pos.target,
                            onCameraIdle: () async {
                              setModalState(() => isAddressLoading = true);
                              final a = await _reverseGeocode(centerLatLng);
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
                                      color: Colors.redAccent, size: 45))),
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
                                onPressed: () => _locateMe(mapController!),
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
}
