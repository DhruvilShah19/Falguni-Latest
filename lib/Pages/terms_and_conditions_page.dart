import 'package:flutter/material.dart';
import 'legal_content_widgets.dart';
import '../Providers/delivery_config.dart';

// Simple thousands-separator formatter, same as delivery_charges_page.dart.
String _inr(num n) {
  final digits = n.toInt().toString();
  final buffer = StringBuffer();
  for (int i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(',');
    buffer.write(digits[i]);
  }
  return '₹$buffer';
}

// Mirrors falguni_web/app/terms-and-conditions/page.tsx section for
// section. Section 8's numbers are pulled from DeliveryConfig (same source
// delivery_charges_page.dart uses) rather than hardcoded, for the same
// reason: this is a legal document, so it must never say a different price
// than what checkout actually charges.
class TermsAndConditionsPage extends StatelessWidget {
  const TermsAndConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final fetchedTiers = DeliveryConfig.distanceTiers;
    final tiers = fetchedTiers.length >= 3
        ? fetchedTiers
        : const [
            DistanceTierRule(tier: 'Hyperlocal', maxDistanceKm: 5, fee: 50, freeAbove: 400),
            DistanceTierRule(tier: 'Intercity', maxDistanceKm: 10, fee: 100, freeAbove: 1200),
            DistanceTierRule(tier: 'Interstate', maxDistanceKm: 15, fee: 150, freeAbove: 1800),
          ];
    final hyperlocal = tiers[0];
    final intercity = tiers[1];
    final interstate = tiers[2];
    final gujarat = DeliveryConfig.gujaratOutstation;
    final panIndia = DeliveryConfig.panIndia;

    return LegalContentPage(
      title: 'Terms & Conditions',
      effectiveDate: '01-04-2026',
      lastUpdated: '01-08-2026',
      intro: const [
        'Welcome to Falguni Gruh Udhyog ("Company", "we", "our", "us"). These Terms & Conditions govern your access to and use of our website, mobile application, WhatsApp ordering service, telephone ordering service, retail stores and all related services.',
        'By accessing our website or placing an order with Falguni Gruh Udhyog, you agree to be legally bound by these Terms & Conditions.',
      ],
      sections: [
        const LegalSection(title: '1. Eligibility', blocks: [
          LegalBlock.p('You must be at least 18 years of age or have the consent of a parent or legal guardian to place an order.'),
          LegalBlock.p('By placing an order, you confirm that all information provided by you is accurate and complete.'),
        ]),
        const LegalSection(title: '2. Products', blocks: [
          LegalBlock.p('Falguni Gruh Udhyog manufactures and sells traditional Indian food products, snacks, sweets, savouries, bakery products, packaged foods and other food items.'),
          LegalBlock.p('Product availability may vary by location, season and stock availability.'),
          LegalBlock.p('We reserve the right to discontinue any product without prior notice.'),
        ]),
        const LegalSection(title: '3. Product Images', blocks: [
          LegalBlock.p('Product photographs displayed on our website are for illustration purposes.'),
          LegalBlock.p('Actual product colour, texture, size and packaging may vary slightly due to:'),
          LegalBlock.ul(['Handmade preparation', 'Manufacturing batches', 'Lighting', 'Packaging improvements', 'Screen settings']),
          LegalBlock.p('Such variations shall not be treated as product defects.'),
        ]),
        const LegalSection(title: '4. Pricing', blocks: [
          LegalBlock.p('All prices are displayed in Indian Rupees (INR).'),
          LegalBlock.p('Prices are subject to change without prior notice.'),
          LegalBlock.p('Applicable GST shall be charged wherever required under Indian law.'),
          LegalBlock.p('Promotional prices are valid only during the advertised period.'),
        ]),
        const LegalSection(title: '5. Order Acceptance', blocks: [
          LegalBlock.p('Submission of an order does not constitute acceptance by Falguni Gruh Udhyog.'),
          LegalBlock.p('We reserve the right to:'),
          LegalBlock.ul(['Accept or reject any order', 'Limit quantities purchased', 'Cancel duplicate orders', 'Reject suspicious transactions', 'Reject incomplete or fraudulent orders']),
          LegalBlock.p('If payment has already been received for a cancelled order, the eligible amount will be refunded to the original payment method.'),
        ]),
        const LegalSection(title: '6. Payment', blocks: [
          LegalBlock.p('We accept payment through approved payment methods available on our website or application, including UPI, debit cards, credit cards, net banking and other supported digital payment options.'),
          LegalBlock.p('All online payments are processed through secure third-party payment gateways.'),
          LegalBlock.p('Falguni Gruh Udhyog does not store customers\' card details, CVV, UPI PIN or internet banking credentials.'),
        ]),
        const LegalSection(title: '7. Order Confirmation', blocks: [
          LegalBlock.p('Once payment is successfully completed, an order confirmation will be sent through email, SMS and/or WhatsApp (where applicable).'),
          LegalBlock.p('Customers are responsible for reviewing the order details immediately and informing us of any discrepancies before dispatch.'),
        ]),
        LegalSection(title: '8. Delivery Policy', blocks: [
          const LegalBlock.p('Delivery charges are calculated based on the delivery location.'),
          LegalBlock.p('Hyperlocal Delivery (Within ${hyperlocal.maxDistanceKm.toInt()} km)'),
          LegalBlock.ul(['Delivery Charge: ${_inr(hyperlocal.fee)}', 'Free Delivery on orders above ${_inr(hyperlocal.freeAbove)}']),
          LegalBlock.p('Intercity Delivery (${hyperlocal.maxDistanceKm.toInt()}–${intercity.maxDistanceKm.toInt()} km)'),
          LegalBlock.ul(['Delivery Charge: ${_inr(intercity.fee)}', 'Free Delivery on orders above ${_inr(intercity.freeAbove)}']),
          LegalBlock.p('Interstate Delivery (${intercity.maxDistanceKm.toInt()}–${interstate.maxDistanceKm.toInt()} km)'),
          LegalBlock.ul(['Delivery Charge: ${_inr(interstate.fee)}', 'Free Delivery on orders above ${_inr(interstate.freeAbove)}']),
          LegalBlock.p('Gujarat Outstation (More than ${interstate.maxDistanceKm.toInt()} km within Gujarat)'),
          LegalBlock.ul(['Delivery Charge: ${_inr(gujarat.feePerKg)} per kg', 'Free Delivery on orders above ${_inr(gujarat.freeAbove)}']),
          const LegalBlock.p('PAN India Delivery'),
          LegalBlock.ul(['Delivery Charge: ${_inr(panIndia.feePerKg)} per kg', 'Free Delivery on orders above ${_inr(panIndia.freeAbove)}']),
          const LegalBlock.p('Delivery charges, distance calculations and eligibility for free delivery are determined solely by Falguni Gruh Udhyog. See the Delivery Charges page for the full breakdown and worked examples.'),
        ]),
        const LegalSection(title: '9. Delivery Timeline', blocks: [
          LegalBlock.p('Estimated delivery times are indicative only.'),
          LegalBlock.p('Delays may occur due to:'),
          LegalBlock.ul(['Weather conditions', 'Traffic', 'Festivals', 'Government restrictions', 'Courier delays', 'Natural disasters', 'Operational constraints']),
          LegalBlock.p('Such delays shall not constitute grounds for cancellation, compensation or damages.'),
        ]),
        const LegalSection(title: '10. Delivery Address', blocks: [
          LegalBlock.p('Customers are responsible for providing a complete and accurate delivery address.'),
          LegalBlock.p('If an incorrect or incomplete address results in delivery failure, additional delivery charges may apply for re-delivery.'),
        ]),
        const LegalSection(title: '11. Customer Availability', blocks: [
          LegalBlock.p('Customers or an authorised recipient must be available to receive the order.'),
          LegalBlock.p('If delivery cannot be completed because the recipient is unavailable, we reserve the right to:'),
          LegalBlock.ul(['Attempt re-delivery (subject to availability)', 'Charge additional delivery fees', 'Cancel the order if the product is perishable']),
        ]),
        const LegalSection(title: '12. Risk & Ownership', blocks: [
          LegalBlock.p('Ownership and risk in the products pass to the customer upon successful delivery.'),
          LegalBlock.p('Customers should inspect the order immediately upon receipt.'),
        ]),
        const LegalSection(title: '13. Order Cancellation', blocks: [
          LegalBlock.p('Orders may be cancelled only before dispatch.'),
          LegalBlock.p('Once dispatched, orders cannot be cancelled.'),
          LegalBlock.p('Freshly prepared, customised or perishable food products are generally not eligible for cancellation after processing has commenced.'),
        ]),
        const LegalSection(title: '14. Refunds & Replacements', blocks: [
          LegalBlock.p('Refunds or replacements may be considered only in cases such as:'),
          LegalBlock.ul(['Wrong product delivered', 'Damaged package received', 'Manufacturing defect', 'Missing items', 'Products damaged during transit']),
          LegalBlock.p('Requests must be reported within 24 hours of delivery and supported with photographs or videos where requested.'),
          LegalBlock.p('Refunds will not be provided merely because a customer dislikes the taste, texture, flavour or personal preference of a product.'),
        ]),
        const LegalSection(title: '15. Shelf Life & Storage', blocks: [
          LegalBlock.p('Customers must follow the storage instructions printed on the packaging.'),
          LegalBlock.p('Falguni Gruh Udhyog shall not be responsible for product deterioration due to improper storage after delivery.'),
        ]),
        const LegalSection(title: '16. Allergens', blocks: [
          LegalBlock.p('Our products may contain or be processed in facilities handling:'),
          LegalBlock.ul(['Wheat', 'Gluten', 'Milk', 'Peanuts', 'Tree Nuts', 'Sesame', 'Soy', 'Mustard', 'Spices']),
          LegalBlock.p('Customers with allergies should review ingredient information carefully before purchase.'),
        ]),
        const LegalSection(title: '17. Customer Responsibilities', blocks: [
          LegalBlock.p('Customers agree not to:'),
          LegalBlock.ul(['Provide false information', 'Place fraudulent orders', 'Misuse promotional offers', 'Attempt unauthorised access to our systems', 'Copy website content without permission', 'Disrupt website operations']),
          LegalBlock.p('Violation of these terms may result in suspension of services or legal action.'),
        ]),
        const LegalSection(title: '18. Intellectual Property', blocks: [
          LegalBlock.p('All trademarks, logos, product names, packaging designs, website content, photographs, graphics and text are the exclusive property of Falguni Gruh Udhyog unless otherwise stated.'),
          LegalBlock.p('No content may be copied, reproduced, modified or distributed without prior written permission.'),
        ]),
        const LegalSection(title: '19. Promotional Offers', blocks: [
          LegalBlock.p('Promotional offers are subject to specific terms and may be modified or withdrawn without prior notice.'),
          LegalBlock.p('Only one promotional offer may be applied per order unless otherwise specified.'),
        ]),
        const LegalSection(title: '20. Limitation of Liability', blocks: [
          LegalBlock.p('To the maximum extent permitted by law, Falguni Gruh Udhyog shall not be liable for any indirect, incidental, consequential or special damages arising from the use of our website, products or services.'),
          LegalBlock.p('Our total liability, if any, shall not exceed the value of the product purchased.'),
        ]),
        const LegalSection(title: '21. Force Majeure', blocks: [
          LegalBlock.p('We shall not be liable for delays or failure to perform due to circumstances beyond our reasonable control, including but not limited to:'),
          LegalBlock.ul(['Natural disasters', 'Floods', 'Fires', 'Pandemic', 'Government restrictions', 'Strikes', 'Power failures', 'Internet outages', 'Transportation disruptions']),
        ]),
        const LegalSection(title: '22. Governing Law', blocks: [
          LegalBlock.p('These Terms & Conditions shall be governed by and construed in accordance with the laws of India.'),
        ]),
        const LegalSection(title: '23. Jurisdiction', blocks: [
          LegalBlock.p('Any dispute arising out of or relating to these Terms & Conditions shall be subject to the exclusive jurisdiction of the competent courts located in Ahmedabad, Gujarat.'),
        ]),
        const LegalSection(title: '24. Amendments', blocks: [
          LegalBlock.p('Falguni Gruh Udhyog reserves the right to modify these Terms & Conditions at any time.'),
          LegalBlock.p('Revised Terms shall become effective immediately upon publication on our website.'),
          LegalBlock.p('Continued use of our services constitutes acceptance of the revised Terms.'),
        ]),
        const LegalSection(title: '25. Contact Us', blocks: [
          LegalBlock.p('For any questions regarding these Terms & Conditions, please contact:'),
          LegalBlock.ul(['Falguni Gruh Udhyog', 'Website: https://falgunigruhudhyog.in', 'Email: sales@falgunigruhudhyog.in', 'Phone: 9825382002']),
        ]),
      ],
    );
  }
}
