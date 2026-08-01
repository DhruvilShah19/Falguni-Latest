// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';

// Shared scaffold + renderer for the legal pages (Privacy Policy, Terms &
// Conditions, Website Disclaimer). Mirrors the section/paragraph/bullet
// structure used to build the equivalent pages on the website
// (falguni_web/app/privacy-policy, /terms-and-conditions,
// /website-disclaimer) so the content stays easy to keep in sync -- each
// page here is just a data file (see privacy_policy_page.dart,
// terms_and_conditions_page.dart, website_disclaimer_page.dart) rendered by
// this one shared widget instead of three near-duplicate screens.

class LegalBlock {
  final String? paragraph;
  final List<String>? bullets;
  const LegalBlock.p(String text)
      : paragraph = text,
        bullets = null;
  const LegalBlock.ul(List<String> items)
      : paragraph = null,
        bullets = items;
}

class LegalSection {
  final String title;
  final List<LegalBlock> blocks;
  const LegalSection({required this.title, required this.blocks});
}

class LegalContentPage extends StatelessWidget {
  final String title;
  final String effectiveDate;
  final String lastUpdated;
  final List<String> intro;
  final List<LegalSection> sections;

  const LegalContentPage({
    super.key,
    required this.title,
    required this.effectiveDate,
    required this.lastUpdated,
    required this.intro,
    required this.sections,
  });

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            letterSpacing: .5,
          ),
        ),
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [kBgTop, kBgMid, kBgTop],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 110, 18, 50),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Effective Date: $effectiveDate  •  Last Updated: $lastUpdated',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 11.5,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (final para in intro)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(
                            para,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.75),
                              fontSize: 13.5,
                              height: 1.5,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                for (final section in sections) ...[
                  _SectionWidget(section: section),
                  const SizedBox(height: 20),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionWidget extends StatelessWidget {
  final LegalSection section;
  const _SectionWidget({required this.section});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          section.title,
          style: const TextStyle(
            color: LegalContentPage.kGold,
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        for (final block in section.blocks) _BlockWidget(block: block),
      ],
    );
  }
}

class _BlockWidget extends StatelessWidget {
  final LegalBlock block;
  const _BlockWidget({required this.block});

  @override
  Widget build(BuildContext context) {
    if (block.bullets != null) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final item in block.bullets!)
              Padding(
                padding: const EdgeInsets.only(bottom: 5),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 7, right: 8),
                      child: Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: LegalContentPage.kGold.withOpacity(0.6),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        item,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        block.paragraph!,
        style: TextStyle(
          color: Colors.white.withOpacity(0.6),
          fontSize: 13,
          height: 1.5,
        ),
      ),
    );
  }
}
