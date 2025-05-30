// ignore_for_file: unused_field, non_constant_identifier_names, duplicate_ignore, avoid_print

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:pinelabs_edge_flutter/api/payment.dart';
import 'package:pinelabs_edge_flutter/checkout/utils.dart';
import 'package:pinelabs_edge_flutter/config/upi_handlers.config.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'constants.dart';
import 'form_builder.dart';

class Edge extends StatefulWidget {
  final String PPC_AMOUNT;
  final bool PPC_PROD;
  final String PPC_UNIQUEMERCHANTTXNID;
  final String PPC_MERCHANTID;
  final String PPC_MERCHANT_SECRET;
  final String PPC_MERCHANTACCESSCODE;
  final String PPC_PAYMODEONLANDINGPAGE;
  final String PPC_CUSTOMERMOBILE;
  final String PPC_CUSTOMEREMAIL;
  final String PPC_CUSTOMERADDRESS;
  final String PPC_CUSTOMERPINCODE;
  final String PPC_CUSTOMER_ID;
  final String PPC_PRODUCT_CODE;
  final Function callback;

  const Edge(
      {Key? key,
      required this.PPC_PROD,
      required this.callback,
      required this.PPC_UNIQUEMERCHANTTXNID,
      required this.PPC_MERCHANTID,
      required this.PPC_MERCHANT_SECRET,
      required this.PPC_MERCHANTACCESSCODE,
      required this.PPC_PAYMODEONLANDINGPAGE,
      required this.PPC_AMOUNT,
      required this.PPC_CUSTOMERMOBILE,
      required this.PPC_CUSTOMEREMAIL,
      this.PPC_CUSTOMERADDRESS = "",
      this.PPC_CUSTOMERPINCODE = "",
      this.PPC_CUSTOMER_ID = "",
      this.PPC_PRODUCT_CODE = ""})
      : super(key: key);

  @override
  _EdgeState createState() => _EdgeState();
}

class _EdgeState extends State<Edge> {
  late final WebViewController _controller;
  bool loading = false;
  final _isConnected = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onNavigationRequest: (NavigationRequest request) async {
          if (request.url.startsWith('https://uat.pinepg.in/mobileapp/')) {
            if (kDebugMode) {
              print('Blocking navigation to ${request.url}');
            }
            return NavigationDecision.prevent;
          }

          bool isUPIHandler = true;
          for (var element in protocol_to_ignore) {
            if (request.url.startsWith(element)) {
              isUPIHandler = false;
            }
          }

          if (isUPIHandler) {
            final Uri url = Uri.parse(request.url);
            await launchUrl(url);
            return NavigationDecision.prevent;
          }

          if (kDebugMode) {
            print('Allowing navigation to ${request.url}');
          }
          return NavigationDecision.navigate;
        },
        onPageStarted: (String url) {
          if (kDebugMode) {
            print('Page started loading: $url');
          }
        },
        onPageFinished: (String url) {
          if (kDebugMode) {
            print('Page finished loading: $url');
          }
          if (url == getCallbackUrl()) {
            if (kDebugMode) {
              print('Callback triggered');
            }
            _handleResponsePage();
          }
        },
      ))
      ..loadHtmlString(_createRedirectPage());
  }

  @override
  Widget build(BuildContext context) {
    return loading
        ? const Center(child: CircularProgressIndicator())
        : SizedBox(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height,
            child: WebViewWidget(controller: _controller),
          );
  }

  String getServiceUrl() {
    return widget.PPC_PROD
        ? Constants().PROD_REDIRECT_URI
        : Constants().UAT_REDIRECT_URI;
  }

  String getCallbackUrl() {
    return widget.PPC_PROD
        ? Constants().PROD_PPC_MERCHANT_RETURN_URL_VALUE
        : Constants().UAT_PPC_MERCHANT_RETURN_URL_VALUE;
  }

  _handleResponsePage() async {
    setState(() {
      loading = true;
    });
    var api = Payment();
    var info = await api.inqiery(
        widget.PPC_MERCHANTID,
        widget.PPC_MERCHANT_SECRET,
        widget.PPC_MERCHANTACCESSCODE,
        widget.PPC_UNIQUEMERCHANTTXNID,
        widget.PPC_PROD);

    if (info[Constants().PCC_TXN_RESPONSE_CODE] == "1") {
      widget.callback(true, info);
    } else {
      widget.callback(false, info);
    }

    setState(() {
      loading = false;
    });
  }

  _createRedirectPage() {
    Map<String, String> formFields = {};

    formFields[Constants().PPC_UNIQUEMERCHANTTXNID] =
        widget.PPC_UNIQUEMERCHANTTXNID;
    formFields[Constants().PPC_MERCHANTACCESSCODE] =
        widget.PPC_MERCHANTACCESSCODE;
    formFields[Constants().PPC_PAYMODEONLANDINGPAGE] =
        widget.PPC_PAYMODEONLANDINGPAGE;
    formFields[Constants().PPC_MERCHANTID] = widget.PPC_MERCHANTID;
    formFields[Constants().PPC_CUSTOMERMOBILE] = widget.PPC_CUSTOMERMOBILE;
    formFields[Constants().PPC_AMOUNT] = widget.PPC_AMOUNT;
    formFields[Constants().PPC_CUSTOMEREMAIL] = widget.PPC_CUSTOMEREMAIL;

    if (widget.PPC_CUSTOMERADDRESS.isNotEmpty) {
      formFields[Constants().PPC_CUSTOMER_ADDRESS] = widget.PPC_CUSTOMERADDRESS;
    }
    if (widget.PPC_CUSTOMERPINCODE.isNotEmpty) {
      formFields[Constants().PPC_CUSTOMER_PINCODE] = widget.PPC_CUSTOMERPINCODE;
    }
    if (widget.PPC_CUSTOMER_ID.isNotEmpty) {
      formFields[Constants().PPC_CUSTOMER_ID] = widget.PPC_CUSTOMER_ID;
    }

    formFields[Constants().PPC_PRODUCT_CODE] = widget.PPC_PRODUCT_CODE;
    formFields[Constants().PPC_NAVIGATIONMODE] =
        Constants().PPC_NAVIGATIONMODE_VALUE;
    formFields[Constants().PPC_LPC_SEQ] = Constants().PPC_LPC_SEQ_VALUE;
    formFields[Constants().PPC_TRANSACTIONTYPE] =
        Constants().PPC_TRANSACTIONTYPE_VALUE;
    formFields[Constants().PPC_DIA_SECRET] =
        Utils.dieHash(widget.PPC_MERCHANT_SECRET, formFields);
    formFields[Constants().PPC_REQUEST_AGENT_APP] =
        Constants().PPC_REQUEST_AGENT_APP_VALUE;
    formFields[Constants().PPC_MERCHANTRETURNURL] = getCallbackUrl();
    formFields[Constants().PPC_DIA_SECRET_TYPE] =
        Constants().PPC_DIA_SECRET_TYPE_VALUE;

    return FormBuilder().gern(getServiceUrl(), formFields);
  }
}
