// ignore_for_file: deprecated_member_use, use_build_context_synchronously

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
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Edit Address"),
        centerTitle: true,
        backgroundColor: theme.colorScheme.background,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _input("Address", address, (v) => address = v),
              const SizedBox(height: 16),
              _input("House Number", houseNumber, (v) => houseNumber = v),
              const SizedBox(height: 16),
              _input("Zip Code", closestStop, (v) => closestStop = v),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                  ),
                  onPressed: _save,
                  child: const Text("Save Changes",
                      style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _input(String label, String value, Function(String) onChanged) {
    return TextFormField(
      initialValue: value,
      validator: (v) => v!.isEmpty ? "Required" : null,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
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
