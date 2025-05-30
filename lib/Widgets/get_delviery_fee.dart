// ignore_for_file: avoid_print

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
      setState(() {
        //  loadingServer = false;
      });
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
      appBar: AppBar(
          centerTitle: true,
          iconTheme: Theme.of(context).iconTheme,
          titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
          backgroundColor: Theme.of(context).colorScheme.surface,
          elevation: 0,
          title: const Text(
            'Pickup Addresses',
          ).tr()),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const Text(
                    'Tap Pickup Address To Get Delivery Fee',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Colors.grey),
                  ).tr(),
                ],
              ),
            ),
            FutureBuilder<List<PickupModel>>(
                future: getDeliveryAddresses(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return snapshot.data?.isEmpty ?? true
                        ? Center(
                            child: Image.asset(
                              'assets/image/rider update.png',
                              height: MediaQuery.of(context).size.height / 2,
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            itemCount: snapshot.data?.length,
                            itemBuilder: (context, index) {
                              PickupModel addressModel = snapshot.data![index];
                              return Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: SizedBox(
                                    height: 75,
                                    width: double.infinity,
                                    child: Card(
                                      elevation: 0,
                                      child: RadioListTile(
                                        onChanged: (v) {
                                          setState(() {
                                            selected = v;
                                            pickupLat = addressModel.lat;
                                            pickupLong = addressModel.long;
                                            pickupAddress =
                                                addressModel.address;
                                          });
                                          // Navigator.pop(
                                          //     context, addressModel.address);
                                        },
                                        title: Text(
                                          addressModel.address,
                                          maxLines: 2,
                                        ),
                                        subtitle: Text(addressModel.title),
                                        groupValue: selected,
                                        value: index,
                                      ),
                                    )),
                              );
                            });
                  } else {
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 16.0),
                      child: Shimmer.fromColors(
                        baseColor: Colors.grey[300]!,
                        highlightColor: Colors.grey[100]!,
                        enabled: true,
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemBuilder: (_, __) => SizedBox(
                              height: 100,
                              width: double.infinity,
                              child: Card(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20.0),
                                ),
                              )),
                          itemCount: 10,
                        ),
                      ),
                    );
                  }
                }),
            const SizedBox(
              height: 120,
            ),
          ],
        ),
      ),
      bottomSheet: SizedBox(
        height: 100,
        width: double.infinity,
        child: Center(
          child: SizedBox(
            height: 40,
            width: MediaQuery.of(context).size.width / 1.5,
            child: deliveryFee != 0
                ? ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context, {
                        'deliveryFee': deliveryFee / 100,
                        'pickupAddress': pickupAddress
                      });
                    },
                    child: Text(
                      "Continue at ${Formatter().converter((deliveryFee / 100).toDouble())} Rupees delivery fee",
                      textAlign: TextAlign.center,
                    ),
                  )
                : ElevatedButton(
                    onPressed: pickupLat == 0 && pickupLong == 0
                        ? null
                        : () {
                            getDeliveryFee();
                          },
                    child: const Text('Get Delivery Fee')),
          ),
        ),
      ),
    );
  }
}
