class PickupModel {
  final String address;

  final String? timeCreated;
  final String title;
  final num lat;
  final num long;
  final String uid;

  PickupModel({
    required this.lat,
    required this.long,
    required this.address,
    required this.uid,
    required this.title,
    this.timeCreated,
  });

  PickupModel.fromMap(data, this.uid)
      : address = data['address'],
        lat = data['lat'],
        long = data['long'],
        title = data['title'],
        timeCreated = data['timeCreated'];

  Map<String, dynamic> toMap() {
    return {'address': address, 'title': title, 'timeCreated': timeCreated};
  }
}
