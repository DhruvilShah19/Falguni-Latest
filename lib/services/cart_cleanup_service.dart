// ignore_for_file: avoid_print

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class CartCleanupService {
  static final _firestore = FirebaseFirestore.instance;
  static final _auth = FirebaseAuth.instance;

  /// Removes all wrong prices from all users' cart items
  /// This clears the 'price' field that was incorrectly stored
  static Future<Map<String, dynamic>> removeAllWrongPrices() async {
    try {
      int deletedCount = 0;
      int errorCount = 0;

      // Get all users
      final usersSnapshot = await _firestore.collection('users').get();

      print('Processing ${usersSnapshot.docs.length} users...');

      for (final userDoc in usersSnapshot.docs) {
        try {
          final userId = userDoc.id;
          final cartRef =
              _firestore.collection('users').doc(userId).collection('Cart');

          final cartSnapshot = await cartRef.get();

          print('User $userId: Found ${cartSnapshot.docs.length} cart items');

          // Process each cart item
          for (final cartItem in cartSnapshot.docs) {
            try {
              // Delete the price field - removes the wrong value
              await cartRef.doc(cartItem.id).update({
                'price': FieldValue.delete(),
              });

              deletedCount++;
              print('Removed price from ${cartItem.id}');
            } catch (e) {
              errorCount++;
              print('Error removing price from ${cartItem.id}: $e');
            }
          }
        } catch (e) {
          errorCount++;
          print('Error processing user ${userDoc.id}: $e');
        }
      }

      final result = {
        'success': true,
        'deletedCount': deletedCount,
        'errorCount': errorCount,
        'message': 'Removed $deletedCount wrong prices. Errors: $errorCount',
      };

      print('Cleanup completed: $result');
      return result;
    } catch (e) {
      print('Fatal error in removeAllWrongPrices: $e');
      return {
        'success': false,
        'error': e.toString(),
        'message': 'Failed to cleanup: $e',
      };
    }
  }

  /// Removes wrong prices only from current user's cart
  static Future<Map<String, dynamic>> removeCurrentUserWrongPrices() async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser == null) {
        return {
          'success': false,
          'message': 'No user logged in',
        };
      }

      int deletedCount = 0;
      int errorCount = 0;

      final cartRef = _firestore
          .collection('users')
          .doc(currentUser.uid)
          .collection('Cart');

      final cartSnapshot = await cartRef.get();

      print('Current user: Found ${cartSnapshot.docs.length} cart items');

      for (final cartItem in cartSnapshot.docs) {
        try {
          await cartRef.doc(cartItem.id).update({
            'price': FieldValue.delete(),
          });
          deletedCount++;
        } catch (e) {
          errorCount++;
          print('Error: $e');
        }
      }

      return {
        'success': true,
        'deletedCount': deletedCount,
        'errorCount': errorCount,
        'message':
            'Removed $deletedCount wrong prices from your cart. Errors: $errorCount',
      };
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
        'message': 'Failed to cleanup: $e',
      };
    }
  }

  /// Clear prices only (keeps all other data)
  static Future<void> clearPriceField(String userId) async {
    final cartRef =
        _firestore.collection('users').doc(userId).collection('Cart');

    final snapshot = await cartRef.get();
    for (final doc in snapshot.docs) {
      await doc.reference.update({
        'price': FieldValue.delete(),
      });
    }
  }
}
