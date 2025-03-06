import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { createVote, checkIfUserVoted, getCurrentUser } from "../lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useVotedPolls } from "@/context/VotedPollsContext";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";

interface PollBoxProps {
  pollId: string;
  title: string;
  briefDescription: string;
  fullDescription: string;
  image: string;
  options: string[];
  createdBy: string;
  status: string;
}

const PollBox: React.FC<PollBoxProps> = ({
  pollId,
  title,
  briefDescription,
  fullDescription,
  image,
  options,
  createdBy,
  status,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { user } = useGlobalContext();
  const [userId, setUserId] = useState<string | null>(null);
  const { refreshVotedPolls } = useVotedPolls();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserId(currentUser.$id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      checkVote();
    }
  }, [userId]);

  const checkVote = async () => {
    if (!userId) return;
    const voted = await checkIfUserVoted(userId, pollId);
    setHasVoted(voted);
  };

  const registerVoteInDatabase = async (
    correctPollId: string,
    option: string
  ) => {
    try {
      await createVote({
        userId: userId || "",
        pollId: correctPollId, // Use the correct poll ID
        selectedOption: option,
        date: new Date().toISOString(),
      });
      console.log("Vote registered in database with poll ID:", correctPollId);
      setHasVoted(true); // Prevent further votes
      refreshVotedPolls();
      Alert.alert("Vote registered successfully!");
    } catch (err) {
      console.error("Failed to register vote:", err);
    }
  };

  const handleVote = async (option: string) => {
    if (hasVoted) {
      Alert.alert("You cannot vote twice in the same poll.");
      return;
    }

    try {
      // Ensure we're using the correct existing poll ID
      const existingPolls = await databases.listDocuments(
        config.databaseId,
        config.pollscollection,
        [Query.equal("title", title)]
      );

      let correctPollId = pollId; // Default to the provided poll ID

      if (existingPolls.documents.length > 0) {
        correctPollId = existingPolls.documents[0].$id;
        console.log("Using existing poll ID:", correctPollId);
      }

      await registerVoteInDatabase(correctPollId, option);
      setHasVoted(true);
      refreshVotedPolls();
      Alert.alert("Vote registered!");
    } catch (error) {
      console.error("Error in handleVote:", error);
    }
  };

  return (
    <View
      style={[styles.container, status !== "active" && styles.decidedContainer]}
    >
      <Text style={styles.title}>{title}</Text>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <Text style={styles.briefDesc}>{briefDescription}</Text>

      {/* Read More Button */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.readMore}>Read More</Text>
      </TouchableOpacity>

      {status === "active" ? (
        <View style={styles.voteContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleVote(option)}
              style={styles.voteButton}
              disabled={hasVoted}
            >
              <Text style={styles.voteText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.decidedText}>
          The poll has been decided. Please direct to the result page.
        </Text>
      )}

      {/* Modal for Full Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{title}</Text>
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.fullDesc}>{fullDescription}</Text>
            <Text style={styles.infoText}>Poll ID: {pollId}</Text>
            <Text style={styles.infoText}>Created By: {createdBy}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{status}</Text>
            </View>

            <View style={styles.voteContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleVote(option)}
                  style={styles.voteButton}
                  disabled={hasVoted}
                >
                  <Text style={styles.voteText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PollBox;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  decidedContainer: {
    borderColor: "#FF0000",
    borderWidth: 2,
    opacity: 0.5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
  },
  briefDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  readMore: {
    color: "#007BFF",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  voteButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 40,
  },
  voteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  decidedText: {
    color: "#FF0000",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  fullDesc: {
    fontSize: 16,
    marginVertical: 10,
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
  },
  statusContainer: {
    backgroundColor: "#28a745",
    padding: 5,
    borderRadius: 5,
    marginVertical: 10,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
