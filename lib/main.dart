// ignore_for_file: avoid_print, unused_import

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:gap/gap.dart';
import 'package:loader_overlay/loader_overlay.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'Model/user.dart';
import 'Providers/auth.dart';
import 'Theme/theme.dart';
import 'Theme/theme_data.dart';
import 'Widgets/custom_animation.dart';
import 'route_generator.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'firebase_options.dart';

int? initScreen;
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await setupFlutterNotifications();
  showFlutterNotification(message);
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  print('Handling a background message ${message.messageId}');
}

void requestFCMPermission() async {
  FirebaseMessaging messaging = FirebaseMessaging.instance;
  NotificationSettings settings = await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  print('FCM Permission status: ${settings.authorizationStatus}');
}

/// Create a [AndroidNotificationChannel] for heads up notifications
late AndroidNotificationChannel channel;

bool isFlutterLocalNotificationsInitialized = false;

Future<void> setupFlutterNotifications() async {
  if (isFlutterLocalNotificationsInitialized) {
    return;
  }
  channel = const AndroidNotificationChannel(
    'high_importance_channel', // id
    'High Importance Notifications', // title
    description:
        'This channel is used for important notifications.', // description
    importance: Importance.high,
  );

  flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  /// Create an Android Notification Channel.
  ///
  /// We use this channel in the `AndroidManifest.xml` file to override the
  /// default FCM channel to enable heads up notifications.
  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  /// Update the iOS foreground notification presentation options to allow
  /// heads up notifications.
  await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
    alert: true,
    badge: true,
    sound: true,
  );
  isFlutterLocalNotificationsInitialized = true;
}

// void _retrieveToken() async {
//   String? token = await FirebaseMessaging.instance.getToken();
//   print('FCM Token: $token');
// }

void showFlutterNotification(RemoteMessage message) {
  RemoteNotification? notification = message.notification;
  AndroidNotification? android = message.notification?.android;
  if (notification != null && android != null && !kIsWeb) {
    flutterLocalNotificationsPlugin.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          channel.id,
          channel.name,
          channelDescription: channel.description,
          icon: 'launch_background',
        ),
      ),
    );
  }
}

/// Initialize the [FlutterLocalNotificationsPlugin] package.
late FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  // WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.getInstance().then((prefs) {
    initScreen = prefs.getInt("initScreen");
    prefs.setInt("initScreen", 1);
  });
  // await dotenv.load(fileName: ".env");
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  requestFCMPermission();
  if (!kIsWeb) {
    await setupFlutterNotifications();
  }
  await EasyLocalization.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp])
      .then((value) {
    SharedPreferences.getInstance().then((prefs) {
      var lightModeOn = prefs.getBool('lightMode') ?? true;
      runApp(MultiProvider(
          providers: [
            StreamProvider<UserModel>.value(
              value: AuthService().user,
              initialData: UserModel(
                displayName: '',
                email: '',
                phonenumber: '',
                token: '',
                uid: '',
              ),
            ),
            ChangeNotifierProvider<ThemeNotifier>.value(
                value: ThemeNotifier(lightModeOn ? lightTheme : darkTheme)),
          ],
          child: EasyLocalization(
              supportedLocales: const [
                Locale('es', 'ES'),
                Locale('en', 'US'),
                Locale('pt', 'PT'),
                Locale('ar', 'AE')
              ],
              path:
                  'assets/languagesFile', // <-- change the path of the translation files
              fallbackLocale: const Locale('en', 'US'),
              child: const MyApp())));
    });
  });
}

void configLoading() {
  EasyLoading.instance
    ..displayDuration = const Duration(milliseconds: 2000)
    ..indicatorType = EasyLoadingIndicatorType.fadingCircle
    ..loadingStyle = EasyLoadingStyle.dark
    ..indicatorSize = 45.0
    ..radius = 10.0
    ..progressColor = Colors.yellow
    ..backgroundColor = Colors.green
    ..indicatorColor = Colors.yellow
    ..textColor = Colors.yellow
    ..maskColor = Colors.blue.withOpacity(0.5)
    ..userInteractions = true
    ..dismissOnTap = false
    ..customAnimation = CustomAnimation();
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    _retrieveToken();
    initialization();
  }

  void initialization() async {
    FlutterNativeSplash.remove();
  }

  void _retrieveToken() async {
    final FirebaseAuth auth = FirebaseAuth.instance;
    User? user = auth.currentUser;

    if (user != null) {
      String? token = await FirebaseMessaging.instance.getToken();
      FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .update({'tokenID': token});
      print("My tokenID is $token");
    }
  }

  static FirebaseAnalytics analytics = FirebaseAnalytics.instance;
  static FirebaseAnalyticsObserver observer =
      FirebaseAnalyticsObserver(analytics: analytics);
  @override
  Widget build(
    BuildContext context,
  ) {
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    return GlobalLoaderOverlay(
      overlayWidgetBuilder: (_) {
        //ignored progress for the moment
        return const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              Gap(10),
              Text('Please check internet connection...')
            ],
          ),
        );
      },
      child: MaterialApp(
          navigatorObservers: <NavigatorObserver>[observer],
          localizationsDelegates: context.localizationDelegates,
          supportedLocales: context.supportedLocales,
          locale: context.locale,
          onGenerateRoute: RouteGenerator.generateRoute,
          initialRoute: initScreen == 0 || initScreen == null
              ? '/onboarding'
              : '/wrapper',
          debugShowCheckedModeBanner: false,
          theme: themeNotifier.getTheme(),
          builder: EasyLoading.init()),
    );
  }
}
