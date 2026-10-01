import 'package:flutter/foundation.dart';

@immutable
class PickupModel {
  final String uid;
  final String title;
  final String address;
  final num lat;
  final num long;
  final String phone;
  final String operatingHours;
  final bool isDefault;
  final dynamic timeCreated;
  final dynamic createdAt;
  final dynamic updatedAt;

  const PickupModel({
    required this.uid,
    required this.title,
    required this.address,
    required this.lat,
    required this.long,
    this.phone = '',
    this.operatingHours = '',
    this.isDefault = false,
    this.timeCreated,
    this.createdAt,
    this.updatedAt,
  });

  factory PickupModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return PickupModel(
        uid: uid ?? '',
        title: '',
        address: '',
        lat: 0,
        long: 0,
      );
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
      return false;
    }

    return PickupModel(
      uid: uid ?? data['uid']?.toString() ?? '',
      title: data['title']?.toString().trim() ?? '',
      address: data['address']?.toString().trim() ?? '',
      lat: parseNum(data['lat']),
      long: parseNum(data['long']),
      phone: data['phone']?.toString().trim() ?? '',
      operatingHours:
          (data['operatingHours'] ?? data['hours'])?.toString().trim() ?? '',
      isDefault: parseBool(data['isDefault']),
      timeCreated: data['timeCreated']?.toString(),
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'address': address,
      'lat': lat,
      'long': long,
      'phone': phone,
      'operatingHours': operatingHours,
      'isDefault': isDefault,
      'timeCreated': timeCreated,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get hasCoordinates => lat != 0 && long != 0;
  bool get hasPhone => phone.trim().isNotEmpty;
  bool get hasHours => operatingHours.trim().isNotEmpty;

  PickupModel copyWith({
    String? uid,
    String? title,
    String? address,
    num? lat,
    num? long,
    String? phone,
    String? operatingHours,
    bool? isDefault,
    dynamic timeCreated,
    dynamic createdAt,
    dynamic updatedAt,
  }) {
    return PickupModel(
      uid: uid ?? this.uid,
      title: title ?? this.title,
      address: address ?? this.address,
      lat: lat ?? this.lat,
      long: long ?? this.long,
      phone: phone ?? this.phone,
      operatingHours: operatingHours ?? this.operatingHours,
      isDefault: isDefault ?? this.isDefault,
      timeCreated: timeCreated ?? this.timeCreated,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PickupModel &&
          runtimeType == other.runtimeType &&
          uid == other.uid &&
          title == other.title &&
          address == other.address &&
          lat == other.lat &&
          long == other.long &&
          isDefault == other.isDefault;

  @override
  int get hashCode =>
      uid.hashCode ^
      title.hashCode ^
      address.hashCode ^
      lat.hashCode ^
      long.hashCode ^
      isDefault.hashCode;

  @override
  String toString() =>
      'PickupModel(uid: $uid, title: $title, isDefault: $isDefault, address: $address)';
}
