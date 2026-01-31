import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shimmer/shimmer.dart';
import '../Model/pickup_model.dart';

class PickupAddressesPage extends StatefulWidget {
  const PickupAddressesPage({super.key});

  @override
  State<PickupAddressesPage> createState() => _PickupAddressesPageState();
}

class _PickupAddressesPageState extends State<PickupAddressesPage> {
  // Design constants - matching cart & wallet pages
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  DocumentReference? userDetails;
  String id = '';
  String addressID = '';

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
            'Pickup Addresses',
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
                              Icons.location_on_outlined,
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
                                  'Select Your Pickup Location',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 16,
                                    color: Colors.white,
                                  ),
                                ).tr(),
                                const SizedBox(height: 4),
                                const Text(
                                  'Choose from our available locations',
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
                                'Tap on any location below to see details and confirm your selection',
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
                // Parking Information & Contact Section
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
                      // Parking Tips Section
                      Row(
                        children: [
                          const Icon(
                            Icons.local_parking_outlined,
                            color: kGold,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'Parking & Pickup Tips',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: Colors.white,
                            ),
                          ).tr(),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // Tips List
                      _buildTipRow(
                          '🅿️', 'Free parking available at all locations'),
                      _buildTipRow('⏱️', 'Pickup usually takes 5-10 minutes'),
                      _buildTipRow(
                          '🔔', 'We\'ll notify you when order is ready'),
                      _buildTipRow('⏰', 'Operating hours: 10 AM - 10 PM daily'),
                      const SizedBox(height: 12),
                      // Divider
                      Container(
                        height: 0.5,
                        color: Colors.white.withOpacity(0.1),
                      ),
                      const SizedBox(height: 12),
                      // Contact Section
                      Row(
                        children: [
                          const Icon(
                            Icons.storefront_outlined,
                            color: kGold,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'Available Stores',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: Colors.white,
                            ),
                          ).tr(),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // Available Stores Info
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: kGold.withOpacity(0.2),
                          ),
                        ),
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.info_outline,
                                  color: kGold.withOpacity(0.7),
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: const Text(
                                    'Select any store below to pickup your order',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.white70,
                                    ),
                                  ).tr(),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                const Icon(
                                  Icons.phone,
                                  color: kGold,
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Need help? Contact us',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.white70,
                                        ),
                                      ).tr(),
                                      const SizedBox(height: 2),
                                      GestureDetector(
                                        onTap: () {
                                          // Open phone dialer
                                          // launchUrl(Uri(scheme: 'tel', path: '+1234567890'));
                                        },
                                        child: const Text(
                                          '+1 (800) 123-4567',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: kGold,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
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
                                      'No pickup addresses available',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ).tr(),
                                    const SizedBox(height: 12),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 24,
                                      ),
                                      child: const Text(
                                        'We\'re working on adding more pickup locations. Check back soon!',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Colors.white70,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ).tr(),
                                    ),
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
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () {
                                          Navigator.pop(
                                              context, addressModel.address);
                                        },
                                        borderRadius: BorderRadius.circular(14),
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color:
                                                Colors.white.withOpacity(0.08),
                                            borderRadius:
                                                BorderRadius.circular(14),
                                            border: Border.all(
                                              color:
                                                  Colors.white.withOpacity(0.1),
                                              width: 1,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black
                                                    .withOpacity(0.2),
                                                blurRadius: 8,
                                                offset: const Offset(0, 4),
                                              ),
                                            ],
                                          ),
                                          child: Column(
                                            children: [
                                              // Map Preview Section
                                              Container(
                                                height: 140,
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      const BorderRadius.only(
                                                    topLeft:
                                                        Radius.circular(14),
                                                    topRight:
                                                        Radius.circular(14),
                                                  ),
                                                  color: Colors.grey[300],
                                                  border: Border(
                                                    bottom: BorderSide(
                                                      color: Colors.white
                                                          .withOpacity(0.1),
                                                    ),
                                                  ),
                                                ),
                                                child: Stack(
                                                  children: [
                                                    // Placeholder for map or image
                                                    Container(
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            const BorderRadius
                                                                .only(
                                                          topLeft:
                                                              Radius.circular(
                                                                  14),
                                                          topRight:
                                                              Radius.circular(
                                                                  14),
                                                        ),
                                                        color: Colors.grey[400],
                                                      ),
                                                      child: Center(
                                                        child: Column(
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .center,
                                                          children: [
                                                            Icon(
                                                              Icons.location_on,
                                                              size: 40,
                                                              color: Colors
                                                                  .grey[600],
                                                            ),
                                                            const SizedBox(
                                                              height: 4,
                                                            ),
                                                            Text(
                                                              addressModel
                                                                  .title,
                                                              style: TextStyle(
                                                                color: Colors
                                                                    .grey[700],
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                    // Golden overlay corner
                                                    Positioned(
                                                      top: 0,
                                                      right: 0,
                                                      child: Container(
                                                        decoration:
                                                            const BoxDecoration(
                                                          color: kGold,
                                                          borderRadius:
                                                              BorderRadius.only(
                                                            topRight:
                                                                Radius.circular(
                                                                    14),
                                                          ),
                                                        ),
                                                        padding:
                                                            const EdgeInsets
                                                                .symmetric(
                                                          horizontal: 8,
                                                          vertical: 4,
                                                        ),
                                                        child: const Text(
                                                          '📍',
                                                          style: TextStyle(
                                                            fontSize: 14,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              // Content Section
                                              Padding(
                                                padding:
                                                    const EdgeInsets.all(14),
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          child: Column(
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .start,
                                                            children: [
                                                              Text(
                                                                addressModel
                                                                    .title,
                                                                style:
                                                                    const TextStyle(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w700,
                                                                  fontSize: 15,
                                                                  color: kGold,
                                                                ),
                                                              ),
                                                              const SizedBox(
                                                                height: 8,
                                                              ),
                                                              Text(
                                                                addressModel
                                                                    .address,
                                                                maxLines: 3,
                                                                overflow:
                                                                    TextOverflow
                                                                        .ellipsis,
                                                                style:
                                                                    const TextStyle(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w400,
                                                                  fontSize: 13,
                                                                  color: Colors
                                                                      .white70,
                                                                  height: 1.4,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                        const SizedBox(
                                                          width: 12,
                                                        ),
                                                        Container(
                                                          decoration:
                                                              BoxDecoration(
                                                            color: kGold
                                                                .withOpacity(
                                                                    0.2),
                                                            shape:
                                                                BoxShape.circle,
                                                          ),
                                                          padding:
                                                              const EdgeInsets
                                                                  .all(10),
                                                          child: const Icon(
                                                            Icons.arrow_forward,
                                                            color: kGold,
                                                            size: 20,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    const SizedBox(height: 12),
                                                    Container(
                                                      decoration: BoxDecoration(
                                                        color: Colors.white
                                                            .withOpacity(0.05),
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(6),
                                                        border: Border.all(
                                                          color: Colors.white
                                                              .withOpacity(
                                                                  0.08),
                                                        ),
                                                      ),
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                        horizontal: 8,
                                                        vertical: 6,
                                                      ),
                                                      child: Text(
                                                        'Tap to select',
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: kGold
                                                              .withOpacity(0.7),
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        ),
                                                      ).tr(),
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
                                  height: 200,
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
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper method to build tip rows
  Widget _buildTipRow(String emoji, String text) {
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
