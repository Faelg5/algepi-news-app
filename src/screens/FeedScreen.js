import React, { useState, useEffect, useContext, navigation } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useQuery } from "react-query";
import {
  fetchAllNewsNA,
  fetchRecommendedNews,
  fetchTNA,
} from "../../utils/NewsApi";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
import Counter from "../../src/components/Counter";
import { ColorList } from "../constants/colors";

import { useFonts } from "expo-font";
import Heatmap from "../components/Heatmap";
import { UserPreferencesContext } from "../../App"; // Import context
import { countries } from "./PreferencesScreen"; // Import countries list
import { TfIdf } from "../../utils/tfidf"; // Custom TF-IDF class
import styles from "../constants/styles";

import { Picker } from "@react-native-picker/picker";
import { heightPercentageToDP } from "react-native-responsive-screen";
const CHATGPT_API_KEY =
  "sk-algepi-news-1-t5Tl89Dkq27JBkBK3SivT3BlbkFJMgX0jaTTQVYkfrUaGf59";
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";


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
    const response = await fetch(CHATGPT_API_URL, {
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

const OpenAIThemeSummaryCall = async (content) => {
  // console.log("CONTENT:::");
  // console.log(content);
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
          "Your role is to simply return a list of terms. Select the terms in an objective, neutral and respectful way. Return only a list of words that summarize the themes in the given text, using only the terms listed here: tech, sports, politics, health, entertainment, food, travel. Never include a full sentence or something else than one of these specific terms I just mentioned, and commas. Here is the document to summarize:" +
          content,
      },
    ],
    max_tokens: 60,
    temperature: 0,
  };

  try {
    const response = await fetch(CHATGPT_API_URL, {
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
    // console.log("RESPONSE:JSON");
    // console.log(response);
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
  { label: "The News API", value: "theNewsApi" },
  { label: "Google News", value: "googleNews" },
];

const getCountryName = (countryCode) =>
  countries.find((country) => country.code === countryCode)?.name;
var currentCountryName;

export default function FeedScreen() {

  const { selectedThemes, selectedCountry } = useContext(
    UserPreferencesContext
  ); // Use context to get user preferences
  const [source, setSource] = useState("newsApi");
  const [newsData, setNewsData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // const [source, setSource] = useState("theNewsApi");
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
    setIsLoading(true);
    let response;
    console.log("using source: " + source);
    if (source === "newsApi") {
      response = await fetchAllNewsNA(
        selectedThemes.join("+"),
        selectedCountry
      ); // using OR operator to search for multiple themes
    } else if (source === "theNewsApi") {
      response = await fetchTNA(selectedCountry, selectedThemes.join(","));
    } else if (source === "googleNews") {
      response = await fetchRecommendedNews();
    }
    console.log("Fetching news from " + source + "...");

    currentCountryName = getCountryName(selectedCountry);
    console.log("Current language Name: " + currentCountryName);
    // console.log(response);
    console.log("Source: " + source);

    if (response) {
      let articles = [];
      console.log("RESPONSE:");
      console.log(response);


      if (source === "theNewsApi" && response.data) {
        articles = response.data.map((item) => ({
          author: item.source, // Assuming there's no author information in the original data
          content: item.snippet, // Using the snippet as the content
          description: item.description,
          publishedAt: item.published_at,
          source: { name: item.source },
          title: item.title,
          url: item.url,
          urlToImage: item.image_url,
        }));
        // setIsLoading(false); // Set isLoading to false after data is fetched

      } else if (response.data) {
        articles = response.data.articles;
        console.log("articles are now: ");
        console.log(articles);
        setNewsData(articles);
        // setIsLoading(false); // Set isLoading to false after data is fetched

      }

      console.log("full response is above ");
      console.log("country: " + selectedCountry);

      console.log("articles: ");
      console.log(articles);

      console.log("newsData is now:" + newsData);
      // setNewsWithSummaries(articles);
      summarizeThemesInArticles(articles);

      // analyzeNewsSentiments(articles);
      generateSummaries(articles);
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

  const summarizeThemesInArticles = async (articles) => {
    const summarizedThemesList = await Promise.all(
      articles.map(async (article) => {
        const summary = await OpenAIThemeSummaryCall(article.title); // get a summary of the article as a list of terms
        return {
          ...article,
          summary,
        };
        console.log(summary);
      })
    );
    // console.log("full list of each article with summary");
    // console.log(summarizedThemesList);
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

  comparePreferences = async (article) => {
    console.log("selected themes");
    console.log(selectedThemes);

    console.log("adding article: ");
    console.log(article);

    // Ensure aiSummary is resolved
    if (source === "theNewsApi") {
      article.aiSummary = await OpenAIThemeSummaryCall(article.description);
    } else if (source === "newsApi") {
      article.aiSummary = await OpenAIThemeSummaryCall(article.content);
    }
    const terms = selectedThemes;
    // console.log(terms);

    const scores = terms.map((term) => tfidf.tfidf(term, article.aiSummary));
    // console.log(tfidf);

    // Iterate over displayedNews and ensure aiSummary is correctly processed
    newsData.forEach((article) => {
      console.log("add this article: " + article);

      if (typeof article.aiSummary === "object") {
        var summary = Object.values(article.aiSummary).join(" ");
      } else if (typeof article.aiSummary === "string") {
        var summary = article.aiSummary;
      }

      console.log("article summary: " + summary);
      tfidf.addDocument(summary);
    });

    return scores.reduce((sum, score) => sum + score, 0);
  };

  useEffect(() => {
    fetchNews();
    currentCountryName = getCountryName(selectedCountry);
  }, [source]);

  useEffect(() => {
    if (showSummaries) {
      generateSummaries(newsWithSentiments);
    } else {
      // fetchNews();
    }
  }, [showSummaries]);

  useEffect(() => {
    if (showSummaries) {
      generateSummaries(newsWithSentiments);
    } else {
      // fetchNews();
    }
  }, [showSummaries]);

  const { colorScheme } = useColorScheme();
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

  const { isLoading: isNewsLoading, data: myData } = useQuery({
    queryKey: ["news", source],
    queryFn: fetchNews,
    onSuccess: (myData) => {

      console.log("data: ");
      console.log(myData);
      articles = source === "theNewsApi" ? myData : myData; // depending on the source, we parse the articles differently
      console.log("articles: ");
      console.log(articles);

      // Set newsData variable as the articles
      setNewsData(myData);
      setIsLoading(false);
      // analyzeNewsSentiments(articles);
    },
    onError: (error) => {
      console.error("Error fetching news:", error);
    },
  });

  const handleSelectCountry = (country) => {
    setCurrentCountry(country);
  };

  const handleNewsDetailsClick = (item) => {
    navigation.navigate("NewsDetails", { item });
  };

  function formatDate(isoDate) {
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, options);
  }

  const gimmickAverages = {
    positive: Math.random() * 100,
    neutral: Math.random() * 100,
    negative: Math.random() * 100,
    other: Math.random() * 100,
  };


  // var displayedNews = showSummaries ? newsWithSummaries : newsWithSentiments;
  // console.log(newsWithSummaries);
  const averages = calculateAverages();

  [currentCountry, setCurrentCountry] = useState(selectedCountry || "fr");

  const tfidf = new TfIdf();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Header />
      <MiniHeader
        label="Votre sélection du jour"
        explanation="Data from The News API, summaries by ChatGPT-4o. Learn more here."
      />
      <Text style={styles.subTitle}>
        Recommended articles in {currentCountryName} from {source}.
      </Text>
      <Text></Text>
      <View style={styles.preferencesContainer}>
        <Text style={styles.subTitle}>Your topics:</Text>
        {selectedThemes.length > 0 ? (
          <View style={styles.themesContainer}>
            {selectedThemes.map((topic, index) => (
              <Text key={index} style={styles.themeText}>
                {topic}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.noPreferencesText}>No topics selected</Text>
        )}
      </View>
      {/* <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCountry}
          onValueChange={(itemValue) => handleSelectCountry(itemValue)}
          style={styles.picker}
        >
          {countries.map((country, index) => (
            <Picker.Item key={index} label={country.name} value={country.code} />
          ))}
        </Picker>
        </View> */}
      {/* <View style={styles.preferencesContainer}>
        <Text style={styles.subTitle}>in:</Text>
        {selectedCountry.length > 0 ? (
          <View style={styles.themesContainer}>
              <Text style={styles.themeText}>
                {selectedCountry}
              </Text>
          </View>
        ) : (
          <Text style={styles.noPreferencesText}>No country selected</Text>
        )}
      </View> */}

      {isLoading ? (
        <Loading />
      ) : (<>
        {console.log("newsData: ", newsData)}
        {Array.isArray(newsData) && newsData.length > 0 ? (
          <ScrollView>
          <View
            style={styles.articlesContainer}
            className={colorScheme === "dark" ? "bg-black" : "bg-white"}
          >
            {newsData.map((article, index) => (
              <TouchableOpacity
                className="mb-4 mx-4 space-y-1"
                key={index}
                onPress={() => handleNewsDetailsClick(article)}
              >
                <View className="flex-row justify-start w-[100%] shadow-sm">
                  <Image
                    source={{
                      uri: article.urlToImage || "https://picsum.photos/200/400",
                    }}
                    style={{
                      width: heightPercentageToDP(9),
                      height: heightPercentageToDP(10),
                    }}
                  />
                  <View className="w-[70%] pl-4 justify-center space-y-1">
                    <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
                      {article?.source?.name.length > 20
                        ? article.source.name.slice(0, 20) + "..."
                        : article.source.name}
                    </Text>
                    <Text
                      className="text-neutral-800 capitalize max-w-[90%] dark:text-white"
                      style={{
                        fontWeight: showSummaries ? "normal" : "bold",
                        marginTop: 10,
                      }}
                    >
                      {showSummaries
                        ? article.aiSummary
                        : article?.title?.length > 80
                        ? article?.title.slice(0, 80) + "..."
                        : article?.title}
                    </Text>
                    <Text className="text-xs text-gray-700 dark:text-neutral-400">
                      {formatDate(article.publishedAt)}
                    </Text>
                  </View>
                </View>
                <Text>
                  Preference Match Score:{" "}
                  {article.content.length < 1 // if the content is existing, start comparison
                    ? "content is behind a paywall"
                    // : comparePreferences(article)}
                    :"compare preferences here"}
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
                    {/* <Heatmap
                      data={[
                        { value: article.positive },
                        { value: article.neutral },
                        { value: article.negative },
                        { value: article.other },
                      ]}
                      height={expandedHeatmapIndex === index ? 50 : 50} // Adjust height based on state
                      showValues={expandedHeatmapIndex === index} // Show values only if expanded
                    /> */}
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
          </ScrollView>
        ) : (
          <Loading/>
        )}
      </>
      )}
    </SafeAreaView>
  );
}

const feedStyles = StyleSheet.create({
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
    // flexDirection: "row",
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
