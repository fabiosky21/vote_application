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
import { useTranslation } from "react-i18next";

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

export default function UserLayout () {
  const { t } = useTranslation();


  return (
    <Tabs
      screenOptions={{
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
        name="index"
        options={{
          title: t("nav_home"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.home} title={t("nav_home")} />
          ),
        }}
      />
      <Tabs.Screen
        name="completedPolls"
        options={{
          title: t("nav_completed_polls"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={icons.completed_}
              title={t("nav_completed_polls")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resultpage"
        options={{
          title: t("nav_result_page"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={icons.evaluation}
              title={t("nav_result_page")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav_profile"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={icons.profile}
              title={t("nav_profile")}
            />
          ),
        }}
      />
      
    </Tabs>
  );
};

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


