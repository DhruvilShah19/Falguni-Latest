import 'package:flutter/foundation.dart';

@immutable
class FeedsModel {
  /// Unique document ID in Firestore 'Feeds' collection
  final String? uid;

  /// Headline or title of the banner / slide
  final String title;

  /// Optional subtitle or promotional caption
  final String detail;

  /// Public image URL (e.g. Firebase Storage or CDN)
  final String image;

  /// Target category slug/name if tapping banner navigates to products of this category
  final String category;

  /// Sub-category (legacy compatibility)
  final String subCategory;

  /// Sub-category-collections (legacy compatibility)
  final String subCategoryCollections;

  /// Whether the banner is active and displayed in the carousel slider
  final bool slider;

  /// Display priority/order index (lower numbers appear first)
  final int position;

  /// Type of action when tapped: 'category', 'product', 'url', 'none'
  final String linkType;

  /// Target value for the link (category name, productId, web URL, etc.)
  final String linkValue;

  /// Timestamp when created
  final dynamic createdAt;

  /// Timestamp when last updated
  final dynamic updatedAt;

  const FeedsModel({
    this.uid,
    this.title = '',
    this.detail = '',
    this.image = '',
    this.category = '',
    this.subCategory = '',
    this.subCategoryCollections = '',
    this.slider = true,
    this.position = 0,
    this.linkType = 'category',
    this.linkValue = '',
    this.createdAt,
    this.updatedAt,
  });

  /// Factory constructor to safely parse Firestore map data
  factory FeedsModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return FeedsModel(uid: uid, image: '');
    }

    final categoryStr = data['category']?.toString().trim() ?? '';
    final linkTypeStr = data['linkType']?.toString().trim() ??
        (categoryStr.isNotEmpty ? 'category' : 'none');
    final linkValueStr = data['linkValue']?.toString().trim() ?? categoryStr;

    // Defensively parse boolean slider flag
    bool parseSlider(dynamic val) {
      if (val is bool) return val;
      if (val is num) return val != 0;
      if (val is String) {
        final s = val.toLowerCase().trim();
        return s == 'true' || s == '1' || s == 'yes';
      }
      return true; // default active
    }

    // Defensively parse position / order index
    int parsePosition(dynamic val) {
      if (val is int) return val;
      if (val is num) return val.toInt();
      if (val is String) return int.tryParse(val.trim()) ?? 0;
      return 0;
    }

    return FeedsModel(
      uid: uid,
      title: data['title']?.toString().trim() ?? '',
      detail: data['detail']?.toString().trim() ?? '',
      image: data['image']?.toString().trim() ?? '',
      category: categoryStr,
      subCategory: data['sub-category']?.toString().trim() ?? '',
      subCategoryCollections:
          data['sub-category-collections']?.toString().trim() ?? '',
      slider: parseSlider(data['slider']),
      position: parsePosition(data['position'] ?? data['sortOrder']),
      linkType: linkTypeStr,
      linkValue: linkValueStr,
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  /// Converts the model to a Firestore-compatible map
  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'detail': detail,
      'image': image,
      'category': category,
      'sub-category': subCategory,
      'sub-category-collections': subCategoryCollections,
      'slider': slider,
      'position': position,
      'linkType': linkType,
      'linkValue': linkValue,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  /// Helper getters for domain logic
  bool get hasImage => image.trim().isNotEmpty;
  bool get hasCategory => category.trim().isNotEmpty;
  bool get isActive => slider;
  bool get hasLink =>
      (linkValue.trim().isNotEmpty && linkType != 'none') || hasCategory;

  /// Immutability copyWith method
  FeedsModel copyWith({
    String? uid,
    String? title,
    String? detail,
    String? image,
    String? category,
    String? subCategory,
    String? subCategoryCollections,
    bool? slider,
    int? position,
    String? linkType,
    String? linkValue,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return FeedsModel(
      uid: uid ?? this.uid,
      title: title ?? this.title,
      detail: detail ?? this.detail,
      image: image ?? this.image,
      category: category ?? this.category,
      subCategory: subCategory ?? this.subCategory,
      subCategoryCollections:
          subCategoryCollections ?? this.subCategoryCollections,
      slider: slider ?? this.slider,
      position: position ?? this.position,
      linkType: linkType ?? this.linkType,
      linkValue: linkValue ?? this.linkValue,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FeedsModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          title == other.title &&
          detail == other.detail &&
          image == other.image &&
          category == other.category &&
          slider == other.slider &&
          position == other.position &&
          linkType == other.linkType &&
          linkValue == other.linkValue;

  @override
  int get hashCode =>
      uid.hashCode ^
      title.hashCode ^
      detail.hashCode ^
      image.hashCode ^
      category.hashCode ^
      slider.hashCode ^
      position.hashCode ^
      linkType.hashCode ^
      linkValue.hashCode;

  @override
  String toString() =>
      'FeedsModel(uid: $uid, title: $title, category: $category, slider: $slider, position: $position)';
}

