import 'package:firebase_analytics/firebase_analytics.dart';

class Analytics {
  FirebaseAnalytics analytics = FirebaseAnalytics.instance;
  setUserID(String userID) {
    analytics.setUserId(id: userID);
  }

  getLoginAnalytics() {
    analytics.logEvent(name: 'login');
  }

  getLoginMethod() {
    analytics.logLogin(loginMethod: 'email');
  }

  getSignupAnatytics() {
    analytics.logSignUp(signUpMethod: 'email');
  }

  void trackProductView(String productId, String productName) {
    analytics.logEvent(
      name: 'product_view',
      parameters: {
        'product_id': productId,
        'product_name': productName,
      },
    );
  }

  void trackProductWishlist(String productId, String productName) {
    analytics.logEvent(
      name: 'product_wishlist',
      parameters: {
        'product_id': productId,
        'product_name': productName,
      },
    );
  }

  void trackProductPurchase(
      String productId, String productName, double price) {
    analytics.logEvent(
      name: 'product_purchase',
      parameters: {
        'product_id': productId,
        'product_name': productName,
        'price': price.toString(),
      },
    );
  }
}
