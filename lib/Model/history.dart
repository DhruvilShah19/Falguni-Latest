// class HistoryModel {
//   final String message;
//   final String amount;
//   final String paymentSystem;
//   final String? uid;
//   final String timeCreated;

//   HistoryModel({
//     required this.message,
//     required this.amount,
//     required this.paymentSystem,
//     required this.timeCreated,
//     this.uid,
//   });

//   HistoryModel.fromMap(Map<String, dynamic> data, this.uid)
//       : message = data['message'],
//         amount = data['amount'],
//         paymentSystem = data['paymentSystem'],
//         timeCreated = data['timeCreated'];

//   Map<String, dynamic> toMap() {
//     return {
//       'message': message,
//       'amount': amount,
//       'paymentSystem': paymentSystem,
//       'timeCreated': timeCreated
//     };
//   }
// }
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

class HistoryModel {
  final String message;
  final String amount;
  final String paymentSystem;
  final String? uid;
  final DateTime timeCreated;

  HistoryModel({
    required this.message,
    required this.amount,
    required this.paymentSystem,
    required this.timeCreated,
    this.uid,
  });

  factory HistoryModel.fromMap(Map<String, dynamic> data, String id) {
    return HistoryModel(
      uid: id,
      message: data['message'] ?? '',
      amount: data['amount'] ?? '0',
      paymentSystem: data['paymentSystem'] ?? '',
      timeCreated: _parseDate(data['timeCreated']),
    );
  }

  static DateTime _parseDate(dynamic value) {
    if (value is Timestamp) {
      return value.toDate();
    } else if (value is String) {
      // Remove any extra whitespace
      String raw = value.trim();

      try {
        // 1. Try: "Thursday, 10 April, 2025" (Your missing record format)
        // Note: 'EEEE' is day of week, 'd' is day, 'MMMM' is month
        return DateFormat("EEEE, d MMMM, yyyy").parse(raw);
      } catch (_) {
        try {
          // 2. Try your OTHER old format: "Tuesday, February 6, 2024"
          return DateFormat.yMMMMEEEEd().parse(raw);
        } catch (_) {
          try {
            // 3. Try simple "d MMMM, yyyy" just in case
            return DateFormat("d MMMM, yyyy").parse(raw);
          } catch (_) {
            // 4. Fallback for ISO format or manual cleanup
            return DateTime.tryParse(raw) ?? DateTime(2024, 1, 1);
          }
        }
      }
    }
    return DateTime.now();
  }

  Map<String, dynamic> toMap() {
    return {
      'message': message,
      'amount': amount,
      'paymentSystem': paymentSystem,
      // Saves as a blue 'Timestamp' link in Firebase Console
      'timeCreated': Timestamp.fromDate(timeCreated),
    };
  }
}
