// ignore_for_file: curly_braces_in_flow_control_structures, avoid_print, deprecated_member_use

import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../Model/formatter.dart';

class _CashfreeTxItem {
  final String title;
  final String subtitle;
  final DateTime date;
  final double amount;
  final String status;

  _CashfreeTxItem({
    required this.title,
    required this.subtitle,
    required this.date,
    required this.amount,
    required this.status,
  });
}

/// User-facing page to verify Cashfree transactions.
/// Tab 1: Verify logged-in user's own orders against Cashfree API
/// Tab 2: Manual lookup by Cashfree Order ID
/// Tab 3: List tracked Cashfree expenditures
class AuditOrdersPage extends StatefulWidget {
  const AuditOrdersPage({super.key});

  @override
  State<AuditOrdersPage> createState() => _AuditOrdersPageState();
}

class _AuditOrdersPageState extends State<AuditOrdersPage>
    with SingleTickerProviderStateMixin {
  static const Color kGold = Color(0xFFD4AF37);
  static const Color kDarkBg = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  late TabController _tabController;

  // Tab 1
  bool isLoading = false;
  bool hasRun = false;
  String? errorMessage;
  List<_AuditResult> results = [];
  int totalOrders = 0, verifiedPaid = 0, notPaid = 0, noOrderId = 0;

  // Tab 2
  final TextEditingController _orderIdController = TextEditingController();
  bool isLookingUp = false;
  _AuditResult? lookupResult;
  String? lookupError;

  String? _baseUrl;
  String? _clientId;
  String? _clientSecret;

  // Tab 3
  String id = '';
  String currencySymbol = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadEnv();
    _getUserDetails();
    _getCurrencySymbol();
  }

  Future<void> _getUserDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((value) {
      if (!mounted) return;
      setState(() {
        id = value['id'] ?? '';
      });
    });
  }

  void _getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      if (!mounted) return;
      setState(() => currencySymbol = value['Currency symbol'] ?? '');
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _orderIdController.dispose();
    super.dispose();
  }

  Future<void> _loadEnv() async {
    if (!dotenv.isInitialized) await dotenv.load(fileName: ".env");
    String c(String? v) =>
        (v ?? '').replaceAll("'", '').replaceAll('"', '').trim();
    String apiUrl = c(dotenv.env['apiUrl']);
    _clientId = c(dotenv.env['client_id']);
    _clientSecret = c(dotenv.env['client_secret']);
    if (apiUrl.isNotEmpty) {
      _baseUrl = apiUrl;
      if (_baseUrl!.endsWith('/'))
        _baseUrl = _baseUrl!.substring(0, _baseUrl!.length - 1);
      if (_baseUrl!.endsWith('/orders'))
        _baseUrl = _baseUrl!.substring(0, _baseUrl!.length - '/orders'.length);
    }
  }

  Map<String, String> get _h => {
        'x-client-id': _clientId!,
        'x-client-secret': _clientSecret!,
        'x-api-version': '2023-08-01',
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kDarkBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Transaction Data',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: kGold,
          labelColor: kGold,
          unselectedLabelColor: Colors.white54,
          labelStyle:
              const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          tabs: const [
            Tab(
                icon: Icon(Icons.account_balance_wallet, size: 22),
                text: 'Tracking'),
            Tab(icon: Icon(Icons.receipt_long, size: 22), text: 'Verification'),
          ],
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kDarkBg, kBgMid, kDarkBg],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: TabBarView(
          controller: _tabController,
          children: [_buildTab3(), _buildTab1()],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASHFREE PORTAL LINK CARD
  // ═══════════════════════════════════════════════════════════════════════════

  Widget _cashfreePortalCard() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: GestureDetector(
        onTap: () async {
          final url = Uri.parse('https://www.cashfree.com/customer-hub');
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          }
        },
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [kGold.withOpacity(0.15), kGold.withOpacity(0.05)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kGold.withOpacity(0.4)),
          ),
          child: Row(children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: kGold.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child:
                  const Icon(Icons.open_in_new_rounded, color: kGold, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Cashfree Customer Hub',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  Text(
                      'View all your transactions (last 3 months) on Cashfree\'s official portal using your phone number',
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.5), fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.arrow_forward_ios_rounded,
                color: kGold.withOpacity(0.6), size: 16),
          ]),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 1: MY ORDERS
  // ═══════════════════════════════════════════════════════════════════════════

  Widget _buildTab1() {
    return SafeArea(
      child: Column(children: [
        _cashfreeNoticeBanner(),
        _cashfreePortalCard(),

        // --- MANUAL LOOKUP SECTION ---
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Lookup Specific Order:',
                style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _orderIdController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Enter Cashfree Order ID...',
                        hintStyle:
                            TextStyle(color: Colors.white.withOpacity(0.3)),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.06),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 12),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: kGold.withOpacity(0.3))),
                        enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: kGold.withOpacity(0.3))),
                        focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: kGold)),
                        prefixIcon: Icon(Icons.search,
                            color: kGold.withOpacity(0.6), size: 18),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: isLookingUp ? null : _runTab2,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(
                          vertical: 14, horizontal: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      disabledBackgroundColor: kGold.withOpacity(0.4),
                    ),
                    child: isLookingUp
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.black))
                        : const Text('Verify',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              if (lookupError != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: _errBox(lookupError!),
                ),
              if (lookupResult != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: _auditTile(lookupResult!),
                ),
            ],
          ),
        ),

        const Divider(color: Colors.white12, height: 24, thickness: 1),

        // --- BATCH VERIFICATION SECTION ---
        if (hasRun) _summaryCard(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isLoading ? null : _runTab1,
              icon: isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.black))
                  : const Icon(Icons.verified_user_rounded),
              label: Text(isLoading
                  ? 'Verifying...'
                  : hasRun
                      ? 'Re-verify'
                      : 'Verify My Transactions'),
              style: _goldBtn(),
            ),
          ),
        ),
        if (errorMessage != null) _errBox(errorMessage!),
        Expanded(
          child: results.isEmpty
              ? Center(
                  child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                      hasRun
                          ? 'No Cashfree orders found for your account.'
                          : 'Tap "Verify My Transactions" to check all your Cashfree transactions against the payment gateway.',
                      style:
                          const TextStyle(color: Colors.white54, fontSize: 14),
                      textAlign: TextAlign.center),
                ))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: results.length,
                  itemBuilder: (_, i) => _auditTile(results[i])),
        ),
      ]),
    );
  }

  Future<void> _runTab1() async {
    setState(() {
      isLoading = true;
      hasRun = false;
      errorMessage = null;
      results.clear();
      totalOrders = verifiedPaid = notPaid = noOrderId = 0;
    });
    try {
      if (_baseUrl == null || _clientId == null || _clientSecret == null) {
        setState(() {
          isLoading = false;
          errorMessage = "Missing credentials.";
        });
        return;
      }
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        setState(() {
          isLoading = false;
          errorMessage = "Not logged in.";
        });
        return;
      }
      QuerySnapshot snap = await FirebaseFirestore.instance
          .collection('Orders')
          .where('userID', isEqualTo: user.uid)
          .get();

      final cutoff = DateTime(2026, 2, 23);
      int validOrdersCount = 0;

      for (var doc in snap.docs) {
        Map<String, dynamic> d = doc.data() as Map<String, dynamic>;
        DateTime orderDate = _parseOrderDate(d);
        if (orderDate.isBefore(cutoff)) continue;

        validOrdersCount++;
        if (d['paymentType'] != 'Cash Free') continue;
        dynamic cf = d['cashFreeDetails'];
        String? cfId;
        if (cf != null && cf is Map) cfId = cf['order_id']?.toString();
        if (cfId == null || cfId.isEmpty) {
          noOrderId++;
          results.add(_AuditResult(
            appOrderId: d['orderID']?.toString() ?? 'N/A',
            cfOrderId: 'MISSING',
            cfStatus: 'NO ORDER ID',
            isPaid: false,
            amount: 0,
            customerName: '',
            customerPhone: '',
            paymentMethod: '',
            timeCreated: d['timeCreated']?.toString() ?? '',
            cfPaymentTime: '',
          ));
          continue;
        }
        final r = await _fetchOrder(cfId,
            appOrderId: d['orderID']?.toString() ?? 'N/A',
            fallbackTime: d['timeCreated']?.toString() ?? '');
        if (r != null) {
          r.isPaid ? verifiedPaid++ : notPaid++;
          results.add(r);
        }
        await Future.delayed(const Duration(milliseconds: 150));
        if (mounted) setState(() {});
      }
      totalOrders = validOrdersCount;
      results.sort((a, b) => a.isPaid == b.isPaid
          ? 0
          : a.isPaid
              ? 1
              : -1);
    } catch (e) {
      errorMessage = "Error: $e";
    }
    if (mounted) {
      setState(() {
        isLoading = false;
        hasRun = true;
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOOKUP ACTION
  // ═══════════════════════════════════════════════════════════════════════════

  Future<void> _runTab2() async {
    String id = _orderIdController.text.trim();
    if (id.isEmpty) {
      setState(() => lookupError = "Please enter a Cashfree Order ID.");
      return;
    }
    setState(() {
      isLookingUp = true;
      lookupError = null;
      lookupResult = null;
    });
    try {
      final r = await _fetchOrder(id);
      if (r != null) setState(() => lookupResult = r);
    } catch (e) {
      setState(() => lookupError = "Failed: $e");
    }
    if (mounted) setState(() => isLookingUp = false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED: Fetch single order from Cashfree API
  // ═══════════════════════════════════════════════════════════════════════════

  Future<_AuditResult?> _fetchOrder(String cfOrderId,
      {String appOrderId = 'N/A', String fallbackTime = ''}) async {
    try {
      final resp = await http.get(
        Uri.parse('$_baseUrl/orders/$cfOrderId'),
        headers: _h,
      );
      if (resp.statusCode == 200) {
        var od = jsonDecode(resp.body);
        String name = '', phone = '', payMethod = '', payTime = '';
        double amount = double.tryParse('${od['order_amount']}') ?? 0;
        String status = od['order_status']?.toString() ?? 'UNKNOWN';

        if (od['customer_details'] != null) {
          name = od['customer_details']['customer_name']?.toString() ?? '';
          phone = od['customer_details']['customer_phone']?.toString() ?? '';
        }
        try {
          final payResp = await http.get(
            Uri.parse('$_baseUrl/orders/$cfOrderId/payments'),
            headers: _h,
          );
          if (payResp.statusCode == 200) {
            var pl = jsonDecode(payResp.body);
            if (pl is List && pl.isNotEmpty) {
              var p = pl.firstWhere(
                (x) => x['payment_status'] == 'SUCCESS',
                orElse: () => pl.first,
              );
              payMethod = p['payment_group']?.toString() ?? '';
              payTime = p['payment_time']?.toString() ?? '';
            }
          }
        } catch (_) {}

        return _AuditResult(
          appOrderId: appOrderId,
          cfOrderId: cfOrderId,
          cfStatus: status,
          isPaid: status == 'PAID',
          amount: amount,
          customerName: name,
          customerPhone: phone,
          paymentMethod: payMethod,
          timeCreated: fallbackTime,
          cfPaymentTime: payTime,
        );
      } else if (resp.statusCode == 404) {
        setState(() => lookupError = "Order not found on Cashfree.");
      } else {
        setState(
            () => lookupError = "API error (${resp.statusCode}): ${resp.body}");
      }
    } catch (e) {
      setState(() => lookupError = "Network error: $e");
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 3: CASHFREE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  DateTime _parseOrderDate(Map<String, dynamic> data) {
    if (data['timeCreated'] is Timestamp) {
      return (data['timeCreated'] as Timestamp).toDate();
    }
    String tc = data['timeCreated']?.toString() ?? '';
    try {
      return DateFormat.yMMMMEEEEd().parse(tc);
    } catch (_) {}
    // fallback for unparseable dates
    return DateTime.fromMillisecondsSinceEpoch(0);
  }

  Future<List<_CashfreeTxItem>> _getCashfreeTransactions() async {
    if (id.isEmpty) return [];
    List<_CashfreeTxItem> items = [];

    try {
      final ordersSnap = await FirebaseFirestore.instance
          .collection('Orders')
          .where('userID', isEqualTo: id)
          .get();

      for (var doc in ordersSnap.docs) {
        final data = doc.data();
        DateTime date = _parseOrderDate(data);

        final total = (data['total'] ?? 0).toDouble();
        final status = data['status'] ?? 'Received';
        final orderID = data['orderID'] ?? '';

        String displayStatus = "Debited";
        if (status == "Cancelled") {
          displayStatus = "Returned back";
        } else if (status == "Received" || status == "Processing") {
          displayStatus = "Pending";
        }

        String paymentType = data['paymentType'] ?? '';
        if (paymentType == 'Cash on delivery') {
          paymentType = 'Cash Free';
        }

        if (paymentType == 'Cash Free') {
          items.add(_CashfreeTxItem(
            title: "Order #$orderID",
            subtitle: status,
            date: date,
            amount: total,
            status: displayStatus,
          ));
        }
      }

      items.sort((a, b) => b.date.compareTo(a.date));
    } catch (e) {
      debugPrint("Error fetching CF transactions: $e");
    }
    return items;
  }

  Widget _buildTab3() {
    return SafeArea(
      child: FutureBuilder<List<_CashfreeTxItem>>(
        future: _getCashfreeTransactions(),
        builder: (context, snapshot) {
          final history = snapshot.data ?? [];

          double totalSpent = 0;
          for (var t in history) {
            if (t.status != "Returned back") {
              totalSpent += t.amount;
            }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Total Spent via Cash Free",
                          style: TextStyle(color: kGold, fontSize: 14)),
                      const SizedBox(height: 8),
                      Text(
                          "$currencySymbol${Formatter().converter(totalSpent)}",
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  "All Cashfree Transactions",
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                if (snapshot.connectionState == ConnectionState.waiting)
                  const Center(child: CircularProgressIndicator(color: kGold))
                else if (history.isEmpty &&
                    snapshot.connectionState == ConnectionState.done)
                  const Text("No Cashfree transactions found.",
                      style: TextStyle(color: Colors.white60))
                else
                  ...history.map((h) => _buildTxTile(h)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTxTile(_CashfreeTxItem h) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  h.title,
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w500),
                ),
                Text(
                  DateFormat.yMMMMd().format(h.date),
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                "$currencySymbol${Formatter().converter(h.amount)}",
                style: const TextStyle(
                    color: Colors.redAccent, fontWeight: FontWeight.bold),
              ),
              Text(
                h.status,
                style: TextStyle(
                  color: h.status == "Returned back"
                      ? Colors.greenAccent
                      : Colors.white54,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGETS
  // ═══════════════════════════════════════════════════════════════════════════

  Widget _cashfreeNoticeBanner() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.redAccent.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info_outline_rounded,
                color: Colors.redAccent, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                "From Feb 23rd 2026 onwards we will have this feature available that tracks this order via cashfree. Before that we will not be able to track it.",
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  ButtonStyle _goldBtn() => ElevatedButton.styleFrom(
        backgroundColor: kGold,
        foregroundColor: Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        disabledBackgroundColor: kGold.withOpacity(0.4),
      );

  Widget _summaryCard() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kGold.withOpacity(0.4)),
        ),
        child: Column(children: [
          const Text('Verification Summary',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(children: [
            _sItem('My Orders', totalOrders, Colors.white70),
            _sItem('Paid ✅', verifiedPaid, Colors.greenAccent),
            _sItem('Not Paid ⚠️', notPaid, Colors.redAccent),
            _sItem('No ID', noOrderId, Colors.orangeAccent),
          ]),
        ]),
      ),
    );
  }

  Widget _sItem(String label, int count, Color color) {
    return Expanded(
      child: Column(children: [
        Text('$count',
            style: TextStyle(
                color: color, fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label,
            style: const TextStyle(color: Colors.white54, fontSize: 10),
            textAlign: TextAlign.center),
      ]),
    );
  }

  Widget _auditTile(_AuditResult r) {
    Color sc = r.isPaid ? Colors.greenAccent : Colors.redAccent;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: sc.withOpacity(r.isPaid ? 0.3 : 0.4)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(r.isPaid ? Icons.check_circle : Icons.warning_rounded,
              color: sc, size: 22),
          const SizedBox(width: 8),
          Expanded(
              child: Text(
                  r.isPaid ? 'Payment Verified' : 'Payment Not Verified',
                  style: TextStyle(
                      color: sc, fontSize: 15, fontWeight: FontWeight.w700))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
                color: sc.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8)),
            child: Text(r.cfStatus,
                style: TextStyle(
                    color: sc, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ]),
        const SizedBox(height: 10),
        const Divider(color: Colors.white12, height: 1),
        const SizedBox(height: 8),
        if (r.appOrderId != 'N/A') _row('App Order #', r.appOrderId),
        _row('CF Order ID', r.cfOrderId),
        _row('Amount', '₹${r.amount.toStringAsFixed(2)}'),
        if (r.customerName.isNotEmpty) _row('Name', r.customerName),
        if (r.customerPhone.isNotEmpty) _row('Phone', r.customerPhone),
        if (r.paymentMethod.isNotEmpty)
          _row('Paid Via', _fmtMethod(r.paymentMethod)),
        if (r.cfPaymentTime.isNotEmpty)
          _row('Paid At', _fmtTime(r.cfPaymentTime)),
        if (r.cfPaymentTime.isEmpty && r.timeCreated.isNotEmpty)
          _row('Created', r.timeCreated),
      ]),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(
            width: 90,
            child: Text(label,
                style: const TextStyle(color: Colors.white38, fontSize: 12))),
        Expanded(
            child: Text(value,
                style: const TextStyle(color: Colors.white70, fontSize: 12))),
      ]),
    );
  }

  Widget _errBox(String msg) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.redAccent.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
        ),
        child: Row(children: [
          const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
          const SizedBox(width: 10),
          Expanded(
              child: Text(msg,
                  style:
                      const TextStyle(color: Colors.redAccent, fontSize: 13))),
        ]),
      ),
    );
  }

  String _fmtMethod(String m) {
    switch (m.toLowerCase()) {
      case 'upi':
        return 'UPI';
      case 'net_banking':
      case 'nb':
        return 'Net Banking';
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return 'Card';
      case 'wallet':
        return 'Wallet';
      default:
        return m.toUpperCase();
    }
  }

  String _fmtTime(String raw) {
    try {
      return DateFormat('dd MMM yyyy, hh:mm a')
          .format(DateTime.parse(raw).toLocal());
    } catch (_) {
      return raw;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA MODEL
// ═══════════════════════════════════════════════════════════════════════════

class _AuditResult {
  final String appOrderId, cfOrderId, cfStatus;
  final bool isPaid;
  final double amount;
  final String customerName, customerPhone, paymentMethod;
  final String timeCreated, cfPaymentTime;

  _AuditResult({
    required this.appOrderId,
    required this.cfOrderId,
    required this.cfStatus,
    required this.isPaid,
    required this.amount,
    required this.customerName,
    required this.customerPhone,
    required this.paymentMethod,
    required this.timeCreated,
    required this.cfPaymentTime,
  });
}
