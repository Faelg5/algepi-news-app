import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "nativewind";
import { useQuery } from "react-query";
import { fetchBreakingNews, fetchRecommendedNews } from "../../utils/NewsApi";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
import { useFonts } from "expo-font";
import { VictoryPie, VictoryTooltip, VictoryLegend } from "victory-native";
import InfoButton from "../components/InfoButton";

const API_KEY =
  "sk-algepi-news-1-t5Tl89Dkq27JBkBK3SivT3BlbkFJMgX0jaTTQVYkfrUaGf59";
const API_URL = "https://api.openai.com/v1/chat/completions";

const sources = [
  { label: "News API", value: "newsApi" },
  { label: "Google News", value: "googleNews" },
];

export default function AIGuideScreen() {
  const [source, setSource] = useState("newsapi");
  const [newsWithSentiments, setNewsWithSentiments] = useState([]);
  const [summaryData, setSummaryData] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
    other: 0,
  });

  const analyzeNewsSentiments = async (articles) => {
    let totalPositive = 0;
    let totalNeutral = 0;
    let totalNegative = 0;
    let totalOther = 0;

    const analyzedNews = await Promise.all(
      articles.map(async (article) => {
        const positive = Math.random() * 100;
        const neutral = Math.random() * 20;
        const negative = Math.random() * 10;
        const other = Math.random() * 10;

        totalPositive += positive;
        totalNeutral += neutral;
        totalNegative += negative;
        totalOther += other;

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
    setSummaryData({
      positive: totalPositive,
      neutral: totalNeutral,
      negative: totalNegative,
      other: totalOther,
    });
  };

  const fetchNews = async () => {
    if (source === "newsapi") {
      const { data: breakingNews } = await fetchBreakingNews();
      analyzeNewsSentiments(breakingNews.articles);
    } else if (source === "anotherNewsSource") {
      const { data: recommendedNews } = await fetchRecommendedNews();
      analyzeNewsSentiments(recommendedNews.articles);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [source]);

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskMedium: require("../fonts/SpaceGrotesk-Medium.ttf"),
    SpaceGroteskSemibold: require("../fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../fonts/SpaceGrotesk-Bold.ttf"),
  });

  useEffect(() => {
    console.log("Fonts loaded:", fontsLoaded);
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError]);

  const { isLoading: isBreakingLoading, data: breakingNews } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: fetchBreakingNews,
    onSuccess: (data) => {
      analyzeNewsSentiments(data.articles);
    },
    onError: (error) => {
      console.error("Error fetching breaking news:", error);
    },
  });

  const { isLoading: isRecommendedLoading, data: recommendedNews } = useQuery({
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

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <Header />


      {isLoading ? (
        <Loading />
      ) : (
        <View style={styles.articlesContainer} className={colorScheme === "dark" ? "bg-black" : "bg-white"}>
          <MiniHeader label="Reasons - Overview" explanation="This graph shows the top factors that affect the current set of news."/>
          <Text style={styles.subTitle}>Reveal the top reasons behind recommendations
          </Text>
          {/* <InfoButton label="This chart shows the percentage of each factor that influences the recommendation of the news article." /> */}

          <View style={styles.pieChartContainer} className=" dark:">
            <VictoryPie
              data={[
                { x: "Positive", y: summaryData.positive },
                { x: "Neutral", y: summaryData.neutral },
                { x: "Negative", y: summaryData.negative },
                { x: "Other", y: summaryData.other },
              ]}
              labels={({ datum }) => `${datum.x}: ${datum.y.toFixed(2)}`}
              labelComponent={<VictoryTooltip />}
              colorScale={["#4caf50", "#ffeb3b", "#f44336", "#2196f3"]}
              width={150}
              height={150}
              style={{
                labels: { fontSize: 12, padding: 10 },
                parent: { justifyContent: "center", alignItems: "center" },
              }}
            />
            <VictoryLegend
              x={10}
              y={0}
              height={50}
              orientation="horizontal"
              gutter={10}
              // title="Categories:"
              data={[
                { name: "User Preferences", symbol: { fill: "#4caf50" } },
                { name: "Content Similarity", symbol: { fill: "#ffeb3b" } },
                { name: "User Behavior", symbol: { fill: "#f44336" } },
                { name: "Other", symbol: { fill: "#2196f3" } },
              ]}
              style={{
                labels: { fontSize: 12 },
              }}
            />
          </View>
          <MiniHeader label="Top Reasons by News Item" />

          {newsWithSentiments.map((article, index) => (
            <ScrollView className={colorScheme === "dark" ? "bg-black" : "bg-white"}>
              <View key={index} style={styles.row} className={colorScheme === "dark" ? "bg-black" : "bg-white"}>
                <View style={styles.column} className={colorScheme === "dark" ? "bg-black" : "bg-white"} >
                  <VictoryPie
                    data={[
                      { x: "Positive", y: article.positive },
                      { x: "Neutral", y: article.neutral },
                      { x: "Negative", y: article.negative },
                      { x: "Other", y: article.other },
                    ]}
                    labels={({ datum }) => `${datum.x}: ${datum.y.toFixed(2)}`}
                    labelComponent={<VictoryTooltip />}
                    colorScale={["#4caf50", "#ffeb3b", "#f44336", "#2196f3"]}
                    width={150}
                    height={120}
                    style={{
                      labels: { fontSize: 10, padding: 5 },
                      parent: {
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10
                      },
                    }}
                  />
                </View>
                <View style={styles.wideColumn} className={colorScheme === "dark" ? "bg-black" : "bg-white"}>
                  <Text style={{ fontWeight: "bold" }} className={colorScheme === "dark" ? "text-white" : "text-black"} >{article.title}</Text>
                </View>
              </View>
            </ScrollView>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
    marginVertical: 2,
    alignItems: "center",
    backgroundColor: "veryLightGray",
    borderColor: "black",
    borderRadius: 10,
    margin: 10,
  },
  wideColumn: {
    flex: 2,
    alignItems: "center",
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  pieChartContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "lightgray",
    margin: 10,
    padding: 5,
    borderRadius: 10,
    zIndex: 1, // Ensure chart container is above the bubble
  },
  picker: {
    flex: 1,
    height: 50,
    width: 200,
  },
  subTitle: {
    marginLeft: 15,
    marginBottom: 10,
    zIndex: 2, // Ensure text is above the bubble
    position: 'relative', // Ensure text respects its own stacking context
  },
});