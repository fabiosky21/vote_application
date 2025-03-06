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
} from "react-native";
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import CustomButton from "../components/customButton";
import FormField from "../components/formField";
import images from "@/constants/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import { createEmailUser, account } from "../lib/appwrite"; // Ensure you have imported createUser and account

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const router = useRouter();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);
    console.log("🚀 Attempting to create user with:", form);

    try {
      const result = await createEmailUser({
        email: form.email,
        password: form.password,
        username: form.username,
      });
      setUser(result);
        setIsLogged(true);

      console.log("✅ User created successfully:", result);

      if (result) {
        router.replace("/sign-in");
      } else {
        Alert.alert("Error", "Sign-up failed.");
      }
    } catch (error) {
      console.error("❌ Sign-up error:", error);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    capital: false,
    special: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validatePassword = (password: string) => {
    const length = password.length >= 8;
    const capital = /[A-Z]/.test(password);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordRequirements({ length, capital, special });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsPasswordFocused(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsPasswordFocused(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
          <FormField
            label="Password"
            value={form.password}
            onChangeText={(text) => {
              setForm({ ...form, password: text });
            }}
            placeholder="Enter your password"
            secureTextEntry
          />

          {isPasswordFocused && (
            <View style={styles.requirementsContainer}>
              <Text
                style={[
                  styles.requirement,
                  passwordRequirements.length ? styles.valid : styles.invalid,
                ]}
              >
                - At least 8 characters
              </Text>
              <Text
                style={[
                  styles.requirement,
                  passwordRequirements.capital ? styles.valid : styles.invalid,
                ]}
              >
                - At least one capital letter
              </Text>
              <Text
                style={[
                  styles.requirement,
                  passwordRequirements.special ? styles.valid : styles.invalid,
                ]}
              >
                - At least one special character
              </Text>
            </View>
          )}

          <CustomButton
            title={"Sign Up"}
            handlePress={() => submit()}
            containerStyles={{
              width: "80%",
              backgroundColor: "#007BFF",
              paddingVertical: 15,
              borderRadius: 10,
              marginTop: 20,
            }}
            textStyles={{ color: "#fff", fontSize: 18 }}
            isLoading={isSubmitting}
          />
          <View
            style={{
              justifyContent: "center",
              paddingTop: 36,
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
              Do you have an account?
            </Text>

            <Link
              href="/sign-in"
              style={{
                fontSize: 18,
                fontFamily: "Rubik-Medium",
                color: "#007BFF",
              }}
            >
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
  requirementsContainer: {
    width: "80%",
    marginTop: 10,
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
