// ignore_for_file: curly_braces_in_flow_control_structures, deprecated_member_use

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

import '../../Model/formatter.dart';
import '../../Model/order_model.dart';
import '../../Pages/orders_preview.dart';

class ProcessingOrders extends StatefulWidget {
  final DateTime? filterStart;
  final DateTime? filterEnd;
  const ProcessingOrders({super.key, this.filterStart, this.filterEnd});

  @override
  State<ProcessingOrders> createState() => _ProcessingOrdersState();
}

class _ProcessingOrdersState extends State<ProcessingOrders> {
  DocumentReference? userRef;

  static const Color kGold =
      Color(0xFFD4AF37); // Richer, traditional honey-gold
  static const Color kPrimary = Color(0xFF2B1B17); // Deep "Roasted Bean" brown
  static const Color kCard = Color(0xFF5C4033); // Warm "Earth/Clay" brown

  String userID = '';
  List<OrderModel2> orders = [];
  String currencySymbol = '';

  @override
  initState() {
    super.initState();
    fetchOrders();
    getCurrencyDetails();
    _getUserModelDoc();
  }

  Future<void> fetchOrders() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;

    setState(() {
      userRef =
          firestore.collection('users').doc(user!.uid).get().then((value) {
        setState(() {
          userID = value['id'];
        });
      }).then((value) {
        return FirebaseFirestore.instance
            .collection('Orders')
            .where('status', isEqualTo: 'Processing')
            .where('userID', isEqualTo: userID)
            .snapshots(includeMetadataChanges: true)
            .listen((data) {
          orders.clear();
          for (var doc in data.docs) {
            if (mounted) {
              setState(() {
                orders.add(
                  OrderModel2(
                    orders: [
                      ...(doc.data()['orders']).map((items) {
                        return OrdersList.fromMap(items);
                      })
                    ],
                    pickupAddress: doc.data()['pickupAddress'],
                    confirmationStatus: doc.data()['confirmationStatus'],
                    uid: doc.data()['uid'],
                    marketID: doc.data()['marketID'],
                    vendorID: doc.data()['vendorID'],
                    userID: doc.data()['userID'],
                    deliveryAddress: doc.data()['deliveryAddress'],
                    houseNumber: doc.data()['houseNumber'],
                    closesBusStop: doc.data()['closesBusStop'],
                    deliveryBoyID: doc.data()['deliveryBoyID'],
                    status: doc.data()['status'],
                    accept: doc.data()['accept'],
                    orderID: doc.data()['orderID'],
                    timeCreated: doc.data()['timeCreated'],
                    total: doc.data()['total'],
                    deliveryFee: doc.data()['deliveryFee'],
                    acceptDelivery: doc.data()['acceptDelivery'],
                    paymentType: doc.data()['paymentType'],
                    cashFreeDetails: doc.data()['cashFreeDetails'],
                  ),
                );
              });
            }
          }

          // Sort by uid timestamp (string → date)
          orders.sort((a, b) {
            DateTime da = DateTime.parse(a.uid);
            DateTime db = DateTime.parse(b.uid);
            return db.compareTo(da); // newest first
          });
        });
      }) as DocumentReference?;
    });
  }

  Future<void> _getUserModelDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  getCurrencyDetails() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      setState(() {
        currencySymbol = value['Currency symbol'];
      });
    });
  }

  List<OrderModel2> get _filtered {
    if (widget.filterStart == null && widget.filterEnd == null) return orders;
    return orders.where((o) {
      try {
        final d = DateTime.parse(o.uid);
        if (widget.filterStart != null && d.isBefore(widget.filterStart!))
          return false;
        if (widget.filterEnd != null && d.isAfter(widget.filterEnd!))
          return false;
        return true;
      } catch (_) {
        return true;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final display = _filtered;
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kPrimary, kCard, kPrimary],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: ListView(
        physics: const BouncingScrollPhysics(),
        children: [
          const SizedBox(height: 16),
          display.isEmpty
              ? Center(
                  child: Image.asset(
                    'assets/image/empty.png',
                    height: MediaQuery.of(context).size.height / 2.5,
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: display.length,
                  itemBuilder: (context, i) {
                    return _orderCard(context, display[i], currencySymbol);
                  },
                ),
        ],
      ),
    );
  }

  Widget _orderCard(BuildContext context, OrderModel2 order, String symbol) {
    return InkWell(
      onTap: () {
        Navigator.of(context).push(MaterialPageRoute(
            builder: (context) =>
                OrdersPreview(orderModel: order, currencySymbol: symbol)));
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: kGold.withOpacity(0.4), width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.35),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "#${order.orderID}",
                      style: const TextStyle(
                        color: kGold,
                        fontSize: 19,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      order.timeCreated,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.75),
                        fontSize: 12.5,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Amount + Payment
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Amount
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Amount".tr(),
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 12)),
                        const SizedBox(height: 3),
                        Text(
                          "$symbol${Formatter().converter(order.total.toDouble())}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),

                    Container(width: 1, height: 35, color: Colors.white24),

                    // Payment type
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text("Payment Type".tr(),
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 12)),
                        const SizedBox(height: 3),
                        Text(
                          order.paymentType == "Wallet"
                              ? "Wallet"
                              : order.paymentType == "Cash Free"
                                  ? "Cash Free"
                                  : "Cash on delivery",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ).tr(),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Processing Badge
                Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(40),
                    ),
                    child: const Text(
                      "Processing",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ).tr(),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
