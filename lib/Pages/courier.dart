// ignore_for_file: deprecated_member_use

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:easy_localization/easy_localization.dart';

import '../Model/courier.dart';
import '../Widgets/add_courier.dart';
import 'courier_overview.dart';

class CourierPage extends StatefulWidget {
  const CourierPage({super.key});

  @override
  State<CourierPage> createState() => _CourierPageState();
}

class _CourierPageState extends State<CourierPage> {
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  DocumentReference? userRef;
  String userID = '';

  Future<void> _getUserModelDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    }
  }

  getuserID() async {
    if (userRef == null) return;

    userRef!.get().then((value) {
      if (mounted) {
        setState(() {
          userID = value['id'];
        });
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _getUserModelDoc();
    getuserID();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      floatingActionButton: FloatingActionButton(
        backgroundColor: kGold,
        elevation: 6,
        child: const Icon(Icons.add, color: kBgTop),
        onPressed: () {
          Navigator.push(
              context, MaterialPageRoute(builder: (_) => const AddCourier()));
        },
      ),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          "Courier System".tr(),
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kBgTop, kBgMid, kBgTop],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        padding: const EdgeInsets.only(top: kToolbarHeight + 20),
        child: StreamBuilder<List<CourierModel>>(
          stream: FirebaseFirestore.instance
              .collection('Courier')
              .where('userUID', isEqualTo: userID)
              .snapshots()
              .map((event) => event.docs
                  .map((e) => CourierModel.fromMap(e.data(), e.id))
                  .toList()),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return _buildShimmer();
            }

            if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return Center(
                child: Image.asset(
                  'assets/image/rider update.png',
                  height: MediaQuery.of(context).size.height / 2,
                ),
              );
            }

            final data = snapshot.data!;

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: data.length,
              itemBuilder: (_, index) {
                final courier = data[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CourierOverview(courierModel: courier),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      title: Text(
                        "Parcel ID: #${courier.parcelID}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      subtitle: courier.status == true
                          ? Text(
                              "Completed".tr(),
                              style: const TextStyle(
                                color: kGold,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            )
                          : const SizedBox(),
                      trailing: const Icon(Icons.chevron_right,
                          color: Colors.white70),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SHIMMER SKELETON
  // ---------------------------------------------------------------------------

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.white.withOpacity(0.15),
      highlightColor: Colors.white.withOpacity(0.3),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 6,
        itemBuilder: (_, __) => Container(
          height: 80,
          margin: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}
