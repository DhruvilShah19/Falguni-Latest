// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import '../Model/constant.dart';

class MapScreen extends StatefulWidget {
  final num userLat;
  final num userLong;
  final num marketLat;
  final num marketLong;
  final String address;
  final num zoom;
  const MapScreen({
    super.key,
    required this.userLat,
    required this.zoom,
    required this.address,
    required this.userLong,
    required this.marketLong,
    required this.marketLat,
  });

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF5C4033); // Deep "Roasted Bean" brown

  GoogleMapController? mapController;
  Map<MarkerId, Marker> markers = {};
  Map<PolylineId, Polyline> polylines = {};
  List<LatLng> polylineCoordinates = [];
  PolylinePoints polylinePoints = PolylinePoints();
  String googleAPiKey = googleApiKey;

  @override
  void initState() {
    super.initState();

    /// Origin marker (User)
    _addMarker(
      LatLng(widget.userLat.toDouble(), widget.userLong.toDouble()),
      "origin",
      BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
    );

    /// Destination marker (Market)
    _addMarker(
      LatLng(widget.marketLat.toDouble(), widget.marketLong.toDouble()),
      "destination",
      BitmapDescriptor.defaultMarkerWithHue(45), // Gold-ish Hue
    );

    _getPolyline();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgTop,
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target:
                  LatLng(widget.userLat.toDouble(), widget.userLong.toDouble()),
              zoom: widget.zoom.toDouble(),
            ),
            myLocationEnabled: true,
            tiltGesturesEnabled: true,
            compassEnabled: false, // Cleaner UI
            scrollGesturesEnabled: true,
            zoomGesturesEnabled: true,
            zoomControlsEnabled: false, // Premium look hides standard buttons
            onMapCreated: _onMapCreated,
            markers: Set<Marker>.of(markers.values),
            polylines: Set<Polyline>.of(polylines.values),
            // Ensure map fills screen and handles gestures properly
            padding: const EdgeInsets.only(bottom: 20),
          ),

          // 🔹 BOUTIQUE FLOATING BACK BUTTON
          Positioned(
            top: 50,
            left: 20,
            child: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1C1515),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    )
                  ],
                ),
                child: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: Colors.white, size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    // Auto-fit the camera to show the whole route once created
    _fitBounds();
  }

  _addMarker(LatLng position, String id, BitmapDescriptor descriptor) {
    MarkerId markerId = MarkerId(id);
    Marker marker = Marker(
      markerId: markerId,
      icon: descriptor,
      position: position,
      infoWindow:
          InfoWindow(title: id == "origin" ? "Your Location" : "Market"),
    );
    markers[markerId] = marker;
  }

  _addPolyLine() {
    PolylineId id = const PolylineId("poly");
    Polyline polyline = Polyline(
      polylineId: id,
      color: kGold, // 🔹 Changed to Boutique Gold
      width: 5,
      jointType: JointType.round,
      startCap: Cap.roundCap,
      endCap: Cap.roundCap,
      points: polylineCoordinates,
    );
    polylines[id] = polyline;
    setState(() {});
  }

  _getPolyline() async {
    PolylineResult result = await polylinePoints.getRouteBetweenCoordinates(
      request: PolylineRequest(
        origin:
            PointLatLng(widget.userLat.toDouble(), widget.userLong.toDouble()),
        destination: PointLatLng(
            widget.marketLat.toDouble(), widget.marketLong.toDouble()),
        mode: TravelMode.driving,
      ),
      googleApiKey: googleAPiKey,
    );

    if (result.points.isNotEmpty) {
      polylineCoordinates.clear();
      for (var point in result.points) {
        polylineCoordinates.add(LatLng(point.latitude, point.longitude));
      }
      _addPolyLine();
      _fitBounds(); // Update bounds once polyline is ready
    }
  }

  // 🔹 NEW: Auto-zoom to fit both User and Market on screen
  void _fitBounds() {
    if (mapController == null) return;

    LatLngBounds bounds;
    LatLng user = LatLng(widget.userLat.toDouble(), widget.userLong.toDouble());
    LatLng market =
        LatLng(widget.marketLat.toDouble(), widget.marketLong.toDouble());

    // FIX: Calculate bounds correctly for all directions
    double minLat =
        (user.latitude < market.latitude) ? user.latitude : market.latitude;
    double maxLat =
        (user.latitude > market.latitude) ? user.latitude : market.latitude;
    double minLong =
        (user.longitude < market.longitude) ? user.longitude : market.longitude;
    double maxLong =
        (user.longitude > market.longitude) ? user.longitude : market.longitude;

    bounds = LatLngBounds(
      southwest: LatLng(minLat, minLong),
      northeast: LatLng(maxLat, maxLong),
    );

    mapController!.animateCamera(CameraUpdate.newLatLngBounds(bounds, 100));
  }
}
