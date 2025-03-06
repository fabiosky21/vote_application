import { Tabs } from "expo-router";
import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import icons from "@/constants/icons";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/appwrite";

const TabBarIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}) => (
  <View style={styles.iconContainer}>
    <Image
      source={icon}
      style={[styles.icon, { tintColor: focused ? "#0061FF" : "#666876" }]}
      resizeMode="contain"
    />
    <Text
      style={[styles.text, focused ? styles.textFocused : styles.textUnfocused]}
    >
      {title}
    </Text>
  </View>
);

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          position: "absolute",
          borderTopColor: "#0061FF1A",
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="createPolls"   // This matches createPolls.tsx
        options={{
          title: "Create Polls",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.createpolls} title="Create Polls" />
          ),
        }}
      />
      <Tabs.Screen
        name="approveorPolls"  // This matches approveorPolls.tsx
        options={{
          title: "Approve Polls",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.approval} title="Approve" />
          ),
        }}
      />
      <Tabs.Screen
        name="profilead"  
        options={{
          title: "Profile Admin",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.adminu} title="Admin" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    iconContainer: {
        flex: 1,
        marginTop: 3,
        flexDirection: "column",
        alignItems: "center",
      },
      icon: {
        width: 24,
        height: 24,
      },
      text: {
        fontSize: 10,
        width: "100%",
        textAlign: "center",
        marginTop: 1,
      },
      textFocused: {
        color: "#0061FF",
        fontFamily: "Rubik-Medium",
      },
      textUnfocused: {
        color: "#666876",
        fontFamily: "Rubik",
      },
});
