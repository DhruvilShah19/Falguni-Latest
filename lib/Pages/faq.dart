// ignore_for_file: deprecated_member_use, prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class FaqPage extends StatefulWidget {
  const FaqPage({super.key});

  @override
  State<FaqPage> createState() => _FaqPageState();
}

class _FaqPageState extends State<FaqPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: Theme.of(context).iconTheme,
        titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
        backgroundColor: Theme.of(context).colorScheme.background,
        centerTitle: true,
        elevation: 0,
        title: const Text('Faq').tr(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            Text(
              'Below are frequently asked questions, you may find the answer for yourself',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const SizedBox(height: 30),
            faqItem(
              question: 'Should I create an account to shop here?',
              answer:
                  'Yes, by creating an account with us, not only your shopping experience becomes easier, but you will also receive regular updates about our new product launches and special offers and discounts. You can also track your orders through your account.',
            ),
            faqItem(
              question: 'What are Online Payment Options available?',
              answer:
                  'Debit Cards, Credit Cards (Visa/MasterCard/Diners), Net Banking.',
            ),
            faqItem(
              question: 'What is the shelf life period of your product?',
              answer:
                  'Different products have different shelf life, and they are usually mentioned on the packaging. Additionally, you can inquire about the perishability of any specific product before ordering.',
            ),
            faqItem(
              question: 'Do you deliver overseas?',
              answer:
                  'Yes, we do ship our products overseas. You can check with us on which products can be delivered to you within its shelf life.',
            ),
            faqItem(
              question: 'Do you offer refunds on cancellations or returns?',
              answer:
                  'You can check out the Refunds & Returns policy to understand the process of returns and refunds, if any.',
            ),
            faqItem(
              question: 'When can I expect my order delivery?',
              answer:
                  'Orders within the city of Ahmedabad and its nearby towns are fulfilled in 2 to 3 days. But for larger cities outside Gujarat, it may take 3 to 4 days. For deliveries overseas, it depends on the shipping policy of the country. We advise you to check with the team prior to ordering.',
            ),
          ],
        ),
      ),
    );
  }

  Widget faqItem({required String question, required String answer}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            answer,
            style: const TextStyle(fontSize: 16, height: 1.5),
          ),
        ],
      ),
    );
  }
}
