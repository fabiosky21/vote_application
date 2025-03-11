import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";

const FAQScreen = () => {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const router = useRouter();

  const faqs = [
    { question: t("faq_how_to_vote"), answer: t("faq_how_to_vote_answer") },
    { question: t("faq_change_vote"), answer: t("faq_change_vote_answer") },
    { question: t("faq_new_polls"), answer: t("faq_new_polls_answer") },
    { question: t("faq_view_results"), answer: t("faq_view_results_answer") },
    {
      question: t("faq_anonymous_vote"),
      answer: t("faq_anonymous_vote_answer"),
    },
    {
      question: t("faq_change_language"),
      answer: t("faq_change_language_answer"),
    },
    {
      question: t("faq_who_creates_polls"),
      answer: t("faq_who_creates_polls_answer"),
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <TouchableOpacity
          onPress={() => router.push("/user/profile")}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.header}>{t("faq_title")}</Text>

        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleExpand(index)}
            style={styles.faqItem}
          >
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#007AFF"
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 10,
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
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    marginTop: 30,
  },
  faqItem: {
    backgroundColor: "#F9F9F9",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
  },
  answer: {
    fontSize: 14,
    marginTop: 8,
    color: "#555",
  },
});
