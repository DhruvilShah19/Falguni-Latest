import 'package:flutter/foundation.dart';

@immutable
class CategoriesModel {
  final String? uid;
  final String category;
  final String image;
  final int position;
  final dynamic createdAt;
  final dynamic updatedAt;

  const CategoriesModel({
    this.uid,
    required this.category,
    required this.image,
    this.position = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory CategoriesModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return CategoriesModel(uid: uid, category: '', image: '');
    }

    int parsePosition(dynamic val) {
      if (val is int) return val;
      if (val is num) return val.toInt();
      if (val is String) return int.tryParse(val.trim()) ?? 0;
      return 0;
    }

    return CategoriesModel(
      uid: uid,
      category: data['category']?.toString().trim() ?? '',
      image: data['image']?.toString().trim() ?? '',
      position: parsePosition(data['position'] ?? data['sortOrder']),
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'category': category,
      'image': image,
      'position': position,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get hasImage => image.trim().isNotEmpty;
  bool get isNotEmpty => category.trim().isNotEmpty;

  CategoriesModel copyWith({
    String? uid,
    String? category,
    String? image,
    int? position,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return CategoriesModel(
      uid: uid ?? this.uid,
      category: category ?? this.category,
      image: image ?? this.image,
      position: position ?? this.position,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CategoriesModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          category == other.category &&
          image == other.image &&
          position == other.position;

  @override
  int get hashCode =>
      uid.hashCode ^ category.hashCode ^ image.hashCode ^ position.hashCode;

  @override
  String toString() =>
      'CategoriesModel(uid: $uid, category: $category, position: $position)';
}

