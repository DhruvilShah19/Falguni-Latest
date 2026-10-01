import 'package:flutter/foundation.dart';

@immutable
class CouponModel {
  final String uid;
  final String coupon;
  final String title;
  final num percentage;
  final dynamic timeCreated;
  final bool isActive;
  final num minOrderAmount;
  final num maxDiscount;
  final dynamic expiryDate;
  final dynamic createdAt;
  final dynamic updatedAt;

  const CouponModel({
    this.uid = '',
    required this.coupon,
    this.title = '',
    required this.percentage,
    this.timeCreated,
    this.isActive = true,
    this.minOrderAmount = 0,
    this.maxDiscount = 0,
    this.expiryDate,
    this.createdAt,
    this.updatedAt,
  });

  factory CouponModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return CouponModel(uid: uid ?? '', coupon: '', percentage: 0);
    }

    num parseNum(dynamic val) {
      if (val is num) return val;
      if (val is String) return num.tryParse(val.trim()) ?? 0;
      return 0;
    }

    bool parseBool(dynamic val) {
      if (val is bool) return val;
      if (val is num) return val != 0;
      if (val is String) {
        final s = val.toLowerCase().trim();
        return s == 'true' || s == '1' || s == 'yes';
      }
      return true;
    }

    return CouponModel(
      uid: uid ?? data['uid']?.toString() ?? '',
      coupon: data['coupon']?.toString().trim().toUpperCase() ?? '',
      title: data['title']?.toString().trim() ?? '',
      percentage: parseNum(data['percentage']),
      timeCreated: data['timeCreated'],
      isActive: parseBool(data['isActive'] ?? data['active'] ?? true),
      minOrderAmount: parseNum(data['minOrderAmount'] ?? data['minOrder']),
      maxDiscount: parseNum(data['maxDiscount']),
      expiryDate: data['expiryDate'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'coupon': coupon,
      'title': title,
      'percentage': percentage,
      'timeCreated': timeCreated,
      'isActive': isActive,
      'minOrderAmount': minOrderAmount,
      'maxDiscount': maxDiscount,
      if (expiryDate != null) 'expiryDate': expiryDate,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get isValid => coupon.isNotEmpty && percentage > 0 && isActive;
  String get formattedDiscount =>
      '${percentage.toStringAsFixed(percentage.truncateToDouble() == percentage ? 0 : 1)}%';

  CouponModel copyWith({
    String? uid,
    String? coupon,
    String? title,
    num? percentage,
    dynamic timeCreated,
    bool? isActive,
    num? minOrderAmount,
    num? maxDiscount,
    dynamic expiryDate,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return CouponModel(
      uid: uid ?? this.uid,
      coupon: coupon ?? this.coupon,
      title: title ?? this.title,
      percentage: percentage ?? this.percentage,
      timeCreated: timeCreated ?? this.timeCreated,
      isActive: isActive ?? this.isActive,
      minOrderAmount: minOrderAmount ?? this.minOrderAmount,
      maxDiscount: maxDiscount ?? this.maxDiscount,
      expiryDate: expiryDate ?? this.expiryDate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CouponModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          coupon == other.coupon &&
          percentage == other.percentage &&
          title == other.title &&
          isActive == other.isActive;

  @override
  int get hashCode =>
      uid.hashCode ^
      coupon.hashCode ^
      percentage.hashCode ^
      title.hashCode ^
      isActive.hashCode;

  @override
  String toString() =>
      'CouponModel(uid: $uid, coupon: $coupon, percentage: $percentage, title: $title)';
}

