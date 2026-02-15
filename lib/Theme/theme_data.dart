// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

final darkTheme = ThemeData(
        useMaterial3: false,
        // fontFamily: 'Robot',
        iconTheme: const IconThemeData(
          color: Colors.white,
        ),
        indicatorColor: Colors.white,
        primaryColor: const Color(0xFF362F2F),
        brightness: Brightness.dark,
        cardColor: Colors.black12,
        dividerColor: Colors.black12,
        textTheme: GoogleFonts.chivoTextTheme(
            const TextTheme(titleLarge: TextStyle(fontSize: 14))),
        colorScheme: ColorScheme.fromSwatch(
                primarySwatch: Colors.blue, brightness: Brightness.dark)
            .copyWith(secondary: Colors.white)
            .copyWith(surface: const Color(0xFF1D1B1B)))
    .copyWith(
        pageTransitionsTheme: const PageTransitionsTheme(
  builders: <TargetPlatform, PageTransitionsBuilder>{
    TargetPlatform.android: ZoomPageTransitionsBuilder(),
  },
));

final lightTheme = ThemeData(
        useMaterial3: false,
        indicatorColor: Colors.black,
        cardColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        primaryColor: Colors.white,
        brightness: Brightness.light,
        dividerColor: Colors.white54,
        textTheme: GoogleFonts.chivoTextTheme(
            const TextTheme(titleLarge: TextStyle(fontSize: 14))),
        colorScheme: ColorScheme.fromSwatch(backgroundColor: Colors.white)
            .copyWith(secondary: Colors.black)
            .copyWith(surface: Colors.white))
    .copyWith(
        pageTransitionsTheme: const PageTransitionsTheme(
  builders: <TargetPlatform, PageTransitionsBuilder>{
    TargetPlatform.android: ZoomPageTransitionsBuilder(),
  },
));
