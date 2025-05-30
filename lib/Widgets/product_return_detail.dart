// ignore_for_file: unnecessary_null_comparison

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:falguni_app/Model/order_model.dart';
import 'package:falguni_app/Widgets/return_product_widget.dart';
import 'package:flutter/material.dart';

class ProductReturnDetail extends StatefulWidget {
  final String productID;
  final OrderModel2 orderModel;
  final OrdersList ordersList;
  const ProductReturnDetail(
      {super.key,
      required this.productID,
      required this.orderModel,
      required this.ordersList});

  @override
  State<ProductReturnDetail> createState() => _ProductReturnDetailState();
}

class _ProductReturnDetailState extends State<ProductReturnDetail> {
  int returnDuration = 0;
  getReturnPolicy() {
    FirebaseFirestore.instance
        .collection('Products')
        .doc(widget.productID)
        .snapshots()
        .listen((v) {
      if (v.exists) {
        setState(() {
          returnDuration = v['returnDuration'];
        });
      } else {
        FirebaseFirestore.instance
            .collection('Flash Sales Products')
            .doc(widget.productID)
            .snapshots()
            .listen((r) {
          setState(() {
            returnDuration = v['returnDuration'];
          });
        });
      }
    });
  }

  getExpiryForReturnPolicy(int returnPolicy) {
    // if (widget.orderModel.uid != null) {}
    DateTime fixedDate = DateTime.parse(
      widget.orderModel.uid,
    );
    var result = fixedDate.add(Duration(days: returnPolicy));
    // ignore: avoid_print
    print('Result is $result');
    // Get the current date
    DateTime currentDate = DateTime.now();

    // Check if the current date is greater than the new date
    bool dateExceeded = currentDate.isAfter(result);
    if (dateExceeded) {
      // ignore: avoid_print
      print('Date has been exceeded');
      // ignore: avoid_print
      print('Date bool is $dateExceeded');
    } else {
      // ignore: avoid_print
      print('Date has not been exceeded');
      // ignore: avoid_print
      print('Date bool is $dateExceeded');
    }
    return result;
  }

  getExpiry(int returnPolicy) {
    if (widget.orderModel.uid != null) {
      DateTime fixedDate = DateTime.parse(widget.orderModel.uid);
      var result = fixedDate.add(Duration(days: returnPolicy));
      // Parse the string into a DateTime object
      DateTime dateTime = DateTime.parse(result.toString());

      // Format the DateTime object to the desired format
      String formattedDate = DateFormat('MMMM d, y').format(dateTime);

      return formattedDate;
    } else {
      return '';
    }
  }

  getExpiryBool(int returnPolicy) {
    DateTime fixedDate = DateTime.parse(widget.orderModel.uid);
    var result = fixedDate.add(Duration(days: returnPolicy));
    // ignore: avoid_print
    print('Result is $result');
    // Get the current date
    DateTime currentDate = DateTime.now();

    // Check if the current date is greater than the new date
    bool dateExceeded = currentDate.isAfter(result);
    if (dateExceeded) {
      // ignore: avoid_print
      print('Date has been exceeded');
      // ignore: avoid_print
      print('Date bool is $dateExceeded');
      return true;
    } else {
      // ignore: avoid_print
      print('Date has not been exceeded');
      // ignore: avoid_print
      print('Date bool is $dateExceeded');
      return false;
    }
    //return result;
  }

  @override
  void initState() {
    getReturnPolicy();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          if (returnDuration == 0)
            const Text(
              'No return policy on this product',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w200),
            ).tr(),
          if (returnDuration != 0 &&
              widget.orderModel.uid != null &&
              getExpiryBool(returnDuration) == false)
            Container(
              decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: const BorderRadius.all(Radius.circular(12))),
              child: Padding(
                padding: const EdgeInsets.all(5.0),
                child: InkWell(
                  onTap: () {
                    Navigator.of(context)
                        .push(MaterialPageRoute(builder: (context) {
                      return ReturnProductWidget(
                        userID: widget.orderModel.userID,
                        ordersList: widget.ordersList,
                        orderID: widget.orderModel.orderID.toString(),
                        returnDuration: returnDuration,
                      );
                    }));
                  },
                  child: Text(
                    'Return policy expires on  ${getExpiry(returnDuration)}, Tap to request for a return',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 10, fontWeight: FontWeight.w200),
                  ).tr(),
                ),
              ),
            ),
          if (returnDuration != 0 &&
              widget.orderModel.uid != null &&
              getExpiryBool(returnDuration) == true)
            Container(
              decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: const BorderRadius.all(Radius.circular(12))),
              child: Padding(
                padding: const EdgeInsets.all(5.0),
                child: const Text(
                  'Return policy on this product has expired',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w200),
                ).tr(),
              ),
            ),
          if (returnDuration != 0 && widget.orderModel.uid == null)
            Container(
              decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: const BorderRadius.all(Radius.circular(12))),
              child: Padding(
                padding: const EdgeInsets.all(5.0),
                child: Text(
                  'Return policy of $returnDuration days',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style:
                      const TextStyle(fontSize: 10, fontWeight: FontWeight.w200),
                ).tr(),
              ),
            ),
        ],
      ),
    );
  }
}
