import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { GlobalProvider } from "@/lib/global-provider";
import { VotedPollsProvider } from "@/context/VotedPollsContext";
import { getCurrentUser } from "@/lib/appwrite";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function RootLayout() {
  // 1. Load fonts
  const [fontsLoaded] = useFonts({
    "Rubik-bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-italic": require("../assets/fonts/Rubik-Italic.ttf"),
    "Rubik-bold-italic": require("../assets/fonts/Rubik-BoldItalic.ttf"),
  });

  // 2. Keep track of user’s admin status & loading
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // 3. Get the router for manual navigation
  const router = useRouter();

  useEffect(() => {
    // Hide splash screen once fonts are loaded
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    // Check if user is admin
    const checkUser = async () => {
      try {
        const user = await getCurrentUser(); // returns user or null
        if (user?.labels?.includes("admin")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (fontsLoaded) checkUser();
  }, [fontsLoaded]);

  // 4. Once loaded, redirect in a useEffect (AFTER layout mounts)
  useEffect(() => {
    if (!loading && isAdmin !== null) {
      if (isAdmin) {
        // Admin user → go to admin route
        router.replace("/(root)/(tabs)/admin/createPolls");
      } else {
        // Non-admin user → go to user route
        router.replace("/(root)/(tabs)/user");
      }
    }
  }, [loading, isAdmin]);

  // 5. Render a loader until we’re done checking
  if (!fontsLoaded || loading || isAdmin === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0061FF" />
      </View>
    );
  }

  // 6. Render an empty layout—navigation is handled in the useEffect above
  //    OR you can render <Stack><Stack.Screen ... /></Stack> + <Slot/> if needed
  return (
    <VotedPollsProvider>
      <GlobalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GlobalProvider>
    </VotedPollsProvider>
  );
}
