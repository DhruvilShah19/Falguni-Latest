// ignore_for_file: non_constant_identifier_names

class Constants {
  // Internet Url
  String INTERNET_LOOKUP_URL = "https://pinepg.in/"; // required
  // PRODUCTION URLS
  String PROD_REDIRECT_URI = "https://pinepg.in/PinePGRedirect"; // required
  String PROD_PPC_MERCHANT_RETURN_URL_VALUE =
      "https://pinepg.in/mobileapp/index"; // required
  String PROD_INQUIRY_API_URI = "https://pinepg.in/api/PG/V2"; // required
  // UAT URLS
  String UAT_REDIRECT_URI =
      "https://uat.pinepg.in/PinePGRedirect/index"; // required
  String UAT_PPC_MERCHANT_RETURN_URL_VALUE =
      "https://uat.pinepg.in/mobileapp/index";
  String UAT_INQUIRY_API_URI = "https://uat.pinepg.in/api/PG/V2"; // required

  String PPC_DIA_SECRET_TYPE = "ppc_DIA_SECRET_TYPE"; // required

  String PPC_LPC_SEQ = "ppc_LPC_SEQ"; // no info

  String PPC_DIA_SECRET = "ppc_DIA_SECRET"; // required
  String PPC_MERCHANTACCESSCODE = "ppc_MerchantAccessCode"; // required
  String PPC_UNIQUEMERCHANTTXNID = "ppc_UniqueMerchantTxnID"; // required

  String PPC_CUSTOMER_PINCODE = "ppc_CustomerAddressPIN";
  String PPC_CUSTOMER_ID = "ppc_CustomerId";
  String PPC_CUSTOMERMOBILE = "ppc_CustomerMobile";
  String PPC_CUSTOMEREMAIL = "ppc_CustomerEmail";
  String PPC_CUSTOMER_ADDRESS = "ppc_CustomerAddress1";

  String PPC_REQUEST_AGENT_APP = "ppc_request_agent_app";

  String PPC_PRODUCT_CODE = "ppc_Product_Code"; // required only for emi

  String PPC_PAYMODEONLANDINGPAGE = "ppc_PayModeOnLandingPage"; // required
  String PPC_NAVIGATIONMODE = "ppc_NavigationMode"; // required (default: 2)
  String PPC_MERCHANTID = "ppc_MerchantID"; // required
  String PPC_MERCHANTRETURNURL = "ppc_MerchantReturnURL"; // required
  String PPC_AMOUNT = "ppc_Amount"; // required : min 2
  String PPC_TRANSACTIONTYPE = "ppc_TransactionType"; // required : always 1
  // value
  String PPC_DIA_SECRET_TYPE_VALUE = "SHA256";
  String PPC_NAVIGATIONMODE_VALUE = "2"; // 2 for redirect 7 for seemless
  String PPC_LPC_SEQ_VALUE = "1"; // 1 for first landing page
  String PPC_TRANSACTIONTYPE_VALUE = "1"; // 1 for payment
  String PPC_REQUEST_AGENT_APP_VALUE = "1";

  // Errors
  String INTERNET_ERROR = "Internet not Connected, please try again.";
  // reponse options
  String PCC_PINE_PG_TXN_STATUS = "ppc_PinePGTxnStatus";
  String PCC_TXN_RESPONSE_CODE = "ppc_TxnResponseCode";
  // payment Api
  String PCC_TXN_TYPE = "ppc_TransactionType";
  String PCC_TXN_TYPE_VALUE = "3";
}
