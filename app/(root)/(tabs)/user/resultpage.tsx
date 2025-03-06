import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { PieChart } from "react-native-chart-kit";
import { getPollResults } from "@/lib/appwrite";

const ResultPage = () => {
  interface PollResult {
    id: string;
    title: string;
    yesVotes: number;
    noVotes: number;
    status: string;
  }

  const [pollResults, setPollResults] = useState<PollResult[]>([]);

  useEffect(() => {
    const fetchPollResults = async () => {
      try {
        const results = (await getPollResults()) as PollResult[];
        setPollResults(results);
      } catch (error) {
        console.error("Error fetching poll results:", error);
      }
    };

    fetchPollResults();
  }, []);

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
        name: "Yes",
        population: poll.yesVotes,
        color: "#4CAF50",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "No",
        population: poll.noVotes,
        color: "#F44336",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];

    return (
      <View key={poll.id} style={styles.chartContainer}>
        <Text style={styles.title}>{poll.title}</Text>
        <PieChart
          data={data}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <Text style={styles.resultText}>
          {poll.status === "approved"
            ? "Approved"
            : poll.status === "rejected"
            ? "Rejected"
            : "Active"}
        </Text>
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
  scrollViewContent: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 60,
  },
  chartContainer: {
    backgroundColor: "#E0E0E0",
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: Dimensions.get("window").width - 60, // Adjust width to make the box smaller
    alignSelf: "center", // Center the box horizontally
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
});
