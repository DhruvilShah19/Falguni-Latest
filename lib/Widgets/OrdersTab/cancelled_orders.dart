import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

import '../../Model/formatter.dart';
import '../../Model/order_model.dart';
import '../../Pages/orders_preview.dart';

class CancelledOrders extends StatefulWidget {
  const CancelledOrders({super.key});

  @override
  State<CancelledOrders> createState() => _CancelledOrdersState();
}

class _CancelledOrdersState extends State<CancelledOrders> {
  DocumentReference? userRef;

  String userID = '';
  List<OrderModel2> orders = [];

  String getcurrencySymbol = '';

  // THEME COLORS (same family as AllOrders / Notifications)
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);

  @override
  void initState() {
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
            .where('status', isEqualTo: 'Cancelled')
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
                  ),
                );
              });
            }
          }

          // Sort latest → oldest by uid (timestamp string)
          orders.sort((a, b) {
            DateTime dateA = DateTime.parse(a.uid);
            DateTime dateB = DateTime.parse(b.uid);
            return dateB.compareTo(dateA);
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
        getcurrencySymbol = value['Currency symbol'];
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF1C1515),
            Color(0xFF2F2525),
            Color(0xFF1C1515),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: ListView(
        physics: const BouncingScrollPhysics(),
        shrinkWrap: true,
        children: [
          const SizedBox(height: 16),
          orders.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 50),
                    child: Image.asset(
                      'assets/image/empty.png',
                      height: MediaQuery.of(context).size.height / 2.5,
                    ),
                  ),
                )
              : ListView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  itemCount: orders.length,
                  itemBuilder: (context, i) {
                    return _orderCard(
                      context,
                      orders[i],
                      getcurrencySymbol,
                    );
                  },
                ),
        ],
      ),
    );
  }

  Widget _orderCard(
      BuildContext context, OrderModel2 order, String currencySymbol) {
    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => OrdersPreview(
              orderModel: order,
              currencySymbol: currencySymbol,
            ),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 14,
                offset: const Offset(0, 7),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Order ID + date/time
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "#${order.orderID}",
                      style: const TextStyle(
                        color: kGold,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      order.timeCreated,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Middle row: Amount + Payment type
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Amount
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Amount".tr(),
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "$currencySymbol${Formatter().converter(order.total.toDouble())}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),

                    Container(
                      height: 36,
                      width: 1,
                      color: Colors.white24,
                    ),

                    // Payment Type
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          "Payment Type".tr(),
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          order.paymentType == 'Wallet'
                              ? 'Wallet'.tr()
                              : 'Cash on delivery'.tr(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Status: Cancelled pill
                Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      borderRadius: BorderRadius.circular(40),
                    ),
                    child: Text(
                      order.status, // "Cancelled"
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
