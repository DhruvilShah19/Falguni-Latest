import 'dart:io';
import 'package:flutter/foundation.dart';
import 'dart:core';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:pinelabs_edge_flutter/services/hex.dart';

class Utils {
  static isInternetConnected() async {
    try {
      final result = await InternetAddress.lookup('example.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        if (kDebugMode) {
          print('internet connected');
        }
        return true;
      }
      return false;
    } on SocketException catch (_) {
      if (kDebugMode) {
        print('internet not connected');
      }
      return false;
    }
  }

  static String dieHash(String secretKey, Map<String, String> inputs) {
    final sortedInputs = inputs.keys.toList()..sort();

    final String data =
        sortedInputs.map((key) => '$key=${inputs[key]}').join('&');

    var bytesOfInputs = utf8.encode(data);
    var bytesOfSecret = HEX.decode(secretKey);

    var hmacSha256 = Hmac(sha256, bytesOfSecret);
    var digest = hmacSha256.convert(bytesOfInputs);
    final String hash = digest.toString().toUpperCase();

    return hash;
  }
}
