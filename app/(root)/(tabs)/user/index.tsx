import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Video, ResizeMode } from "expo-av";
import video from "@/constants/video";
import { useGlobalContext } from "@/lib/global-provider";
import NewsBox from "@/components/newsBox";
import PollBox from "@/components/PollBox";
import { SafeAreaView,  } from "react-native-safe-area-context";
import { databases, config } from "@/lib/appwrite";

import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import gif from "@/constants/gif";

type Poll = {
  $id: string;
  title: string;
  briefDescription: string;
  fullDescription: string;
  image: string;
  options: string[];
  createdBy: string;
  status: string;
};

const Index = () => {
  const { user } = useGlobalContext();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    console.log("User object:", user);
    fetchPolls();
  }, [user]);

  const fetchPolls = async () => {
    try {
      console.log("Fetching polls...");
      const response = await databases.listDocuments(
        config.databaseId,
        config.pollscollection
      );
      const pollsData: Poll[] = response.documents.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        briefDescription: doc.briefDescription,
        fullDescription: doc.fullDescription,
        image: doc.image,
        options: doc.options,
        createdBy: doc.createdBy,
        status: doc.status,
      }));
      setPolls(pollsData);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("Refreshing...");
    await fetchPolls();
    setVideoKey((prevKey) => prevKey + 1);
    setRefreshing(false);
  };
  return (

    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={styles.ScrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={{
                uri: user?.avatar || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>{t("welcome")},</Text>
              <Text style={styles.userName}>{user?.name || t("guest")}!</Text>
            </View>
          </View>
          <Image source={gif.ex1} style={styles.gif} />

          <Video
            key={videoKey}
            source={video.video12}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            style={styles.video}
          />
          <Text style={styles.headernews}>{t("newsInIreland")}</Text>

          <NewsBox />
          <Text style={styles.pollssect}>{t("activePolls")}</Text>
          {polls.map((poll) => (
            <PollBox
              key={poll.$id}
              pollId={poll.$id}
              title={poll.title}
              briefDescription={poll.briefDescription}
              fullDescription={poll.fullDescription}
              image={poll.image}
              options={poll.options}
              createdBy={poll.createdBy}
              status={poll.status}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    
  },
  ScrollViewContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 50,
    margin: 10,
    alignSelf: "flex-start",
  },
  headernews: {
    fontSize: 20,
    fontStyle: "italic",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#bec2b8",
    borderRadius: 20,
    margin: 10,
    alignSelf: "center",
  },
  pollssect: {
    fontSize: 20,
    fontStyle: "italic",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#bec2b8",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 25,
    margin: 10,
    alignSelf: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 16,
  },
  welcomeContainer: {
    flexDirection: "row",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#424242",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#424242",
  },
  video: {
    width: "90%",
    height: 200,
    marginBottom: 40,
    borderRadius: 40,
    marginLeft: 20,
  },
  gif: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    paddingTop: 10,
  },
});
