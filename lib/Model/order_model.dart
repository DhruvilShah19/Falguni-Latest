import 'package:flutter/foundation.dart';

@immutable
class OrdersList {
  final String productName;
  final String selected;
  final num quantity;
  final String image;
  final String category;
  final dynamic id;
  final String productID;
  final num selectedPrice;
  final num totalNumberOfUserRating;
  final num totalRating;

  const OrdersList({
    required this.productName,
    required this.id,
    this.productID = '',
    required this.selected,
    required this.image,
    required this.selectedPrice,
    this.totalRating = 0,
    this.totalNumberOfUserRating = 0,
    this.category = '',
    required this.quantity,
  });

  factory OrdersList.fromMap(dynamic data) {
    if (data == null || data is! Map) {
      return const OrdersList(
        productName: '',
        id: '',
        selected: '',
        image: '',
        selectedPrice: 0,
        quantity: 0,
      );
    }

    String parseStr(dynamic val) => val?.toString().trim() ?? '';
    num parseNum(dynamic val) {
      if (val is num) return val;
      if (val is String) return num.tryParse(val.trim()) ?? 0;
      return 0;
    }

    final rawId = data['productID'] ?? data['id'] ?? '';
    return OrdersList(
      productName: parseStr(data['name'] ?? data['productName']),
      selected: parseStr(data['selected']),
      id: rawId,
      productID: parseStr(data['productID'] ?? data['id']),
      image: parseStr(data['image1'] ?? data['image']),
      selectedPrice:
          parseNum(data['selectedPrice'] ?? data['newPrice'] ?? data['price']),
      totalRating: parseNum(data['totalRating']),
      totalNumberOfUserRating: parseNum(data['totalNumberOfUserRating']),
      category: parseStr(data['category']),
      quantity: parseNum(data['quantity']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': productName,
      'selected': selected,
      'productID': productID.isNotEmpty ? productID : id?.toString(),
      'id': id,
      'image1': image,
      'selectedPrice': selectedPrice,
      'totalRating': totalRating,
      'totalNumberOfUserRating': totalNumberOfUserRating,
      'category': category,
      'quantity': quantity,
    };
  }
}

@immutable
class OrderModel {
  final String pickupAddress;
  final String marketID;
  final String vendorID;
  final String userID;
  final String deliveryAddress;
  final String houseNumber;
  final String closesBusStop;
  final String deliveryBoyID;
  final String status;
  final bool accept;
  final int orderID;
  final dynamic timeCreated;
  final num total;
  final num deliveryFee;
  final bool acceptDelivery;
  final bool? confirmationStatus;
  final String paymentType;
  final List<dynamic> orders;
  final String uid;
  final int weekNumber;
  final String date;
  final String day;
  final String month;
  final String year;
  final dynamic cashFreeDetails;
  final dynamic createdAt;
  final dynamic updatedAt;

  const OrderModel({
    required this.marketID,
    this.weekNumber = 0,
    this.date = '',
    this.month = '',
    this.year = '',
    this.day = '',
    this.cashFreeDetails,
    this.createdAt,
    this.updatedAt,
    required this.pickupAddress,
    required this.orderID,
    required this.orders,
    required this.uid,
    required this.acceptDelivery,
    required this.deliveryFee,
    required this.total,
    required this.vendorID,
    required this.paymentType,
    this.confirmationStatus,
    required this.userID,
    required this.timeCreated,
    required this.deliveryAddress,
    required this.houseNumber,
    required this.closesBusStop,
    required this.deliveryBoyID,
    required this.status,
    required this.accept,
  });

  factory OrderModel.fromMap(dynamic data, String? uid) {
    if (data == null || data is! Map) {
      return OrderModel(
        marketID: '',
        pickupAddress: '',
        orderID: 0,
        orders: const [],
        uid: uid ?? '',
        acceptDelivery: false,
        deliveryFee: 0,
        total: 0,
        vendorID: '',
        paymentType: 'Cash Free',
        userID: '',
        timeCreated: '',
        deliveryAddress: '',
        houseNumber: '',
        closesBusStop: '',
        deliveryBoyID: '',
        status: '',
        accept: false,
      );
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

    bool parseBool(dynamic val) {
      if (val is bool) return val;
      if (val is num) return val != 0;
      if (val is String) {
        final s = val.toLowerCase().trim();
        return s == 'true' || s == '1' || s == 'yes';
      }
      return false;
    }

    return OrderModel(
      marketID: parseStr(data['marketID']),
      weekNumber: parseInt(data['weekNumber']),
      date: parseStr(data['date']),
      month: parseStr(data['month']),
      year: parseStr(data['year']),
      day: parseStr(data['day']),
      cashFreeDetails: data['cashFreeDetails'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
      pickupAddress: parseStr(data['pickupAddress']),
      orderID: parseInt(data['orderID']),
      orders: data['orders'] is List ? (data['orders'] as List) : const [],
      uid: uid ?? parseStr(data['uid']),
      acceptDelivery: parseBool(data['acceptDelivery']),
      deliveryFee: parseNum(data['deliveryFee']),
      total: parseNum(data['total']),
      vendorID: parseStr(data['vendorID']),
      paymentType: parseStr(data['paymentType'] ?? 'Cash Free'),
      confirmationStatus: data['confirmationStatus'] != null
          ? parseBool(data['confirmationStatus'])
          : null,
      userID: parseStr(data['userID']),
      timeCreated: data['timeCreated'],
      deliveryAddress: parseStr(data['deliveryAddress']),
      houseNumber: parseStr(data['houseNumber']),
      closesBusStop: parseStr(data['closesBusStop']),
      deliveryBoyID: parseStr(data['deliveryBoyID']),
      status: parseStr(data['status']),
      accept: parseBool(data['accept']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'month': month,
      'year': year,
      'weekNumber': weekNumber,
      'date': date,
      'day': day,
      'pickupAddress': pickupAddress,
      'paymentType': paymentType,
      'marketID': marketID,
      'orderID': orderID,
      'orders': orders,
      'acceptDelivery': acceptDelivery,
      'deliveryFee': deliveryFee,
      'total': total,
      'vendorID': vendorID,
      'userID': userID,
      'timeCreated': timeCreated,
      'deliveryAddress': deliveryAddress,
      'houseNumber': houseNumber,
      'closesBusStop': closesBusStop,
      'deliveryBoyID': deliveryBoyID,
      'status': status,
      'confirmationStatus': confirmationStatus,
      'accept': accept,
      'uid': uid,
      'cashFreeDetails': cashFreeDetails,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get isDelivered => status.toLowerCase() == 'delivered';
  bool get isCancelled => status.toLowerCase() == 'cancelled';
  bool get isPickup => !acceptDelivery || pickupAddress.isNotEmpty;
  String get formattedTotal => '₹${total.toStringAsFixed(2)}';
}

@immutable
class OrderModel2 {
  final bool? confirmationStatus;
  final String marketID;
  final String pickupAddress;
  final String vendorID;
  final String userID;
  final String deliveryAddress;
  final String houseNumber;
  final String closesBusStop;
  final String deliveryBoyID;
  final String status;
  final bool accept;
  final int orderID;
  final dynamic timeCreated;
  final num total;
  final String uid;
  final num deliveryFee;
  final bool acceptDelivery;
  final List<OrdersList> orders;
  final String paymentType;
  final dynamic cashFreeDetails;
  final dynamic createdAt;
  final dynamic updatedAt;

  const OrderModel2({
    this.marketID = '',
    this.pickupAddress = '',
    this.uid = '',
    this.orderID = 0,
    this.orders = const [],
    this.acceptDelivery = false,
    this.deliveryFee = 0,
    this.total = 0,
    this.vendorID = '',
    this.paymentType = 'Cash Free',
    this.userID = '',
    this.timeCreated,
    this.confirmationStatus,
    this.cashFreeDetails,
    this.deliveryAddress = '',
    this.houseNumber = '',
    this.closesBusStop = '',
    this.deliveryBoyID = '',
    this.status = '',
    this.accept = false,
    this.createdAt,
    this.updatedAt,
  });

  factory OrderModel2.fromMap(dynamic data, [String uid = '']) {
    if (data == null || data is! Map) {
      return OrderModel2(uid: uid);
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

    bool parseBool(dynamic val) {
      if (val is bool) return val;
      if (val is num) return val != 0;
      if (val is String) {
        final s = val.toLowerCase().trim();
        return s == 'true' || s == '1' || s == 'yes';
      }
      return false;
    }

    List<OrdersList> parsedOrders = [];
    if (data['orders'] is List) {
      for (final item in data['orders'] as List) {
        if (item is Map) {
          parsedOrders.add(OrdersList.fromMap(item));
        }
      }
    }

    return OrderModel2(
      marketID: parseStr(data['marketID']),
      pickupAddress: parseStr(data['pickupAddress']),
      orderID: parseInt(data['orderID']),
      confirmationStatus: data['confirmationStatus'] != null
          ? parseBool(data['confirmationStatus'])
          : null,
      orders: parsedOrders,
      acceptDelivery: parseBool(data['acceptDelivery']),
      deliveryFee: parseNum(data['deliveryFee']),
      total: parseNum(data['total']),
      vendorID: parseStr(data['vendorID']),
      paymentType: parseStr(data['paymentType'] ?? 'Cash Free'),
      userID: parseStr(data['userID']),
      timeCreated: data['timeCreated'],
      deliveryAddress: parseStr(data['deliveryAddress']),
      houseNumber: parseStr(data['houseNumber']),
      closesBusStop: parseStr(data['closesBusStop']),
      deliveryBoyID: parseStr(data['deliveryBoyID']),
      status: parseStr(data['status']),
      accept: parseBool(data['accept']),
      uid: uid.isNotEmpty ? uid : parseStr(data['uid']),
      cashFreeDetails: data['cashFreeDetails'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'pickupAddress': pickupAddress,
      'paymentType': paymentType,
      'marketID': marketID,
      'orderID': orderID,
      'orders': orders.map((o) => o.toMap()).toList(),
      'acceptDelivery': acceptDelivery,
      'deliveryFee': deliveryFee,
      'total': total,
      'vendorID': vendorID,
      'userID': userID,
      'timeCreated': timeCreated,
      'deliveryAddress': deliveryAddress,
      'houseNumber': houseNumber,
      'closesBusStop': closesBusStop,
      'deliveryBoyID': deliveryBoyID,
      'status': status,
      'confirmationStatus': confirmationStatus,
      'accept': accept,
      'uid': uid,
      'cashFreeDetails': cashFreeDetails,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  bool get isDelivered => status.toLowerCase() == 'delivered';
  bool get isCancelled => status.toLowerCase() == 'cancelled';
  bool get isPickup => !acceptDelivery || pickupAddress.isNotEmpty;
  String get formattedTotal => '₹${total.toStringAsFixed(2)}';
}

