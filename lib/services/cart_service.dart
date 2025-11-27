import 'package:cloud_firestore/cloud_firestore.dart';
import '../Model/products.dart';

class CartService {
  static final _firestore = FirebaseFirestore.instance;

  static Stream<num> listenCartQuantity(String userID) {
    return _firestore
        .collection("users")
        .doc(userID)
        .collection("Cart")
        .snapshots()
        .map((snap) {
      num total = 0;
      for (var doc in snap.docs) {
        total += (doc.data()["quantity"] as num);
      }
      return total;
    });
  }

  static Future<void> addToCart({
    required String userID,
    required String marketID,
    required num deliveryFee,
    required ProductsModel product,
    required String selectedUnit,
  }) async {
    await _firestore
        .collection("users")
        .doc(userID)
        .collection("Cart")
        .doc("${product.vendorId}${product.name}$selectedUnit")
        .set(product.toMap());

    await _firestore.collection("users").doc(userID).update({
      "CurrentMarketID": marketID,
      "deliveryFee": deliveryFee,
    });
  }

  static Future<void> clearCart(String userID) async {
    final cart = await _firestore
        .collection("users")
        .doc(userID)
        .collection("Cart")
        .get();

    for (var doc in cart.docs) {
      await doc.reference.delete();
    }
  }

  static Future<String> getCurrentMarketID(String userID) async {
    final doc = await _firestore.collection("users").doc(userID).get();
    return doc["CurrentMarketID"] ?? "";
  }

  static Future<void> resetMarketID(String userID) async {
    await _firestore.collection("users").doc(userID).update({
      "CurrentMarketID": "",
      "deliveryFee": 0,
    });
  }
}
