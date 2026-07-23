import Flutter
import UIKit
import GoogleMaps
@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Dedicated iOS-only key, restricted to bundle ID com.falgunigruhudhyog
    // and Maps SDK for iOS only. Do not reuse this value elsewhere.
    GMSServices.provideAPIKey("AIzaSyC1UHZOflimliPEHP7KhkN-NB7gaShSE8M")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
