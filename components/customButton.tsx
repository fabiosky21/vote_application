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
  containerStyles,
  textStyles,
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
          borderRadius: 10,
          flexDirection: "row", // Ensure the text and ActivityIndicator are in a row
        },
        containerStyles,
        isLoading && { opacity: 0.5 },
      ]}
      disabled={isLoading}
    >
      <Text
        style={[
          { color: "#000", fontFamily: "Rubik-ExtraBold", fontSize: 18 },
          textStyles,
        ]}
      >
        {title}
      </Text>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#000"
          size="small"
          style={{ marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
