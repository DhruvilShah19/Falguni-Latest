// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../Model/products.dart';
import '../Model/formatter.dart';

class OrderSummaryWidget extends StatelessWidget {
  final Future<List<ProductsModel>> cartFuture;
  final String currencySymbol;

  // Design constants - Premium theme
  static const Color kGold = Color(0xFFC9A86A);

  const OrderSummaryWidget({
    super.key,
    required this.cartFuture,
    required this.currencySymbol,
  });

  Widget _buildOrderSummaryItem(ProductsModel product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.08),
            Colors.white.withOpacity(0.02),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: kGold.withOpacity(0.15),
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(11),
              child: Image.network(
                product.image1,
                height: 80,
                width: 80,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 80,
                    width: 80,
                    color: Colors.white.withOpacity(0.05),
                    child: Icon(Icons.image_not_supported_rounded,
                        color: Colors.white.withOpacity(0.3)),
                  );
                },
              ),
            ),
          ),
          const SizedBox(width: 16),
          // Product Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Name
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 6),
                // Selected Item (variant)
                if (product.selected != null && product.selected != 'Item')
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: kGold.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      product.selected!,
                      style: const TextStyle(
                        color: kGold,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Qty: ${product.quantity}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.6),
                      ),
                    ),
                    Text(
                      '$currencySymbol${Formatter().converter(product.price!.toDouble())}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kGold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.shopping_bag_outlined,
                    color: kGold, size: 18),
              ),
              const SizedBox(width: 12),
              const Text(
                "ORDER SUMMARY",
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                  color: Colors.white,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Order Items List
        FutureBuilder<List<ProductsModel>>(
          future: cartFuture,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              return ListView.builder(
                physics: const NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                itemCount: snapshot.data?.length,
                itemBuilder: (context, index) {
                  ProductsModel productsModel = snapshot.data![index];
                  return _buildOrderSummaryItem(productsModel);
                },
              );
            } else {
              return Shimmer.fromColors(
                baseColor: Colors.white.withOpacity(0.05),
                highlightColor: Colors.white.withOpacity(0.1),
                enabled: true,
                child: ListView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  itemBuilder: (_, __) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  itemCount: 2,
                ),
              );
            }
          },
        ),
        // Bottom spacing
        const SizedBox(height: 120)
      ],
    );
  }
}
