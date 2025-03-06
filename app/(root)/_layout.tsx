import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGlobalContext } from "@/lib/global-provider";

export default function AppLayout() {
  const { loading, isLogged } = useGlobalContext();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#0061FF" size="large" />
      </SafeAreaView>
    );
  }

  if (!isLogged) return <Redirect href="/sign-in" />;

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "white",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activityIndicator: {},
});
