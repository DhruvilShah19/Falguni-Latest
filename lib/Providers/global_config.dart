import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class GlobalConfig {
  static String currencySymbol = '\$';
  static num deliveryFee = 0;

  static Future<void> init() async {
    try {
      final currencyDoc = await FirebaseFirestore.instance
          .collection('Currency Settings')
          .doc('Currency Settings')
          .get();
      
      if (currencyDoc.exists && currencyDoc.data() != null) {
        currencySymbol = currencyDoc.data()!['Currency symbol'] ?? '\$';
      }

      final deliveryDoc = await FirebaseFirestore.instance
          .collection('Delivery Fee')
          .doc('Delivery Fee')
          .get();
          
      if (deliveryDoc.exists && deliveryDoc.data() != null) {
        deliveryFee = deliveryDoc.data()!['Delivery Fee'] ?? 0;
      }
    } catch (e) {
      debugPrint("Error fetching global config: $e");
    }
  }
}
