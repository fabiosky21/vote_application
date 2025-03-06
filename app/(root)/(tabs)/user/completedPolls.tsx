import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useVotedPolls } from "@/context/VotedPollsContext";
import { SafeAreaView } from "react-native-safe-area-context";

type Poll = {
  id: string;
  title: string;
  description: string;
  image: string;
};

const CompletedPolls = () => {
  const { votedPolls, refreshVotedPolls } = useVotedPolls();

  useEffect(() => {
    refreshVotedPolls();
  }, []);

  const renderItem = ({ item }: { item: Poll }) => (
    <View style={styles.pollContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.contentContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.votedContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#28a745" />
          <Text style={styles.votedText}>Voted</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={votedPolls}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default CompletedPolls;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 60,
  },
  pollContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 250,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  votedContainer: {
    alignItems: "center",
  },
  votedText: {
    color: "#28a745",
    fontWeight: "bold",
    marginTop: 4,
  },
});
