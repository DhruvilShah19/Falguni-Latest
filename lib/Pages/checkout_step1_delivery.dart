// ignore_for_file: unnecessary_null_comparison

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../Model/formatter.dart';
import '../Model/products.dart';
import '../Widgets/map_snapshot.dart';

class CheckoutStep1Delivery extends StatelessWidget {
  // Design constants - matching cart & wallet pages
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  final bool deliveryBool;
  final bool pickupBool;
  final String deliveryAddress;
  final String pickupAddress;
  final String currencySymbol;
  final double deliveryAddressLat;
  final double deliveryAddressLong;
  final bool isAddressEmpty;
  final Future<List<ProductsModel>> Function() getMyCart;
  final VoidCallback onDeliveryAddressTap;
  final Function(bool?) onDeliveryChanged;
  final Function(bool?) onPickupChanged;

  const CheckoutStep1Delivery({
    super.key,
    required this.deliveryBool,
    required this.pickupBool,
    required this.deliveryAddress,
    required this.pickupAddress,
    required this.currencySymbol,
    required this.deliveryAddressLat,
    required this.deliveryAddressLong,
    required this.isAddressEmpty,
    required this.getMyCart,
    required this.onDeliveryAddressTap,
    required this.onDeliveryChanged,
    required this.onPickupChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kBgTop, kBgMid, kBgTop],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Delivery Type Selection Section
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: [
                    // --- TEMPORARILY DISABLED DELIVERY OPTION ---
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          // Show user the explanation for the temporary disable
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              backgroundColor: const Color(0xFF1C1515),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  side: BorderSide(
                                      color: kGold.withOpacity(0.3))),
                              title: const Text("Delivery Service Update",
                                  style: TextStyle(
                                      color: kGold,
                                      fontWeight: FontWeight.bold)),
                              content: const Text(
                                  "Sorry, Porter is currently not working and we are working on this.\n\nPlease add your desired location and contact info to falgunigruhudhyog@gmail.com and we will help you with delivery.",
                                  style: TextStyle(color: Colors.white70)),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text("OK",
                                      style: TextStyle(
                                          color: kGold,
                                          fontWeight: FontWeight.bold)),
                                )
                              ],
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Opacity(
                          opacity: 0.5, // Visual cue that it is disabled
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.1),
                                width: 1.5,
                              ),
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white24,
                                      width: 2,
                                    ),
                                  ),
                                  child: null, // Radio circle remains empty
                                ),
                                const SizedBox(width: 12),
                                const Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '🚚 Delivery (Unavailable)',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      Padding(
                                        padding: EdgeInsets.only(top: 4),
                                        child: Text(
                                          "Tap for more info regarding delivery",
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: Colors.white54,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Pickup Option
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: onPickupChanged == null
                            ? null
                            : () => onPickupChanged(!pickupBool),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          decoration: BoxDecoration(
                            color: pickupBool
                                ? Colors.white.withOpacity(0.1)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: pickupBool
                                  ? kGold
                                  : Colors.white.withOpacity(0.1),
                              width: 1.5,
                            ),
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: pickupBool ? kGold : Colors.white54,
                                    width: 2,
                                  ),
                                ),
                                child: pickupBool
                                    ? Padding(
                                        padding: const EdgeInsets.all(4.0),
                                        child: Container(
                                          decoration: const BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: kGold,
                                          ),
                                        ),
                                      )
                                    : null,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      '📍 Pick Up',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    if (pickupBool && pickupAddress.isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Text(
                                          pickupAddress,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: Colors.white70,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Delivery Address Card - Only shows if manually selected (usually hidden now)
              if (deliveryBool == true)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: kGold.withOpacity(0.3),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "📍 Delivery Address",
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: Colors.white,
                            ),
                          ),
                          GestureDetector(
                            onTap: onDeliveryAddressTap,
                            child: Container(
                              decoration: const BoxDecoration(
                                color: kGold,
                                shape: BoxShape.circle,
                              ),
                              padding: const EdgeInsets.all(8),
                              child: const Icon(
                                Icons.edit,
                                color: kBgMid,
                                size: 16,
                              ),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (deliveryAddressLat != 0 && deliveryAddressLong != 0)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            height: 230,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: kGold.withOpacity(0.3),
                                width: 1,
                              ),
                            ),
                            child: SnapshotBody(
                              lat: deliveryAddressLat,
                              long: deliveryAddressLong,
                            ),
                          ),
                        ),
                      const SizedBox(height: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                        padding: const EdgeInsets.all(10),
                        child: Text(
                          deliveryAddress,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 24),
              // Order Summary Header
              Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: kGold,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: const Icon(
                      Icons.shopping_bag_outlined,
                      color: kBgMid,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    "Order Summary",
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Products List
              FutureBuilder<List<ProductsModel>>(
                  future: getMyCart(),
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      return ListView.separated(
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        itemCount: snapshot.data?.length ?? 0,
                        separatorBuilder: (context, index) =>
                            const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          ProductsModel productsModel = snapshot.data![index];
                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.08),
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Row(
                                children: [
                                  // Product Icon
                                  Container(
                                    width: 70,
                                    height: 70,
                                    decoration: BoxDecoration(
                                      color: kGold.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: kGold.withOpacity(0.3),
                                        width: 1,
                                      ),
                                    ),
                                    child: const Icon(
                                      Icons.shopping_bag,
                                      color: kGold,
                                      size: 32,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  // Product Details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          productsModel.name,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 14,
                                            color: Colors.white,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          productsModel.selected ?? '',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: Colors.white70,
                                            fontWeight: FontWeight.w400,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 6),
                                        Container(
                                          decoration: BoxDecoration(
                                            color: kGold.withOpacity(0.15),
                                            borderRadius:
                                                BorderRadius.circular(4),
                                            border: Border.all(
                                              color: kGold.withOpacity(0.3),
                                              width: 0.5,
                                            ),
                                          ),
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 6,
                                            vertical: 2,
                                          ),
                                          child: Text(
                                            'Qty: ${productsModel.quantity}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: kGold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Price
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '$currencySymbol${Formatter().converter(productsModel.price!.toDouble())}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                          color: kGold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    } else {
                      return ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: 3,
                        separatorBuilder: (context, index) =>
                            const SizedBox(height: 10),
                        itemBuilder: (_, __) => Shimmer.fromColors(
                          baseColor: Colors.grey[300]!,
                          highlightColor: Colors.grey[100]!,
                          enabled: true,
                          child: Container(
                            height: 80,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      );
                    }
                  }),
              const SizedBox(height: 100)
            ],
          ),
        ),
      ),
    );
  }
}
