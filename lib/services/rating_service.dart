import 'package:cloud_firestore/cloud_firestore.dart';
import '../Model/rating.dart';

class RatingService {
  static final _firestore = FirebaseFirestore.instance;

  static Future<List<RatingModel>> getRatings(String productID) async {
    final snap = await _firestore
        .collection("Products")
        .doc(productID)
        .collection("Ratings")
        .get();

    return snap.docs.map((e) => RatingModel.fromMap(e.data(), e.id)).toList();
  }

  static Stream<Map<String, num>> ratingSummaryStream(String productID) {
    return _firestore
        .collection("Products")
        .doc(productID)
        .collection("Ratings")
        .snapshots()
        .map((snap) {
      num totalRate = 0;
      num count = snap.docs.length;

      for (var doc in snap.docs) {
        totalRate += doc["rating"] ?? 0;
      }

      final avg = count == 0 ? 0 : (totalRate / count);

      return {
        "avg": avg,
        "count": count,
      };
    });
  }
}
