// ignore_for_file: avoid_print, deprecated_member_use

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shimmer/shimmer.dart';
import 'package:falguni_app/Model/formatter.dart';
import '../Model/pickup_model.dart';

class GetDeliveryFeeWidget extends StatefulWidget {
  final num customerLat;
  final num customerLong;
  final String customerName;
  final String phone;
  const GetDeliveryFeeWidget(
      {super.key,
      required this.customerLat,
      required this.customerLong,
      required this.customerName,
      required this.phone});

  @override
  State<GetDeliveryFeeWidget> createState() => _GetDeliveryFeeWidgetState();
}

class _GetDeliveryFeeWidgetState extends State<GetDeliveryFeeWidget> {
  // Design constants - matching cart & wallet pages
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  DocumentReference? userDetails;
  String id = '';
  String addressID = '';
  int? selected;
  num pickupLat = 0;
  num pickupLong = 0;
  num deliveryFee = 0;
  String pickupAddress = '';
  bool isLoading = false;
  getPhone() {}

  Future<List<PickupModel>> getDeliveryAddresses() {
    return FirebaseFirestore.instance.collection('Pickup Addresses').get().then(
        (event) => event.docs
            .map((e) => PickupModel.fromMap(e.data(), e.id))
            .toList());
  }

  @override
  void initState() {
    super.initState();
  }

  getDeliveryFee() async {
    // Show loading dialog
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            decoration: BoxDecoration(
              color: kBgMid,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kGold.withOpacity(0.3), width: 1),
            ),
            padding: const EdgeInsets.all(24),
            child: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  height: 50,
                  width: 50,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation<Color>(kGold),
                  ),
                ),
                SizedBox(height: 20),
                Text(
                  'Finding Delivery Price',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Calculating fare for your location...',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    final Map<String, dynamic> requestData = {
      "pickup_details": {"lat": pickupLat, "lng": pickupLong},
      "drop_details": {"lat": widget.customerLat, "lng": widget.customerLong},
      "customer": {
        "name": widget.customerName,
        "mobile": {"country_code": "+91", "number": widget.phone.substring(3)}
      },
    };
    try {
      //   var url = Uri.parse('http://10.0.2.2:3000/get-quote');
      var url = Uri.parse('https://render-packages.onrender.com/get-quote');
      var response = await http.post(url,
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': '4330e319-edc7-4110-880f-b2747bf666db',
            'Accept': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
          },
          body: jsonEncode(requestData));

      if (!mounted) return;
      Navigator.of(context).pop(); // Close loading dialog

      print('Response status: ${response.statusCode}');
      if (response.statusCode == 200 &&
          jsonDecode(response.body)["type"] != 'restricted_location') {
        //  print(jsonDecode(response.body.toString())["vehicles"][5]['type']['fare']);
        // Find the "2 Wheeler" entry and get the "minor_amount"
        var twoWheeler = jsonDecode(response.body.toString())["vehicles"]
            .firstWhere((vehicle) => vehicle["type"] == "2 Wheeler",
                orElse: () => null);

        if (twoWheeler != null) {
          var minorAmount = twoWheeler["fare"]["minor_amount"] as int;
          print("Minor Amount for 2 Wheeler: $minorAmount");
          Fluttertoast.showToast(
              msg:
                  "You'll be charged ${Formatter().converter((twoWheeler["fare"]["minor_amount"] / 100).toDouble())} Rupees",
              toastLength: Toast.LENGTH_LONG,
              timeInSecForIosWeb: 4,
              fontSize: 14.0);
          setState(() {
            deliveryFee = twoWheeler["fare"]["minor_amount"] as num;
          });
        } else {
          print("2 Wheeler not found in the data");
        }
      }
      //   print('Response body: ${response.body}');
      if ('${jsonDecode(response.body)["type"]}' == 'restricted_location') {
        Fluttertoast.showToast(
            msg:
                '${jsonDecode(response.body)["message"]}.Please try contacting admin directly',
            toastLength: Toast.LENGTH_LONG,
            timeInSecForIosWeb: 4,
            fontSize: 14.0);
      }
    } catch (e) {
      return Fluttertoast.showToast(
          msg: '${jsonDecode(e.toString())["message"]}',
          toastLength: Toast.LENGTH_LONG,
          timeInSecForIosWeb: 4,
          fontSize: 14.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
          automaticallyImplyLeading: true,
          backgroundColor: Colors.transparent,
          elevation: 0,
          iconTheme: const IconThemeData(color: kGold),
          centerTitle: true,
          title: const Text(
            'Calculate Delivery Fee',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ).tr()),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              children: [
                // Header Section with Rich Content
                Container(
                  margin: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: kGold.withOpacity(0.2),
                    ),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              color: kGold,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.all(10),
                            child: const Icon(
                              Icons.local_shipping_outlined,
                              color: kBgMid,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Select Pickup Location',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 16,
                                    color: Colors.white,
                                  ),
                                ).tr(),
                                const SizedBox(height: 4),
                                const Text(
                                  'Choose pickup point to calculate delivery cost',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: Colors.white70,
                                  ),
                                ).tr(),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Icon(
                              Icons.info_outline,
                              color: kGold.withOpacity(0.7),
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: const Text(
                                'Select a pickup location and tap "Get Delivery Fee" to see the exact cost',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white70,
                                  height: 1.4,
                                ),
                              ).tr(),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                // Delivery Info Section
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16.0),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: kGold.withOpacity(0.15),
                    ),
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.info_outline,
                            color: kGold,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'How Delivery Fee Works',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: Colors.white,
                            ),
                          ).tr(),
                        ],
                      ),
                      const SizedBox(height: 10),
                      _buildInfoRow('📍', 'Fee calculated based on distance'),
                      _buildInfoRow(
                          '⚡', 'Real-time calculation from our partners'),
                      _buildInfoRow(
                          '💰', 'Price updated when you select location'),
                      _buildInfoRow('🚚', 'Fast & reliable delivery service'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                FutureBuilder<List<PickupModel>>(
                    future: getDeliveryAddresses(),
                    builder: (context, snapshot) {
                      if (snapshot.hasData) {
                        return snapshot.data?.isEmpty ?? true
                            ? Padding(
                                padding: EdgeInsets.only(
                                  top: MediaQuery.of(context).size.height / 6,
                                ),
                                child: Column(
                                  children: [
                                    Container(
                                      width: 140,
                                      height: 140,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: LinearGradient(
                                          colors: [
                                            kGold.withOpacity(0.25),
                                            kGold.withOpacity(0.08),
                                          ],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                        border: Border.all(
                                          color: kGold.withOpacity(0.4),
                                          width: 2,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: kGold.withOpacity(0.1),
                                            blurRadius: 20,
                                            offset: const Offset(0, 10),
                                          ),
                                        ],
                                      ),
                                      child: const Icon(
                                        Icons.location_off_outlined,
                                        size: 70,
                                        color: kGold,
                                      ),
                                    ),
                                    const SizedBox(height: 28),
                                    const Text(
                                      'No pickup locations available',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ).tr(),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                itemCount: snapshot.data?.length,
                                itemBuilder: (context, index) {
                                  PickupModel addressModel =
                                      snapshot.data![index];
                                  bool isSelected = selected == index;
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () {
                                          setState(() {
                                            selected = index;
                                            pickupLat = addressModel.lat;
                                            pickupLong = addressModel.long;
                                            pickupAddress =
                                                addressModel.address;
                                            deliveryFee =
                                                0; // Reset fee on new selection
                                          });
                                        },
                                        borderRadius: BorderRadius.circular(14),
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? Colors.white.withOpacity(0.12)
                                                : Colors.white
                                                    .withOpacity(0.06),
                                            borderRadius:
                                                BorderRadius.circular(14),
                                            border: Border.all(
                                              color: isSelected
                                                  ? kGold.withOpacity(0.5)
                                                  : Colors.white
                                                      .withOpacity(0.1),
                                              width: isSelected ? 2 : 1,
                                            ),
                                            boxShadow: isSelected
                                                ? [
                                                    BoxShadow(
                                                      color: kGold
                                                          .withOpacity(0.2),
                                                      blurRadius: 12,
                                                      offset:
                                                          const Offset(0, 4),
                                                    ),
                                                  ]
                                                : [
                                                    BoxShadow(
                                                      color: Colors.black
                                                          .withOpacity(0.2),
                                                      blurRadius: 8,
                                                      offset:
                                                          const Offset(0, 2),
                                                    ),
                                                  ],
                                          ),
                                          padding: const EdgeInsets.all(14),
                                          child: Row(
                                            children: [
                                              // Radio Button
                                              Container(
                                                width: 24,
                                                height: 24,
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  border: Border.all(
                                                    color: isSelected
                                                        ? kGold
                                                        : Colors.white54,
                                                    width: 2,
                                                  ),
                                                ),
                                                child: isSelected
                                                    ? Padding(
                                                        padding:
                                                            const EdgeInsets
                                                                .all(4.0),
                                                        child: Container(
                                                          decoration:
                                                              const BoxDecoration(
                                                            shape:
                                                                BoxShape.circle,
                                                            color: kGold,
                                                          ),
                                                        ),
                                                      )
                                                    : null,
                                              ),
                                              const SizedBox(width: 12),
                                              // Location Info
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      addressModel.title,
                                                      style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w700,
                                                        fontSize: 14,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 6),
                                                    Text(
                                                      addressModel.address,
                                                      maxLines: 2,
                                                      overflow:
                                                          TextOverflow.ellipsis,
                                                      style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w400,
                                                        fontSize: 12,
                                                        color: Colors.white70,
                                                        height: 1.3,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              // Fee Display (if calculated)
                                              if (isSelected &&
                                                  deliveryFee != 0)
                                                Container(
                                                  decoration: BoxDecoration(
                                                    color:
                                                        kGold.withOpacity(0.2),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8),
                                                    border: Border.all(
                                                      color: kGold
                                                          .withOpacity(0.4),
                                                    ),
                                                  ),
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                    horizontal: 8,
                                                    vertical: 4,
                                                  ),
                                                  child: Column(
                                                    children: [
                                                      Text(
                                                        '₹${Formatter().converter((deliveryFee / 100).toDouble())}',
                                                        style: const TextStyle(
                                                          fontSize: 11,
                                                          color: kGold,
                                                          fontWeight:
                                                              FontWeight.w700,
                                                        ),
                                                      ),
                                                      Text(
                                                        'Fee',
                                                        style: TextStyle(
                                                          fontSize: 9,
                                                          color: kGold
                                                              .withOpacity(0.7),
                                                          fontWeight:
                                                              FontWeight.w500,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                });
                      } else {
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16.0,
                            vertical: 24.0,
                          ),
                          child: ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemBuilder: (_, __) => Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: Shimmer.fromColors(
                                baseColor: Colors.grey[300]!,
                                highlightColor: Colors.grey[100]!,
                                enabled: true,
                                child: Container(
                                  height: 100,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                              ),
                            ),
                            itemCount: 3,
                          ),
                        );
                      }
                    }),
                const SizedBox(height: 120),
              ],
            ),
          ),
        ),
      ),
      bottomSheet: SizedBox(
        height: 110,
        width: double.infinity,
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [kBgMid, kBgTop],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            border: Border(
              top: BorderSide(
                color: Color(0xFFC9A86A),
                width: 0.5,
              ),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (selected != null)
                  Text(
                    'Selected: ${selected != null && selected! < 1 ? 'Location ${selected! + 1}' : ''}',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 48,
                  width: double.infinity,
                  child: deliveryFee != 0
                      ? ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kGold,
                            foregroundColor: kBgMid,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          onPressed: () {
                            Navigator.pop(context, {
                              'deliveryFee': deliveryFee / 100,
                              'pickupAddress': pickupAddress
                            });
                          },
                          child: Text(
                            "Continue - ₹${Formatter().converter((deliveryFee / 100).toDouble())} delivery fee",
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                        )
                      : ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                isLoading ? kGold.withOpacity(0.7) : kGold,
                            foregroundColor: kBgMid,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          onPressed: isLoading
                              ? null
                              : () {
                                  if (selected != null) {
                                    setState(() {
                                      isLoading = true;
                                    });
                                    getDeliveryFee();
                                  } else {
                                    Fluttertoast.showToast(
                                        msg: 'Please select a pickup location',
                                        backgroundColor: Colors.red,
                                        textColor: Colors.white);
                                  }
                                },
                          child: isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor:
                                        AlwaysStoppedAnimation<Color>(kBgMid),
                                  ),
                                )
                              : const Text(
                                  'Calculate Delivery Fee',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                  ),
                                ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper method to build info rows
  Widget _buildInfoRow(String emoji, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            emoji,
            style: const TextStyle(fontSize: 14),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.white70,
                height: 1.3,
              ),
            ).tr(),
          ),
        ],
      ),
    );
  }
}
