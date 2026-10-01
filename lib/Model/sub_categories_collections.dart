import 'package:flutter/foundation.dart';

@immutable
class SubCategoriesCollectionsModel {
  final String? uid;
  final String? id;
  final String category;
  final String name;
  final String subCategory;
  final String image;
  final int position;
  final dynamic createdAt;
  final dynamic updatedAt;

  const SubCategoriesCollectionsModel({
    this.uid,
    this.id,
    required this.category,
    required this.subCategory,
    required this.image,
    required this.name,
    this.position = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory SubCategoriesCollectionsModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return SubCategoriesCollectionsModel(
        uid: uid,
        category: '',
        subCategory: '',
        image: '',
        name: '',
      );
    }

    int parsePosition(dynamic val) {
      if (val is int) return val;
      if (val is num) return val.toInt();
      if (val is String) return int.tryParse(val.trim()) ?? 0;
      return 0;
    }

    return SubCategoriesCollectionsModel(
      uid: uid,
      id: data['id']?.toString() ?? uid,
      category: data['category']?.toString().trim() ?? '',
      subCategory: data['sub-category']?.toString().trim() ?? '',
      image: data['image']?.toString().trim() ?? '',
      name: data['name']?.toString().trim() ?? '',
      position: parsePosition(data['position'] ?? data['sortOrder']),
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'category': category,
      'image': image,
      'id': id,
      'name': name,
      'sub-category': subCategory,
      'position': position,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get hasImage => image.trim().isNotEmpty;
  bool get isNotEmpty => name.trim().isNotEmpty;

  SubCategoriesCollectionsModel copyWith({
    String? uid,
    String? id,
    String? category,
    String? subCategory,
    String? image,
    String? name,
    int? position,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return SubCategoriesCollectionsModel(
      uid: uid ?? this.uid,
      id: id ?? this.id,
      category: category ?? this.category,
      subCategory: subCategory ?? this.subCategory,
      image: image ?? this.image,
      name: name ?? this.name,
      position: position ?? this.position,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SubCategoriesCollectionsModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          id == other.id &&
          category == other.category &&
          subCategory == other.subCategory &&
          name == other.name &&
          image == other.image &&
          position == other.position;

  @override
  int get hashCode =>
      uid.hashCode ^
      id.hashCode ^
      category.hashCode ^
      subCategory.hashCode ^
      name.hashCode ^
      image.hashCode ^
      position.hashCode;

  @override
  String toString() =>
      'SubCategoriesCollectionsModel(uid: $uid, name: $name, subCategory: $subCategory, category: $category)';
}

