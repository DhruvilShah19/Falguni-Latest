// ignore_for_file: avoid_print, unused_local_variable, use_build_context_synchronously, deprecated_member_use

import 'dart:async';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:falguni_app/Pages/login_page.dart';
import 'package:falguni_app/Pages/delivery_addresses.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:image_picker/image_picker.dart';

import '../Providers/auth.dart';

class ProfilePage extends StatefulWidget {
  final bool isbottomNav;
  const ProfilePage({super.key, required this.isbottomNav});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  DocumentReference? userRef;

  String fullname = '';
  String email = '';
  String phone = '';
  String userPic = '';
  String userPicMain = '';
  String address = 'Select Address';
  String referralCode = '';
  num cartQuantity = 0;

  final _formKey = GlobalKey<FormState>();
  XFile? imageFile;
  bool loadingImage = false;

  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kPrimaryDark =
      Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kCardDark = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  @override
  void initState() {
    super.initState();
    _getUserRef();
    _listenUserDetails();
  }

  Future<void> _getUserRef() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() {
      userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    });
  }

  void _listenUserDetails() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((value) {
      if (!mounted || !value.exists) return;

      setState(() {
        email = value['email'];
        fullname = value['fullname'];
        phone = value['phone'];
        userPic = value['photoUrl'];

        /// Always read default address
        address = value.data()?['DeliveryAddress']?.toString() ??
            value.data()?['address']?.toString() ??
            "Select Address";

        referralCode = value['personalReferralCode'];
      });
    });
  }

  Future<void> _uploadImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);

    if (picked == null) return;

    setState(() {
      imageFile = picked;
      loadingImage = true;
    });

    try {
      final ref = FirebaseStorage.instance.ref().child(picked.path);
      final task = await ref.putFile(File(picked.path));
      final url = await task.ref.getDownloadURL();

      setState(() {
        userPicMain = url;
      });
    } finally {
      if (mounted) setState(() => loadingImage = false);
    }
  }

  String get _activePic => userPicMain.isNotEmpty ? userPicMain : userPic;

  String _initials() {
    String base = fullname.isNotEmpty ? fullname : email;
    if (base.trim().isEmpty) return "U";

    final parts = base.trim().split(" ");
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts[1][0]).toUpperCase();
  }

  Widget _initialsAvatar() {
    return CircleAvatar(
      radius: 60,
      backgroundColor: kGold.withOpacity(0.15),
      child: Text(
        _initials(),
        style: const TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: kGold,
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    if (imageFile != null) {
      return ClipOval(
        child: Image.file(
          File(imageFile!.path),
          height: 120,
          width: 120,
          fit: BoxFit.cover,
        ),
      );
    }

    if (_activePic.isNotEmpty) {
      return ClipOval(
        child: CachedNetworkImage(
          height: 120,
          width: 120,
          fit: BoxFit.cover,
          imageUrl: _activePic,
          placeholder: (_, __) => const SpinKitRing(
            color: kGold,
            size: 30,
            lineWidth: 3,
          ),
          errorWidget: (_, __, ___) => _initialsAvatar(),
        ),
      );
    }

    return _initialsAvatar();
  }

  void _saveProfile() {
    if (!_formKey.currentState!.validate()) return;

    final finalPhone = phone.isEmpty ? phone : "+91$phone";

    AuthService().updateProfile(
      fullname,
      finalPhone,
      context,
      userPicMain,
      address,
    );
  }

  Future<void> _confirmDelete() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) {
        bool agree = false;
        return StatefulBuilder(builder: (ctx, setStateDialog) {
          return AlertDialog(
            backgroundColor: kPrimaryDark,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Text("Delete Account",
                style: TextStyle(color: kGold, fontWeight: FontWeight.bold)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Are you sure you want to delete your account? This cannot be undone.",
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
                CheckboxListTile(
                  value: agree,
                  onChanged: (val) =>
                      setStateDialog(() => agree = val ?? false),
                  title: const Text(
                    'I understand and want to delete my account.',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  activeColor: kGold,
                  checkColor: Colors.black,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child:
                    const Text("Cancel", style: TextStyle(color: Colors.white)),
              ),
              TextButton(
                onPressed: agree ? () => Navigator.pop(context, true) : null,
                child: const Text(
                  "Delete",
                  style: TextStyle(color: Colors.redAccent),
                ),
              ),
            ],
          );
        });
      },
    );

    if (result == true) _deleteAccount();
  }

  Future<void> _deleteAccount() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return;

      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .delete();
      await user.delete();
      await AuthService().signOut(context);

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  Widget _fieldContainer({
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(.12)),
      ),
      child: Row(
        children: [
          Icon(icon, color: kGold, size: 22),
          const SizedBox(width: 14),
          Expanded(child: child),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPrimaryDark,
      appBar: AppBar(
        automaticallyImplyLeading: !widget.isbottomNav,
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        title: const Text(
          "Edit Profile",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 20,
            letterSpacing: .3,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Avatar
              Center(
                child: Stack(
                  children: [
                    _buildAvatar(),
                    Positioned(
                      bottom: 0,
                      right: 2,
                      child: GestureDetector(
                        onTap: _uploadImage,
                        child: CircleAvatar(
                          radius: 22,
                          backgroundColor: kGold,
                          child: loadingImage
                              ? const SizedBox(
                                  height: 18,
                                  width: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.black,
                                  ),
                                )
                              : const Icon(Icons.camera_alt,
                                  size: 18, color: Colors.black),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 30),

              // Full name
              _fieldContainer(
                icon: Icons.person,
                child: TextFormField(
                  style: const TextStyle(color: Colors.white),
                  validator: (v) =>
                      (v == null || v.isEmpty) ? "Required field".tr() : null,
                  decoration: InputDecoration(
                    hintText: fullname.isEmpty ? "Full Name" : fullname,
                    hintStyle: const TextStyle(color: Colors.white54),
                    border: InputBorder.none,
                  ),
                  onChanged: (v) => fullname = v,
                ),
              ),

              // Email (read only)
              _fieldContainer(
                icon: Icons.email_outlined,
                child: TextFormField(
                  readOnly: true,
                  style: const TextStyle(color: Colors.white70),
                  decoration: InputDecoration(
                    hintText: email,
                    hintStyle: const TextStyle(color: Colors.white60),
                    border: InputBorder.none,
                  ),
                ),
              ),

              // Phone
              _fieldContainer(
                icon: Icons.phone,
                child: TextFormField(
                  maxLength: 10,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    counterText: "",
                    hintText: phone.isEmpty ? "+91 XXXXX XXXXX" : phone,
                    hintStyle: const TextStyle(color: Colors.white54),
                    border: InputBorder.none,
                  ),
                  validator: (v) =>
                      (v == null || v.isEmpty) ? "Required field".tr() : null,
                  onChanged: (v) => phone = v,
                ),
              ),

              // Address
              _fieldContainer(
                icon: Icons.location_on_outlined,
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const DeliveryAddressesPage()),
                    );
                  },
                  child: Text(
                    address.isEmpty ? "Select Address" : address,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white70),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Save Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _saveProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kGold,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    "Save",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Delete account
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  onPressed: _confirmDelete,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent, width: 1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    "Delete My Account",
                    style: TextStyle(
                      color: Colors.redAccent,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
