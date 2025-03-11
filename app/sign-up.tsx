import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  TextInput,
} from "react-native";
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import CustomButton from "../components/customButton";
import FormField from "../components/formField";
import images from "@/constants/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import { sendOtp, verifyOtp } from "../lib/appwrite";
import { createEmailUser, account } from "../lib/appwrite";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const router = useRouter();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    capital: false,
    special: false,
  });

  // Validate Password Strength
  const validatePassword = (password: string) => {
    const length = password.length >= 8;
    const capital = /[A-Z]/.test(password);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordRequirements({ length, capital, special });
  };

  // Step 1: Send OTP to Email
  const handleSignUp = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (
      !passwordRequirements.length ||
      !passwordRequirements.capital ||
      !passwordRequirements.special
    ) {
      Alert.alert("Error", "Password does not meet the security requirements.");
      return;
    }

    setSubmitting(true);
    try {
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      await sendOtp(form.email, generatedOtp);

      setOtpSent(true);
      Alert.alert("Check your email!", "An OTP has been sent to your email.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert("Error", "Could not send OTP. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter the OTP sent to your email.");
      return;
    }

    setSubmitting(true);
    try {
      const isValid = await verifyOtp(form.email, otp);
      if (!isValid) {
        Alert.alert("Error", "Invalid OTP. Try again.");
        return;
      }

      // OTP is valid, create the user account
      const result = await createEmailUser({
        email: form.email,
        password: form.password,
        username: form.username,
      });

      setUser(result);
      setIsLogged(true);
      Alert.alert("Success", "Account created successfully!");
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign-up error:", error);
      Alert.alert("Error", (error as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Image
            source={images.signimage}
            style={{ width: "100%", height: 200, marginBottom: 20 }}
          />

          <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
            Sign up to access e-vote
          </Text>

          {!otpSent ? (
            <>
              <FormField
                label="User name"
                value={form.username}
                onChangeText={(text) => setForm({ ...form, username: text })}
                placeholder="Enter your username"
              />
              <FormField
                label="Email"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Enter your email"
              />

              <View style={styles.passwordContainer}>
                <FormField
                  label="Password"
                  value={form.password}
                  onChangeText={(text) => {
                    setForm({ ...form, password: text });
                    validatePassword(text);
                  }}
                  placeholder="Enter your password"
                  secureTextEntry
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />

                {isPasswordFocused && (
                  <View style={styles.popover}>
                    <Text
                      style={[
                        styles.requirement,
                        passwordRequirements.length
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      - At least 8 characters
                    </Text>
                    <Text
                      style={[
                        styles.requirement,
                        passwordRequirements.capital
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      - At least one capital letter
                    </Text>
                    <Text
                      style={[
                        styles.requirement,
                        passwordRequirements.special
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      - At least one special character
                    </Text>
                  </View>
                )}
              </View>

              <CustomButton
                title="Sign Up"
                handlePress={handleSignUp}
                isLoading={isSubmitting}
                containerStyles={{
                  backgroundColor: "#007BFF",
                }}
              />
            </>
          ) : (
            <>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                Enter the One Time Password sent to your email
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter One Time Password"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
              />

              <CustomButton
                title={"Verify OTP"}
                handlePress={handleVerifyOtp}
                isLoading={isSubmitting}
              />
            </>
          )}

          <View
            style={{
              justifyContent: "center",
              paddingTop: 36,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 18, color: "#4A4A4A" }}>
              Do you have an account?
            </Text>
            <Link href="/sign-in" style={{ fontSize: 18, color: "#007BFF" }}>
              Sign In
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  passwordContainer: {
    width: "80%",
    position: "relative",
    marginVertical: 10,
  },
  popover: {
    position: "absolute",
    top: -80,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    elevation: 2,
    zIndex: 10,
  },
  requirement: {
    fontSize: 14,
    marginBottom: 5,
  },
  valid: {
    color: "green",
  },
  invalid: {
    color: "red",
  },
});
