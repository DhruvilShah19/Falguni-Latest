import 'package:cloud_firestore/cloud_firestore.dart';
import '../Model/products.dart';

class FavoriteService {
  static final _firestore = FirebaseFirestore.instance;

  static Stream<bool> isFavorite({
    required String userID,
    required ProductsModel product,
  }) {
    return _firestore
        .collection("users")
        .doc(userID)
        .collection("Favorite")
        .where("marketID", isEqualTo: product.marketID)
        .where("vendorId", isEqualTo: product.vendorId)
        .where("name", isEqualTo: product.name)
        .snapshots()
        .map((snap) => snap.docs.isNotEmpty);
  }

  static Future<void> addFavorite({
    required String userID,
    required ProductsModel product,
  }) async {
    await _firestore
        .collection("users")
        .doc(userID)
        .collection("Favorite")
        .doc("${product.vendorId}${product.name}")
        .set(product.toMap());
  }

  static Future<void> removeFavorite({
    required String userID,
    required ProductsModel product,
  }) async {
    await _firestore
        .collection("users")
        .doc(userID)
        .collection("Favorite")
        .doc("${product.marketID}${product.vendorId}${product.name}")
        .delete();
  }
}
