import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_KEY = "d5880409f0bc4ee0b26f737b428b0141"; // Replace with your News API key
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=Ireland&category&apiKey=${API_KEY}`;

interface Article {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
}

const NewsBox = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(NEWS_API_URL);
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {articles.map((article, index) => (
          <View key={index} style={styles.articleContainer}>
            {article.urlToImage && (
              <Image
                source={{ uri: article.urlToImage }}
                style={styles.image}
              />
            )}
            <Text style={styles.title}>{article.title}</Text>
            <Text style={styles.description}>{article.description}</Text>
          </View>
        ))}
      </ScrollView>
      {currentIndex > 0 && (
        <TouchableOpacity
          style={[styles.arrow, styles.leftArrow]}
          onPress={() => {
            setCurrentIndex(currentIndex - 1);
            scrollViewRef.current?.scrollTo({
              x: (currentIndex - 1) * width,
              animated: true,
            });
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      )}
      {currentIndex < articles.length - 1 && (
        <TouchableOpacity
          style={[styles.arrow, styles.rightArrow]}
          onPress={() => {
            setCurrentIndex(currentIndex + 1);
            scrollViewRef.current?.scrollTo({
              x: (currentIndex + 1) * width,
              animated: true,
            });
          }}
        >
          <Ionicons name="arrow-forward" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  articleContainer: {
    width: width - 30,
    height: 350,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  arrow: {
    position: "absolute",
    top: "50%",
    zIndex: 1,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
});

export default NewsBox;
