// ignore_for_file: prefer_const_constructors, use_build_context_synchronously

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shimmer/shimmer.dart';

import '../Model/history.dart';
import '../Model/order_model.dart';
import 'orders_preview.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage>
    with TickerProviderStateMixin {
  DocumentReference? userRef;

  static const Color kPrimary = Color(0xFF2F2525); // Espresso
  static const Color kGold = Color(0xFFC9A86A); // Premium gold

  // Which order cards are expanded
  final Set<String> _expandedOrderIds = {};

  // Search + sort
  String _searchQuery = "";
  String _sortType = "Newest";

  // Currency for OrdersPreview
  String _currencySymbol = '';

  @override
  void initState() {
    super.initState();
    _getUserDoc();
    _loadCurrencySettings();
  }

  Future<void> _getUserDoc() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    setState(() {
      userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);
    });
  }

  Future<void> _loadCurrencySettings() async {
    try {
      final snap = await FirebaseFirestore.instance
          .collection('Currency Settings')
          .doc('Currency Settings')
          .get();

      if (snap.exists) {
        setState(() {
          _currencySymbol = (snap.data()?['Currency symbol'] ?? '').toString();
        });
      }
    } catch (_) {
      // ignore
    }
  }

  Future<List<HistoryModel>> getHistory() async {
    if (userRef == null) return [];
    final snapshot = await userRef!
        .collection('Notifications')
        // Firestore order doesn't matter; we re-sort in Dart.
        .orderBy('timeCreated', descending: true)
        .get();

    return snapshot.docs
        .map((doc) => HistoryModel.fromMap(doc.data(), doc.id))
        .toList();
  }

  /// Extract order id like `Order ID #241` → `241`.
  /// If none is found, returns 'other'.
  String _extractOrderId(String message) {
    final reg = RegExp(r'Order ID\s*#?(\d+)');
    final match = reg.firstMatch(message);
    if (match != null && match.groupCount >= 1) {
      return match.group(1)!;
    }
    return 'other';
  }

  /// Robustly parse HistoryModel.timeCreated into a DateTime.
  ///
  /// Handles:
  /// - Firestore Timestamp
  /// - int milliseconds since epoch
  /// - Strings like:
  ///   "Saturday, September 21, 2024"
  ///   "Tuesday, 22 October 2024"
  ///   "September 21, 2024"
  ///   "21 October 2024"
  DateTime _parseHistoryDate(dynamic raw) {
    // 1) Firestore Timestamp
    if (raw is Timestamp) {
      return raw.toDate();
    }

    // 2) Millis since epoch
    if (raw is num) {
      return DateTime.fromMillisecondsSinceEpoch(raw.toInt());
    }

    // 3) String formats
    final s0 = raw?.toString().trim() ?? '';
    if (s0.isEmpty) {
      return DateTime.fromMillisecondsSinceEpoch(0);
    }

    String s = s0;

    // Sometimes string is "Saturday, September 21, 2024"
    // Sometimes "Tuesday, 22 October 2024"
    // We'll try multiple explicit patterns in English.
    final patterns = <String>[
      'EEEE, MMMM d, y', // Saturday, September 21, 2024
      'EEEE, d MMMM y', // Tuesday, 22 October 2024
      'EEEE, dd MMMM y', // Tuesday, 02 October 2024
      'MMMM d, y', // September 21, 2024
      'd MMMM y', // 22 October 2024
      'dd MMMM y', // 02 October 2024
    ];

    // First, try full string with all patterns
    for (final p in patterns) {
      try {
        return DateFormat(p, 'en_US').parse(s);
      } catch (_) {
        // keep trying
      }
    }

    // If it has a weekday, drop it and try again on the remaining part.
    // e.g. "Saturday, September 21, 2024" → "September 21, 2024"
    if (s.contains(',')) {
      final parts = s.split(',');
      if (parts.length >= 2) {
        final rest = parts.sublist(1).join(',').trim();
        for (final p in patterns) {
          try {
            return DateFormat(p, 'en_US').parse(rest);
          } catch (_) {
            // keep trying
          }
        }
      }
    }

    // Final fallback – generic ISO-like parse
    try {
      return DateTime.parse(s);
    } catch (_) {
      // If everything fails, treat as very old so it goes to the bottom.
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
  }

  // --------------------------------------------------
  // BUILD
  // --------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: const [
              Color(0xFF1C1515),
              Color(0xFF2F2525),
              Color(0xFF1C1515),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Column(
          children: [
            _buildAppBar(),
            _buildSearchAndSortBar(),
            Expanded(
              child: FutureBuilder<List<HistoryModel>>(
                future: getHistory(),
                builder: _buildBody,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --------------------------------------------------
  // APP BAR
  // --------------------------------------------------

  Widget _buildAppBar() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
        child: Row(
          children: [
            IconButton(
              icon: Icon(Icons.arrow_back_ios_new_rounded, size: 20),
              color: Colors.white,
              onPressed: () => Navigator.of(context).pop(),
            ),
            Expanded(
              child: Center(
                child: Text(
                  "Inbox".tr(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    letterSpacing: .4,
                  ),
                ),
              ),
            ),
            // fake icon to keep title centered
            Opacity(
              opacity: 0,
              child: IconButton(
                onPressed: () {},
                icon: Icon(Icons.arrow_back_ios_new_rounded),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --------------------------------------------------
  // SEARCH + SORT
  // --------------------------------------------------

  Widget _buildSearchAndSortBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 4, 18, 8),
      child: Row(
        children: [
          // Search
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(14),
              ),
              child: TextField(
                style: TextStyle(color: Colors.white),
                cursorColor: kGold,
                onChanged: (v) {
                  setState(() => _searchQuery = v.trim());
                },
                decoration: InputDecoration(
                  hintText: "Search notifications".tr(),
                  hintStyle: TextStyle(color: Colors.white70, fontSize: 13),
                  border: InputBorder.none,
                  icon: Icon(Icons.search, color: Colors.white70, size: 20),
                ),
              ),
            ),
          ),
          SizedBox(width: 10),
          // Sort
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(14),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _sortType,
                dropdownColor: kPrimary,
                icon: Icon(Icons.keyboard_arrow_down_rounded, color: kGold),
                style: TextStyle(color: Colors.white, fontSize: 13),
                items: const ["Newest", "Oldest"]
                    .map(
                      (e) => DropdownMenuItem(
                        value: e,
                        child: Text(e),
                      ),
                    )
                    .toList(),
                onChanged: (v) {
                  if (v == null) return;
                  setState(() => _sortType = v);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------
  // MAIN BODY
  // --------------------------------------------------

  Widget _buildBody(
      BuildContext context, AsyncSnapshot<List<HistoryModel>> snapshot) {
    if (!snapshot.hasData) {
      return _buildShimmerLoader();
    }

    List<HistoryModel> data = snapshot.data!;

    // Sort by parsed DateTime (robust)
    data.sort((a, b) {
      final ta = _parseHistoryDate(a.timeCreated);
      final tb = _parseHistoryDate(b.timeCreated);
      if (_sortType == "Newest") {
        return tb.compareTo(ta); // newest first
      } else {
        return ta.compareTo(tb); // oldest first
      }
    });

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      data = data
          .where((n) =>
              n.message.toLowerCase().contains(q) ||
              n.timeCreated.toString().toLowerCase().contains(q))
          .toList();
    }

    if (data.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.only(top: 60),
          child: Image.asset(
            "assets/image/notifications.jpg",
            width: 260,
          ),
        ),
      );
    }

    // Group by order id (or "other")
    final Map<String, List<HistoryModel>> grouped = {};
    for (final notif in data) {
      final key = _extractOrderId(notif.message);
      grouped.putIfAbsent(key, () => []).add(notif);
    }

    final entries = grouped.entries.toList();

    return ListView.separated(
      padding: EdgeInsets.fromLTRB(18, 8, 18, 24),
      itemCount: entries.length,
      separatorBuilder: (_, __) => SizedBox(height: 14),
      itemBuilder: (_, i) {
        final entry = entries[i];
        final list = entry.value;
        final bool isExpanded = _expandedOrderIds.contains(entry.key);

        return _buildOrderGroup(
          groupKey: entry.key,
          notifications: list,
          isExpanded: isExpanded,
        );
      },
    );
  }

  // --------------------------------------------------
  // GROUP CARD
  // --------------------------------------------------

  Widget _buildOrderGroup({
    required String groupKey,
    required List<HistoryModel> notifications,
    required bool isExpanded,
  }) {
    final first = notifications.first;
    final orderMatch = RegExp(r"Order ID\s*#?(\d+)").firstMatch(first.message);

    final bool isOrderGroup = groupKey != 'other' && orderMatch != null;

    final String orderLabel = isOrderGroup
        ? "Order #${orderMatch.group(1)}"
        : "General notifications".tr();

    return AnimatedContainer(
      duration: Duration(milliseconds: 200),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: isOrderGroup ? kGold : Colors.white24, width: 1),
        color: Colors.white.withOpacity(0.06),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.30),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              if (isOrderGroup) {
                // Order group → tap header opens order
                _openOrderForNotification(first);
              } else {
                // General group → tap toggles expand
                setState(() {
                  if (isExpanded) {
                    _expandedOrderIds.remove(groupKey);
                  } else {
                    _expandedOrderIds.add(groupKey);
                  }
                });
              }
            },
            onLongPress: () {
              // Long press toggles expand for any group
              setState(() {
                if (isExpanded) {
                  _expandedOrderIds.remove(groupKey);
                } else {
                  _expandedOrderIds.add(groupKey);
                }
              });
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.white.withOpacity(0.15),
                    radius: 22,
                    child: Icon(
                      isOrderGroup
                          ? Icons.shopping_bag_outlined
                          : Icons.notifications,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          orderLabel,
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          isOrderGroup
                              ? "Tap to view order details".tr()
                              : "Tap to expand details".tr(),
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 11.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!isOrderGroup)
                    AnimatedRotation(
                      turns: isExpanded ? 0.5 : 0,
                      duration: Duration(milliseconds: 200),
                      child: Icon(Icons.keyboard_arrow_down_rounded,
                          color: Colors.white70),
                    ),
                ],
              ),
            ),
          ),

          // EXPANDED CONTENT
          AnimatedSize(
            duration: Duration(milliseconds: 220),
            child: isExpanded || isOrderGroup
                ? Column(
                    children: notifications
                        .map(
                          (n) => _buildInnerNotification(
                            n,
                            isOrderGroup: isOrderGroup,
                          ),
                        )
                        .toList(),
                  )
                : SizedBox.shrink(),
          )
        ],
      ),
    );
  }

  // --------------------------------------------------
  // INNER NOTIFICATION ROW
  // --------------------------------------------------

  Widget _buildInnerNotification(
    HistoryModel item, {
    required bool isOrderGroup,
  }) {
    return InkWell(
      onTap: isOrderGroup
          ? () => _openOrderForNotification(item)
          : null, // general notification: no navigation
      onLongPress: () => _confirmDelete(item.uid ?? ""),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 6,
              height: 6,
              margin: EdgeInsets.only(top: 6),
              decoration: BoxDecoration(
                color: isOrderGroup ? kGold : Colors.white70,
                shape: BoxShape.circle,
              ),
            ),
            SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.message,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    item.timeCreated.toString(),
                    style: TextStyle(
                      color: Colors.white60,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 10),
            GestureDetector(
              onTap: () => _confirmDelete(item.uid ?? ""),
              child: Icon(
                Icons.delete_outline,
                color: Colors.redAccent,
                size: 18,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --------------------------------------------------
  // OPEN ORDER PREVIEW FROM NOTIFICATION
  // --------------------------------------------------

  Future<void> _openOrderForNotification(HistoryModel notif) async {
    final rawId = _extractOrderId(notif.message);

    if (rawId == 'other') {
      Fluttertoast.showToast(
        msg: "No linked order found".tr(),
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    final int? orderIdInt = int.tryParse(rawId);
    if (orderIdInt == null) {
      Fluttertoast.showToast(
        msg: "Invalid order ID".tr(),
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    try {
      final query = await FirebaseFirestore.instance
          .collection('Orders')
          .where('orderID', isEqualTo: orderIdInt)
          .limit(1)
          .get();

      if (query.docs.isEmpty) {
        Fluttertoast.showToast(
          msg: "Order not found".tr(),
          gravity: ToastGravity.BOTTOM,
        );
        return;
      }

      final doc = query.docs.first;
      final data = doc.data();

      // Map to OrderModel2 (and convert orders list)
      final List<OrdersList> ordersList = (data['orders'] as List)
          .map((e) => OrdersList.fromMap(e as Map<dynamic, dynamic>))
          .toList();

      final order = OrderModel2(
        marketID: data['marketID'],
        pickupAddress: data['pickupAddress'],
        uid: data['uid'],
        orderID: data['orderID'],
        orders: ordersList,
        acceptDelivery: data['acceptDelivery'],
        deliveryFee: data['deliveryFee'],
        total: data['total'],
        vendorID: data['vendorID'],
        paymentType: data['paymentType'],
        userID: data['userID'],
        timeCreated: data['timeCreated'],
        confirmationStatus: data['confirmationStatus'],
        deliveryAddress: data['deliveryAddress'],
        houseNumber: data['houseNumber'],
        closesBusStop: data['closesBusStop'],
        deliveryBoyID: data['deliveryBoyID'],
        status: data['status'],
        accept: data['accept'],
      );

      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => OrdersPreview(
            orderModel: order,
            currencySymbol: _currencySymbol,
          ),
        ),
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Unable to open order".tr(),
        gravity: ToastGravity.BOTTOM,
      );
    }
  }

  // --------------------------------------------------
  // SHIMMER LOADER
  // --------------------------------------------------

  Widget _buildShimmerLoader() {
    return Padding(
      padding: const EdgeInsets.all(18.0),
      child: Shimmer.fromColors(
        baseColor: Colors.grey[700]!,
        highlightColor: Colors.grey[500]!,
        child: ListView.builder(
          itemCount: 6,
          itemBuilder: (_, __) => Container(
            height: 80,
            margin: EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white12,
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        ),
      ),
    );
  }

  // --------------------------------------------------
  // DELETE (WITH CONFIRM)
  // --------------------------------------------------

  void _confirmDelete(String id) async {
    if (id.isEmpty) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        title: Text(
          "Delete notification?".tr(),
          style: TextStyle(fontWeight: FontWeight.w600, color: kPrimary),
        ),
        content: Text(
          "This action cannot be undone.".tr(),
          style: TextStyle(color: Colors.grey[800]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text("Cancel".tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              "Delete".tr(),
              style: TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      _deleteNotification(id);
    }
  }

  void _deleteNotification(String id) {
    if (userRef == null || id.isEmpty) return;

    userRef!.collection('Notifications').doc(id).delete().then((_) {
      Fluttertoast.showToast(
        msg: "Notification deleted".tr(),
        gravity: ToastGravity.BOTTOM,
      );
      setState(() {});
    });
  }
}
