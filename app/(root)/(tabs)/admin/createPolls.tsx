import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { createPoll } from "@/lib/appwrite";
import { ID } from "appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provider";

const CreatePolls = () => {
  const { user } = useGlobalContext();
  const [title, setTitle] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [image, setImage] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const handleCreatePoll = async () => {
    if (
      !title ||
      !briefDescription ||
      !fullDescription ||
      !image ||
      options.some((option) => !option)
    ) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const pollId = ID.unique();
      const pollData = {
        pollId,
        title,
        briefDescription,
        fullDescription,
        image,
        options,
        createdBy: user?.name || "AdminUser", // Use the current user's name
        status: "active",
        userId: user?.$id || "admin", // Use the current user's ID
      };

      await createPoll(pollData);
      Alert.alert("Poll created successfully!");
      // Clear the form
      setTitle("");
      setBriefDescription("");
      setFullDescription("");
      setImage("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Error creating poll:", error);
      Alert.alert("Failed to create poll.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Create a New Poll</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Brief Description"
          value={briefDescription}
          onChangeText={setBriefDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Full Description"
          value={fullDescription}
          onChangeText={setFullDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={image}
          onChangeText={setImage}
        />
        <Text style={styles.subHeader}>Options</Text>
        {options.map((option, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Option ${index + 1}`}
            value={option}
            onChangeText={(value) => handleOptionChange(index, value)}
          />
        ))}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Created By:</Text>
          <Text style={styles.infoValue}>{user?.name || "AdminUser"}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={styles.statusButton}>
            <Text style={styles.statusButtonText}>Active</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreatePoll}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Poll..." : "Create Poll"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePolls;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  scrollViewContent: {
    paddingBottom: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
  infoValue: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    paddingBottom: 2,
  },
  statusButton: {
    backgroundColor: "green",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  statusButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0061FF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
});
