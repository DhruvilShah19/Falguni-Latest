// ignore_for_file: prefer_const_constructors, use_build_context_synchronously, prefer_const_literals_to_create_immutables, deprecated_member_use

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
  final bool isbottomNav;
  const NotificationsPage({super.key, this.isbottomNav = false});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage>
    with TickerProviderStateMixin {
  DocumentReference? userRef;

  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kBgTop = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kBgMid = Color(0xFF5C4033); // Warm "Earth/Clay" brown

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
            colors: [kBgTop, kBgMid, kBgTop],
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
            if (!widget.isbottomNav)
              IconButton(
                icon: Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                color: Colors.white,
                onPressed: () => Navigator.of(context).pop(),
              )
            else
              const SizedBox(width: 48), // Padding equivalent to icon button
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

    // Group orders chronologically
    final List<dynamic> feedItems = [];
    final Map<String, List<HistoryModel>> orderGroups = {};

    for (final notif in data) {
      final key = _extractOrderId(notif.message);
      if (key == 'other') {
        feedItems.add(notif);
      } else {
        if (!orderGroups.containsKey(key)) {
          orderGroups[key] = [];
          feedItems.add(orderGroups[key]!);
        }
        orderGroups[key]!.add(notif);
      }
    }

    return ListView.separated(
      padding: EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: feedItems.length,
      separatorBuilder: (_, __) => SizedBox(height: 12),
      itemBuilder: (_, i) {
        final current = feedItems[i];
        if (current is HistoryModel) {
          return _buildNotificationCard(current, 1);
        } else if (current is List<HistoryModel>) {
          return _buildNotificationCard(current.first, current.length);
        }
        return SizedBox.shrink();
      },
    );
  }

  // --------------------------------------------------
  // NOTIFICATION CARD
  // --------------------------------------------------

  Widget _buildNotificationCard(HistoryModel item, int count) {
    final rawId = _extractOrderId(item.message);
    final bool isOrderGroup = rawId != 'other';

    final DateTime dt = _parseHistoryDate(item.timeCreated);
    String formattedTime = "";
    final Duration diff = DateTime.now().difference(dt);
    if (diff.inDays == 0 && dt.day == DateTime.now().day) {
      formattedTime = 'Today, ${DateFormat('h:mm a', 'en_US').format(dt)}';
    } else if (diff.inDays <= 1 &&
        dt.day == DateTime.now().subtract(const Duration(days: 1)).day) {
      formattedTime = 'Yesterday, ${DateFormat('h:mm a', 'en_US').format(dt)}';
    } else {
      formattedTime = DateFormat('MMM dd, yyyy • h:mm a', 'en_US').format(dt);
    }

    final IconData icon = isOrderGroup
        ? Icons.local_shipping_outlined
        : Icons.notifications_none_rounded;
    final Color iconColor = isOrderGroup ? Colors.black : Colors.white;
    final Color iconBg = isOrderGroup ? kGold : Colors.white.withOpacity(0.1);
    final String label =
        isOrderGroup ? "Order #$rawId Update".tr() : "Alert".tr();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: isOrderGroup ? () => _openOrderForNotification(item) : null,
          onLongPress: () => _confirmDelete(item.uid ?? ""),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: iconBg,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: iconColor, size: 22),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              label.tr(),
                              style: TextStyle(
                                color: isOrderGroup ? kGold : Colors.white70,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          Text(
                            formattedTime,
                            style: TextStyle(
                              color: Colors.white54,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8),
                      Text(
                        item.message,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14.5,
                          height: 1.4,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (count > 1) ...[
                        SizedBox(height: 8),
                        Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: kGold.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: kGold.withOpacity(0.3)),
                          ),
                          child: Text(
                            "+ ${count - 1} earlier updates",
                            style: TextStyle(
                              color: kGold,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ]
                    ],
                  ),
                ),
                SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _confirmDelete(item.uid ?? ""),
                  child: Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Icon(Icons.close_rounded,
                        color: Colors.white30, size: 18),
                  ),
                )
              ],
            ),
          ),
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
        baseColor: Colors.white.withOpacity(0.15),
        highlightColor: Colors.white.withOpacity(0.3),
        child: ListView.builder(
          itemCount: 6,
          itemBuilder: (_, __) => Container(
            height: 80,
            margin: EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
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
