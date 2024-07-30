import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Button,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useQuery } from "react-query";
import { fetchBreakingNews, fetchRecommendedNews } from "../../utils/NewsApi";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
// import { UserPreferencesContext } from "../../App"; // Import context
import { ColorList } from "../constants/colors";


const sources = [
  { label: "News API", value: "newsApi" },
  { label: "Google News", value: "googleNews" },
];

export default function FeedScreen({ navigation }) { // Add navigation prop
  // const { userPreferences } = useContext(UserPreferencesContext);
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
        const other = Math.random() * 20;

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

  const isLoading = isBreakingLoading || isRecommendedLoading;

  const displayedNews = showSummaries ? newsWithSummaries : newsWithSentiments;

  return (
    <SafeAreaView style={[styles.container]}>
      <Header />
      <Button title="Preferences" onPress={() => navigation.navigate("Preferences")} /> {/* Add button */}

      {/* <View style={styles.preferencesContainer}>
        <Text style={styles.subTitle}>Your selected themes:</Text>
        {userPreferences.length > 0 ? (
          <View style={styles.themesContainer}>
            {userPreferences.map((theme, index) => (
              <Text key={index} style={styles.themeText}>
                {theme}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.noPreferencesText}>No themes selected</Text>
        )}
      </View> */}

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

          <MiniHeader
            label="Recommended for you"
            explanation="Data from NewsAPI.org, summary by ChatGPT. Learn more here."
          />
          <Text style={styles.subTitle}>
            Articles in the USA from NewsAPI.org.
          </Text>

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
                  style={styles.column}
                  className={colorScheme === "dark" ? "bg-black" : "bg-white"}
                >
                  <Image
                    source={{ uri: article.urlToImage }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "cover",
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 5,
                    }}
                  />
                </View>
                <View
                  style={styles.wideColumn}
                  className={colorScheme === "dark" ? "bg-black" : "bg-white"}
                >
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedHeatmapIndex(
                        expandedHeatmapIndex === index ? null : index
                      )
                    }
                  >
                    <View
                      style={{
                        height: expandedHeatmapIndex === index ? 50 : 20,
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
                        height={expandedHeatmapIndex === index ? 50 : 30} // Adjust height based on state
                        showValues={expandedHeatmapIndex === index} // Show values only if expanded
                      />
                    </View>
                  </TouchableOpacity>
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
  preferencesContainer: {
    padding: 16,
    alignItems: "center",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  themesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  themeText: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: 8,
    borderRadius: 5,
    margin: 5,
  },
  noPreferencesText: {
    fontSize: 16,
    color: "#666",
  },
});
