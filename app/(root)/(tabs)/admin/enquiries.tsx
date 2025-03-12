import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases, config } from "@/lib/appwrite";
import { Query, Models, Permission, Role } from "react-native-appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "react-i18next";

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedInquiry, setSelectedInquiry] =
    useState<Models.Document | null>(null);
  const [messages, setMessages] = useState<Models.Document[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const { user } = useGlobalContext();
  const { t } = useTranslation();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  //  Fetch all pending inquiries from `contactIssues` DB
  const fetchEnquiries = async () => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.contactIssues,
        [Query.orderDesc("createdAt")]
      );
      setEnquiries(response.documents);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  //  Fetch conversation messages from `Messages` DB when an inquiry is selected
  const fetchMessages = async (conversationId: string) => {
    setMessageLoading(true);
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.Messages,
        [
          Query.equal("conversationId", conversationId),
          Query.orderDesc("timestamp"),
        ]
      );
      setMessages(response.documents.reverse());
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessageLoading(false);
    }
  };

  //  Handle selecting an inquiry
  const handleSelectInquiry = (inquiry: Models.Document) => {
    if (selectedInquiry?.$id === inquiry.$id) {
      setSelectedInquiry(null);
      setMessages([]);
    } else {
      setSelectedInquiry(inquiry);
      fetchMessages(inquiry.$id);
    }
  };

  //  Handle sending a response
  const handleResponse = async () => {
    if (!selectedInquiry || !responseText[selectedInquiry.$id]?.trim()) {
      Alert.alert("Error", "Please enter a response.");
      return;
    }

    try {
      const newMessage = {
        conversationId: selectedInquiry.$id,
        senderId: "admin",
        content: responseText[selectedInquiry.$id],
        timestamp: new Date().toISOString(),
      };

      //  Save response in `Messages` DB
      const response = await databases.createDocument(
        config.databaseId,
        config.Messages,
        "unique()",
        newMessage,
        [Permission.read(Role.any())]
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...newMessage,
          $id: response.$id,
          $collectionId: response.$collectionId,
          $databaseId: response.$databaseId,
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
          $permissions: response.$permissions,
        },
      ]);

      setResponseText((prev) => ({ ...prev, [selectedInquiry.$id]: "" }));

      //  Update status to "In Progress" if still "Pending"
      if (selectedInquiry.status === "pending") {
        try {
          console.log(
            " Updating status to 'In Progress' for:",
            selectedInquiry.$id
          );
          setSelectedInquiry({ ...selectedInquiry, status: "In Progress" });

          await databases.updateDocument(
            config.databaseId,
            config.contactIssues,
            selectedInquiry.$id,
            { status: "In Progress", adminId: user?.$id || "Unknown" }
          );

          console.log(" Status updated to 'In Progress' in Appwrite");

          //  Fetch the updated document from Appwrite to verify the change
          const updatedInquiry = await databases.getDocument(
            config.databaseId,
            config.contactIssues,
            selectedInquiry.$id
          );

          console.log(" Updated Status from DB:", updatedInquiry.status);

          // Update UI
          setSelectedInquiry({
            ...selectedInquiry,
            status: "In Progress",
            adminId: user?.$id || "Unknown",
          });

          setEnquiries((prev) =>
            prev.map((item) =>
              item.$id === selectedInquiry.$id
                ? {
                    ...item,
                    status: "In Progress",
                    adminId: user?.$id || "Unknown",
                  }
                : item
            )
          );
        } catch (error) {
          console.error(" Error updating status:", error);
        }
      }

      Alert.alert("Success", "Response sent successfully.");
    } catch (error) {
      console.error("Error handling response:", error);
      Alert.alert("Error", "Could not send response.");
    }
  };

  //  Handle closing an inquiry (Set status to "Solved")
  const handleCloseInquiry = async () => {
    if (!selectedInquiry) return;

    try {
      await databases.updateDocument(
        config.databaseId,
        config.contactIssues,
        selectedInquiry.$id,
        { status: "Solved" }
      );

      Alert.alert("Inquiry Closed", "The inquiry has been marked as solved.");
      fetchEnquiries(); // Refresh list
    } catch (error) {
      console.error("Error closing inquiry:", error);
      Alert.alert("Error", "Could not close inquiry.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>{t("Admin_Enquiries")}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0061FF" />
        ) : (
          <FlatList
            data={enquiries}
            keyExtractor={(item) => item.$id}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  selectedInquiry?.$id === item.$id && styles.selectedCard,
                ]}
                onPress={() => handleSelectInquiry(item)}
              >
                <Text style={styles.issueType}>User: {item.name}</Text>

                <Text style={styles.issueType}>Issue: {t(item.issueType)}</Text>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.image} />
                )}
                <Text style={styles.description}>{item.description}</Text>
                <Text
                  style={[
                    styles.statusPill,
                    item.status.toLowerCase() === "pending" ||
                    item.status.toLowerCase() === "solved"
                      ? styles.redPill
                      : item.status.toLowerCase() === "in progress"
                      ? styles.greenPill
                      : {},
                  ]}
                >
                  {item.status}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Show Conversation Only When an Inquiry is Selected */}
        {selectedInquiry && (
          <View style={styles.overlay}>
            <Text style={styles.chatHeader}>Conversation</Text>
            <ScrollView style={styles.chatContainer}>
              {messageLoading ? (
                <ActivityIndicator size="small" color="#0061FF" />
              ) : (
                messages.map((msg) => (
                  <View
                    key={msg.$id}
                    style={[
                      styles.message,
                      msg.senderId === "admin"
                        ? styles.adminMessage
                        : styles.userMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.content}</Text>
                    <Text style={styles.timestamp}>
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleString()
                        : "No Timestamp"}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Response Input */}
            <TextInput
              style={styles.input}
              placeholder="Type a response..."
              value={responseText[selectedInquiry.$id] || ""}
              onChangeText={(text) =>
                setResponseText((prev) => ({
                  ...prev,
                  [selectedInquiry.$id]: text,
                }))
              }
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleResponse}
              >
                <Text style={styles.submitButtonText}>Send Response</Text>
              </TouchableOpacity>

              {/* Close Inquiry Button */}
              {selectedInquiry.status !== "Solved" && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseInquiry}
                >
                  <Text style={styles.closeButtonText}>Mark as Solved</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Floating Close Button */}
            <TouchableOpacity
              style={styles.floatingCloseButton}
              onPress={() => setSelectedInquiry(null)}
            >
              <Text style={styles.floatingCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Enquiries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    paddingTop: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 10,
    margin: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    maxWidth: "30%",
  },
  selectedCard: {
    backgroundColor: "#b3c9ff",
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    overflow: "hidden",
    marginTop: 4,
  },
  redPill: {
    backgroundColor: "red",
  },
  greenPill: {
    backgroundColor: "green",
  },
  status: {
    fontWeight: "bold",
  },
  issueType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "left",
    marginTop: 5,
  },
  image: {
    width: 60,
    height: 70,
    marginTop: 5,
    borderRadius: 5,
    alignSelf: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 100,
    padding: 20,
  },
  chatContainer: {
    flex: 1,
    marginTop: 10,
  },
  adminMessage: {
    backgroundColor: "#e1f5fe",
    alignSelf: "flex-end",
  },
  userMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-start",
  },
  message: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  chatHeader: {
    fontSize: 18,
    fontWeight: "bold",
    paddingTop: 80,
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  messageList: {
    height: 200,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    marginTop: 10,
    borderRadius: 20,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    marginTop: 10,
    borderRadius: 20,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 10,
    gap: 8,
    marginBottom: 70,
  },

  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  floatingCloseButton: {
    position: "absolute",
    alignSelf: "center",
    top: 60,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
  },
  floatingCloseButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
