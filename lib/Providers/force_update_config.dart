import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';

class ForceUpdateInfo {
  final bool isRequired;
  final String message;
  final String storeUrl;

  const ForceUpdateInfo({
    required this.isRequired,
    required this.message,
    required this.storeUrl,
  });

  static const none = ForceUpdateInfo(isRequired: false, message: '', storeUrl: '');
}

// Lets the minimum required build number be bumped from Firestore alone, no
// new release needed to start gating older installs. Only affects installs
// that already contain this check -- an install on a build that predates
// this file entirely has no way to be reached remotely.
class ForceUpdateConfig {
  static const _defaultAndroidStoreUrl =
      'https://play.google.com/store/apps/details?id=com.Falgunigruhudhyog';

  static Future<ForceUpdateInfo> check() async {
    if (kIsWeb) return ForceUpdateInfo.none;

    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentBuildNumber = int.tryParse(packageInfo.buildNumber) ?? 0;

      final doc = await FirebaseFirestore.instance
          .collection('Force Update')
          .doc('Force Update')
          .get();

      if (!doc.exists || doc.data() == null) return ForceUpdateInfo.none;

      final data = doc.data()!;
      final isIOS = defaultTargetPlatform == TargetPlatform.iOS;
      final minBuildNumber =
          (isIOS ? data['iosMinBuildNumber'] : data['androidMinBuildNumber']) as int? ?? 0;
      final storeUrl = (isIOS ? data['iosStoreUrl'] : data['androidStoreUrl']) as String? ??
          _defaultAndroidStoreUrl;
      final message = data['message'] as String? ??
          'A new version of Falguni Gruh Udhyog is available. Please update to continue.';

      return ForceUpdateInfo(
        isRequired: currentBuildNumber < minBuildNumber,
        message: message,
        storeUrl: storeUrl,
      );
    } catch (e) {
      debugPrint('Error checking force update config: $e');
      // Never block the app because the check itself failed (offline, etc).
      return ForceUpdateInfo.none;
    }
  }
}
