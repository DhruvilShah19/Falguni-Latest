// ignore_for_file: deprecated_member_use, use_build_context_synchronously

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shimmer/shimmer.dart';
import 'package:falguni_app/Providers/analytics.dart';

import '../Model/formatter.dart';
import '../Model/products.dart';
import 'product_detail.dart';

class CartPage extends StatefulWidget {
  final bool isbottomNav;
  const CartPage({super.key, required this.isbottomNav});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  DocumentReference? userRef;
  bool showBottomSheet = true;
  bool showBottomSheetOnLoading = false;
  String currencySymbol = '';
  num subTotal = 0;
  num deliveryFee = 0;
  num couponReward = 0;
  bool couponStatus = false;
  bool pleaseWait = false;

  Future<void> _getUserDoc() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    final FirebaseFirestore firestore = FirebaseFirestore.instance;

    User? user = auth.currentUser;
    setState(() {
      userRef = firestore.collection('users').doc(user!.uid);
    });
  }

  Future<List<ProductsModel>> getMyCart() {
    return userRef!.collection('Cart').get().then((snapshot) {
      if (snapshot.docs.isEmpty) {
        userRef!.update({'deliveryFee': 0}).then((value) {
          setState(() {
            showBottomSheet = false;
          });
        });
      }

      return snapshot.docs
          .map((doc) => ProductsModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  getSubTotal() {
    userRef!.collection('Cart').snapshots().listen((val) {
      num tempTotal = val.docs.fold(0, (tot, doc) => tot + doc.data()['price']);

      setState(() {
        subTotal = tempTotal -
            (couponStatus == true && couponReward != 0
                ? (couponReward * tempTotal / 100)
                : 0);
      });
    });
  }

  String coupon = '';
  getCouponStatus() {
    FirebaseFirestore.instance
        .collection('Coupon System')
        .doc('Coupon System')
        .snapshots()
        .listen((value) {
      setState(() {
        couponStatus = value['Status'];
      });
      getSubTotal();
    });
  }

  getCurrencySymbol() {
    FirebaseFirestore.instance
        .collection('Currency Settings')
        .doc('Currency Settings')
        .get()
        .then((value) {
      setState(() {
        currencySymbol = value['Currency symbol'];
      });
    });
  }

  getDeliveryFee() {
    userRef!.snapshots().listen((val) {
      setState(() {
        //deliveryFee = val['deliveryFee'];
        couponReward = val["Coupon Reward"];
      });
    });
  }

  @override
  void initState() {
    getCurrencySymbol();
    _getUserDoc();
    getCouponStatus();
    getDeliveryFee();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            automaticallyImplyLeading:
                widget.isbottomNav == true ? false : true,
            iconTheme: Theme.of(context).iconTheme,
            titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
            backgroundColor: Theme.of(context).colorScheme.background,
            centerTitle: true,
            elevation: 4,
            title: const Text(
              'My Cart',
            ).tr()),
        body: SingleChildScrollView(
          child: Column(
            children: [
              FutureBuilder<List<ProductsModel>>(
                future: getMyCart(),
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return const Column(
                      children: [
                        SizedBox(height: 10),
                        Text('Something went wrong'),
                      ],
                    );
                  }

                  if (!snapshot.hasData) {
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 16.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        children: <Widget>[
                          Shimmer.fromColors(
                            baseColor: Colors.grey[300]!,
                            highlightColor: Colors.grey[100]!,
                            enabled: true,
                            child: ListView.builder(
                              shrinkWrap: true,
                              itemBuilder: (_, __) => const Padding(
                                padding: EdgeInsets.all(8.0),
                                child: SizedBox(
                                    height: 140,
                                    width: double.infinity,
                                    child: Card(
                                      elevation: 4,
                                    )),
                              ),
                              itemCount: 10,
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  return snapshot.data?.isEmpty ?? true
                      ? Column(
                          children: [
                            Image.asset(
                              'assets/image/empty.png',
                              height: MediaQuery.of(context).size.height / 2,
                            ),
                            ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                        const Color.fromARGB(255, 47, 37, 37)),
                                onPressed: () {
                                  Navigator.of(context).pushNamed('/bottomNav');
                                },
                                child: const Text('Continue Shopping').tr())
                          ],
                        )
                      : ListView.builder(
                          itemCount: snapshot.data!.length,
                          physics: const BouncingScrollPhysics(),
                          shrinkWrap: true,
                          itemBuilder: (BuildContext buildContext, int index) {
                            ProductsModel productModel = snapshot.data![index];

                            return Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: InkWell(
                                onTap: () {
                                  Analytics().trackProductView(
                                      productModel.productID,
                                      productModel.name);
                                  Navigator.of(context).push(MaterialPageRoute(
                                      builder: (context) => ProductDetailsPage(
                                            currency: currencySymbol,
                                            marketID: productModel.marketID,
                                            productsModel: productModel,
                                          )));
                                },
                                child: SizedBox(
                                    height: 140,
                                    width: double.infinity,
                                    // child: Card(
                                    //     elevation: 4,
                                    //     shape: RoundedRectangleBorder(
                                    //       borderRadius:
                                    //           BorderRadius.circular(15.0),
                                    //     ),
                                    //     child: Column(
                                    //         mainAxisAlignment:
                                    //             MainAxisAlignment.spaceBetween,
                                    //         children: [
                                    //           Padding(
                                    //             padding:
                                    //                 const EdgeInsets.all(8.0),
                                    //             child: Row(
                                    //               mainAxisAlignment:
                                    //                   MainAxisAlignment
                                    //                       .spaceBetween,
                                    //               children: [
                                    //                 Flexible(
                                    //                   flex: 6,
                                    //                   child: Image.network(
                                    //                     productModel.image1,
                                    //                     height: 100,
                                    //                     width: 100,
                                    //                   ),
                                    //                 ),
                                    //                 Column(
                                    //                   children: [
                                    //                     SizedBox(
                                    //                       width: MediaQuery.of(
                                    //                                   context)
                                    //                               .size
                                    //                               .width /
                                    //                           3,
                                    //                       child: Text(
                                    //                         productModel.name,
                                    //                         maxLines: 1,
                                    //                         overflow:
                                    //                             TextOverflow
                                    //                                 .ellipsis,
                                    //                         style: const TextStyle(
                                    //                             fontSize: 12,
                                    //                             fontWeight:
                                    //                                 FontWeight
                                    //                                     .bold),
                                    //                         textAlign: TextAlign
                                    //                             .center,
                                    //                       ),
                                    //                     ),
                                    //                     Row(
                                    //                       mainAxisAlignment:
                                    //                           MainAxisAlignment
                                    //                               .spaceBetween,
                                    //                       children: [
                                    //                         const Text("Price:",
                                    //                                 style: TextStyle(
                                    //                                     fontSize:
                                    //                                         12,
                                    //                                     fontWeight:
                                    //                                         FontWeight.bold))
                                    //                             .tr(),
                                    //                         const SizedBox(
                                    //                             width: 10),
                                    //                         Text(
                                    //                             '$currencySymbol${Formatter().converter(productModel.price!.toDouble())}',
                                    //                             style:
                                    //                                 const TextStyle(
                                    //                               fontSize: 14,
                                    //                             )),
                                    //                       ],
                                    //                     ),
                                    //                     Row(
                                    //                       mainAxisAlignment:
                                    //                           MainAxisAlignment
                                    //                               .spaceBetween,
                                    //                       children: [
                                    //                         const Text(
                                    //                                 "Selected Item:",
                                    //                                 style: TextStyle(
                                    //                                     fontSize:
                                    //                                         12,
                                    //                                     fontWeight:
                                    //                                         FontWeight.bold))
                                    //                             .tr(),
                                    //                         const SizedBox(
                                    //                             width: 10),
                                    //                         Text(
                                    //                             productModel
                                    //                                 .selected
                                    //                                 .toString(),
                                    //                             style:
                                    //                                 const TextStyle(
                                    //                               fontSize: 14,
                                    //                             )),
                                    //                       ],
                                    //                     ),
                                    //                     Row(
                                    //                         mainAxisAlignment:
                                    //                             MainAxisAlignment
                                    //                                 .spaceBetween,
                                    //                         children: [
                                    //                           Text(
                                    //                               '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
                                    //                               style: const TextStyle(
                                    //                                   fontSize:
                                    //                                       14,
                                    //                                   fontWeight:
                                    //                                       FontWeight
                                    //                                           .bold)),
                                    //                           const SizedBox(
                                    //                               width: 20),
                                    //                           if (productModel
                                    //                                   .percantageDiscount >
                                    //                               0)
                                    //                             Text(
                                    //                                 '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                                    //                                 style: const TextStyle(
                                    //                                     color: Colors
                                    //                                         .grey,
                                    //                                     fontSize:
                                    //                                         14,
                                    //                                     decoration:
                                    //                                         TextDecoration
                                    //                                             .lineThrough,
                                    //                                     fontWeight:
                                    //                                         FontWeight.bold)),
                                    //                         ])
                                    //                   ],
                                    //                 ),
                                    //                 Padding(
                                    //                   padding:
                                    //                       const EdgeInsets.only(
                                    //                           right: 10),
                                    //                   child: Column(
                                    //                     mainAxisAlignment:
                                    //                         MainAxisAlignment
                                    //                             .spaceBetween,
                                    //                     children: [
                                    //                       IconButton(
                                    //                           iconSize: 20,
                                    //                           onPressed: () {
                                    //                             userRef!
                                    //                                 .collection(
                                    //                                     'Cart')
                                    //                                 .doc(productModel
                                    //                                     .uid)
                                    //                                 .update({
                                    //                               'quantity':
                                    //                                   productModel
                                    //                                           .quantity! +
                                    //                                       1,
                                    //                               'price': (productModel
                                    //                                           .quantity! +
                                    //                                       1) *
                                    //                                   productModel
                                    //                                       .selectedPrice!,
                                    //                             });
                                    //                           },
                                    //                           icon: const Icon(
                                    //                               Icons.add)),
                                    //                       Text(productModel
                                    //                           .quantity
                                    //                           .toString()),
                                    //                       IconButton(
                                    //                           iconSize: 20,
                                    //                           onPressed: () {
                                    //                             if (productModel
                                    //                                     .quantity! <=
                                    //                                 1) {
                                    //                               userRef!
                                    //                                   .collection(
                                    //                                       'Cart')
                                    //                                   .doc(productModel
                                    //                                       .uid)
                                    //                                   .delete()
                                    //                                   .then(
                                    //                                       (value) {
                                    //                                 Fluttertoast.showToast(
                                    //                                     msg: "Product has been deleted"
                                    //                                         .tr(),
                                    //                                     toastLength:
                                    //                                         Toast
                                    //                                             .LENGTH_SHORT,
                                    //                                     gravity:
                                    //                                         ToastGravity
                                    //                                             .TOP,
                                    //                                     timeInSecForIosWeb:
                                    //                                         1,
                                    //                                     fontSize:
                                    //                                         14.0);
                                    //                               });
                                    //                             } else {
                                    //                               userRef!
                                    //                                   .collection(
                                    //                                       'Cart')
                                    //                                   .doc(productModel
                                    //                                       .uid)
                                    //                                   .update({
                                    //                                 'quantity':
                                    //                                     productModel.quantity! -
                                    //                                         1,
                                    //                                 'price': (productModel.quantity! -
                                    //                                         1) *
                                    //                                     productModel
                                    //                                         .selectedPrice!
                                    //                               });
                                    //                             }
                                    //                           },
                                    //                           icon: const Icon(
                                    //                               Icons
                                    //                                   .remove)),
                                    //                     ],
                                    //                   ),
                                    //                 ),
                                    //               ],
                                    //             ),
                                    //           ),
                                    //         ]))),
                                    child: Card(
                                      elevation: 4,
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(15.0),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(12.0),
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            // Product Image
                                            ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                              child: Image.network(
                                                productModel.image1,
                                                height: 100,
                                                width: 100,
                                                fit: BoxFit.cover,
                                              ),
                                            ),
                                            const SizedBox(width: 12),

                                            // Product Info Column
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  // Product Name
                                                  Text(
                                                    productModel.name,
                                                    maxLines: 1,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: const TextStyle(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 8),

                                                  // Price Row
                                                  Row(
                                                    children: [
                                                      const Text(
                                                        "Price:",
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ).tr(),
                                                      const SizedBox(width: 6),
                                                      Text(
                                                        '$currencySymbol${Formatter().converter(productModel.price!.toDouble())}',
                                                        style: const TextStyle(
                                                            fontSize: 13),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),

                                                  // Selected Items Row
                                                  Row(
                                                    children: [
                                                      const Text(
                                                        "Selected Item:",
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ).tr(),
                                                      const SizedBox(width: 6),
                                                      Text(
                                                        productModel.selected
                                                            .toString(),
                                                        style: const TextStyle(
                                                            fontSize: 13),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),

                                                  // Unit Price and Discount
                                                  Row(
                                                    children: [
                                                      Text(
                                                        '$currencySymbol${Formatter().converter(productModel.unitPrice1.toDouble())}',
                                                        style: const TextStyle(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 10),
                                                      if (productModel
                                                              .percantageDiscount >
                                                          0)
                                                        Text(
                                                          '$currencySymbol${Formatter().converter(productModel.unitOldPrice1.toDouble())}',
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 13,
                                                            color: Colors.grey,
                                                            decoration:
                                                                TextDecoration
                                                                    .lineThrough,
                                                          ),
                                                        ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),

                                            // Quantity Controls
                                            Column(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 10,
                                                      vertical: 8),
                                                  decoration: BoxDecoration(
                                                    color: Colors.grey.shade100,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12),
                                                    boxShadow: const [
                                                      BoxShadow(
                                                        color: Colors.black12,
                                                        blurRadius: 4,
                                                        offset: Offset(0, 2),
                                                      ),
                                                    ],
                                                    border: Border.all(
                                                        color: Colors
                                                            .grey.shade300),
                                                  ),
                                                  child: Column(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      InkWell(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(30),
                                                        onTap: () {
                                                          userRef!
                                                              .collection(
                                                                  'Cart')
                                                              .doc(productModel
                                                                  .uid)
                                                              .update({
                                                            'quantity': productModel
                                                                    .quantity! +
                                                                1,
                                                            'price': (productModel
                                                                        .quantity! +
                                                                    1) *
                                                                productModel
                                                                    .selectedPrice!,
                                                          });
                                                        },
                                                        child: const Padding(
                                                          padding:
                                                              EdgeInsets.all(
                                                                  6.0),
                                                          child: Icon(Icons.add,
                                                              size: 20,
                                                              color: Colors
                                                                  .blueAccent),
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      AnimatedSwitcher(
                                                        duration:
                                                            const Duration(
                                                                milliseconds:
                                                                    300),
                                                        transitionBuilder: (child,
                                                                animation) =>
                                                            ScaleTransition(
                                                                scale:
                                                                    animation,
                                                                child: child),
                                                        child: Text(
                                                          productModel.quantity
                                                              .toString(),
                                                          key: ValueKey<int>(
                                                              productModel
                                                                  .quantity!
                                                                  .toInt()),
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 15,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color:
                                                                Colors.black87,
                                                          ),
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      InkWell(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(30),
                                                        onTap: () {
                                                          if (productModel
                                                                  .quantity! <=
                                                              1) {
                                                            userRef!
                                                                .collection(
                                                                    'Cart')
                                                                .doc(
                                                                    productModel
                                                                        .uid)
                                                                .delete()
                                                                .then((value) {
                                                              Fluttertoast
                                                                  .showToast(
                                                                msg:
                                                                    "Product has been deleted"
                                                                        .tr(),
                                                                toastLength: Toast
                                                                    .LENGTH_SHORT,
                                                                gravity:
                                                                    ToastGravity
                                                                        .TOP,
                                                                timeInSecForIosWeb:
                                                                    1,
                                                                fontSize: 14.0,
                                                              );
                                                            });
                                                          } else {
                                                            userRef!
                                                                .collection(
                                                                    'Cart')
                                                                .doc(
                                                                    productModel
                                                                        .uid)
                                                                .update({
                                                              'quantity':
                                                                  productModel
                                                                          .quantity! -
                                                                      1,
                                                              'price': (productModel
                                                                          .quantity! -
                                                                      1) *
                                                                  productModel
                                                                      .selectedPrice!,
                                                            });
                                                          }
                                                        },
                                                        child: const Padding(
                                                          padding:
                                                              EdgeInsets.all(
                                                                  6.0),
                                                          child: Icon(
                                                              Icons.remove,
                                                              size: 20,
                                                              color: Colors
                                                                  .redAccent),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                )
                                              ],
                                            )
                                          ],
                                        ),
                                      ),
                                    )),
                              ),
                            );
                          },
                        );
                },
              ),
              const SizedBox(
                height: 260,
              )
            ],
          ),
        ),
        bottomSheet: showBottomSheet == false
            ? null
            : SizedBox(
                height: couponStatus == true ? 230 : 190,
                width: double.infinity,
                child: Card(
                    elevation: 4,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(3.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text("SubTotal:",
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14))
                                  .tr(),
                              Text(
                                  '$currencySymbol${Formatter().converter(subTotal.toDouble())}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14))
                            ],
                          ),
                        ),
                        // Padding(
                        //   padding: const EdgeInsets.all(3.0),
                        //   child: Row(
                        //     mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        //     children: [
                        //       const Text("Delivery Fee:",
                        //               style: TextStyle(
                        //                   fontWeight: FontWeight.bold,
                        //                   fontSize: 14))
                        //           .tr(),
                        //       Text(
                        //           '$currencySymbol${Formatter().converter(deliveryFee.toDouble())}',
                        //           style: const TextStyle(
                        //               fontWeight: FontWeight.bold,
                        //               fontSize: 14))
                        //     ],
                        //   ),
                        // ),
                        Padding(
                          padding: const EdgeInsets.all(3.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text("Total:",
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14))
                                  .tr(),
                              Text(
                                  '$currencySymbol${Formatter().converter((deliveryFee + subTotal).toDouble())}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14))
                            ],
                          ),
                        ),
                        couponStatus == true
                            ? Padding(
                                padding: const EdgeInsets.all(3.0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text("Coupon:",
                                            style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14))
                                        .tr(),
                                    SizedBox(
                                      height: 50,
                                      width: 150,
                                      child: TextField(
                                          maxLength: 10,
                                          onChanged: (val) {
                                            setState(() {
                                              coupon = val;
                                            });
                                          },
                                          decoration: const InputDecoration(
                                              border: OutlineInputBorder(
                                                  borderRadius:
                                                      BorderRadius.all(
                                                          Radius.circular(
                                                              10))))),
                                    ),
                                  ],
                                ),
                              )
                            : const SizedBox(),
                        Padding(
                          padding: const EdgeInsets.only(
                              right: 8, left: 8, bottom: 30),
                          child: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                        const Color.fromARGB(255, 47, 37, 37)),
                                onPressed: pleaseWait == true
                                    ? null
                                    : () {
                                        if (subTotal == 0) {
                                          Navigator.of(context)
                                              .pushNamed('/bottomNav');
                                        } else {
                                          if (coupon == '') {
                                            Navigator.of(context)
                                                .pushNamed('/checkout');
                                          } else {
                                            if (coupon != '') {
                                              FirebaseFirestore.instance
                                                  .collection('Coupons')
                                                  .where('coupon',
                                                      isEqualTo: coupon)
                                                  .get()
                                                  .then((value) {
                                                if (value.docs.isNotEmpty) {
                                                  for (var item in value.docs) {
                                                    setState(() {
                                                      pleaseWait = true;
                                                    });
                                                    Fluttertoast.showToast(
                                                        msg:
                                                            "Coupon reward added to your cart."
                                                                .tr(),
                                                        toastLength:
                                                            Toast.LENGTH_SHORT,
                                                        gravity:
                                                            ToastGravity.TOP,
                                                        timeInSecForIosWeb: 1,
                                                        fontSize: 14.0);
                                                    userRef!.update({
                                                      'Coupon Reward':
                                                          item['percentage']
                                                    }).then((value) {
                                                      setState(() {
                                                        pleaseWait = false;
                                                      });
                                                      Navigator.of(context)
                                                          .pushNamed(
                                                              '/checkout');
                                                    });
                                                  }
                                                } else {
                                                  Fluttertoast.showToast(
                                                      msg:
                                                          "Wrong coupon number."
                                                              .tr(),
                                                      toastLength:
                                                          Toast.LENGTH_SHORT,
                                                      gravity: ToastGravity.TOP,
                                                      timeInSecForIosWeb: 1,
                                                      fontSize: 14.0);
                                                }
                                              });
                                            }
                                          }
                                        }
                                      },
                                child: const Text('Check Out').tr()),
                          ),
                        )
                      ],
                    )),
              ));
  }
}
