// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import '../Widgets/map_snapshot.dart';

// Mirrors falguni_web/app/contact/page.tsx -- store info, hours, map, and
// social/marketplace links. The website has no equivalent screen was
// missing entirely on the app side before this; phone/maps launch
// mechanics follow the exact pattern already used in pickup_addresses.dart
// so this stays consistent with the rest of the app rather than
// introducing a new way of doing the same thing.
class ContactPage extends StatelessWidget {
  const ContactPage({super.key});

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  static const double _storeLat = 23.0360;
  static const double _storeLong = 72.5294;
  static const String _phone = '+919825382002';
  static const String _phoneDisplay = '+91 98253 82002';
  static const String _address =
      'Shop No 1, Hirak Complex, opposite Shakti Enclave, Nehru Park, '
      'Mahavir Nagar society, Vastrapur, Ahmedabad, Gujarat 380015';

  Future<void> _launchPhone() async {
    final uri = Uri(scheme: 'tel', path: _phone);
    if (!await launchUrl(uri)) {
      debugPrint('Could not launch phone');
    }
  }

  Future<void> _launchDirections() async {
    final uri = Uri.parse(
        'https://www.google.com/maps/dir/?api=1&destination=$_storeLat,$_storeLong');
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch directions');
    }
  }

  Future<void> _launchExternal(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        title: Text(
          "Contact Us",
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            letterSpacing: .5,
          ),
        ).tr(),
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [kBgTop, kBgMid, kBgTop],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          _buildContent(),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 110, 18, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Falguni Gruh Udhyog",
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            "GOURMET GROCERY STORE",
            style: TextStyle(
              color: kGold,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 24),

          // Info card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow(
                  icon: Icons.location_on_outlined,
                  title: 'Located in: Hirak Centre',
                  subtitle: _address,
                  trailing: GestureDetector(
                    onTap: _launchDirections,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.directions_outlined,
                            size: 13, color: kGold),
                        const SizedBox(width: 4),
                        Text(
                          'GET DIRECTIONS',
                          style: TextStyle(
                            color: kGold,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                GestureDetector(
                  onTap: _launchPhone,
                  child: _infoRow(
                    icon: Icons.phone_outlined,
                    title: _phoneDisplay,
                    titleStyle: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                _infoRow(
                  icon: Icons.access_time,
                  title: '10 AM – 9 PM',
                  subtitle: 'Store Hours',
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: kGold.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Pickup: 9 AM – 5 PM',
                      style: TextStyle(
                        color: kGold,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Map
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              height: 220,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: const SnapshotBody(lat: _storeLat, long: _storeLong),
            ),
          ),
          const SizedBox(height: 28),

          // Social
          Row(
            children: [
              Expanded(
                child: _linkCard(
                  icon: Icons.camera_alt_outlined,
                  iconColor: const Color(0xFFE1306C),
                  label: 'Instagram',
                  sub: '@falgunigruhudhyogindia',
                  onTap: () => _launchExternal(
                      'https://instagram.com/falgunigruhudhyogindia'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _linkCard(
                  icon: Icons.play_circle_outline,
                  iconColor: const Color(0xFFFF0000),
                  label: 'YouTube',
                  sub: 'Subscribe',
                  onTap: () => _launchExternal(
                      'https://youtube.com/@FalguniGruhUdgyogvastrapur'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          Center(
            child: Text(
              'ALSO AVAILABLE ON',
              style: TextStyle(
                color: kGold,
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 10,
            runSpacing: 10,
            children: [
              _pillLink('Swiggy Instamart', const Color(0xFFFC8019),
                  'https://www.swiggy.com/instamart/search?custom_back=true&query=Falguni+Gruh+Udhyog'),
              _pillLink('Flipkart', const Color(0xFF2874F0),
                  'https://www.flipkart.com/food-products/namkeen/falguni-gruh-udhyog~brand/pr?sid=eat,0we&marketplace=FLIPKART'),
              _pillLink('Amazon', const Color(0xFFFF9900),
                  'https://www.amazon.in/s?k=FGU&ref=bl_dp_s_web_0'),
              _pillLink('Taplink', const Color(0xFF818CF8),
                  'https://taplink.cc/falgunigruhudhyog'),
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _infoRow({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    TextStyle? titleStyle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: kGold),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: titleStyle ??
                    const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.55),
                    fontSize: 12.5,
                    height: 1.4,
                  ),
                ),
              ],
              if (trailing != null) ...[
                const SizedBox(height: 10),
                trailing,
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _linkCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String sub,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: iconColor, size: 24),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sub,
              style: TextStyle(
                color: Colors.white.withOpacity(0.5),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _pillLink(String label, Color color, String url) {
    return GestureDetector(
      onTap: () => _launchExternal(url),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(shape: BoxShape.circle, color: color),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
