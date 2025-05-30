# Pinelabs Edge Flutter

    This plugin only supports ios and android 

## Import
```dart
import 'package:pinelabs_edge_flutter/checkout/edge.dart';
```

## Usage
```dart 

Edge(
          callback: (bool status,Map response) => {
            print(response),
            print(status),
          },
          //
          PPC_PROD: true or false // true for production false for test
          
          PPC_AMOUNT: amount,
          //
          PPC_UNIQUEMERCHANTTXNID: _txn_id,
          //
          PPC_MERCHANTID: _merchant_id,
          PPC_MERCHANT_SECRET: _merchant_secret,
          PPC_MERCHANTACCESSCODE: _merchant_access_code,
          //
          PPC_PAYMODEONLANDINGPAGE: _pay_modes,
          //
          PPC_CUSTOMERMOBILE: _customer_mobile,
          PPC_CUSTOMEREMAIL: _customer_email,
          PPC_CUSTOMERADDRESS: _customer_address, // optional
          PPC_CUSTOMERPINCODE: _custom_pincode, // optional
          PPC_CUSTOMER_ID: "786", // optional
          //
          PPC_PRODUCT_CODE: _product_code, // optional
        )

```

## Infomation

# Widget Name : `Edge`

# Parameters 

- PPC_PROD: `Type:bool` :: `[REQUIRED]` // true for production false for test

- callback: Response (bool status,Map response) `[ REQUIRED ]`
          
- PPC_AMOUNT:  `Type:String` :: `[REQUIRED]`

- PPC_UNIQUEMERCHANTTXNID:  `Type:String` :: `[REQUIRED]`

- PPC_MERCHANTID:  `Type:String` :: `[REQUIRED]`
- PPC_MERCHANT_SECRET:  `Type:String` :: `[REQUIRED]`
- PPC_MERCHANTACCESSCODE:  `Type:String` :: `[REQUIRED]`

- PPC_PAYMODEONLANDINGPAGE:  `Type:String` :: `[REQUIRED]`,

- PPC_CUSTOMERMOBILE:  `Type:String` :: `[REQUIRED]`
- PPC_CUSTOMEREMAIL:  `Type:String` :: `[REQUIRED]`
- PPC_CUSTOMERADDRESS:  `Type:String` :: `[OPTIONAL]`
- PPC_CUSTOMERPINCODE: `Type:String` :: `[OPTIONAL]`
- PPC_CUSTOMER_ID: `Type:String` :: `[OPTIONAL]`

- PPC_PRODUCT_CODE: `Type:String` :: `[OPTIONAL]`
