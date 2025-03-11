import {
  View,
  Text,
  ScrollView,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { logout } from "@/lib/appwrite";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/lib/i18n";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

interface SettingsItemProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: object;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProps) => (
  <TouchableOpacity onPress={onPress} style={styles.settingsItem}>
    <View style={styles.settingsItemContent}>
      <Image source={icon} style={[styles.icon, textStyle]} />
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </View>
    {showArrow && <Image source={icons.arrowr} style={styles.arrowIcon} />}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch, updateUserAvatar } = useGlobalContext();
  const { t, i18n } = useTranslation(); //  Initialize translations
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();


  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", t("logoutSuccess")); // Translated text
      refetch({});
    } else {
      Alert.alert("Error", t("logoutFailed")); // Translated text
    }
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      updateUserAvatar(result.assets[0].uri); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t("settings")}</Text>
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.avatar }} style={styles.profileImage} />
            <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
              <Image source={icons.edit} style={styles.editIconImage} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
        </View>
        <View style={styles.settingsList}>
          {/* Language Selection */}
          <SettingsItem
            icon={icons.language}
            title={t("selectLanguage")}
            onPress={() => setModalVisible(true)}
          />
          <SettingsItem
            icon={icons.help}
            title={t("help")}
            onPress={() => router.push("/help")}
          />
          <SettingsItem
            icon={icons.customer_service}
            title={t("contactUs")}
            onPress={() => router.push("/contact")}
          />
          <SettingsItem
            icon={icons.chat}
            title={t("message")}
            onPress={() => router.push("/messages")}
          />

        </View>
        <View style={styles.logoutContainer}>
          <SettingsItem
            icon={icons.logout}
            title={t("logout")}
            textStyle={styles.logoutText}
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("selectLanguage")}</Text>

            <TouchableOpacity
              onPress={() => {
                changeLanguage("en");
                setModalVisible(false);
              }}
              style={styles.languageOption}
            >
              <Text style={styles.flagText}>🇬🇧</Text>
              <Text style={styles.languageText}> English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                changeLanguage("es");
                setModalVisible(false);
              }}
              style={styles.languageOption}
            >
              <Text style={styles.flagText}>🇪🇸</Text>
              <Text style={styles.languageText}> Español</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                changeLanguage("fr");
                setModalVisible(false);
              }}
              style={styles.languageOption}
            >
              <Text style={styles.flagText}>🇫🇷</Text>
              <Text style={styles.languageText}> Français</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>{t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    paddingBottom: 32,
    paddingHorizontal: 7,
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  avatarContainer: {
    position: "relative",
  },
   editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  editIconImage: {
    width: 20,
    height: 20,
  },
  
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  settingsList: {
    marginTop: 20,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  settingsItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  logoutContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  logoutText: {
    color: "red",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  languageOption: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 75,
    width: "100%",
  },
  flagText: {
    fontSize: 29,
    marginRight: 10,
  },
  languageText: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff5252",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});






