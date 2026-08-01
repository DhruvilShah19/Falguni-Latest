import 'package:flutter/material.dart';
import 'legal_content_widgets.dart';

// Mirrors falguni_web/app/website-disclaimer/page.tsx section for section.
// The web page's title is "Website Disclaimer" and scopes itself to the
// site at https://falgunigruhudhyog.in -- kept as-is here (rather than
// generalised to "App Disclaimer") since the underlying legal document the
// business provided is specifically about the website.
class WebsiteDisclaimerPage extends StatelessWidget {
  const WebsiteDisclaimerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return LegalContentPage(
      title: 'Website Disclaimer',
      effectiveDate: '01-04-2026',
      lastUpdated: '01-08-2026',
      intro: const [
        'Welcome to Falguni Gruh Udhyog ("Company", "we", "our", "us"). This Website Disclaimer governs your use of https://falgunigruhudhyog.in ("Website").',
        'By accessing or using this Website, you agree to the terms of this Disclaimer.',
      ],
      sections: [
        const LegalSection(title: '1. General Information', blocks: [
          LegalBlock.p('The information available on this Website is provided for general informational and commercial purposes only.'),
          LegalBlock.p('While we strive to ensure that all information is accurate and up to date, we do not guarantee the completeness, accuracy or reliability of any information published on the Website.'),
        ]),
        const LegalSection(title: '2. Product Information', blocks: [
          LegalBlock.p('We make every effort to accurately describe our products.'),
          LegalBlock.p('However, due to the traditional and handmade nature of many of our food products, slight variations may occur in:'),
          LegalBlock.ul(['Colour', 'Texture', 'Shape', 'Thickness', 'Weight (within legally permissible limits)', 'Packaging design']),
          LegalBlock.p('These natural variations should not be treated as manufacturing defects.'),
        ]),
        const LegalSection(title: '3. Product Images', blocks: [
          LegalBlock.p('Product photographs displayed on the Website are for representation purposes only.'),
          LegalBlock.p('Actual products may differ slightly due to:'),
          LegalBlock.ul(['Manufacturing batches', 'Packaging improvements', 'Photography lighting', 'Screen display settings', 'Product size representation']),
          LegalBlock.p('Such differences do not affect product quality.'),
        ]),
        const LegalSection(title: '4. Pricing Errors', blocks: [
          LegalBlock.p('Although we take reasonable care to ensure correct pricing, typographical, technical or human errors may occasionally occur.'),
          LegalBlock.p('If a product is listed with an incorrect price or promotional offer due to an error, Falguni Gruh Udhyog reserves the right to:'),
          LegalBlock.ul(['Cancel the order before dispatch.', 'Correct the pricing.', 'Contact the customer for confirmation before processing the order.', 'Refund any payment received where applicable.']),
        ]),
        const LegalSection(title: '5. Product Availability', blocks: [
          LegalBlock.p('Product availability displayed on the Website is subject to change without notice.'),
          LegalBlock.p('We reserve the right to:'),
          LegalBlock.ul(['Discontinue products.', 'Limit purchase quantities.', 'Refuse orders due to stock shortages.', 'Modify product packaging or specifications.']),
        ]),
        const LegalSection(title: '6. Nutritional Information', blocks: [
          LegalBlock.p('Nutritional values, ingredient information and serving suggestions are provided for general guidance only.'),
          LegalBlock.p('Values may vary slightly due to:'),
          LegalBlock.ul(['Natural ingredients', 'Manufacturing variations', 'Seasonal changes']),
          LegalBlock.p('Customers should always refer to the product packaging for the latest information.'),
        ]),
        const LegalSection(title: '7. Medical Disclaimer', blocks: [
          LegalBlock.p('The information provided on this Website should not be interpreted as medical, nutritional or healthcare advice.'),
          LegalBlock.p('Customers with allergies, dietary restrictions or medical conditions should consult a qualified healthcare professional before consuming our products if they have any concerns.'),
        ]),
        const LegalSection(title: '8. Third-Party Links', blocks: [
          LegalBlock.p('Our Website may contain links to third-party websites, payment gateways or social media platforms for customer convenience.'),
          LegalBlock.p('We do not control or endorse the content, privacy practices or policies of third-party websites and are not responsible for their availability or content.'),
        ]),
        const LegalSection(title: '9. Website Availability', blocks: [
          LegalBlock.p('While we endeavour to keep our Website operational, uninterrupted access cannot be guaranteed.'),
          LegalBlock.p('The Website may occasionally be unavailable due to:'),
          LegalBlock.ul(['Scheduled maintenance', 'Technical issues', 'Internet outages', 'Software updates', 'Cybersecurity measures', 'Circumstances beyond our reasonable control']),
          LegalBlock.p('We shall not be liable for temporary interruptions in service.'),
        ]),
        const LegalSection(title: '10. Technical Errors', blocks: [
          LegalBlock.p('Occasionally, technical errors may result in:'),
          LegalBlock.ul(['Incorrect pricing', 'Display issues', 'Inventory inaccuracies', 'Duplicate orders', 'Payment interruptions']),
          LegalBlock.p('Falguni Gruh Udhyog reserves the right to rectify such errors and take appropriate corrective action.'),
        ]),
        const LegalSection(title: '11. Payment Gateway Disclaimer', blocks: [
          LegalBlock.p('Online payments are processed through trusted third-party payment service providers.'),
          LegalBlock.p('We do not store customers\':'),
          LegalBlock.ul(['Card details', 'CVV', 'UPI PIN', 'Net Banking credentials']),
          LegalBlock.p('Any payment processing delays or failures caused by payment service providers or banks are outside our direct control.'),
        ]),
        const LegalSection(title: '12. Delivery Disclaimer', blocks: [
          LegalBlock.p('Estimated delivery timelines are indicative only.'),
          LegalBlock.p('Actual delivery may be delayed due to:'),
          LegalBlock.ul(['Weather', 'Traffic', 'Festivals', 'Government restrictions', 'Courier operations', 'Natural disasters', 'Force Majeure events']),
          LegalBlock.p('Such delays do not automatically entitle customers to compensation or damages.'),
        ]),
        const LegalSection(title: '13. Intellectual Property', blocks: [
          LegalBlock.p('Unless otherwise stated, all Website content including:'),
          LegalBlock.ul(['Logos', 'Brand names', 'Product names', 'Photographs', 'Graphics', 'Icons', 'Videos', 'Product descriptions', 'Website design', 'Text content']),
          LegalBlock.p('is the exclusive intellectual property of Falguni Gruh Udhyog and is protected under applicable copyright and trademark laws.'),
          LegalBlock.p('No part of this Website may be copied, reproduced, republished, distributed, modified or commercially exploited without our prior written permission.'),
        ]),
        const LegalSection(title: '14. User Responsibility', blocks: [
          LegalBlock.p('Users are responsible for:'),
          LegalBlock.ul([
            'Maintaining the confidentiality of their account credentials.',
            'Providing accurate information while placing orders.',
            'Reviewing product details before purchase.',
            'Reading product labels before consumption.',
            'Ensuring that products are suitable for their dietary needs.',
          ]),
        ]),
        const LegalSection(title: '15. Limitation of Liability', blocks: [
          LegalBlock.p('To the maximum extent permitted by law, Falguni Gruh Udhyog shall not be liable for:'),
          LegalBlock.ul([
            'Indirect or consequential losses.',
            'Loss of profits or business opportunities.',
            'Delays beyond our reasonable control.',
            'Website downtime.',
            'Customer misuse of products.',
            'Improper storage after delivery.',
            'Allergic reactions where ingredient and allergen information has been disclosed.',
          ]),
          LegalBlock.p('Nothing in this Disclaimer limits any statutory rights available to consumers under applicable law.'),
        ]),
        const LegalSection(title: '16. Indemnity', blocks: [
          LegalBlock.p('You agree to indemnify and hold harmless Falguni Gruh Udhyog, its owners, directors, employees and representatives from any claims, liabilities, damages, losses or expenses arising out of:'),
          LegalBlock.ul(['Your misuse of the Website.', 'Violation of these policies.', 'Fraudulent activities.', 'Infringement of any third-party rights.']),
        ]),
        const LegalSection(title: '17. Governing Law', blocks: [
          LegalBlock.p('This Disclaimer shall be governed by and interpreted in accordance with the laws of India.'),
          LegalBlock.p('Any disputes shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat.'),
        ]),
        const LegalSection(title: '18. Changes to this Disclaimer', blocks: [
          LegalBlock.p('Falguni Gruh Udhyog reserves the right to modify this Disclaimer at any time.'),
          LegalBlock.p('The updated version will be published on this Website with the revised "Last Updated" date.'),
          LegalBlock.p('Your continued use of the Website after any changes constitutes acceptance of the revised Disclaimer.'),
        ]),
        const LegalSection(title: '19. Contact Us', blocks: [
          LegalBlock.p('For any questions regarding this Disclaimer, please contact:'),
          LegalBlock.ul(['Falguni Gruh Udhyog', 'Website: https://falgunigruhudhyog.in']),
        ]),
      ],
    );
  }
}
