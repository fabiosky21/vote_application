import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  RefreshControl
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getPollResults, databases, config } from "@/lib/appwrite";


const ApproveorPolls = () => {
  interface PollResult {
    yesVotes: number;
    noVotes: number;
    title: string;
    id: string;
    status?: string; // Make status optional
  }

  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPollResults = async () => {
    try {
      const results: PollResult[] = await getPollResults();
      const resultsWithStatus = results.map(result => ({
        ...result,
        status: result.status || "active" // Default status if not provided
      }));
      setPollResults(resultsWithStatus);
    } catch (error) {
      console.error("Error fetching poll results:", error);
    }
  };

  useEffect(() => {
    fetchPollResults();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPollResults();
    setRefreshing(false);
  };

  const handleApprove = async (pollId: string): Promise<void> => {
    try {
      await databases.updateDocument(
        config.databaseId,
        config.pollscollection,
        pollId,
        { status: "approved" }
      );
      Alert.alert("Decision has been taken.");
      setPollResults((prevPollResults) =>
        prevPollResults.map((poll) =>
          poll.id === pollId ? { ...poll, status: "approved" } : poll
        )
      );
    } catch (error) {
      console.error("Error approving poll:", error);
      Alert.alert("Failed to approve poll.");
    }
  };

  const handleReject = async (pollId: string): Promise<void> => {
    try {
      await databases.updateDocument(
        config.databaseId,
        config.pollscollection,
        pollId,
        { status: "rejected" }
      );
      Alert.alert("Decision has been taken.");
      setPollResults((prevPollResults) =>
        prevPollResults.map((poll) =>
          poll.id === pollId ? { ...poll, status: "rejected" } : poll
        )
      );
    } catch (error) {
      console.error("Error rejecting poll:", error);
      Alert.alert("Failed to reject poll.");
    }
  };

  const renderChart = (poll: PollResult) => {
    const data = {
      labels: ["Yes", "No"],
      datasets: [
        {
          data: [poll.yesVotes || 0, poll.noVotes || 0],
        },
      ],
    };

    const totalVotes = (poll.yesVotes || 0) + (poll.noVotes || 0);

    return (
      <View key={poll.id} style={styles.chartContainer}>
        <Text style={styles.title}>{poll.title}</Text>
        <View style={styles.chartRow}>
          <View style={styles.voteCounts}>
            <Text style={styles.voteCountText}>Yes: {poll.yesVotes || 0}</Text>
            <Text style={styles.voteCountText}>No: {poll.noVotes || 0}</Text>
          </View>
          <BarChart
            data={data}
            width={Dimensions.get("window").width - 100} // Adjust width to fit the vote counts
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            showBarTops={false}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
        <Text style={styles.totalVotesText}>Total Votes: {totalVotes}</Text>
        {poll.status === "active" ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(poll.id)}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(poll.id)}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.decisionText}>Decision has been taken.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.container}>
          {pollResults.map((poll) => renderChart(poll))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApproveorPolls;

const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    width: Dimensions.get("window").width - 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteCounts: {
    marginRight: 10,
  },
  voteCountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalVotesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  decisionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
});
