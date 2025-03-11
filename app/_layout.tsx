import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { GlobalProvider, useGlobalContext } from "@/lib/global-provider";
import { VotedPollsProvider } from "@/context/VotedPollsContext";
import { I18nextProvider } from "react-i18next";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import i18n, { loadLanguage } from "../lib/i18n";

function RedirectHandler() {
  const { user, loading } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If no user, go to sign-in page.
        router.replace("/sign-in");
      } else {
        // Check if user is admin by looking at the labels array.
        const isAdmin = user.labels && user.labels.includes("admin");
        // Debug logs
        console.log("Redirecting: loading:", loading, "user:", user);
        if (isAdmin) {
          router.replace("/(root)/(tabs)/admin/createPolls");
        } else {
          router.replace("/(root)/(tabs)/user");
        }
      }
    }
  }, [loading, user]);

  // While loading, show a spinner.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0061FF" />
      </View>
    );
  }

  return null; // Once redirected, this component doesn't render anything.
}

export default function RootLayout() {
  useEffect(() => {
    loadLanguage();
  }, []);

  const [fontsLoaded] = useFonts({
    "Rubik-bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-italic": require("../assets/fonts/Rubik-Italic.ttf"),
    "Rubik-bold-italic": require("../assets/fonts/Rubik-BoldItalic.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0061FF" />
      </View>
    );
  }

  // Wrap your app with GlobalProvider so that all user state comes from there.
  return (
    <I18nextProvider i18n={i18n}>
      <VotedPollsProvider>
        <GlobalProvider>
          <RedirectHandler />
          <Stack screenOptions={{ headerShown: false }} />
        </GlobalProvider>
      </VotedPollsProvider>
    </I18nextProvider>
  );
}
