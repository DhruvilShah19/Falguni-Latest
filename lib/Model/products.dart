import 'package:flutter/foundation.dart';

@immutable
class ProductVariant {
  final int index;
  final String unitName;
  final num price;
  final num oldPrice;

  const ProductVariant({
    required this.index,
    required this.unitName,
    required this.price,
    required this.oldPrice,
  });

  bool get hasDiscount => oldPrice > price && price > 0;
  num get discountPercentage =>
      hasDiscount ? (((oldPrice - price) / oldPrice) * 100).round() : 0;
}

@immutable
class ProductsModel {
  final String uid;
  final String name;
  final String category;
  final String subCategory;
  final String subSubCategory;
  final String image1;
  final String image2;
  final String image3;
  final String unitname1;
  final String unitname2;
  final String unitname3;
  final String unitname4;
  final String unitname5;
  final String unitname6;
  final String unitname7;
  final num unitPrice1;
  final num unitPrice2;
  final num unitPrice3;
  final num unitPrice4;
  final num unitPrice5;
  final num unitPrice6;
  final num unitPrice7;
  final num unitOldPrice1;
  final num unitOldPrice2;
  final num unitOldPrice3;
  final num unitOldPrice4;
  final num unitOldPrice5;
  final num unitOldPrice6;
  final num unitOldPrice7;
  final num percantageDiscount;
  final String vendorId;
  final String brandName;
  final String marketID;
  final String marketName;
  final String description;
  final String productID;
  final num totalRating;
  final num totalNumberOfUserRating;
  final int quantity;
  final String? endFlash;
  final num? price;
  final String? selected;
  final num? selectedPrice;
  final dynamic createdAt;
  final dynamic updatedAt;

  const ProductsModel({
    required this.uid,
    required this.name,
    this.category = '',
    this.subCategory = '',
    this.subSubCategory = '',
    this.image1 = '',
    this.image2 = '',
    this.image3 = '',
    this.unitname1 = '',
    this.unitname2 = '',
    this.unitname3 = '',
    this.unitname4 = '',
    this.unitname5 = '',
    this.unitname6 = '',
    this.unitname7 = '',
    this.unitPrice1 = 0,
    this.unitPrice2 = 0,
    this.unitPrice3 = 0,
    this.unitPrice4 = 0,
    this.unitPrice5 = 0,
    this.unitPrice6 = 0,
    this.unitPrice7 = 0,
    this.unitOldPrice1 = 0,
    this.unitOldPrice2 = 0,
    this.unitOldPrice3 = 0,
    this.unitOldPrice4 = 0,
    this.unitOldPrice5 = 0,
    this.unitOldPrice6 = 0,
    this.unitOldPrice7 = 0,
    this.percantageDiscount = 0,
    this.vendorId = '',
    this.brandName = '',
    this.marketID = '',
    this.marketName = '',
    this.description = '',
    this.productID = '',
    this.totalRating = 0,
    this.totalNumberOfUserRating = 0,
    this.quantity = 0,
    this.endFlash,
    this.price,
    this.selected,
    this.selectedPrice,
    this.createdAt,
    this.updatedAt,
  });

  factory ProductsModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return ProductsModel(uid: uid ?? '', name: '');
    }

    String parseStr(dynamic val) => val?.toString().trim() ?? '';

    num parseNum(dynamic val) {
      if (val is num) return val;
      if (val is String) return num.tryParse(val.trim()) ?? 0;
      return 0;
    }

    int parseInt(dynamic val) {
      if (val is int) return val;
      if (val is num) return val.toInt();
      if (val is String) return int.tryParse(val.trim()) ?? 0;
      return 0;
    }

    return ProductsModel(
      uid: uid ?? parseStr(data['uid']),
      name: parseStr(data['name']),
      category: parseStr(data['category']),
      subCategory: parseStr(data['subCategory']),
      subSubCategory: parseStr(data['subSubCategory']),
      image1: parseStr(data['image1']),
      image2: parseStr(data['image2']),
      image3: parseStr(data['image3']),
      unitname1: parseStr(data['unitname1']),
      unitname2: parseStr(data['unitname2']),
      unitname3: parseStr(data['unitname3']),
      unitname4: parseStr(data['unitname4']),
      unitname5: parseStr(data['unitname5']),
      unitname6: parseStr(data['unitname6']),
      unitname7: parseStr(data['unitname7']),
      unitPrice1: parseNum(data['unitPrice1']),
      unitPrice2: parseNum(data['unitPrice2']),
      unitPrice3: parseNum(data['unitPrice3']),
      unitPrice4: parseNum(data['unitPrice4']),
      unitPrice5: parseNum(data['unitPrice5']),
      unitPrice6: parseNum(data['unitPrice6']),
      unitPrice7: parseNum(data['unitPrice7']),
      unitOldPrice1: parseNum(data['unitOldPrice1']),
      unitOldPrice2: parseNum(data['unitOldPrice2']),
      unitOldPrice3: parseNum(data['unitOldPrice3']),
      unitOldPrice4: parseNum(data['unitOldPrice4']),
      unitOldPrice5: parseNum(data['unitOldPrice5']),
      unitOldPrice6: parseNum(data['unitOldPrice6']),
      unitOldPrice7: parseNum(data['unitOldPrice7']),
      percantageDiscount: parseNum(data['percantageDiscount']),
      vendorId: parseStr(data['vendorId']),
      brandName: parseStr(data['brandName']),
      marketID: parseStr(data['marketID']),
      marketName: parseStr(data['marketName']),
      description: parseStr(data['description']),
      productID: parseStr(data['productID']),
      totalRating: parseNum(data['totalRating']),
      totalNumberOfUserRating: parseNum(data['totalNumberOfUserRating']),
      quantity: parseInt(data['quantity']),
      endFlash: data['endFlash']?.toString(),
      price: data['price'] != null ? parseNum(data['price']) : null,
      selected: data['selected']?.toString(),
      selectedPrice: data['selectedPrice'] != null
          ? parseNum(data['selectedPrice'])
          : null,
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'category': category,
      'subCategory': subCategory,
      'subSubCategory': subSubCategory,
      'image1': image1,
      'image2': image2,
      'image3': image3,
      'unitname1': unitname1,
      'unitname2': unitname2,
      'unitname3': unitname3,
      'unitname4': unitname4,
      'unitname5': unitname5,
      'unitname6': unitname6,
      'unitname7': unitname7,
      'unitPrice1': unitPrice1,
      'unitPrice2': unitPrice2,
      'unitPrice3': unitPrice3,
      'unitPrice4': unitPrice4,
      'unitPrice5': unitPrice5,
      'unitPrice6': unitPrice6,
      'unitPrice7': unitPrice7,
      'unitOldPrice1': unitOldPrice1,
      'unitOldPrice2': unitOldPrice2,
      'unitOldPrice3': unitOldPrice3,
      'unitOldPrice4': unitOldPrice4,
      'unitOldPrice5': unitOldPrice5,
      'unitOldPrice6': unitOldPrice6,
      'unitOldPrice7': unitOldPrice7,
      'percantageDiscount': percantageDiscount,
      'vendorId': vendorId,
      'brandName': brandName,
      'marketID': marketID,
      'marketName': marketName,
      'description': description,
      'productID': productID,
      'totalRating': totalRating,
      'totalNumberOfUserRating': totalNumberOfUserRating,
      'quantity': quantity,
      'endFlash': endFlash,
      if (price != null) 'price': price,
      if (selected != null) 'selected': selected,
      if (selectedPrice != null) 'selectedPrice': selectedPrice,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  /// Helper: First non-empty product image
  String get primaryImage {
    if (image1.isNotEmpty) return image1;
    if (image2.isNotEmpty) return image2;
    if (image3.isNotEmpty) return image3;
    return '';
  }

  /// Helper: All available image URLs
  List<String> get allImages =>
      [image1, image2, image3].where((img) => img.isNotEmpty).toList();

  /// Helper: Active product unit variants
  List<ProductVariant> get availableVariants {
    final variants = <ProductVariant>[];
    final units = [
      (unitname1, unitPrice1, unitOldPrice1),
      (unitname2, unitPrice2, unitOldPrice2),
      (unitname3, unitPrice3, unitOldPrice3),
      (unitname4, unitPrice4, unitOldPrice4),
      (unitname5, unitPrice5, unitOldPrice5),
      (unitname6, unitPrice6, unitOldPrice6),
      (unitname7, unitPrice7, unitOldPrice7),
    ];
    for (int i = 0; i < units.length; i++) {
      final (name, price, oldPrice) = units[i];
      if (name.isNotEmpty || price > 0) {
        variants.add(ProductVariant(
          index: i + 1,
          unitName: name.isNotEmpty ? name : 'Unit ${i + 1}',
          price: price,
          oldPrice: oldPrice,
        ));
      }
    }
    return variants;
  }

  /// Helper: Lowest variant price
  num get minPrice {
    final active = availableVariants.map((v) => v.price).where((p) => p > 0);
    return active.isEmpty
        ? (unitPrice1 > 0 ? unitPrice1 : 0)
        : active.reduce((a, b) => a < b ? a : b);
  }

  /// Helper: Has any active discount
  bool get hasDiscount =>
      (unitOldPrice1 > unitPrice1 && unitPrice1 > 0) ||
      (percantageDiscount > 0);

  ProductsModel copyWith({
    String? uid,
    String? name,
    String? category,
    String? subCategory,
    String? subSubCategory,
    String? image1,
    String? image2,
    String? image3,
    String? unitname1,
    String? unitname2,
    String? unitname3,
    String? unitname4,
    String? unitname5,
    String? unitname6,
    String? unitname7,
    num? unitPrice1,
    num? unitPrice2,
    num? unitPrice3,
    num? unitPrice4,
    num? unitPrice5,
    num? unitPrice6,
    num? unitPrice7,
    num? unitOldPrice1,
    num? unitOldPrice2,
    num? unitOldPrice3,
    num? unitOldPrice4,
    num? unitOldPrice5,
    num? unitOldPrice6,
    num? unitOldPrice7,
    num? percantageDiscount,
    String? vendorId,
    String? brandName,
    String? marketID,
    String? marketName,
    String? description,
    String? productID,
    num? totalRating,
    num? totalNumberOfUserRating,
    int? quantity,
    String? endFlash,
    num? price,
    String? selected,
    num? selectedPrice,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return ProductsModel(
      uid: uid ?? this.uid,
      name: name ?? this.name,
      category: category ?? this.category,
      subCategory: subCategory ?? this.subCategory,
      subSubCategory: subSubCategory ?? this.subSubCategory,
      image1: image1 ?? this.image1,
      image2: image2 ?? this.image2,
      image3: image3 ?? this.image3,
      unitname1: unitname1 ?? this.unitname1,
      unitname2: unitname2 ?? this.unitname2,
      unitname3: unitname3 ?? this.unitname3,
      unitname4: unitname4 ?? this.unitname4,
      unitname5: unitname5 ?? this.unitname5,
      unitname6: unitname6 ?? this.unitname6,
      unitname7: unitname7 ?? this.unitname7,
      unitPrice1: unitPrice1 ?? this.unitPrice1,
      unitPrice2: unitPrice2 ?? this.unitPrice2,
      unitPrice3: unitPrice3 ?? this.unitPrice3,
      unitPrice4: unitPrice4 ?? this.unitPrice4,
      unitPrice5: unitPrice5 ?? this.unitPrice5,
      unitPrice6: unitPrice6 ?? this.unitPrice6,
      unitPrice7: unitPrice7 ?? this.unitPrice7,
      unitOldPrice1: unitOldPrice1 ?? this.unitOldPrice1,
      unitOldPrice2: unitOldPrice2 ?? this.unitOldPrice2,
      unitOldPrice3: unitOldPrice3 ?? this.unitOldPrice3,
      unitOldPrice4: unitOldPrice4 ?? this.unitOldPrice4,
      unitOldPrice5: unitOldPrice5 ?? this.unitOldPrice5,
      unitOldPrice6: unitOldPrice6 ?? this.unitOldPrice6,
      unitOldPrice7: unitOldPrice7 ?? this.unitOldPrice7,
      percantageDiscount: percantageDiscount ?? this.percantageDiscount,
      vendorId: vendorId ?? this.vendorId,
      brandName: brandName ?? this.brandName,
      marketID: marketID ?? this.marketID,
      marketName: marketName ?? this.marketName,
      description: description ?? this.description,
      productID: productID ?? this.productID,
      totalRating: totalRating ?? this.totalRating,
      totalNumberOfUserRating:
          totalNumberOfUserRating ?? this.totalNumberOfUserRating,
      quantity: quantity ?? this.quantity,
      endFlash: endFlash ?? this.endFlash,
      price: price ?? this.price,
      selected: selected ?? this.selected,
      selectedPrice: selectedPrice ?? this.selectedPrice,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProductsModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          name == other.name &&
          category == other.category &&
          unitPrice1 == other.unitPrice1 &&
          quantity == other.quantity;

  @override
  int get hashCode =>
      uid.hashCode ^
      name.hashCode ^
      category.hashCode ^
      unitPrice1.hashCode ^
      quantity.hashCode;

  @override
  String toString() =>
      'ProductsModel(uid: $uid, name: $name, category: $category, price: $minPrice)';
}
