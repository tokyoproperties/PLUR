// app.config.js — replaces app.json for native config injection
// app.json is kept for reference but this file takes precedence.
// The googleMaps apiKey must live here (not app.json) to guarantee
// Expo prebuild writes it into android/app/src/main/AndroidManifest.xml.

export default {
  expo: {
    name: "earth-eye-mobile",
    slug: "earth-eye-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "eartheyemobile",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.eartheyemobile",
      config: {
        googleMaps: {
          apiKey: "AIzaSyCombWGLM-pMIFUbAV-is3bknfuJs8VA38",
        },
      },
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "./plugins/withGoogleMapsApiKey",
      "expo-router",
      "expo-asset",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
