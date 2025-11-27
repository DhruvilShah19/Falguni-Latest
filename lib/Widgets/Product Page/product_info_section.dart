import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../Model/products.dart';
import '../../Model/formatter.dart';

class ProductInfoSection extends StatelessWidget {
  final ProductsModel productsModel;
  final int returnDuration;
  final String currency;
  final num totalUser;
  final num Function() getRatingAndReview;

  const ProductInfoSection({
    super.key,
    required this.productsModel,
    required this.returnDuration,
    required this.currency,
    required this.totalUser,
    required this.getRatingAndReview,
  });

  static const Color kGold = Color(0xFFC9A86A);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [
              Color(0xFF1C1515),
              Color(0xFF2A221F),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: Colors.white.withOpacity(0.08),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.35),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // SECTION TITLE
            Text(
              "Product Info",
              style: TextStyle(
                color: Colors.white.withOpacity(0.92),
                fontSize: 16,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),

            const SizedBox(height: 6),

            // GOLD UNDERLINE
            Container(
              height: 2,
              width: 40,
              decoration: BoxDecoration(
                color: kGold,
                borderRadius: BorderRadius.circular(4),
              ),
            ),

            const SizedBox(height: 18),

            // PRODUCT NAME
            Text(
              productsModel.name,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                height: 1.3,
                letterSpacing: 0.2,
              ),
            ),
            const SizedBox(height: 6),

            // RETURN POLICY
            Text(
              returnDuration == 0
                  ? 'No return policy'
                  : '$returnDuration Day Return Guarantee',
              style: const TextStyle(
                color: Colors.white60,
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
            ),

            const SizedBox(height: 18),

            // PRICE + RATING ROW
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                /// PRICE
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      currency,
                      style: const TextStyle(
                        fontSize: 18,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      Formatter().converter(
                        productsModel.unitPrice1.toDouble(),
                      ),
                      style: const TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.0,
                      ),
                    ),
                  ],
                ),

                /// RATING
                Row(
                  children: [
                    RatingBarIndicator(
                      rating:
                          totalUser == 0 ? 0 : getRatingAndReview().toDouble(),
                      itemBuilder: (context, _) =>
                          const Icon(Icons.star_rounded, color: kGold),
                      itemSize: 20,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      "($totalUser)",
                      style: const TextStyle(
                        color: Colors.white60,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
