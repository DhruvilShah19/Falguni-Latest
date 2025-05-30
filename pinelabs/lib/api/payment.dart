// ignore_for_file: unused_field, non_constant_identifier_names

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:pinelabs_edge_flutter/checkout/constants.dart';
import 'package:pinelabs_edge_flutter/checkout/utils.dart';

class Payment {
  late String __merchantID = "106598";
  late String __merchantAccessCode = "4a39a6d4-46b7-474d-929d-21bf0e9ed607";
  late String __transectionId;
  late String __transectionType;
  late String __pineTxnId;
  late String __merchantSecret;
  late String REDIRECT_URI;

  final String method = 'POST';

  final Map<String, String> headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  makeBody() {
    Map<String, String> hashMap = {};
    hashMap[Constants().PPC_MERCHANTID] = __merchantID;
    hashMap[Constants().PPC_MERCHANTACCESSCODE] = __merchantAccessCode;
    hashMap[Constants().PPC_UNIQUEMERCHANTTXNID] = __pineTxnId;
    hashMap[Constants().PCC_TXN_TYPE] = Constants().PCC_TXN_TYPE_VALUE;

    return {
      Constants().PPC_DIA_SECRET: Utils.dieHash(__merchantSecret, hashMap),
      Constants().PPC_DIA_SECRET_TYPE: Constants().PPC_DIA_SECRET_TYPE_VALUE,
      Constants().PPC_MERCHANTACCESSCODE: __merchantAccessCode,
      Constants().PPC_MERCHANTID: __merchantID,
      Constants().PPC_UNIQUEMERCHANTTXNID: __pineTxnId,
      Constants().PCC_TXN_TYPE: Constants().PCC_TXN_TYPE_VALUE
    };
  }

  inqiery(_merchantId, _merchantsecret, _merchantAccessCode, _pineTxnId,
      _mode) async {
    __merchantID = _merchantId;
    __merchantAccessCode = _merchantAccessCode;
    __merchantSecret = _merchantsecret;
    __pineTxnId = _pineTxnId;

    var request = http.Request(
      method,
      getServiceUrl(_mode),
    );
    request.bodyFields = makeBody();
    request.headers.addAll(headers);

    http.StreamedResponse response = await request.send();

    var respInfo = await response.stream.bytesToString();

    return jsonDecode(respInfo);
  }

  getServiceUrl(mode) {
    var uri = "";

    if (mode) {
      uri = Constants().PROD_INQUIRY_API_URI;
    } else {
      uri = Constants().UAT_INQUIRY_API_URI;
    }

    return Uri.parse(uri);
  }
}
