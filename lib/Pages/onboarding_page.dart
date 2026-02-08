// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:introduction_screen/introduction_screen.dart';

class OnBoardingPage extends StatefulWidget {
  const OnBoardingPage({super.key});

  @override
  State<OnBoardingPage> createState() => _OnBoardingPageState();
}

class _OnBoardingPageState extends State<OnBoardingPage> {
  final introKey = GlobalKey<IntroductionScreenState>();

  static const Color kGold = Color(0xFFD4AF37);
  static const Color kBgTop = Color(0xFF2B1B17);
  static const Color kBgMid = Color(0xFF5C4033);

  void _onIntroEnd(context) {
    Navigator.of(context).pushNamed('/login');
  }

  Widget buildFullscreenImage() {
    return Image.asset(
      'assets/image/vendors.jpg',
      fit: BoxFit.cover,
      height: double.infinity,
      width: double.infinity,
      alignment: Alignment.center,
    );
  }

  Widget _buildImage(String assetName, [double width = 350]) {
    return Image.asset('assets/image/$assetName', width: width);
  }

  @override
  Widget build(BuildContext context) {
    const bodyStyle = TextStyle(fontSize: 15.0, color: Colors.white70);

    final pageDecoration = PageDecoration(
      titleTextStyle: const TextStyle(
          fontSize: 20.0, fontWeight: FontWeight.w700, color: Colors.white),
      bodyTextStyle: bodyStyle,
      bodyPadding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
      pageColor: Colors.transparent,
      imagePadding: EdgeInsets.zero,
    );

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kBgTop, kBgMid, kBgTop],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: IntroductionScreen(
        key: introKey,
        globalBackgroundColor: Colors.transparent,
        // globalHeader: Align(
        //   alignment: Alignment.topRight,
        //   child: SafeArea(
        //     child: Padding(
        //       padding: const EdgeInsets.only(top: 16, right: 16),
        //       child: _buildImage('icon.png', 100),
        //     ),
        //   ),
        // ),

        pages: [
          PageViewModel(
            title: "Choose best Snacks for you and your family...",
            body:
                "The app connects you to a Falguni Store to purchase your Snacks.",
            image: _buildImage('vendor new.png'),
            decoration: pageDecoration,
          ),
          PageViewModel(
            title: " Quick Delivery at your door step",
            body:
                "Your orders are delivered to your door step with in minutes after making your purchases.",
            image: _buildImage('rider.png'),
            decoration: pageDecoration,
          ),
          // PageViewModel(
          //   title: "Make your own order",
          //   body:
          //       "Send your packages to your loved ones.",
          //   image: _buildImage('cart new.png'),
          //   decoration: pageDecoration.copyWith(
          //     contentMargin: const EdgeInsets.symmetric(horizontal: 16),
          //     fullScreen: false,
          //     bodyFlex: 2,
          //     imageFlex: 3,
          //   ),
          // ),
          PageViewModel(
            image: _buildImage('sellerContact.jpg'),
            title:
                "Connect to the seller directly for customizations and other FAQ's...",
            bodyWidget: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Click on Done", style: bodyStyle),
                Text(" to continue", style: bodyStyle),
              ],
            ),
            decoration: pageDecoration.copyWith(
              bodyFlex: 2,
              imageFlex: 4,
              bodyAlignment: Alignment.bottomCenter,
              imageAlignment: Alignment.topCenter,
            ),
            reverse: true,
          ),
        ],
        onDone: () => _onIntroEnd(context),
        onSkip: () => _onIntroEnd(context),
        showSkipButton: true,
        skipOrBackFlex: 0,
        nextFlex: 0,
        showBackButton: false,
        skip: const Text('Skip',
            style: TextStyle(fontWeight: FontWeight.w600, color: kGold)),
        next: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          decoration: BoxDecoration(
            color: kGold,
            borderRadius: BorderRadius.circular(25.0),
          ),
          child: const Text('Next',
              style: TextStyle(color: kBgTop, fontWeight: FontWeight.w600)),
        ),
        done: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          decoration: BoxDecoration(
            color: kGold,
            borderRadius: BorderRadius.circular(25.0),
          ),
          child: const Text('Done',
              style: TextStyle(color: kBgTop, fontWeight: FontWeight.w600)),
        ),
        curve: Curves.fastLinearToSlowEaseIn,
        controlsMargin: const EdgeInsets.all(16),
        controlsPadding: kIsWeb
            ? const EdgeInsets.all(12.0)
            : const EdgeInsets.fromLTRB(8.0, 4.0, 8.0, 4.0),
        dotsDecorator: DotsDecorator(
          activeColor: kGold,
          size: const Size(10.0, 10.0),
          color: Colors.white24,
          activeSize: const Size(22.0, 10.0),
          activeShape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(25.0)),
          ),
        ),
        dotsContainerDecorator: const ShapeDecoration(
          color: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
          ),
        ),
      ),
    );
  }
}
