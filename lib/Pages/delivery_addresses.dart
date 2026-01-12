// // ignore_for_file: deprecated_member_use, use_build_context_synchronously

// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:fluttertoast/fluttertoast.dart';
// import 'package:easy_localization/easy_localization.dart';

// import '../Model/address.dart';
// import '../Widgets/add_delivery_address.dart';
// import '../Widgets/edit_delivery_address.dart';

// class DeliveryAddressesPage extends StatefulWidget {
//   const DeliveryAddressesPage({super.key});

//   @override
//   State<DeliveryAddressesPage> createState() => _DeliveryAddressesPageState();
// }

// class _DeliveryAddressesPageState extends State<DeliveryAddressesPage> {
//   String id = '';
//   String addressID = '';

//   @override
//   void initState() {
//     _getUserDetails();
//     super.initState();
//   }

//   Future<void> _getUserDetails() async {
//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) return;

//     FirebaseFirestore.instance
//         .collection('users')
//         .doc(user.uid)
//         .snapshots()
//         .listen((snap) {
//       if (!snap.exists) return;
//       setState(() {
//         id = snap['id'];
//         addressID = snap['DeliveryAddressID'] ?? '';
//       });
//     });
//   }

//   Future<List<AddressModel>> _getAddresses() async {
//     if (id.isEmpty) return [];

//     final snapshot = await FirebaseFirestore.instance
//         .collection('users')
//         .doc(id)
//         .collection('DeliveryAddress')
//         .get();

//     return snapshot.docs
//         .map((doc) => AddressModel.fromMap(doc.data(), doc.id))
//         .toList();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);

//     return Scaffold(
//       backgroundColor: theme.colorScheme.background.withOpacity(0.97),
//       floatingActionButton: FloatingActionButton.extended(
//         label: const Text("Add Address"),
//         icon: const Icon(Icons.add),
//         onPressed: () => Navigator.push(
//           context,
//           MaterialPageRoute(builder: (_) => const AddDeliveryAddress()),
//         ),
//       ),
//       appBar: AppBar(
//         elevation: 0,
//         centerTitle: true,
//         backgroundColor: theme.colorScheme.background,
//         iconTheme: IconThemeData(
//           color:
//               theme.brightness == Brightness.dark ? Colors.white : Colors.black,
//         ),
//         title: Text(
//           "Delivery Addresses".tr(),
//           style: theme.textTheme.titleLarge!.copyWith(
//             fontWeight: FontWeight.w700,
//             color: theme.brightness == Brightness.dark
//                 ? Colors.white
//                 : Colors.black,
//           ),
//         ),
//       ),
//       body: Padding(
//         padding: const EdgeInsets.symmetric(horizontal: 16),
//         child: FutureBuilder<List<AddressModel>>(
//           future: _getAddresses(),
//           builder: (_, snap) {
//             if (!snap.hasData) {
//               return const Center(child: CircularProgressIndicator());
//             }

//             final list = snap.data!;
//             if (list.isEmpty) return _empty(context);

//             return ListView.separated(
//               itemCount: list.length,
//               keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
//               separatorBuilder: (_, __) => const SizedBox(height: 12),
//               itemBuilder: (_, i) {
//                 return _addressCard(context, list[i]);
//               },
//             );
//           },
//         ),
//       ),
//     );
//   }

//   // ---------------------------------------------------------------------------
//   // ADDRESS CARD WITH MENU
//   // ---------------------------------------------------------------------------

//   Widget _addressCard(BuildContext context, AddressModel model) {
//     final theme = Theme.of(context);
//     final selected = model.id == addressID;

//     return GestureDetector(
//       onTap: () => _makeDefault(model),
//       child: AnimatedScale(
//         duration: const Duration(milliseconds: 120),
//         scale: 1.0,
//         child: Container(
//           padding: const EdgeInsets.all(18),
//           decoration: BoxDecoration(
//             color: theme.cardColor,
//             borderRadius: BorderRadius.circular(18),
//             border: selected
//                 ? Border.all(
//                     color: theme.colorScheme.primary,
//                     width: 1.5,
//                   )
//                 : null,
//             boxShadow: [
//               BoxShadow(
//                 color: Colors.black.withOpacity(0.06),
//                 blurRadius: 10,
//                 offset: const Offset(0, 3),
//               ),
//             ],
//           ),
//           child: Row(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Icon(
//                 Icons.location_on_rounded,
//                 size: 30,
//                 color: theme.colorScheme.primary,
//               ),

//               const SizedBox(width: 16),

//               Expanded(
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Row(
//                       children: [
//                         Expanded(
//                           child: Text(
//                             model.address,
//                             style: theme.textTheme.titleMedium!.copyWith(
//                               fontWeight: FontWeight.w700,
//                             ),
//                           ),
//                         ),

//                         // Default Badge
//                         if (selected)
//                           Container(
//                             padding: const EdgeInsets.symmetric(
//                                 horizontal: 10, vertical: 4),
//                             decoration: BoxDecoration(
//                               color: theme.colorScheme.primary,
//                               borderRadius: BorderRadius.circular(20),
//                             ),
//                             child: const Text(
//                               "Default",
//                               style: TextStyle(
//                                   color: Colors.white,
//                                   fontSize: 11,
//                                   fontWeight: FontWeight.w600),
//                             ),
//                           ),
//                       ],
//                     ),
//                     const SizedBox(height: 6),
//                     Text(
//                       "House: ${model.houseNumber}",
//                       style: theme.textTheme.bodySmall!.copyWith(
//                         color: Colors.grey.shade600,
//                       ),
//                     ),
//                   ],
//                 ),
//               ),

//               const SizedBox(width: 8),

//               // 3-dot menu
//               PopupMenuButton<String>(
//                 shape: RoundedRectangleBorder(
//                   borderRadius: BorderRadius.circular(12),
//                 ),
//                 onSelected: (value) {
//                   if (value == "edit") {
//                     Navigator.push(
//                       context,
//                       MaterialPageRoute(
//                         builder: (_) =>
//                             EditDeliveryAddress(model: model, userId: id),
//                       ),
//                     ).then((_) => setState(() {}));
//                   }

//                   if (value == "delete") _deleteConfirm(context, model);
//                   if (value == "default") _makeDefault(model);
//                 },
//                 itemBuilder: (_) => [
//                   const PopupMenuItem(
//                     value: "edit",
//                     child: Row(
//                       children: [
//                         Icon(Icons.edit, size: 18),
//                         SizedBox(width: 10),
//                         Text("Edit Address"),
//                       ],
//                     ),
//                   ),
//                   const PopupMenuItem(
//                     value: "default",
//                     child: Row(
//                       children: [
//                         Icon(Icons.star, size: 18),
//                         SizedBox(width: 10),
//                         Text("Make Default"),
//                       ],
//                     ),
//                   ),
//                   const PopupMenuItem(
//                     value: "delete",
//                     child: Row(
//                       children: [
//                         Icon(Icons.delete, size: 18, color: Colors.redAccent),
//                         SizedBox(width: 10),
//                         Text("Delete",
//                             style: TextStyle(color: Colors.redAccent)),
//                       ],
//                     ),
//                   ),
//                 ],
//               )
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   // ---------------------------------------------------------------------------
//   // DELETE CONFIRMATION
//   // ---------------------------------------------------------------------------

//   void _deleteConfirm(BuildContext context, AddressModel model) {
//     showDialog(
//       context: context,
//       builder: (_) {
//         return AlertDialog(
//           shape:
//               RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
//           title: const Text("Delete Address"),
//           content: const Text("Are you sure you want to delete this address?"),
//           actions: [
//             TextButton(
//               child: const Text("Cancel"),
//               onPressed: () => Navigator.pop(context),
//             ),
//             ElevatedButton(
//               style:
//                   ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
//               child: const Text("Delete"),
//               onPressed: () async {
//                 await FirebaseFirestore.instance
//                     .collection('users')
//                     .doc(id)
//                     .collection('DeliveryAddress')
//                     .doc(model.uid)
//                     .delete();

//                 Fluttertoast.showToast(msg: "Address deleted");
//                 Navigator.pop(context);
//                 setState(() {});
//               },
//             ),
//           ],
//         );
//       },
//     );
//   }

//   // ---------------------------------------------------------------------------
//   // SET DEFAULT ADDRESS
//   // ---------------------------------------------------------------------------

//   Future<void> _makeDefault(AddressModel model) async {
//     await FirebaseFirestore.instance.collection('users').doc(id).update({
//       "DeliveryAddress": model.address,
//       "HouseNumber": model.houseNumber,
//       "ClosestBustStop": model.closestbusStop,
//       "DeliveryAddressID": model.id,
//     });

//     Fluttertoast.showToast(msg: "Default Address Selected");
//     setState(() => addressID = model.id);
//   }

//   // ---------------------------------------------------------------------------
//   // EMPTY UI
//   // ---------------------------------------------------------------------------

//   Widget _empty(BuildContext context) {
//     return Center(
//       child: Column(
//         children: [
//           const SizedBox(height: 100),
//           Image.asset("assets/image/rider update.png",
//               height: MediaQuery.of(context).size.height * 0.3),
//           const SizedBox(height: 14),
//           Text("No Saved Addresses",
//               style: Theme.of(context)
//                   .textTheme
//                   .titleMedium!
//                   .copyWith(fontWeight: FontWeight.bold)),
//           const SizedBox(height: 6),
//           Text("Tap + to add your first address",
//               style: TextStyle(color: Colors.grey.shade600)),
//         ],
//       ),
//     );
//   }
// }

// ignore_for_file: deprecated_member_use, use_build_context_synchronously

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:gap/gap.dart';

import '../Model/address.dart';
import '../Widgets/add_delivery_address.dart';
import '../Widgets/edit_delivery_address.dart';

class DeliveryAddressesPage extends StatefulWidget {
  const DeliveryAddressesPage({super.key});

  @override
  State<DeliveryAddressesPage> createState() => _DeliveryAddressesPageState();
}

class _DeliveryAddressesPageState extends State<DeliveryAddressesPage> {
  // Theme Palette
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);

  String id = '';
  String addressID = '';

  @override
  void initState() {
    _getUserDetails();
    super.initState();
  }

  // --- LOGIC PRESERVED ---
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
    return Scaffold(
      backgroundColor: Colors.black,
      // 🔹 BOUTIQUE FLOATING ACTION BUTTON
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: kGold,
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AddDeliveryAddress()),
        ).then((_) => setState(() {})),
        label: const Text("NEW ADDRESS",
            style: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.w900,
                letterSpacing: 1)),
        icon: const Icon(Icons.add_location_alt_rounded, color: Colors.black),
      ),
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
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              sliver: FutureBuilder<List<AddressModel>>(
                future: _getAddresses(),
                builder: (_, snap) {
                  if (!snap.hasData) {
                    return const SliverFillRemaining(
                        child: Center(
                            child: CircularProgressIndicator(color: kGold)));
                  }

                  final list = snap.data!;
                  if (list.isEmpty) {
                    return SliverToBoxAdapter(child: _empty(context));
                  }

                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) => _addressCard(context, list[i]),
                      childCount: list.length,
                    ),
                  );
                },
              ),
            ),
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
      title: Text(
        "DELIVERY ADDRESSES".tr().toUpperCase(),
        style: const TextStyle(
            color: kGold,
            fontSize: 14,
            fontWeight: FontWeight.w900,
            letterSpacing: 2),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            color: Colors.white, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
    );
  }

  Widget _addressCard(BuildContext context, AddressModel model) {
    final bool isDefault = model.id == addressID;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDefault
              ? kGold.withOpacity(0.5)
              : Colors.white.withOpacity(0.08),
          width: isDefault ? 1.5 : 1,
        ),
      ),
      child: InkWell(
        onTap: () => _makeDefault(model),
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isDefault
                      ? kGold.withOpacity(0.1)
                      : Colors.white.withOpacity(0.05),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.location_pin,
                  color: isDefault ? kGold : Colors.white24,
                  size: 24,
                ),
              ),
              const Gap(16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      model.address.toUpperCase(),
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          letterSpacing: 0.5),
                    ),
                    const Gap(6),
                    Text(
                      "House No: ${model.houseNumber}",
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.4), fontSize: 12),
                    ),
                    if (isDefault) ...[
                      const Gap(10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: kGold,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          "DEFAULT ADDRESS",
                          style: TextStyle(
                              color: Colors.black,
                              fontSize: 9,
                              fontWeight: FontWeight.w900),
                        ),
                      ),
                    ]
                  ],
                ),
              ),
              _buildMoreMenu(model),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMoreMenu(AddressModel model) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert_rounded, color: Colors.white24),
      color: const Color(0xFF2F2525),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      onSelected: (value) {
        if (value == "edit") {
          Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) =>
                          EditDeliveryAddress(model: model, userId: id)))
              .then((_) => setState(() {}));
        }
        if (value == "delete") _deleteConfirm(context, model);
        if (value == "default") _makeDefault(model);
      },
      itemBuilder: (_) => [
        _menuItem("edit", Icons.edit_note_rounded, "Edit"),
        _menuItem("default", Icons.star_rounded, "Make Default"),
        _menuItem("delete", Icons.delete_outline_rounded, "Delete",
            isDestructive: true),
      ],
    );
  }

  PopupMenuItem<String> _menuItem(String value, IconData icon, String label,
      {bool isDestructive = false}) {
    return PopupMenuItem(
      value: value,
      child: Row(
        children: [
          Icon(icon, size: 20, color: isDestructive ? Colors.redAccent : kGold),
          const Gap(12),
          Text(label,
              style: TextStyle(
                  color: isDestructive ? Colors.redAccent : Colors.white,
                  fontSize: 14)),
        ],
      ),
    );
  }

  // --- LOGIC PRESERVED ---
  Future<void> _makeDefault(AddressModel model) async {
    HapticFeedback.mediumImpact();
    await FirebaseFirestore.instance.collection('users').doc(id).update({
      "DeliveryAddress": model.address,
      "HouseNumber": model.houseNumber,
      "ClosestBustStop": model.closestbusStop,
      "DeliveryAddressID": model.id,
    });
    Fluttertoast.showToast(msg: "Default Address set");
    setState(() => addressID = model.id);
  }

  void _deleteConfirm(BuildContext context, AddressModel model) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1C1515),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Delete Address",
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: const Text("Remove this address from your profile?",
            style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("CANCEL",
                  style: TextStyle(color: Colors.white24))),
          TextButton(
            onPressed: () async {
              await FirebaseFirestore.instance
                  .collection('users')
                  .doc(id)
                  .collection('DeliveryAddress')
                  .doc(model.uid)
                  .delete();
              Navigator.pop(context);
              setState(() {});
            },
            child: const Text("DELETE",
                style: TextStyle(
                    color: Colors.redAccent, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _empty(BuildContext context) {
    return Column(
      children: [
        const Gap(100),
        Icon(Icons.map_outlined,
            size: 80, color: Colors.white.withOpacity(0.05)),
        const Gap(20),
        const Text("NO SAVED ADDRESSES",
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                letterSpacing: 1)),
        const Gap(10),
        Text("Add a delivery location to start shopping",
            style:
                TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13)),
      ],
    );
  }
}
