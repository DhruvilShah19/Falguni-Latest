import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../Model/rating.dart';

class ProductReviewsSection extends StatelessWidget {
  final bool ratingStatus;
  final Future<List<RatingModel>> reviewsFuture;

  const ProductReviewsSection({
    super.key,
    required this.ratingStatus,
    required this.reviewsFuture,
  });

  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgBottom = Color(0xFF2A221F);

  @override
  Widget build(BuildContext context) {
    if (!ratingStatus) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 6),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(18, 20, 18, 22),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [kBgTop, kBgBottom],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
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
            Text(
              "Product Reviews",
              style: TextStyle(
                color: Colors.white.withOpacity(0.92),
                fontSize: 16,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),

            const SizedBox(height: 6),

            Container(
              height: 2,
              width: 50,
              decoration: BoxDecoration(
                color: kGold,
                borderRadius: BorderRadius.circular(4),
              ),
            ),

            const SizedBox(height: 18),

            // ⭐ FIXED — use cached future
            FutureBuilder<List<RatingModel>>(
              future: reviewsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFFC9A86A)),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Text(
                      "No reviews yet.",
                      style: TextStyle(color: Colors.white70),
                    ),
                  );
                }

                return _buildLinearReviews(snapshot.data!);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLinearReviews(List<RatingModel> reviews) {
    return Column(
      children: List.generate(reviews.length, (index) {
        final r = reviews[index];

        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    r.fullname,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    r.timeCreated,
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              RatingBarIndicator(
                rating: r.rating.toDouble(),
                itemBuilder: (context, _) =>
                    const Icon(Icons.star_rounded, color: kGold),
                itemSize: 18,
              ),
              const SizedBox(height: 10),
              Text(
                r.review,
                style: const TextStyle(
                  fontSize: 13.5,
                  color: Colors.white70,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 5),
              Container(
                height: 1,
                color: Colors.white.withOpacity(0.06),
              ),
            ],
          ),
        );
      }),
    );
  }
}
