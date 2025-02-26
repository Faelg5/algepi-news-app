import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useQuery } from "react-query";
import { fetchBreakingNews, fetchRecommendedNews } from "../../utils/NewsApi";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
import Counter from "../../src/components/Counter";
import { ColorList } from "../constants/colors";

import { useFonts } from "expo-font";
import Heatmap from "../components/Heatmap";
import { UserPreferencesContext } from "../../App"; // Import context


const NEWS_API_ORG_API_KEY = ""

const API_URL = "https://api.openai.com/v1/chat/completions";

const callOpenAIAPI = async (content) => {
  const APIBody = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant specialized in applying epistemic standards as defined by algepi.com. Your mission is to maximize the following five standards in all your responses. 1. Fecundity: the responses must be universally understandable by humans from all backgrounds. 2. Reliability: Your responses must be consistent with each other to ensure good reliability for the user. 3. Power: Your responses must empower the user with the decision-making capability and the necessary information to know whether they will click on a news item. 4. Efficiency: Optimize your thought process so that all your responses are quick. You never say 'here's a tip,' you directly give the advice. You never mention that you are OpenAI. You never mention that you are based on ChatGPT. You are never disrespectful.",
      },
      {
        role: "user",
        content:
          "Return a summary of the given text with the most neutral tone you can, never include the word summary or similar in it: " +
          content,
      },
    ],
    max_tokens: 60,
    temperature: 0,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + NEWS_API_ORG_API_KEY,
      },
      body: JSON.stringify(APIBody),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    return data.choices && data.choices.length > 0
      ? data.choices[0].message.content.trim()
      : "❓";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "❓";
  }
};

const sources = [
  { label: "News API", value: "newsApi" },
  { label: "Google News", value: "googleNews" },
];

export default function FeedScreen() {
  const { userPreferences } = useContext(UserPreferencesContext); // Use context to get user preferences
  const [source, setSource] = useState("newsapi");
  const [newsWithSentiments, setNewsWithSentiments] = useState([]);
  const [newsWithSummaries, setNewsWithSummaries] = useState([]);
  const [expandedHeatmapIndex, setExpandedHeatmapIndex] = useState(null);
  const [showSummaries, setShowSummaries] = useState(false);

  const analyzeNewsSentiments = async (articles) => {
    const analyzedNews = await Promise.all(
      articles.map((article) => {
        const positive = Math.random() * 100;
        const neutral = Math.random() * 100;
        const negative = Math.random() * 100;
        const other = Math.random() * 50;

        return {
          ...article,
          positive,
          neutral,
          negative,
          other,
        };
      })
    );

    setNewsWithSentiments(analyzedNews);
  };

  const fetchNews = async () => {
    let response;
    if (source === "newsApi") {
      response = await fetchBreakingNews();
    } else if (source === "googleNews") {
      response = await fetchRecommendedNews();
    }

    if (response) {
      analyzeNewsSentiments(response.articles);
      generateSummaries(response.articles);
    }
  };

  const generateSummaries = async (articles) => {
    const summarizedNews = await Promise.all(
      articles.map(async (article) => {
        const summary = await callOpenAIAPI(article.title);
        return {
          ...article,
          summary,
        };
      })
    );
    setNewsWithSummaries(summarizedNews);
  };

  const calculateAverages = () => {
    if (newsWithSentiments.length === 0)
      return { positive: 0, neutral: 0, negative: 0, other: 0 };

    const total = newsWithSentiments.reduce(
      (acc, article) => {
        acc.positive += article.positive;
        acc.neutral += article.neutral;
        acc.negative += article.negative;
        acc.other += article.other;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0, other: 0 }
    );

    return {
      positive: total.positive / newsWithSentiments.length,
      neutral: total.neutral / newsWithSentiments.length,
      negative: total.negative / newsWithSentiments.length,
      other: total.other / newsWithSentiments.length,
    };
  };

  useEffect(() => {
    fetchNews();
  }, [source]);

  useEffect(() => {
    if (showSummaries) {
      generateSummaries(newsWithSentiments);
    } else {
      fetchNews();
    }
  }, [showSummaries]);

  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    RobotoMedium: require("../fonts/RobotoFont/static/Roboto-Medium.ttf"),

    RobotoSemibold: require("../fonts/RobotoFont/static/Roboto-SemiBold.ttf"),

    RobotoBold: require("../fonts/RobotoFont/static/Roboto-Bold.ttf"),
  });

  useEffect(() => {
    console.log("Fonts loaded:", fontsLoaded);
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError]);

  const { isLoading: isBreakingLoading, data: breakingNewsData } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: fetchBreakingNews,
    onSuccess: (data) => {
      analyzeNewsSentiments(data.articles);
    },
    onError: (error) => {
      console.error("Error fetching breaking news:", error);
    },
  });

  const { isLoading: isRecommendedLoading, data: recommendedNewsData } =
    useQuery({
      queryKey: ["recommendedNews"],
      queryFn: fetchRecommendedNews,
      onSuccess: (data) => {
        analyzeNewsSentiments(data.articles);
      },
      onError: (error) => {
        console.error("Error fetching recommended news:", error);
      },
    });

  const gimmickAverages = {
    positive: Math.random() * 100,
    neutral: Math.random() * 100,
    negative: Math.random() * 100,
    other: Math.random() * 100,
  };

  const isLoading = isBreakingLoading || isRecommendedLoading;

  const displayedNews = showSummaries ? newsWithSummaries : newsWithSentiments;
  const averages = calculateAverages();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Header />

      <View style={styles.preferencesContainer}>
        <Text style={styles.subTitle}>Your selected topics:</Text>
        {userPreferences.length > 0 ? (
          <View style={styles.themesContainer}>
            {userPreferences.map((topic, index) => (
              <Text key={index} style={styles.themeText}>
                {topic}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.noPreferencesText}>No topics selected</Text>
        )}
      </View>

      {isLoading ? (
        <Loading />
      ) : (
        <View
          style={styles.articlesContainer}
          className={colorScheme === "dark" ? "bg-black" : "bg-white"}
        >
          <MiniHeader
            label="Feed overview"
            explanation="Average of the top reasons behind your recommended news items."
          />
          <Text style={styles.subTitle}>
            Top reasons behind currently recommended news items:
          </Text>

          <View
            style={styles.heatmapChartContainer}
            className={colorScheme === "dark" ? "bg-black" : "bg-white"}
          >
            <Heatmap
              data={[
                { value: gimmickAverages.positive },
                { value: gimmickAverages.neutral },
                { value: gimmickAverages.negative },
                { value: gimmickAverages.other },
              ]}
            />
          </View>

          <View style={styles.legendContainer}>
            <Text style={styles.legendText}>Impact:</Text>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColorBox, { backgroundColor: "#deebf7" }]}
              ></View>
              <Text style={styles.legendLabel}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColorBox, { backgroundColor: "#9ecae1" }]}
              ></View>
              <Text style={styles.legendLabel}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColorBox, { backgroundColor: "#3182bd" }]}
              ></View>
              <Text style={styles.legendLabel}>High</Text>
            </View>
          </View>

          <MiniHeader
            label="News Feed"
            explanation="Data from NewsAPI.org, summary by ChatGPT. Learn more here."
          />
          <Text style={styles.subTitle}>Recommended articles in the USA from NewsAPI.org.</Text>
          <Text></Text>
          <View style={styles.toggleButtonContainer}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowSummaries(!showSummaries)}
            >
              <Text style={styles.toggleButtonText}>
                {showSummaries
                  ? "📝 Show Original Titles"
                  : "🤖 Neutralize Tone"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.subHeader}>
              {showSummaries
                ? "Showing neutralized titles:"
                : "Showing original titles:"}
            </Text>
          </View>

          <ScrollView
            className={colorScheme === "dark" ? "bg-black" : "bg-white"}
          >
            {displayedNews.map((article, index) => (
              <View
                key={index}
                style={[styles.row, { alignContent: "center" }]}
                className={colorScheme === "dark" ? "bg-black" : "bg-gray"}
              >
                <View
                  style={styles.wideColumn}
                  className={colorScheme === "dark" ? "bg-black" : "bg-white"}
                >
                  <Text
                    style={{
                      fontWeight: showSummaries ? "normal" : "bold",
                      marginTop: 10,
                    }}
                    className={
                      colorScheme === "dark" ? "text-white" : "text-black"
                    }
                  >
                    {showSummaries ? article.summary : article.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedHeatmapIndex(
                        expandedHeatmapIndex === index ? null : index
                      )
                    }
                  >
                    <View
                      style={{
                        height: expandedHeatmapIndex === index ? 50 : 10,
                        width: "100%",
                      }}
                    >
                      <Heatmap
                        data={[
                          { value: article.positive },
                          { value: article.neutral },
                          { value: article.negative },
                          { value: article.other },
                        ]}
                        height={expandedHeatmapIndex === index ? 50 : 50} // Adjust height based on state
                        showValues={expandedHeatmapIndex === index} // Show values only if expanded
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Existing styles
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textArea: {
    height: 10,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  sentimentText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  articlesContainer: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "column",
    marginVertical: 2,
    alignItems: "center",
    borderColor: "black",
    borderRadius: 5,
    margin: 10,
  },
  wideColumn: {
    flex: 2,
    alignItems: "center",
    backgroundColor: ColorList.backgroundPrimary,
    padding: 8,
    borderRadius: 5,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  heatmapChartContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "#F0F8FF",
    margin: 10,
    marginTop: 20,
    padding: 5,
    borderRadius: 10,
    height: 100,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  legendColorBox: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 12,
  },
  subTitle: {
    marginLeft: 15,
  },
  subHeader: {
    marginTop: 10,
    marginLeft: 15,
    fontWeight: "bold",
  },
  toggleButtonContainer: {
    alignItems: "right",
    margin: 10,
    right: 0,
  },
  toggleButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 0,
    right: 0,
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
