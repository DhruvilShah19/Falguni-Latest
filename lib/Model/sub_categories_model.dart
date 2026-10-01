import 'package:flutter/foundation.dart';

@immutable
class SubCategoriesModel {
  final String? uid;
  final String category;
  final String name;
  final String image;
  final int position;
  final dynamic createdAt;
  final dynamic updatedAt;

  const SubCategoriesModel({
    this.uid,
    required this.category,
    required this.image,
    required this.name,
    this.position = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory SubCategoriesModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return SubCategoriesModel(uid: uid, category: '', image: '', name: '');
    }

    int parsePosition(dynamic val) {
      if (val is int) return val;
      if (val is num) return val.toInt();
      if (val is String) return int.tryParse(val.trim()) ?? 0;
      return 0;
    }

    return SubCategoriesModel(
      uid: uid,
      category: data['category']?.toString().trim() ?? '',
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
      'name': name,
      'position': position,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get hasImage => image.trim().isNotEmpty;
  bool get isNotEmpty => name.trim().isNotEmpty;

  SubCategoriesModel copyWith({
    String? uid,
    String? category,
    String? name,
    String? image,
    int? position,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return SubCategoriesModel(
      uid: uid ?? this.uid,
      category: category ?? this.category,
      name: name ?? this.name,
      image: image ?? this.image,
      position: position ?? this.position,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SubCategoriesModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          category == other.category &&
          name == other.name &&
          image == other.image &&
          position == other.position;

  @override
  int get hashCode =>
      uid.hashCode ^
      category.hashCode ^
      name.hashCode ^
      image.hashCode ^
      position.hashCode;

  @override
  String toString() =>
      'SubCategoriesModel(uid: $uid, name: $name, category: $category, position: $position)';
}

