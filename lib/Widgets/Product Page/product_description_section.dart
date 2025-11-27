import 'package:flutter/material.dart';
import '../../Model/products.dart';

class ProductDescriptionSection extends StatelessWidget {
  final ProductsModel productsModel;

  const ProductDescriptionSection({
    super.key,
    required this.productsModel,
  });

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
            // TITLE
            Text(
              "Description",
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
                color: const Color(0xFFC9A86A),
                borderRadius: BorderRadius.circular(4),
              ),
            ),

            const SizedBox(height: 14),

            // DESCRIPTION TEXT
            Text(
              productsModel.description,
              style: TextStyle(
                fontSize: 14.5,
                color: Colors.white.withOpacity(0.78),
                height: 1.55,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
