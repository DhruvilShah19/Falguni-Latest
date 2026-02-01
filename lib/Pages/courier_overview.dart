// ignore_for_file: deprecated_member_use, use_build_context_synchronously

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import '../Model/courier.dart';
import '../Widgets/tracking.dart';

class CourierOverview extends StatefulWidget {
  final CourierModel courierModel;
  const CourierOverview({super.key, required this.courierModel});

  @override
  State<CourierOverview> createState() => _CourierOverviewState();
}

class _CourierOverviewState extends State<CourierOverview> {
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  String getcurrencyName = '';
  String getcurrencyCode = '';
  String getcurrencySymbol = '';
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

  @override
  void initState() {
    getCurrencyDetails();
    getRiderDetails();
    assignRider();
    super.initState();
  }

  String deliveryBoyID = '';

  List<String> riders = [];
  int randomIndex = 0;
  String deliveryBoysName = '';

  assignRider() {
    if (widget.courierModel.deliveryBoysName == '') {
      Future.delayed(const Duration(minutes: 2), () {
        FirebaseFirestore.instance
            .collection('drivers')
            .where('Approval', isEqualTo: true)
            .where('open', isEqualTo: true)
            .get()
            .then((value) {
          for (var element in value.docs) {
            riders.add(element['id']);
            debugPrint('Delivery boys are $riders');
            setState(() {
              randomIndex = Random().nextInt(riders.length);
            });
          }
        });
      });
    }
  }

  getRiderDetails() {
    if (riders.isNotEmpty) {
      FirebaseFirestore.instance
          .collection('drivers')
          .doc(riders[randomIndex])
          .snapshots()
          .listen((value) {
        setState(() {
          deliveryBoysName = value['fullname'];
          deliveryBoyID = value['id'];
        });
        if (widget.courierModel.deliveryBoysName == '') {
          Future.delayed(const Duration(minutes: 2), () {
            FirebaseFirestore.instance
                .collection('Courier')
                .doc(widget.courierModel.uid)
                .update({'deliveryBoyID': deliveryBoyID}).then((value) {
              Fluttertoast.showToast(
                  msg: "Rider updated",
                  toastLength: Toast.LENGTH_SHORT,
                  gravity: ToastGravity.TOP,
                  timeInSecForIosWeb: 1,
                  fontSize: 14.0);
            });
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: kBgTop,
        appBar: AppBar(
          iconTheme: const IconThemeData(color: Colors.white),
          backgroundColor: kBgTop,
          centerTitle: true,
          elevation: 0,
          title: Text(
            'Courier details'.tr(),
            style: const TextStyle(
                color: kGold, fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        body: Container(
          height: MediaQuery.of(context).size.height,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [kBgTop, kBgMid, kBgTop],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                const SizedBox(height: 20),
                Tracking(courierModel: widget.courierModel),
                const SizedBox(
                  height: 20,
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    'Parcel Details'.tr(),
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: kGold,
                        fontSize: 16),
                  ),
                ),
                Row(
                  children: [
                    Text('Parcel Image'.tr(),
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: Colors.white)),
                  ],
                ),
                const SizedBox(
                  height: 20,
                ),
                SizedBox(
                  height: MediaQuery.of(context).size.height / 3,
                  width: double.infinity,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      widget.courierModel.parcelImage,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 5),
                      Text(
                        'Parcel ID: #${widget.courierModel.parcelID}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: Colors.white),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'Date: ${widget.courierModel.deliveryDate}',
                        style: const TextStyle(color: Colors.white70),
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Text('Parcel Name:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Text(
                            widget.courierModel.parcelName,
                            style: const TextStyle(color: Colors.white70),
                          )
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Text("Sender's Name:".tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Text(
                            widget.courierModel.sendersName,
                            style: const TextStyle(color: Colors.white70),
                          )
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: [
                          Text("Sender's Address:".tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(widget.courierModel.sendersAddress,
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.white70)),
                          )
                        ],
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Text('Pick Up Address:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(widget.courierModel.sendersAddress,
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.white70)),
                          )
                        ],
                      ),
                      const SizedBox(height: 5),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Text('Recipient Name:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Text(
                            widget.courierModel.recipientName,
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: [
                          Text('Recipient Address:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(widget.courierModel.recipientAddress,
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.white70)),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: [
                          Text('Pick Up Address:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(widget.courierModel.recipientAddress,
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.white70)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Text('Rider name:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(
                            width: 10,
                          ),
                          Expanded(
                            child: widget.courierModel.deliveryBoysName == ''
                                ? Text(
                                    'Rider is yet to accept delivery please wait after 2 minutes'
                                        .tr(),
                                    style: const TextStyle(
                                        fontSize: 10, color: Colors.white54))
                                : deliveryBoysName != ''
                                    ? Text(deliveryBoysName,
                                        style: const TextStyle(
                                            color: Colors.white70))
                                    : Text(
                                        widget.courierModel.deliveryBoysName,
                                        style: const TextStyle(
                                            color: Colors.white70),
                                      ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: [
                          Text('Rider phone:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(
                            width: 10,
                          ),
                          Expanded(
                            child: widget.courierModel.deliveryBoysPhone == ''
                                ? Text('Rider is yet to accept delivery'.tr(),
                                    style: const TextStyle(
                                        fontSize: 10, color: Colors.white54))
                                : Text(
                                    widget.courierModel.deliveryBoysPhone,
                                    style:
                                        const TextStyle(color: Colors.white70),
                                  ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      widget.courierModel.deliveryBoysPhone == ''
                          ? Container()
                          : ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: kGold,
                                foregroundColor: kBgTop,
                              ),
                              onPressed: () async {
                                final Uri launchUri = Uri(
                                  scheme: 'tel',
                                  path: widget.courierModel.deliveryBoysPhone,
                                );
                                await launchUrl(launchUri);
                              },
                              child: Text('Call Rider'.tr(),
                                  style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold)),
                            ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Text('Price:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(
                            width: 10,
                          ),
                          Text(
                            '$getcurrencySymbol${widget.courierModel.price}',
                            style: const TextStyle(color: kGold),
                          )
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: [
                          Text('Distance:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(
                            width: 10,
                          ),
                          Text('${widget.courierModel.km.toString()}Km',
                              style: const TextStyle(color: Colors.white70))
                        ],
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: [
                          Text('Weight:'.tr(),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.white)),
                          const SizedBox(
                            width: 10,
                          ),
                          Text(
                            '${widget.courierModel.weight.toString()}Kg',
                            style: const TextStyle(color: Colors.white70),
                          )
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    children: [
                      Text('Parcel Description'.tr(),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: Colors.white)),
                      const SizedBox(
                        width: 10,
                      ),
                      Expanded(
                        child: Text(widget.courierModel.parcelDescription,
                            style: const TextStyle(
                                fontSize: 12, color: Colors.white70)),
                      )
                    ],
                  ),
                ),
                const SizedBox(
                  height: 20,
                ),
                widget.courierModel.deliveryBoysName == ''
                    ? ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.redAccent,
                            foregroundColor: Colors.white),
                        onPressed: () {
                          FirebaseFirestore.instance
                              .collection('Courier')
                              .doc(widget.courierModel.uid)
                              .delete()
                              .then((value) {
                            Navigator.of(context).pop();
                          });
                        },
                        child: Text('Cancel Delivery'.tr(),
                            style: const TextStyle(color: Colors.white)))
                    : Container(),
              ],
            ),
          ),
        ));
  }
}
