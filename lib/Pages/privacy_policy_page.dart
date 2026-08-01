import 'package:flutter/material.dart';
import 'legal_content_widgets.dart';

// Mirrors falguni_web/app/privacy-policy/page.tsx section for section.
class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  static const _businessInfo = [
    'Business Name: Falguni Gruh Udhyog',
    'Website: https://falgunigruhudhyog.in',
    'Email: sales@falgunigruhudhyog.in',
    'Phone: 9825382002',
    'Address: Gf 1 to 4, Hirak avenue, opp. shakti enclave, vastrapur, Ahmedabad 380015',
  ];

  @override
  Widget build(BuildContext context) {
    return LegalContentPage(
      title: 'Privacy Policy',
      effectiveDate: '01-04-2026',
      lastUpdated: '01-08-2026',
      intro: const [
        'Welcome to Falguni Gruh Udhyog ("we", "our", "us"). We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, disclose and protect your information when you visit our website, mobile application, place an order through WhatsApp, telephone, social media, or purchase from any of our sales channels.',
        'By using our website or services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and processing of your information as described herein.',
      ],
      sections: [
        const LegalSection(title: '1. Business Information', blocks: [
          LegalBlock.ul(_businessInfo),
        ]),
        const LegalSection(title: '2. Information We Collect', blocks: [
          LegalBlock.p('We may collect the following categories of information:'),
          LegalBlock.p('Personal Information'),
          LegalBlock.ul(['Full Name', 'Mobile Number', 'Email Address', 'Billing Address', 'Shipping Address', 'PIN Code', 'City and State']),
          LegalBlock.p('Order Information'),
          LegalBlock.ul(['Products Ordered', 'Order Amount', 'Order History', 'Invoice Details', 'Delivery Preferences']),
          LegalBlock.p('Payment Information'),
          LegalBlock.p('Payments are processed through secure third-party payment gateways.'),
          LegalBlock.p('We do not store:'),
          LegalBlock.ul(['Credit Card Numbers', 'Debit Card Numbers', 'CVV', 'UPI PIN', 'Net Banking Passwords']),
          LegalBlock.p('Payment processors may collect payment information according to their own privacy policies.'),
        ]),
        const LegalSection(title: '3. Information Collected Automatically', blocks: [
          LegalBlock.p('When you use our website, we may automatically collect:'),
          LegalBlock.ul(['IP Address', 'Browser Type', 'Device Information', 'Operating System', 'Date & Time of Visit', 'Pages Viewed', 'Session Duration', 'Cookies', 'Referral Source']),
          LegalBlock.p('This information helps us improve website performance and user experience.'),
        ]),
        const LegalSection(title: '4. How We Use Your Information', blocks: [
          LegalBlock.p('Your information may be used to:'),
          LegalBlock.ul([
            'Process and deliver orders',
            'Verify customer identity',
            'Generate invoices',
            'Process payments',
            'Provide customer support',
            'Send order confirmations',
            'Send shipping updates',
            'Improve our website and services',
            'Detect fraud and misuse',
            'Maintain legal and regulatory compliance',
            'Respond to customer queries',
            'Conduct internal analytics',
            'Send promotional offers (only where permitted)',
          ]),
        ]),
        const LegalSection(title: '5. Marketing Communication', blocks: [
          LegalBlock.p('With your consent, we may send:'),
          LegalBlock.ul(['Promotional offers', 'Festival discounts', 'New product launches', 'Seasonal collections', 'Exclusive membership offers']),
          LegalBlock.p('You may unsubscribe at any time by contacting us or using the unsubscribe option available in our communications.'),
        ]),
        const LegalSection(title: '6. Cookies', blocks: [
          LegalBlock.p('Our website uses cookies to:'),
          LegalBlock.ul(['Remember your preferences', 'Improve website functionality', 'Enhance user experience', 'Measure website traffic', 'Analyse visitor behaviour', 'Maintain login sessions']),
          LegalBlock.p('You may disable cookies through your browser settings; however, some website features may not function properly.'),
        ]),
        const LegalSection(title: '7. Sharing of Information', blocks: [
          LegalBlock.p('We do not sell or rent your personal information.'),
          LegalBlock.p('We may share information with trusted service providers solely for legitimate business purposes, including:'),
          LegalBlock.ul(['Payment gateways', 'Delivery partners', 'Courier companies', 'SMS providers', 'Email service providers', 'Cloud hosting providers', 'Website maintenance partners', 'Government authorities when required by law']),
          LegalBlock.p('Each third-party provider is expected to maintain appropriate confidentiality and security standards.'),
        ]),
        const LegalSection(title: '8. Payment Security', blocks: [
          LegalBlock.p('All online payments are handled by certified payment gateway providers using secure encryption technologies.'),
          LegalBlock.p('Falguni Gruh Udhyog never stores your:'),
          LegalBlock.ul(['Card Number', 'CVV', 'UPI PIN', 'Internet Banking Credentials']),
          LegalBlock.p('Customers should ensure they transact only through our official payment channels.'),
        ]),
        const LegalSection(title: '9. Delivery Information', blocks: [
          LegalBlock.p('To complete your order, we may share limited customer information with delivery partners, including:'),
          LegalBlock.ul(['Name', 'Delivery Address', 'Mobile Number', 'Order Reference Number']),
          LegalBlock.p('Delivery partners receive only the information necessary to fulfil the delivery.'),
        ]),
        const LegalSection(title: '10. Data Security', blocks: [
          LegalBlock.p('We implement commercially reasonable technical and organisational safeguards to protect your personal information against:'),
          LegalBlock.ul(['Unauthorised access', 'Alteration', 'Disclosure', 'Misuse', 'Loss', 'Destruction']),
          LegalBlock.p('While we strive to protect your information, no online transmission or storage system can be guaranteed to be completely secure.'),
        ]),
        const LegalSection(title: '11. Data Retention', blocks: [
          LegalBlock.p('We retain personal information only for as long as necessary to:'),
          LegalBlock.ul(['Complete orders', 'Meet legal obligations', 'Resolve disputes', 'Maintain accounting records', 'Prevent fraud', 'Enforce our agreements']),
          LegalBlock.p('Information no longer required will be securely deleted or anonymised in accordance with applicable laws.'),
        ]),
        const LegalSection(title: '12. Your Rights', blocks: [
          LegalBlock.p('Subject to applicable law, you may request to:'),
          LegalBlock.ul([
            'Access your personal information',
            'Correct inaccurate information',
            'Update your contact details',
            'Withdraw consent where applicable',
            'Request deletion of eligible personal information',
            'Raise concerns regarding data processing',
          ]),
          LegalBlock.p('Requests may be submitted through our customer support contact details.'),
        ]),
        const LegalSection(title: "13. Children's Privacy", blocks: [
          LegalBlock.p('Our services are intended for individuals who are legally capable of entering into binding contracts.'),
          LegalBlock.p('We do not knowingly collect personal information from children without appropriate parental or guardian consent.'),
        ]),
        const LegalSection(title: '14. Third-Party Links', blocks: [
          LegalBlock.p('Our website may contain links to third-party websites, payment platforms or social media pages.'),
          LegalBlock.p('We are not responsible for the privacy practices or content of third-party websites. Users are encouraged to review their respective privacy policies before providing any personal information.'),
        ]),
        const LegalSection(title: '15. Business Transfers', blocks: [
          LegalBlock.p('In the event of a merger, acquisition, restructuring, or sale of assets, customer information may be transferred as part of the business transaction, subject to applicable legal requirements.'),
        ]),
        const LegalSection(title: '16. Fraud Prevention', blocks: [
          LegalBlock.p('To protect our customers and business, we reserve the right to:'),
          LegalBlock.ul(['Verify customer identity', 'Verify payment authenticity', 'Cancel suspicious orders', 'Suspend fraudulent accounts', 'Report suspected fraud to appropriate authorities']),
        ]),
        const LegalSection(title: '17. Compliance with Law', blocks: [
          LegalBlock.p('We may disclose information where required to:'),
          LegalBlock.ul(['Comply with applicable laws', 'Respond to lawful requests by government authorities', 'Protect our legal rights', 'Prevent fraud', 'Protect public safety']),
        ]),
        const LegalSection(title: '18. Policy Updates', blocks: [
          LegalBlock.p('We reserve the right to modify this Privacy Policy at any time.'),
          LegalBlock.p('Updated versions will be published on our website with the revised effective date. Continued use of our services after such updates constitutes acceptance of the revised policy.'),
        ]),
        LegalSection(
          title: '19. Contact Us',
          blocks: [
            const LegalBlock.p('For questions regarding this Privacy Policy or your personal information, please contact:'),
            LegalBlock.ul(_businessInfo.where((l) => !l.startsWith('Business Name')).toList()),
          ],
        ),
        const LegalSection(title: '20. Consent', blocks: [
          LegalBlock.p('By accessing our website, placing an order, using our mobile application, contacting us through WhatsApp, telephone or social media, or otherwise using our services, you acknowledge that you have read, understood and agreed to this Privacy Policy.'),
          LegalBlock.p('If you do not agree with any part of this Privacy Policy, please discontinue the use of our website and services.'),
        ]),
      ],
    );
  }
}
