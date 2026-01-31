import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class SnapshotBody extends StatefulWidget {
  final num lat;
  final num long;
  const SnapshotBody({super.key, required this.lat, required this.long});

  @override
  SnapshotBodyState createState() => SnapshotBodyState();
}

class SnapshotBodyState extends State<SnapshotBody> {
  // Design constants - Premium theme matching app
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgDark = Color(0xFF1C1515);

  GoogleMapController? mapController;
  Map<MarkerId, Marker> markers = {};

  @override
  void initState() {
    super.initState();
    // Add marker for delivery location
    _addMarker(
      LatLng(widget.lat.toDouble(), widget.long.toDouble()),
      "delivery",
      BitmapDescriptor.defaultMarkerWithHue(45), // Gold-ish Hue matching theme
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Container(
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: kGold.withOpacity(0.2),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: GoogleMap(
                onMapCreated: onMapCreated,
                // FIX: Disable gestures to prevent list scroll lag
                scrollGesturesEnabled: false,
                zoomGesturesEnabled: false,
                tiltGesturesEnabled: false,
                rotateGesturesEnabled: false,
                liteModeEnabled: true, // Better performance for snapshots
                initialCameraPosition: CameraPosition(
                  target: LatLng(widget.lat.toDouble(), widget.long.toDouble()),
                  zoom: 15.0,
                ),
                // Clean premium UI
                zoomControlsEnabled: false,
                myLocationButtonEnabled: false,
                mapToolbarEnabled: false,
                compassEnabled: false,
                markers: Set<Marker>.of(markers.values),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  _addMarker(LatLng position, String id, BitmapDescriptor descriptor) {
    MarkerId markerId = MarkerId(id);
    Marker marker = Marker(
      markerId: markerId,
      icon: descriptor,
      position: position,
      // ignore: prefer_const_constructors
      infoWindow: InfoWindow(
        title: "Delivery Location",
        snippet: "Your delivery address",
      ),
    );
    markers[markerId] = marker;
  }
}
