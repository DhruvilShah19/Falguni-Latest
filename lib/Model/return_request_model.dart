class ReturnRequestModel {
  final String uid;
  final String orderID;
  final String reason;
  final bool returned;
  final String userID;
  final int returnDuration;
  final String productName;
  final String selected;
  final num quantity;
  final String image;

  final num selectedPrice;

  ReturnRequestModel(
      {required this.uid,
      required this.returnDuration,
      required this.productName,
      required this.selected,
      required this.quantity,
      required this.image,
      required this.selectedPrice,
      required this.orderID,
      required this.userID,
      required this.reason,
      required this.returned});

  ReturnRequestModel.fromMap(Map<String, dynamic> data, this.uid)
      : orderID = data['orderID'],
        productName = data['productName'],
        selected = data['selectedProduct'],
        quantity = data['quantity'],
        image = data['image'],
        selectedPrice = data['selectedPrice'],
        returnDuration = data['returnDuration'],
        userID = data['userID'],
        returned = data['returned'],
        reason = data['reason'];
  Map<String, dynamic> toMap() {
    return {
      'orderID': orderID,
      'userID': userID,
      'returned': returned,
      'reason': reason,
      'productName': productName,
      'selectedProduct': selected,
      'quantity': quantity,
      'image': image,
      'selectedPrice': selectedPrice,
      'returnDuration': returnDuration,
      'uid': uid
    };
  }
}
