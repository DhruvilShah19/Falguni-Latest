import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shimmer/shimmer.dart';
import '../Model/pickup_model.dart';

class PickupAddressesPage extends StatefulWidget {
  const PickupAddressesPage({super.key});

  @override
  State<PickupAddressesPage> createState() => _PickupAddressesPageState();
}

class _PickupAddressesPageState extends State<PickupAddressesPage> {
  DocumentReference? userDetails;
  String id = '';
  String addressID = '';

  Future<List<PickupModel>> getDeliveryAddresses() {
    return FirebaseFirestore.instance.collection('Pickup Addresses').get().then(
        (event) => event.docs
            .map((e) => PickupModel.fromMap(e.data(), e.id))
            .toList());
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          centerTitle: true,
          iconTheme: Theme.of(context).iconTheme,
          titleTextStyle: TextStyle(color: Theme.of(context).indicatorColor),
          backgroundColor: Theme.of(context).colorScheme.surface,
          elevation: 0,
          title: const Text(
            'Pickup Addresses',
          ).tr()),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const Text(
                    'Tap to select pickup address',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Colors.grey),
                  ).tr(),
                ],
              ),
            ),
            FutureBuilder<List<PickupModel>>(
                future: getDeliveryAddresses(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return snapshot.data?.isEmpty ?? true
                        ? Center(
                            child: Image.asset(
                              'assets/image/rider update.png',
                              height: MediaQuery.of(context).size.height / 2,
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            itemCount: snapshot.data?.length,
                            itemBuilder: (context, index) {
                              PickupModel addressModel = snapshot.data![index];
                              return Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: SizedBox(
                                    height: 75,
                                    width: double.infinity,
                                    child: Card(
                                      elevation: 0,
                                      child: ListTile(
                                        onTap: () {
                                          Navigator.pop(
                                              context, addressModel.address);
                                        },
                                        title: Text(
                                          addressModel.address,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        subtitle: Text(addressModel.title),
                                      ),
                                    )),
                              );
                            });
                  } else {
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 16.0),
                      child: Shimmer.fromColors(
                        baseColor: Colors.grey[300]!,
                        highlightColor: Colors.grey[100]!,
                        enabled: true,
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemBuilder: (_, __) => SizedBox(
                              height: 100,
                              width: double.infinity,
                              child: Card(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20.0),
                                ),
                              )),
                          itemCount: 10,
                        ),
                      ),
                    );
                  }
                }),
          ],
        ),
      ),
    );
  }
}
