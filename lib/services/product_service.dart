import 'package:cloud_firestore/cloud_firestore.dart';
import '../Model/products.dart';

class ProductService {
  static final _firestore = FirebaseFirestore.instance;

  /// Get delivery fee for market
  static Future<num> getMarketDeliveryFee() async {
    final doc =
        await _firestore.collection("Delivery Fee").doc("Delivery Fee").get();
    return doc["Delivery Fee"] ?? 0;
  }

  /// Listen to product return duration
  static Stream<int> getReturnPolicy(String productID) {
    return _firestore
        .collection("Products")
        .doc(productID)
        .snapshots()
        .map((doc) => (doc["returnDuration"] as num).toInt());
  }

  /// Compute product price (clean helper)
  static num selectedPrice(ProductsModel model, String unit, num quantity) {
    switch (unit) {
      case 'unit1':
        return model.unitPrice1 * quantity;
      case 'unit2':
        return model.unitPrice2 * quantity;
      case 'unit3':
        return model.unitPrice3 * quantity;
      case 'unit4':
        return model.unitPrice4 * quantity;
      case 'unit5':
        return model.unitPrice5 * quantity;
      case 'unit6':
        return model.unitPrice6 * quantity;
      case 'unit7':
        return model.unitPrice7 * quantity;
      default:
        return model.unitPrice1 * quantity;
    }
  }

  static num selectedUnitPrice(ProductsModel model, String unit) {
    switch (unit) {
      case 'unit1':
        return model.unitPrice1;
      case 'unit2':
        return model.unitPrice2;
      case 'unit3':
        return model.unitPrice3;
      case 'unit4':
        return model.unitPrice4;
      case 'unit5':
        return model.unitPrice5;
      case 'unit6':
        return model.unitPrice6;
      case 'unit7':
        return model.unitPrice7;
      default:
        return model.unitPrice1;
    }
  }

  static String selectedUnitName(ProductsModel model, String unit) {
    switch (unit) {
      case 'unit1':
        return model.unitname1;
      case 'unit2':
        return model.unitname2;
      case 'unit3':
        return model.unitname3;
      case 'unit4':
        return model.unitname4;
      case 'unit5':
        return model.unitname5;
      case 'unit6':
        return model.unitname6;
      case 'unit7':
        return model.unitname7;
      default:
        return model.unitname1;
    }
  }
}
