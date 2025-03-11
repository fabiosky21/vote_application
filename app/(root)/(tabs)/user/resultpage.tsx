import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { PieChart } from "react-native-chart-kit";
import { getPollResults } from "@/lib/appwrite";
import { useTranslation } from "react-i18next"; 
import images from "@/constants/images";

const ResultPage = () => {
  const { t, i18n } = useTranslation(); //  Initialize translations

  interface PollResult {
    id: string;
    title: string;
    yesVotes: number;
    noVotes: number;
    status: string;
  }

  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPollResults = async () => {
    try {
      setRefreshing(true);
      const results = (await getPollResults()) as PollResult[];

      //  Translate titles before setting state
      const translatedResults = await Promise.all(
        results.map(async (poll) => ({
          ...poll,
          title: await translateText(poll.title, i18n.language),
        }))
      );

      setPollResults(translatedResults);
    } catch (error) {
      console.error("Error fetching poll results:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPollResults();
  }, [i18n.language]);

  const onRefresh = () => {
    fetchPollResults();
  };
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

  interface ChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }

  const renderChart = ({ item: poll }: { item: PollResult }) => {
    const data: ChartData[] = [
      {
        name: t("yes"),
        population: poll.yesVotes,
        color: "#4CAF50",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: t("no"),
        population: poll.noVotes,
        color: "#F44336",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];

    //  Translates poll status dynamically
    const translatedStatus =
      poll.status === "approved"
        ? t("status_approved")
        : poll.status === "rejected"
        ? t("status_rejected")
        : t("status_active");

    return (
      <View key={poll.id} style={styles.chartContainer}>
        <Text style={styles.title}>{poll.title}</Text>
        <PieChart
          data={data}
          width={Dimensions.get("window").width - 40}
          height={150}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <Text style={styles.resultText}>{translatedStatus}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pollResults}
        renderItem={renderChart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.mainText}>{t("poll_results")}</Text>
            <Text style={styles.subText}>{t("poll_result_description")}</Text>
            <Image source={images.collectionvoted} style={styles.boximage} />
          </>
        }
        ListFooterComponent={
          <Text style={styles.footer}>{t("poll_footer_message")}</Text>
          
        }
      />
    </SafeAreaView>
  );
};

export default ResultPage;

const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  mainText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 60,
  },
  chartContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 11,
    elevation: 5,
    width: Dimensions.get("window").width - 90,
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    
  },
  resultText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 10,
  },
  footer: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#000",
  },
  subText: {
    fontSize: 20,
    
    textAlign: "center",
    marginBottom: 20,
  },
  boximage: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
  },
});

