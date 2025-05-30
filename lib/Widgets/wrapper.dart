import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:falguni_app/Pages/login_page.dart';

import '../Pages/bottom_nav.dart';

class Wrapper extends StatefulWidget {
  const Wrapper({super.key});

  @override
  State<Wrapper> createState() => _WrapperState();
}

class _WrapperState extends State<Wrapper> {

  bool isLogged = true;
  getAuth() {
    FirebaseAuth.instance.authStateChanges().listen((User? user) async {
      if (user == null) {
        setState(() {
          isLogged = false;
        });
      } else {
        setState(() {
          isLogged = true;
        });
      }
    });
  }

  @override
  void initState() {
    getAuth();
    
    super.initState();
  }

  


  @override
  Widget build(BuildContext context) {
   
      return isLogged == true ? const BottomNavPage() : const LoginPage();
   
  }
}
