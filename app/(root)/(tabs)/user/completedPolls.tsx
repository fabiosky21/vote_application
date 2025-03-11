import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react"; 
import { Ionicons } from "@expo/vector-icons";
import { useVotedPolls } from "@/context/VotedPollsContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next"; 
import images from "@/constants/images"; 

type Poll = {
  id: string;
  title: string;
  description: string;
  image: string;
};

const CompletedPolls = () => {
  const { votedPolls, refreshVotedPolls } = useVotedPolls();
  const [refreshing, setRefreshing] = useState(false);
  const { t, i18n } = useTranslation(); 

  const [translatedPolls, setTranslatedPolls] = useState<Poll[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVotedPolls();
    setRefreshing(false);
  };

  useEffect(() => {
    refreshVotedPolls();
  }, []);

  useEffect(() => {
    const translatePolls = async () => {
      const translated = await Promise.all(
        votedPolls.map(async (poll) => ({
          ...poll,
          title: await translateText(poll.title, i18n.language),
          description: await translateText(poll.description, i18n.language),
        }))
      );
      setTranslatedPolls(translated);
    };

    translatePolls();
  }, [i18n.language, votedPolls]);

  const translateText = async (text: string, targetLang: string) => {
    if (!text) return text;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      return result[0]?.[0]?.[0] || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const renderItem = ({ item }: { item: Poll }) => (
    <View style={styles.pollContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.contentContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.votedContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#28a745" />
          <Text style={styles.votedText}>{t("voted")}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={translatedPolls} //translated polls
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.mainText}>{t("poll_results2")}</Text>
            <View style={styles.customUnderline} />
            <Image source={images.insidevote} style={styles.boximage} />
          </>
        }
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
  mainText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 20,
  },
  customUnderline: {
    width: "100%", //  Adjust line width
    height: 2, //  Line thickness
    backgroundColor: "black", //  Line color
    marginTop: -2, //  Space between text and line
  },
  boximage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
});
