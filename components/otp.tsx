import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { databases } from '@/lib/appwrite';

interface OTPVerificationProps {
  userId: string;
  email: string;
  onVerified: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ userId, email, onVerified }) => {
  const [otpInput, setOtpInput] = useState('');

  const handleVerify = async () => {
    try {
      // Fetch the stored OTP for the user
      const otpDoc = await databases.getDocument('yourDatabaseId', 'otpCollection', userId);
      
      if (otpDoc.otp === otpInput) {
        // Mark the user as verified in your app's logic
        // For example, you might update a 'verified' flag in the user's document
        await databases.updateDocument(
          'yourDatabaseId',
          'userCollection', // Your collection where user profiles are stored
          userId,
          { verified: true }
        );
        Alert.alert("Success", "Your email has been verified.");
        onVerified();
      } else {
        Alert.alert("Error", "Invalid verification code.");
      }
    } catch (error) {
      console.error("OTP Verification error:", error);
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter the verification code sent to {email}:</Text>
      <TextInput
        value={otpInput}
        onChangeText={setOtpInput}
        placeholder="Enter OTP"
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
};

export default OTPVerification;
