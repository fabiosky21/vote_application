import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provider";
import * as ImagePicker from "expo-image-picker";
import { databases, config } from "@/lib/appwrite";
import { Permission, Role } from "react-native-appwrite";
import { useRouter } from "expo-router";
import icons from "@/constants/icons";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { user } = useGlobalContext();

  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null); // Store image URI
  const [modalVisible, setModalVisible] = useState(false); // Modal control
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const [issueType, setIssueType] = useState(t("select_issue"));

  // Function to handle selecting an issue type
  const selectIssueType = (type: string) => {
    setIssueType(type);
    setDropdownVisible(false);
  };

  // Function to allow user to pick an image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to submit the form
  const handleSubmit = async () => {
    if (!description || issueType === t("select_issue")) {
      Alert.alert(t("error"), t("select_issue_description"));
      return;
    }

    setLoading(true);
    try {
      await databases.createDocument(
        config.databaseId,
        config.contactIssues,
        "unique()",
        {
          userId: user?.$id,
          name: user?.name,
          issueType,
          description,
          image: image || "",
          status: "pending", // Default status for admin review
          createdAt: new Date().toISOString(),
        },
        [Permission.read(Role.any())]
      );

      setModalVisible(true); // Show confirmation modal

      // Reset form after 3 seconds
      setTimeout(() => {
        setModalVisible(false);
        setDescription("");
        setImage(null);
        setIssueType(t("select_issue"));
      }, 3000);
    } catch (error) {
      console.error("Error submitting issue:", error);
      Alert.alert(t("error"), t("submission_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <TouchableOpacity
          onPress={() => router.push("/user/profile")}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.header}>{t("contact_header")}</Text>

        <TextInput
          style={styles.input}
          value={user?.name}
          editable={false}
          placeholder={t("your_name")}
        />

        {/* Dropdown for Issue Type */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownText}>{issueType}</Text>
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownOptions}>
            {[
              { key: "technical_issue", label: t("technical_issue") },
              { key: "polls_issue", label: t("polls_issue") },
              { key: "account_issue", label: t("account_issue") },
              { key: "other_issue", label: t("other_issue") },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => selectIssueType(key)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Description Input */}
        <TextInput
          style={styles.textArea}
          placeholder={t("describe_issue")}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Attach Image Button */}
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Text style={styles.attachButtonText}>{t("attach_image")}</Text>
        </TouchableOpacity>

        {/* Show Selected Image */}
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? t("submitting") : t("submit")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{t("thanks_for_contacting")}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  scrollView: {
    paddingBottom: 20,
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: -1,
    left: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 30,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownText: {
    color: "#333",
  },
  dropdownOptions: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dropdownItemText: {
    color: "#333",
  },
  textArea: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  attachButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  attachButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
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
    borderRadius: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
  },
});
