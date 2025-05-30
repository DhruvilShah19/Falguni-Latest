// ignore_for_file: use_build_context_synchronously

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:falguni_app/Model/order_model.dart';
import 'package:falguni_app/Model/return_request_model.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:gap/gap.dart';
import 'package:loader_overlay/loader_overlay.dart';
import 'package:uuid/uuid.dart';

class ReturnProductWidget extends StatefulWidget {
  final String userID;
  final String orderID;
  final OrdersList ordersList;
  final int returnDuration;

  const ReturnProductWidget({
    super.key,
    required this.userID,
    required this.orderID,
    required this.ordersList,
    required this.returnDuration,
  });

  @override
  State<ReturnProductWidget> createState() => _ReturnProductWidgetState();
}

class _ReturnProductWidgetState extends State<ReturnProductWidget> {
  bool isExist = false;
  bool showPassword = true;
  String email = '';
  bool returned = false;
  String uid = '';

  getReturnedProds() {
    context.loaderOverlay.show();
    FirebaseFirestore.instance
        .collection('Returned Products')
        .where('orderID', isEqualTo: widget.orderID)
        .where('userID', isEqualTo: widget.userID)
        .where('selectedProduct', isEqualTo: widget.ordersList.selected)
        .where('productName', isEqualTo: widget.ordersList.productName)
        .snapshots()
        .listen((event) {
      context.loaderOverlay.hide();
      if (event.docs.isEmpty) {
        setState(() {
          isExist = false;
        });
      } else {
        setState(() {
          isExist = true;
        });
        for (var element in event.docs) {
          setState(() {
            returned = element['returned'];
          });
        }
      }
    });
  }

  postRequest(ReturnRequestModel requestModel) {
    context.loaderOverlay.show();
    FirebaseFirestore.instance
        .collection('Returned Products')
        .add(requestModel.toMap())
        .then((value) {
      context.loaderOverlay.hide();
    });
  }

  @override
  void initState() {
    var id = const Uuid();
    uid = id.v1();
    getReturnedProds();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reaseon For Returning'),
      ),
      body: Form(
        child: Column(
          mainAxisAlignment: MediaQuery.of(context).size.width >= 1100
              ? MainAxisAlignment.start
              : MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            MediaQuery.of(context).size.width >= 1100
                ? const Gap(20)
                : const Gap(0),
            if (MediaQuery.of(context).size.width >= 1100)
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.arrow_back)),
              ),
            MediaQuery.of(context).size.width >= 1100
                ? const Gap(50)
                : const Gap(20),
            const Gap(10),
            Align(
              alignment: MediaQuery.of(context).size.width >= 1100
                  ? Alignment.center
                  : Alignment.center,
              child: Padding(
                padding: EdgeInsets.only(
                    left: MediaQuery.of(context).size.width >= 1100 ? 0 : 0),
                child: Text(
                  'Return Product',
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize:
                          MediaQuery.of(context).size.width >= 1100 ? 20 : 20),
                ).tr(),
              ),
            ),
            Padding(
              padding: MediaQuery.of(context).size.width >= 1100
                  ? const EdgeInsets.all(0)
                  : const EdgeInsets.all(8),
              child: Center(
                child: const Text(
                  'Provide reason for refund.',
                  textAlign: TextAlign.center,
                ).tr(),
              ),
            ),
            const Gap(20),
            SizedBox(
              width: MediaQuery.of(context).size.width >= 1100
                  ? MediaQuery.of(context).size.width / 2
                  : MediaQuery.of(context).size.width / 1.2,
              child: TextField(
                readOnly: isExist == true ? true : false,
                maxLines: 5,
                onChanged: (v) {
                  setState(() {
                    email = v;
                  });
                },
                decoration: InputDecoration(
                  filled: true,
                  border: InputBorder.none,
                  fillColor: const Color.fromARGB(255, 236, 234, 234),
                  hintText: 'Reason for refund'.tr(),
                  //border: OutlineInputBorder()
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Gap(10),
            SizedBox(
              width: MediaQuery.of(context).size.width >= 1100
                  ? MediaQuery.of(context).size.width / 2
                  : MediaQuery.of(context).size.width / 1.2,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                    shape: const BeveledRectangleBorder(),
                    textStyle: const TextStyle(color: Colors.white)),
                // color: Theme.of(context).colorScheme.secondary,
                onPressed: isExist == true && returned == true
                    ? null
                    : isExist == true && returned == false
                        ? null
                        : () {
                            if (email.isNotEmpty) {
                              postRequest(ReturnRequestModel(
                                  uid: uid,
                                  returnDuration: widget.returnDuration,
                                  productName: widget.ordersList.productName,
                                  selected: widget.ordersList.selected,
                                  quantity: widget.ordersList.quantity,
                                  image: widget.ordersList.image,
                                  selectedPrice:
                                      widget.ordersList.selectedPrice,
                                  orderID: widget.orderID,
                                  userID: widget.userID,
                                  reason: email,
                                  returned: returned));
                            } else {
                              Fluttertoast.showToast(
                                  msg: "Field can't be empty",
                                  toastLength: Toast.LENGTH_LONG,
                                  gravity: ToastGravity.CENTER,
                                  timeInSecForIosWeb: 1,
                                  fontSize: 16.0);
                            }
                          },
                child: Text(
                  isExist == true && returned == true
                      ? "PRODUCT HAS BEEN RETURNED".tr()
                      : isExist == true && returned == false
                          ? 'REQUEST IS UNDER REVIEW'.tr()
                          : 'SEND REQUEST'.tr(),
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ).tr(),
              ),
            )
          ],
        ),
      ),
    );
  }
}
