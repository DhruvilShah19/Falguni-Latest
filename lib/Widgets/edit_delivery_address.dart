// ignore_for_file: deprecated_member_use, use_build_context_synchronously, prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../Model/address.dart';

class EditDeliveryAddress extends StatefulWidget {
  final AddressModel model;
  final String userId;

  const EditDeliveryAddress(
      {super.key, required this.model, required this.userId});

  @override
  State<EditDeliveryAddress> createState() => _EditDeliveryAddressState();
}

class _EditDeliveryAddressState extends State<EditDeliveryAddress> {
  // Theme Palette
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF5C4033); // Deep "Roasted Bean" brown

  final _formKey = GlobalKey<FormState>();

  late String address;
  late String houseNumber;
  late String closestStop;

  @override
  void initState() {
    address = widget.model.address;
    houseNumber = widget.model.houseNumber;
    closestStop = widget.model.closestbusStop;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgTop,
      appBar: AppBar(
        title: Text(
          "EDIT ADDRESS",
          style: const TextStyle(
              color: kGold,
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: 2),
        ),
        centerTitle: true,
        backgroundColor: kBgTop,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, Color(0xFF0D0D0D)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 20),
                _input("Address", address, Icons.location_on_outlined,
                    (v) => address = v),
                const SizedBox(height: 16),
                _input("House Number", houseNumber, Icons.home_work_outlined,
                    (v) => houseNumber = v),
                const SizedBox(height: 16),
                _input("Zip Code", closestStop,
                    Icons.local_post_office_outlined, (v) => closestStop = v),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18)),
                    ),
                    onPressed: _save,
                    child: const Text("SAVE CHANGES",
                        style: TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _input(
      String label, String value, IconData icon, Function(String) onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: TextFormField(
        initialValue: value,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        validator: (v) => v!.isEmpty ? "Required" : null,
        onChanged: onChanged,
        decoration: InputDecoration(
          icon: Icon(icon, color: kGold.withOpacity(0.6), size: 20),
          labelText: label,
          labelStyle:
              TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    await FirebaseFirestore.instance
        .collection('users')
        .doc(widget.userId)
        .collection('DeliveryAddress')
        .doc(widget.model.uid)
        .update({
      "address": address,
      "houseNumber": houseNumber,
      "closestbusStop": closestStop,
    });

    Fluttertoast.showToast(msg: "Address updated");
    Navigator.pop(context);
  }
}
