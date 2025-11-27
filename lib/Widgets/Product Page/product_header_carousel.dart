// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../Model/products.dart';

class ProductHeaderCarousel extends StatelessWidget {
  final ProductsModel productsModel;

  const ProductHeaderCarousel({
    super.key,
    required this.productsModel,
  });

  @override
  Widget build(BuildContext context) {
    final images = [
      productsModel.image1,
      productsModel.image2,
      productsModel.image3,
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14.0),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [
              Color(0xFF1C1515),
              Color(0xFF2A221F),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: Colors.white.withOpacity(0.08),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.40),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(22),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // MAIN IMAGE CAROUSEL
              CarouselSlider(
                items: images.map((img) {
                  return Container(
                    color: Colors.black,
                    child: Image.network(
                      img.isNotEmpty
                          ? img
                          : "https://cdn.iconscout.com/icon/free/png-256/gallery-187-902099.png",
                      fit: BoxFit.cover,
                      width: double.infinity,
                      loadingBuilder: (context, child, loading) {
                        if (loading != null) {
                          return Center(
                            child: CircularProgressIndicator(
                              color: Color(0xFFC9A86A),
                              strokeWidth: 2.4,
                            ),
                          );
                        }
                        return child;
                      },
                      errorBuilder: (_, __, ___) => Container(
                        alignment: Alignment.center,
                        child: Icon(
                          Icons.broken_image_outlined,
                          color: Colors.white38,
                          size: 44,
                        ),
                      ),
                    ),
                  );
                }).toList(),
                options: CarouselOptions(
                  height: MediaQuery.of(context).size.height * 0.40,
                  viewportFraction: 1,
                  enableInfiniteScroll: true,
                  autoPlay: false,
                ),
              ),

              // DARK PREMIUM GRADIENT OVERLAY
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withOpacity(0.65),
                      Colors.black.withOpacity(0.35),
                      Colors.black.withOpacity(0.12),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),

              // BOTTOM SHADOW
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 55,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withOpacity(0.55),
                        Colors.black.withOpacity(0.0),
                      ],
                    ),
                  ),
                ),
              ),

              // GOLD SMALL INDICATORS (minimal dots)
              Positioned(
                bottom: 10,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    height: 6,
                    width: 40,
                    decoration: BoxDecoration(
                      color: Color(0xFFC9A86A).withOpacity(0.85),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
