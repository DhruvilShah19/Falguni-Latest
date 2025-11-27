import 'package:flutter/material.dart';
import '../../Model/formatter.dart';
import '../../Model/products.dart';

class ProductVariantsSection extends StatelessWidget {
  final ProductsModel productsModel;
  final String selectedUnit;
  final String currency;
  final Function(String unitKey) onUnitChanged;

  const ProductVariantsSection({
    super.key,
    required this.productsModel,
    required this.selectedUnit,
    required this.currency,
    required this.onUnitChanged,
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
          border: Border.all(color: Colors.white.withOpacity(0.08), width: 1),
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
              "Other Variants",
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

            // VARIANT ITEMS
            _variantTile(
              unitKey: 'unit1',
              unitName: productsModel.unitname1,
              price: productsModel.unitPrice1,
            ),

            if (productsModel.unitname2.isNotEmpty) ...[
              Container(
                height: 1,
                margin: const EdgeInsets.symmetric(vertical: 12),
                color: Colors.white.withOpacity(0.07),
              ),
              _variantTile(
                unitKey: 'unit2',
                unitName: productsModel.unitname2,
                price: productsModel.unitPrice2,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _variantTile({
    required String unitKey,
    required String unitName,
    required num price,
  }) {
    final bool isSelected = selectedUnit == unitKey;

    return InkWell(
      onTap: () => onUnitChanged(unitKey),
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.white.withOpacity(0.10)
              : Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? kGold : Colors.white.withOpacity(0.05),
            width: isSelected ? 1.4 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: kGold.withOpacity(0.18),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ]
              : [],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // LEFT SIDE
            Row(
              children: [
                if (isSelected)
                  const Icon(Icons.check_circle_rounded,
                      size: 18, color: kGold),
                if (isSelected) const SizedBox(width: 10),
                Text(
                  unitName,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white.withOpacity(isSelected ? 1 : 0.85),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),

            // RIGHT SIDE PRICE
            Text(
              "$currency${Formatter().converter(price.toDouble())}",
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color:
                    isSelected ? Colors.white : Colors.white.withOpacity(0.85),
                letterSpacing: 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
