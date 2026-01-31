// import 'package:flutter/material.dart';
// import 'package:fluttertoast/fluttertoast.dart';
// import '../services/cart_cleanup_service.dart';

// class AdminCleanupPage extends StatefulWidget {
//   const AdminCleanupPage({Key? key}) : super(key: key);

//   @override
//   State<AdminCleanupPage> createState() => _AdminCleanupPageState();
// }

// class _AdminCleanupPageState extends State<AdminCleanupPage> {
//   bool isLoading = false;
//   String result = '';

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('🔧 Admin Cleanup'),
//         backgroundColor: Colors.red.shade700,
//       ),
//       body: SingleChildScrollView(
//         child: Padding(
//           padding: const EdgeInsets.all(16.0),
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               const Text(
//                 '⚠️ CLEANUP TOOLS',
//                 style: TextStyle(
//                   fontSize: 20,
//                   fontWeight: FontWeight.bold,
//                   color: Colors.red,
//                 ),
//               ),
//               const SizedBox(height: 20),
//               const Text(
//                 'This page removes wrong prices from Firebase that were stored by the buggy code.',
//                 style: TextStyle(fontSize: 14),
//               ),
//               const SizedBox(height: 20),
//               ElevatedButton.icon(
//                 icon: const Icon(Icons.delete_sweep),
//                 label: const Text('Remove ALL Wrong Prices'),
//                 onPressed: isLoading ? null : _removeAllWrongPrices,
//                 style: ElevatedButton.styleFrom(
//                   backgroundColor: Colors.red.shade600,
//                   padding: const EdgeInsets.symmetric(vertical: 16),
//                   minimumSize: const Size(double.infinity, 50),
//                 ),
//               ),
//               const SizedBox(height: 12),
//               ElevatedButton.icon(
//                 icon: const Icon(Icons.person_remove),
//                 label: const Text('Remove MY Wrong Prices Only'),
//                 onPressed: isLoading ? null : _removeCurrentUserWrongPrices,
//                 style: ElevatedButton.styleFrom(
//                   backgroundColor: Colors.orange.shade600,
//                   padding: const EdgeInsets.symmetric(vertical: 16),
//                   minimumSize: const Size(double.infinity, 50),
//                 ),
//               ),
//               const SizedBox(height: 30),
//               if (isLoading)
//                 const Center(
//                   child: Column(
//                     children: [
//                       CircularProgressIndicator(),
//                       SizedBox(height: 16),
//                       Text('Processing... Please wait'),
//                     ],
//                   ),
//                 ),
//               if (result.isNotEmpty)
//                 Container(
//                   padding: const EdgeInsets.all(12),
//                   decoration: BoxDecoration(
//                     color: result.contains('success')
//                         ? Colors.green.shade50
//                         : Colors.red.shade50,
//                     border: Border.all(
//                       color: result.contains('success')
//                           ? Colors.green
//                           : Colors.red,
//                     ),
//                     borderRadius: BorderRadius.circular(8),
//                   ),
//                   child: Column(
//                     crossAxisAlignment: CrossAxisAlignment.start,
//                     children: [
//                       Text(
//                         result.contains('success') ? '✅ SUCCESS' : '❌ ERROR',
//                         style: TextStyle(
//                           fontSize: 16,
//                           fontWeight: FontWeight.bold,
//                           color: result.contains('success')
//                               ? Colors.green.shade700
//                               : Colors.red.shade700,
//                         ),
//                       ),
//                       const SizedBox(height: 8),
//                       Text(result),
//                     ],
//                   ),
//                 ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   Future<void> _removeAllWrongPrices() async {
//     setState(() => isLoading = true);

//     try {
//       final response = await CartCleanupService.removeAllWrongPrices();

//       setState(() {
//         result = '''
// Removed Prices: ${response['deletedCount']}
// Errors: ${response['errorCount']}

// ${response['message']}

// ✅ All wrong prices have been removed from Firebase!
// ''';
//       });

//       Fluttertoast.showToast(
//         msg: response['message'] ?? 'Cleanup complete!',
//         backgroundColor: Colors.green,
//       );
//     } catch (e) {
//       setState(() {
//         result = '❌ Error: $e';
//       });
//       Fluttertoast.showToast(
//         msg: 'Error: $e',
//         backgroundColor: Colors.red,
//       );
//     } finally {
//       setState(() => isLoading = false);
//     }
//   }

//   Future<void> _removeCurrentUserWrongPrices() async {
//     setState(() => isLoading = true);

//     try {
//       final response = await CartCleanupService.removeCurrentUserWrongPrices();

//       setState(() {
//         result = '''
// Removed Prices: ${response['deletedCount']}
// Errors: ${response['errorCount']}

// ${response['message']}

// ✅ Your cart has been cleaned!
// ''';
//       });

//       Fluttertoast.showToast(
//         msg: response['message'] ?? 'Cleanup complete!',
//         backgroundColor: Colors.green,
//       );
//     } catch (e) {
//       setState(() {
//         result = '❌ Error: $e';
//       });
//       Fluttertoast.showToast(
//         msg: 'Error: $e',
//         backgroundColor: Colors.red,
//       );
//     } finally {
//       setState(() => isLoading = false);
//     }
//   }
// }
