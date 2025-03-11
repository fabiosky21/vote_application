import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: ViewStyle | ViewStyle[];
  textStyles?: TextStyle | TextStyle[];
  isLoading: boolean;
}

const CustomButton = ({
  title,
  handlePress,
  containerStyles = {}, // Default empty object
  textStyles = {}, // Default empty object
  isLoading,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        {
          minHeight: 60,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25, 
          paddingHorizontal: 20,
          
        },
        containerStyles, 
        isLoading && { opacity: 0.5 }, 
      ]}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text
          style={[
            { color: "#fff", fontSize: 18, fontWeight: "bold" },
            textStyles, 
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
