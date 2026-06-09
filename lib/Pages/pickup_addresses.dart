// ignore_for_file: use_build_context_synchronously, prefer_const_constructors, deprecated_member_use

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../Model/pickup_model.dart';

class PickupAddressesPage extends StatefulWidget {
  const PickupAddressesPage({super.key});

  @override
  State<PickupAddressesPage> createState() => _PickupAddressesPageState();
}

class _PickupAddressesPageState extends State<PickupAddressesPage> {
  // Design constants - matching cart & wallet pages
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  DocumentReference? userDetails;
  String id = '';
  String addressID = '';
  final TextEditingController _phoneController = TextEditingController();

  Future<List<PickupModel>> getDeliveryAddresses() {
    return FirebaseFirestore.instance.collection('Pickup Addresses').get().then(
        (event) => event.docs
            .map((e) => PickupModel.fromMap(e.data(), e.id))
            .toList());
  }

  Future<void> _launchPhone() async {
    final Uri launchUri = Uri(scheme: 'tel', path: '+919825382002');
    if (!await launchUrl(launchUri)) {
      debugPrint('Could not launch phone');
    }
  }

  Future<void> _launchSMS() async {
    final Uri launchUri = Uri(scheme: 'sms', path: '+919825382002');
    if (!await launchUrl(launchUri)) {
      debugPrint('Could not launch sms');
    }
  }

  Future<void> _launchEmail() async {
    final Uri launchUri =
        Uri(scheme: 'mailto', path: 'falgunigruhudhyog.sales@gmail.com');
    if (!await launchUrl(launchUri)) {
      debugPrint('Could not launch email');
    }
  }

  Future<void> _launchWhatsApp() async {
    var whatsappUrl =
        "whatsapp://send?phone=+919328299680&text=Hello, I need assistance with pickup";
    if (!await launchUrl(Uri.parse(whatsappUrl))) {
      debugPrint('Could not launch whatsapp');
    }
  }

  Future<void> _launchMap(num lat, num long) async {
    final String googleMapsUrl =
        "https://www.google.com/maps/search/?api=1&query=$lat,$long";
    if (!await launchUrl(Uri.parse(googleMapsUrl),
        mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch maps');
    }
  }

  @override
  void initState() {
    super.initState();
    _fetchUserPhone();
  }

  void _fetchUserPhone() {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get()
          .then((doc) {
        if (doc.exists && mounted) {
          setState(() {
            _phoneController.text = doc.data()?['phone'] ?? '';
          });
        }
      });
    }
  }

  Future<void> _updateUserPhone() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null && _phoneController.text.isNotEmpty) {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .update({
        'phone': _phoneController.text,
      });
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Phone Number Input Section
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
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
                          const Icon(Icons.phone_iphone,
                              color: kGold, size: 20),
                          const SizedBox(width: 10),
                          const Text(
                            'Contact Details',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: Colors.white,
                            ),
                          ).tr(),
                        ],
                      ),
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Enter your phone number',
                          hintStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.05),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                          prefixIcon: const Icon(Icons.call,
                              color: Colors.white54, size: 18),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Admin may contact you on this number for order updates.',
                        style: TextStyle(fontSize: 10, color: Colors.white54),
                      ).tr(),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    "Select Pickup Outlet",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5),
                  ).tr(),
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
                                        onTap: () async {
                                          await _updateUserPhone();
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
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          child: OutlinedButton(
                                                            onPressed: () {
                                                              _launchMap(
                                                                  addressModel
                                                                      .lat,
                                                                  addressModel
                                                                      .long);
                                                            },
                                                            style:
                                                                OutlinedButton
                                                                    .styleFrom(
                                                              side: BorderSide(
                                                                  color: kGold
                                                                      .withOpacity(
                                                                          0.5)),
                                                              shape:
                                                                  RoundedRectangleBorder(
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            8),
                                                              ),
                                                            ),
                                                            child: Text(
                                                              "Get Directions",
                                                              style: TextStyle(
                                                                  color: kGold,
                                                                  fontSize: 12),
                                                            ).tr(),
                                                          ),
                                                        ),
                                                        const SizedBox(
                                                            width: 10),
                                                        Expanded(
                                                          child: ElevatedButton(
                                                            onPressed:
                                                                () async {
                                                              await _updateUserPhone();
                                                              Navigator.pop(
                                                                  context,
                                                                  addressModel
                                                                      .address);
                                                            },
                                                            style:
                                                                ElevatedButton
                                                                    .styleFrom(
                                                              backgroundColor:
                                                                  kGold,
                                                              shape:
                                                                  RoundedRectangleBorder(
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            8),
                                                              ),
                                                            ),
                                                            child: Text(
                                                              "Select Outlet",
                                                              style: TextStyle(
                                                                  color: Colors
                                                                      .black,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold,
                                                                  fontSize: 12),
                                                            ).tr(),
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
                const SizedBox(height: 24),
                // Parking Information & Contact Section (Moved to Bottom)
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
                            Icons.support_agent_outlined,
                            color: kGold,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'Need Assistance?',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: Colors.white,
                            ),
                          ).tr(),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildContactOption(Icons.call, 'Call', _launchPhone),
                          _buildContactOption(Icons.message, 'SMS', _launchSMS),
                          _buildContactOption(
                              Icons.email, 'Email', _launchEmail),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _buildWhatsAppCard(),
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

  Widget _buildContactOption(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: kGold.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: kGold.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: kGold, size: 20),
            const SizedBox(height: 4),
            Text(label,
                    style: const TextStyle(color: Colors.white, fontSize: 10))
                .tr(),
          ],
        ),
      ),
    );
  }

  Widget _buildWhatsAppCard() {
    return InkWell(
      onTap: () {
        _launchWhatsApp();
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16.0),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.greenAccent.withOpacity(0.7)),
          color: Colors.white.withOpacity(0.03),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.greenAccent.withOpacity(0.1),
              ),
              child: Image.asset(
                'assets/image/whatsapp.png',
                height: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Get updates on WhatsApp'.tr(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Say hi and we\'ll help you with your pickup.'.tr(),
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right_rounded,
                color: Colors.white.withOpacity(0.9)),
          ],
        ),
      ),
    );
  }
}
