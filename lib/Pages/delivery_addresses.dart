// ignore_for_file: deprecated_member_use, use_build_context_synchronously

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:easy_localization/easy_localization.dart';

import '../Model/address.dart';
import '../Widgets/add_delivery_address.dart';
import '../Widgets/edit_delivery_address.dart';

class DeliveryAddressesPage extends StatefulWidget {
  const DeliveryAddressesPage({super.key});

  @override
  State<DeliveryAddressesPage> createState() => _DeliveryAddressesPageState();
}

class _DeliveryAddressesPageState extends State<DeliveryAddressesPage> {
  String id = '';
  String addressID = '';

  @override
  void initState() {
    _getUserDetails();
    super.initState();
  }

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((snap) {
      if (!snap.exists) return;
      setState(() {
        id = snap['id'];
        addressID = snap['DeliveryAddressID'] ?? '';
      });
    });
  }

  Future<List<AddressModel>> _getAddresses() async {
    if (id.isEmpty) return [];

    final snapshot = await FirebaseFirestore.instance
        .collection('users')
        .doc(id)
        .collection('DeliveryAddress')
        .get();

    return snapshot.docs
        .map((doc) => AddressModel.fromMap(doc.data(), doc.id))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background.withOpacity(0.97),
      floatingActionButton: FloatingActionButton.extended(
        label: const Text("Add Address"),
        icon: const Icon(Icons.add),
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AddDeliveryAddress()),
        ),
      ),
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        backgroundColor: theme.colorScheme.background,
        iconTheme: IconThemeData(
          color:
              theme.brightness == Brightness.dark ? Colors.white : Colors.black,
        ),
        title: Text(
          "Delivery Addresses".tr(),
          style: theme.textTheme.titleLarge!.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.brightness == Brightness.dark
                ? Colors.white
                : Colors.black,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: FutureBuilder<List<AddressModel>>(
          future: _getAddresses(),
          builder: (_, snap) {
            if (!snap.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final list = snap.data!;
            if (list.isEmpty) return _empty(context);

            return ListView.separated(
              itemCount: list.length,
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                return _addressCard(context, list[i]);
              },
            );
          },
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // ADDRESS CARD WITH MENU
  // ---------------------------------------------------------------------------

  Widget _addressCard(BuildContext context, AddressModel model) {
    final theme = Theme.of(context);
    final selected = model.id == addressID;

    return GestureDetector(
      onTap: () => _makeDefault(model),
      child: AnimatedScale(
        duration: const Duration(milliseconds: 120),
        scale: 1.0,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(18),
            border: selected
                ? Border.all(
                    color: theme.colorScheme.primary,
                    width: 1.5,
                  )
                : null,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.location_on_rounded,
                size: 30,
                color: theme.colorScheme.primary,
              ),

              const SizedBox(width: 16),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            model.address,
                            style: theme.textTheme.titleMedium!.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),

                        // Default Badge
                        if (selected)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              "Default",
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      "House: ${model.houseNumber}",
                      style: theme.textTheme.bodySmall!.copyWith(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              // 3-dot menu
              PopupMenuButton<String>(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                onSelected: (value) {
                  if (value == "edit") {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            EditDeliveryAddress(model: model, userId: id),
                      ),
                    ).then((_) => setState(() {}));
                  }

                  if (value == "delete") _deleteConfirm(context, model);
                  if (value == "default") _makeDefault(model);
                },
                itemBuilder: (_) => [
                  const PopupMenuItem(
                    value: "edit",
                    child: Row(
                      children: [
                        Icon(Icons.edit, size: 18),
                        SizedBox(width: 10),
                        Text("Edit Address"),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: "default",
                    child: Row(
                      children: [
                        Icon(Icons.star, size: 18),
                        SizedBox(width: 10),
                        Text("Make Default"),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: "delete",
                    child: Row(
                      children: [
                        Icon(Icons.delete, size: 18, color: Colors.redAccent),
                        SizedBox(width: 10),
                        Text("Delete",
                            style: TextStyle(color: Colors.redAccent)),
                      ],
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // DELETE CONFIRMATION
  // ---------------------------------------------------------------------------

  void _deleteConfirm(BuildContext context, AddressModel model) {
    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text("Delete Address"),
          content: const Text("Are you sure you want to delete this address?"),
          actions: [
            TextButton(
              child: const Text("Cancel"),
              onPressed: () => Navigator.pop(context),
            ),
            ElevatedButton(
              style:
                  ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
              child: const Text("Delete"),
              onPressed: () async {
                await FirebaseFirestore.instance
                    .collection('users')
                    .doc(id)
                    .collection('DeliveryAddress')
                    .doc(model.uid)
                    .delete();

                Fluttertoast.showToast(msg: "Address deleted");
                Navigator.pop(context);
                setState(() {});
              },
            ),
          ],
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // SET DEFAULT ADDRESS
  // ---------------------------------------------------------------------------

  Future<void> _makeDefault(AddressModel model) async {
    await FirebaseFirestore.instance.collection('users').doc(id).update({
      "DeliveryAddress": model.address,
      "HouseNumber": model.houseNumber,
      "ClosestBustStop": model.closestbusStop,
      "DeliveryAddressID": model.id,
    });

    Fluttertoast.showToast(msg: "Default Address Selected");
    setState(() => addressID = model.id);
  }

  // ---------------------------------------------------------------------------
  // EMPTY UI
  // ---------------------------------------------------------------------------

  Widget _empty(BuildContext context) {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 100),
          Image.asset("assets/image/rider update.png",
              height: MediaQuery.of(context).size.height * 0.3),
          const SizedBox(height: 14),
          Text("No Saved Addresses",
              style: Theme.of(context)
                  .textTheme
                  .titleMedium!
                  .copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text("Tap + to add your first address",
              style: TextStyle(color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
