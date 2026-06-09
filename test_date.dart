// ignore_for_file: avoid_print

import 'package:intl/intl.dart';

void main() {
  String timeVal = '2026-02-21T12:30:35+05:30';
  try {
    DateTime parsed = DateTime.parse(timeVal);
    print('Parsed: $parsed');
    String formatted = DateFormat('dd MMM yyyy, hh:mm a').format(parsed);
    print('Formatted: $formatted');
  } catch (e) {
    print('Error: $e');
  }
}
