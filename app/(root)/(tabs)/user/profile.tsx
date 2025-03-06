import {
  View,
  Text,
  ScrollView,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { logout } from "@/lib/appwrite";

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
  const { user, refetch } = useGlobalContext();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch({});
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
        </View>
        <View style={styles.profileContainer}>
          <Image source={{ uri: user?.avatar }} style={styles.profileImage} />
          <Text style={styles.profileName}>{user?.name}</Text>
        </View>
        <View style={styles.settingsList}>
          <SettingsItem icon={icons.language} title="My test" />
          <SettingsItem icon={icons.help} title="My test" />
        </View>
        <View style={styles.logoutContainer}>
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle={styles.logoutText}
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
});

export default Profile;
