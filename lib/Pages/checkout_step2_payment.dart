import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../Model/formatter.dart';
import '../Pages/wallet_page.dart';

class CheckoutStep2Payment extends StatelessWidget {
  // Design constants - matching cart & wallet pages
  static const Color kPrimary = Color(0xFF2F2525);
  static const Color kGold = Color(0xFFC9A86A);
  static const Color kBgTop = Color(0xFF1C1515);
  static const Color kBgMid = Color(0xFF2F2525);

  final bool walletBool;
  final bool payWithCard;
  final bool cashOnDeliveryBool;
  final bool cashDatabase;
  final num wallet;
  final num subTotal;
  final num deliveryFee;
  final bool deliveryBool;
  final String currencySymbol;
  final Function(bool?) onWalletChanged;
  final Function(bool?) onOnlinePaymentChanged;
  final Function(bool?) onCashOnDeliveryChanged;
  final Function() onWalletTap;
  final List<Map<String, dynamic>> orders;
  final Function() getMyCartToOrders;

  const CheckoutStep2Payment({
    super.key,
    required this.walletBool,
    required this.payWithCard,
    required this.cashOnDeliveryBool,
    required this.cashDatabase,
    required this.wallet,
    required this.subTotal,
    required this.deliveryFee,
    required this.deliveryBool,
    required this.currencySymbol,
    required this.onWalletChanged,
    required this.onOnlinePaymentChanged,
    required this.onCashOnDeliveryChanged,
    required this.onWalletTap,
    required this.orders,
    required this.getMyCartToOrders,
  });

  @override
  Widget build(BuildContext context) {
    num totalAmount = subTotal + (deliveryBool == false ? 0 : deliveryFee);
    bool hasEnoughWallet = wallet >= totalAmount;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kBgTop, kBgMid, kBgTop],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: kGold.withOpacity(0.2),
                  ),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: kGold,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: const EdgeInsets.all(10),
                          child: const Icon(
                            Icons.payment_outlined,
                            color: kBgMid,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Choose Payment Method',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                  color: Colors.white,
                                ),
                              ).tr(),
                              const SizedBox(height: 4),
                              const Text(
                                'Select how you want to pay for your order',
                                style: TextStyle(
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                  color: Colors.white70,
                                ),
                              ).tr(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Payment Options Section
              const Text(
                'Available Payment Options',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ).tr(),
              const SizedBox(height: 12),

              // Wallet Payment Option
              _buildPaymentOption(
                context: context,
                title: 'Wallet',
                subtitle: hasEnoughWallet
                    ? 'Pay full amount using your wallet balance'
                    : 'Use available wallet balance + another payment method',
                icon: Icons.account_balance_wallet_outlined,
                isSelected: walletBool,
                balance:
                    '$currencySymbol${Formatter().converter(wallet.toDouble())}',
                warning: hasEnoughWallet
                    ? null
                    : 'Wallet has $currencySymbol${Formatter().converter(wallet.toDouble())}. Need $currencySymbol${Formatter().converter((totalAmount - wallet).toDouble())} more.',
                onTap: () {
                  if (orders.isEmpty) {
                    getMyCartToOrders();
                  }
                  onWalletChanged(!walletBool);
                },
                onAddMoney: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const WalletPage()),
                  );
                },
                additionalInfo:
                    'Balance: $currencySymbol${Formatter().converter(wallet.toDouble())}',
              ),
              const SizedBox(height: 12),

              // Online Payment Option
              _buildPaymentOption(
                context: context,
                title: 'Online Payment',
                subtitle: 'Pay securely using cards, UPI, or net banking',
                icon: Icons.credit_card_outlined,
                isSelected: payWithCard,
                onTap: () {
                  if (orders.isEmpty) {
                    getMyCartToOrders();
                  }
                  onOnlinePaymentChanged(!payWithCard);
                },
                additionalInfo: 'Fast & Secure',
              ),
              const SizedBox(height: 12),

              // Cash on Delivery Option
              if (cashDatabase)
                _buildPaymentOption(
                  context: context,
                  title: 'Cash on Delivery',
                  subtitle: 'Pay with cash when your order arrives',
                  icon: Icons.local_shipping_outlined,
                  isSelected: cashOnDeliveryBool,
                  onTap: () {
                    if (orders.isEmpty) {
                      getMyCartToOrders();
                    }
                    onCashOnDeliveryChanged(!cashOnDeliveryBool);
                  },
                  additionalInfo: 'Available in selected areas',
                ),

              const SizedBox(height: 20),

              // Order Summary Section
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: kGold.withOpacity(0.15),
                  ),
                ),
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Subtotal',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ).tr(),
                        Text(
                          '$currencySymbol${Formatter().converter(subTotal.toDouble())}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    if (deliveryBool) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Delivery Fee',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ).tr(),
                          Text(
                            '$currencySymbol${Formatter().converter(deliveryFee.toDouble())}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 10),
                    Container(
                      height: 1,
                      color: Colors.white.withOpacity(0.1),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Amount',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ).tr(),
                        Text(
                          '$currencySymbol${Formatter().converter(totalAmount.toDouble())}',
                          style: const TextStyle(
                            color: kGold,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
    String? balance,
    String? warning,
    VoidCallback? onAddMoney,
    String? additionalInfo,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isSelected
              ? kGold.withOpacity(0.15)
              : Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? kGold.withOpacity(0.4)
                : Colors.white.withOpacity(0.1),
            width: isSelected ? 2 : 1,
          ),
        ),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: isSelected ? kGold : Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.all(10),
                  child: Icon(
                    icon,
                    color: isSelected ? kBgMid : kGold,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ).tr(),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                        ),
                      ).tr(),
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? kGold : Colors.white.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  padding: const EdgeInsets.all(2),
                  child: isSelected
                      ? Container(
                          width: 16,
                          height: 16,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: kGold,
                          ),
                          child: const Icon(
                            Icons.check,
                            size: 12,
                            color: kBgMid,
                          ),
                        )
                      : const SizedBox(width: 16, height: 16),
                ),
              ],
            ),
            if (balance != null || additionalInfo != null) ...[
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (additionalInfo != null)
                    Text(
                      additionalInfo,
                      style: const TextStyle(
                        color: kGold,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  if (balance != null && title == 'Wallet')
                    Text(
                      balance,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ],
            if (warning != null) ...[
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.red.withOpacity(0.3),
                  ),
                ),
                padding: const EdgeInsets.all(8),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Colors.red.withOpacity(0.7),
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        warning,
                        style: TextStyle(
                          color: Colors.red.withOpacity(0.7),
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (onAddMoney != null) ...[
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  height: 32,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold.withOpacity(0.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: kGold),
                      ),
                    ),
                    onPressed: onAddMoney,
                    child: const Text(
                      'Add Money to Wallet',
                      style: TextStyle(
                        color: kGold,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ).tr(),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
