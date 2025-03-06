import React, {useState} from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect, Link } from "expo-router";
import CustomButton from "@/components/customButton";
import FormField from "@/components/formField";
import { login as googleLogin, emailPasswordLogin } from "../lib/appwrite";
import axios from "axios";




const signIn = () => {
  const { refetch, loading, isLogged} = useGlobalContext();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [otpVisible, setOtpVisible] = useState(false);


  if (!loading && isLogged) return <Redirect href="/(root)/(tabs)/user" />;

  const handleLogin = async () => {
    const result = await login();
    if (result) {
      refetch({});
    } else {
      Alert.alert("Error", "Failed to login");
    }
  };
  
   // This now calls our REST-based login:
   const handleEmailPasswordLogin = async () => {
    try {
      const session = await emailPasswordLogin(form.email, form.password);
      console.log("Session data:", session);

      // If success, call refetch() to refresh your global state or user context
      refetch({});
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : String(error));
    }
  };

  // Existing Google button logic
  const handleGoogleLogin = async () => {
    const result = await googleLogin();
    if (result) {
      refetch({});
    } else {
      Alert.alert("Error", "Failed to login with Google");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image
          source={require("../assets/images/fulllogot.png")}
          style={{ width: "100%", height: "40%" }} // Adjust the height here
          resizeMode="contain"
        />

        <View
          style={{
            paddingHorizontal: 10,
            marginTop: -20,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",

              textTransform: "uppercase",
              fontFamily: "Rubik-Medium",
              color: "#4A4A4A",
            }}
          >
            Welcome TO E-VOTE
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Rubik-Medium",
              textAlign: "center",
              color: "#000",
              margin: 20,
            }}
          >
            Sign in to continue
          </Text>

          <FormField
            label="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholder="Enter your email"
          />
          <FormField
            label="Password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            placeholder="Enter your password"
            secureTextEntry
          />
          <CustomButton
            title={"Sign In"}
            handlePress={handleEmailPasswordLogin}
            containerStyles={{
              width: "80%",
              backgroundColor: "#007BFF",
              paddingVertical: 15,
              borderRadius: 10,
              marginTop: 10,
            }}
            textStyles={{ color: "#fff", fontSize: 18 }}
            isLoading={false}
          />

          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              borderRadius: 50,
              width: "75%",
              paddingVertical: 16,
              marginTop: 12,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../assets/icons/google (1).png")}
                style={{ width: 36, height: 36 }}
                resizeMode="contain"
              />

              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Rubik-Medium",
                  color: "#4A4A4A",
                  marginLeft: 8,
                }}
              >
                continue with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            justifyContent: "center",
            paddingTop: 30,
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#4A4A4A",
              fontFamily: "Rubik-Medium",
            }}
          >
            Don't you have account?
          </Text>
          <Link
            href="/sign-up"
            style={{
              fontSize: 18,
              fontFamily: "Rubik-Medium",
              color: "#007BFF",
            }}
          >
            sign Up
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default signIn;