import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import { databases, config, client } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Query, Role, Permission, Models } from "react-native-appwrite";
import { useTranslation } from "react-i18next";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";

const Messages = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [conversations, setConversations] = useState<Models.Document[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Models.Document | null>(null);
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string; timestamp: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const { t } = useTranslation();

  // Fetch all user inquiries from `contactIssues`
  const fetchConversations = async () => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.contactIssues, // Collection for inquiries
        user
          ? [Query.equal("userId", user.$id), Query.orderDesc("createdAt")]
          : []
      );

      setConversations(response.documents);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  };

  // Fetch messages when a conversation is selected
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      console.log("Fetching messages for conversation ID:", conversationId);
      const response = await databases.listDocuments(
        config.databaseId,
        config.Messages, // Collection for messages
        [
          Query.equal("conversationId", conversationId),
          Query.orderDesc("timestamp"),
        ]
      );
      console.log("Fetched messages from Appwrite:", response.documents);

      if (response.documents.length === 0) {
        console.log("No messages found for conversation ID:", conversationId);
      }
      // Format messages
      const formattedMessages = response.documents.map(
        (msg: Models.Document) => ({
          id: msg.$id,
          text: msg.content,
          sender: msg.senderId === user?.$id ? "You" : "Admin",
          timestamp: new Date(msg.timestamp).toLocaleString(),
        })
      );

      setMessages(formattedMessages.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  // Handle selecting a conversation box
  const handleSelectConversation = (conversation: Models.Document) => {
    if (selectedConversation?.$id === conversation.$id) {
      // If the same conversation is tapped again, close it
      setSelectedConversation(null);
      setMessages([]);
    } else {
      setSelectedConversation(conversation);
      fetchMessages(conversation.$id);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation) return;

    try {
      const newMessage = {
        conversationId: selectedConversation.$id,
        senderId: user ? user.$id : "user",
        content: inputMessage,
        timestamp: new Date().toISOString(),
      };

      // Save message in Appwrite
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
          id: response.$id,
          text: inputMessage,
          sender: "You",
          timestamp: new Date().toLocaleString(),
        },
      ]);

      setInputMessage("");

      // Update status to "In Progress" if admin hasn't replied yet
      if (selectedConversation.status === "pending") {
        await databases.updateDocument(
          config.databaseId,
          config.contactIssues,
          selectedConversation.$id,
          { status: "In Progress" }
        );
        setSelectedConversation({
          ...selectedConversation,
          status: "In Progress",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableOpacity
        onPress={() => router.push("/user/profile")}
        style={styles.backButton}
      >
        <Image source={icons.back} style={styles.backIcon} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.headerText}>{t("mheader")}</Text>
        <Text style={styles.subHeaderText}>{t("msheader")}</Text>
        {/* Inquiry Boxes */}

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.$id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                selectedConversation?.$id === item.$id && styles.selectedCard,
              ]}
              onPress={() => handleSelectConversation(item)}
            >
              <Text style={styles.issueLabel}>Issue:</Text>
              <Text> {t(item.issueType)}</Text>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.image} />
              )}
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
              {/* Status Pill */}
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

        {/* Conversation Section */}
        {selectedConversation && (
          <View style={styles.overlay}>
            <ScrollView style={styles.chatContainer}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.message,
                      msg.sender === "You"
                        ? styles.userMessage
                        : styles.adminMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.text}</Text>
                    <Text style={styles.timestamp}>{msg.timestamp}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={inputMessage}
                onChangeText={setInputMessage}
              />
              <Button title="Send" onPress={handleSendMessage} />
            </View>
            {/* Floating Close Button */}
            <TouchableOpacity
              style={styles.floatingCloseButton}
              onPress={() => setSelectedConversation(null)}
            >
              <Text style={styles.floatingCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    paddingTop: 50,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
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
    fontSize: 17,
  },
  issueLabel: {
    fontSize: 20,
    fontWeight: "bold",
  },

  image: {
    width: 50,
    height: 50,
    marginTop: 5,
    borderRadius: 5,
    alignSelf: "center",
  },
  description: {
    fontSize: 17,
    color: "#333",
    marginTop: 5,
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
  statusContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 5,
  },
  message: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "80%",
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  userMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  adminMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 10,
    color: "gray",
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
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
  backButton: {
    position: "absolute",
    top: 50,
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
});
