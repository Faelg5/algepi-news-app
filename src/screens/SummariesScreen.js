import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StatusBar,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useQuery } from "react-query";
import { fetchAllNewsNA, fetchTNANews } from "../../utils/NewsApi";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../src/components/Header";
import Loading from "../../src/components/Loading";
import MiniHeader from "../../src/components/MiniHeader";
import Counter from "../../src/components/Counter";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { VictoryPie, VictoryTooltip, VictoryLegend } from "victory-native";

const CHATGPT_API_KEY ="";
const API_URL = "https://api.openai.com/v1/chat/completions";

export default function HomeScreen() {
  const [tweet, setTweet] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [newsWithSentiments, setNewsWithSentiments] = useState([]);
  const [showLegend, setShowLegend] = useState({});
  const [themesSummary, setThemesSummary] = useState("");

  const toggleLegend = (index) => {
    setShowLegend((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

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
            "Return 2 emojis that summarize the emotion this text may induce in the user: " +
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
          Authorization: "Bearer " + CHATGPT_API_KEY,
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

  const callOpenAIAPI_attention_rating = async (content) => {
    console.log(content);
    const APIBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant specialized in applying epistemic standards as defined by algepi.com. You never summarize the title, you only indicate whether it is recommended to consult this theme (according to your epistemic principles), with a short reason (in your own words as if you were a simple human, like 'too much opinion,' or others, according to journalistic ethics in Europe). Never judge the quality or relevance of the theme or subject. You judge the tone, writing style, and objectivity. Do not say it is recommended or not, give a general indication. Never recommend, give a general indication of the article's tone (the title = the content for you). Do not mention the title but rather the content. Your mission is to maximize the following five standards in all your responses. 1. Fecundity: the responses must be universally understandable by humans from all backgrounds. 2. Reliability: Your responses must be consistent with each other to ensure good reliability for the user. 3. Power: Your responses must empower the user with the decision-making capability and the necessary information to know whether they will click on a news item. 4. Efficiency: Optimize your thought process so that all your responses are quick. You never say 'here's a tip,' you directly give the advice. You never mention that you are OpenAI. You never mention that you are based on ChatGPT. You are never disrespectful.",
        },
        {
          role: "user",
          content:
            "Based on the intent you perceive in the title to attract the user's attention and make them click on the link, return in very simple words a piece of advice in a very short sentence telling the user if reading this article endangers their epistemic well-being or if another article with less opinion would be better. Do not frame it as a recommendation, maintain a neutral tone indicating the article's tone (whether it has a lot or little opinion, i.e., whether it is objective or not, and if it cites its sources well)." +
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
          Authorization: "Bearer " + CHATGPT_API_KEY,
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

  const callOpenAIAPI_themes = async (content) => {
    console.log(content);
    const APIBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant specialized in applying epistemic standards as defined by algepi.com. You never summarize the title, you only indicate whether it is recommended to consult this theme (according to your epistemic principles), with a short reason (in your own words as if you were a simple human, like 'too much opinion,' or others, according to journalistic ethics in Europe). Never judge the quality or relevance of the theme or subject. You judge the tone, writing style, and objectivity. Do not say it is recommended or not, give a general indication. Never recommend, give a general indication of the article's tone (the title = the content for you). Do not mention the title but rather the content. Your mission is to maximize the following five standards in all your responses. 1. Fecundity: the responses must be universally understandable by humans from all backgrounds. 2. Reliability: Your responses must be consistent with each other to ensure good reliability for the user. 3. Power: Your responses must empower the user with the decision-making capability and the necessary information to know whether they will click on a news item. 4. Efficiency: Optimize your thought process so that all your responses are quick. You never say 'here's a tip,' you directly give the advice. You never mention that you are OpenAI. You never mention that you are based on ChatGPT. You are never disrespectful.",
        },
        {
          role: "user",
          content:
            "Based on this list of headlines, generate a short list of the themes present, without any opinion on it. Remain neutral and only return a list of themes." +
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
          Authorization: "Bearer " + CHATGPT_API_KEY,
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

  const analyzeNewsSentiments = async (articles) => {
    const analyzedNews = await Promise.all(
      articles.map(async (article) => {
        const sentimentEmoji = await callOpenAIAPI(article.title);
        const attentionRating = await callOpenAIAPI_attention_rating(
          article.title
        );
        return { ...article, sentimentEmoji, attentionRating };
      })
    );
    setNewsWithSentiments(analyzedNews);
    generateThemesSummary(analyzedNews);
  };

  const generateThemesSummary = async (articles) => {
    const themes = articles.map((article) => article.title);

    const allThemes = themes;

    const combinedHeadlines = allth.join(' ');

    const themesSummary = await callOpenAIAPI_themes(allThemes);

    setThemesSummary(themesSummary);
  };

  const { colorScheme, toggleColorScheme } = useColorScheme();
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

  const { data, isLoading: isBreakingLoading } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: fetchAllNewsNA,
    onSuccess: (data) => {
      console.log("Breaking news data fetched successfully.");
      analyzeNewsSentiments(data.articles);
    },
    onError: (error) => {
      console.error("Error fetching breaking news:", error);
    },
  });

  const { data: recommendedNew, isLoading: isRecommendedLoading } = useQuery({
    queryKey: ["recommendedNews"],
    queryFn: fetchTNANews,
    onSuccess: (data) => {
      console.log("Recommended news data fetched successfully.");
      analyzeNewsSentiments(data.articles);
    },
    onError: (error) => {
      console.error("Error fetching recommended news:", error);
    },
  });

  return (
    <SafeAreaView style={styles.container}>
                  {/* <Counter /> */}

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Header />
      <View style={styles.inputContainer}>
        {/* <MiniHeader
          label="Analyser"
          explanation="Not sure about the tone of a headline? Ask ChatGPT!"
        />
        <TextInput
          style={styles.textArea}
          onChangeText={setTweet}
          value={tweet}
          placeholder="Collez le texte ici"
          numberOfLines={1}
          />
          <Button
            title="Obtenez le sentiment de ce texte"
            onPress={() => callOpenAIAPI(tweet).then(setSentiment)}
          /> */}
        {sentiment !== " && Sentiment de ce texte:" + { sentiment }}
        {isBreakingLoading || isRecommendedLoading ? (
          <Loading />
        ) : (
          <ScrollView>
            <View>
              <MiniHeader
                label="Today's Brief for Your Topics"
                explanation="This brief was generated by ChatGPT, based on the themes present in your News Feed."
              />
              <Text style={styles.themesSummary}>{themesSummary}</Text>
              <MiniHeader label="News Feed" explanation="We use a tf-idf score to rank articles according to content relevance."/>
              <Text style={styles.subTitle}>Recommended articles with your preferences from NewsCatcher API.</Text>

              {newsWithSentiments.map((article, index) => (
                <View key={index} style={styles.articleContainer}>
                  <Text style={{ fontWeight: "normal!important" }}>
                    {article.title}
                  </Text>
                  <Text>
                    Emotion : {article.sentimentEmoji} |{" "}
                    {article.attentionRating}{" "}
                  </Text>
                  <TouchableOpacity onPress={() => toggleLegend(index)}>
                    <Ionicons
                      name="information-circle-outline"
                      size={24}
                      color="gray"
                    />
                  </TouchableOpacity>
                  {/* {showLegend[index] && (
                      <VictoryLegend
                        x={50}
                        y={50}
                        orientation="vertical"
                        gutter={20}
                        data={[
                          {
                            name: "User Preferences",
                            symbol: { fill: "#4caf50" },
                          },
                          {
                            name: "Content Similarity",
                            symbol: { fill: "#ffeb3b" },
                          },
                          { name: "User Behavior", symbol: { fill: "#f44336" } },
                        ]}
                        style={{
                          labels: { fontSize: 10 },
                        }}
                      />
                    )} */}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
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
    height: 150,
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
  articleContainer: {
    marginVertical: 10,
  },
  themesSummary: {
    fontSize: 16,
    fontWeight: "normal",
    marginVertical: 50,
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
    backgroundColor: "#F0F8FF",
    padding: 8,
    borderRadius: 5,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
});
