import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  navigation,
} from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
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
import ThemesCard from "../components/ThemesCard";

import Counter from "../../src/components/Counter";
import { ColorList } from "../constants/colors";

import { useFonts } from "expo-font";
import Heatmap from "../components/Heatmap";
import { UserPreferencesContext } from "../../App"; // Import context
import { countries, languages, themes } from "./PreferencesScreen"; // Import countries and languages list
import { TfIdf } from "../../utils/tfidf"; // Custom TF-IDF class
import styles from "../constants/styles";

import { Picker } from "@react-native-picker/picker";
import { heightPercentageToDP } from "react-native-responsive-screen";
import translations from "../constants/translations"; // Import translations

import { trackEvent } from "@aptabase/react-native";
import Svg, { Circle } from "react-native-svg";

const CHATGPT_API_KEY =
  "";
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
  console.log("--------------------------------------");
  console.log("CALLING AI SUMMARY API WITH THIS CONTENT:::");
  console.log(content);
  // console.log("Themes available:")
  // console.log(themes.join(', '));
  const APIBody = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an news app assistant specialized in to summarizing the text that I give you. You return a list of exactly 10 words from the list I provide you. The list represents the text, which means that the higher the count of a word in your summary, the more the text talks about this subject. You never say 'here's a tip,'. You directly give the answer in the form of a list of ten words from the list I provide you. You never mention that you are OpenAI. You never mention that you are based on ChatGPT. You are never disrespectful. You never mention another word than the ones I provide you.",
      },
      {
        role: "user",
        content:
          "Your role is to return a list of terms that summarize the text using only ten words from the list I give you. For example you can return something like: politics, sports, health, entertainment, tech,politics, sports, health, entertainment, tech. Add the word more times if you see it appears frequently in the article I give you at the end of the prompt. Select the terms only from the given list, in an objective, neutral and respectful way. Return only a list of words that summarize the themes in the given text, using exclusively the terms listed here: "+ themes.join(', ')+". Never include a full sentence or another word than one of these specific terms I just mentioned, separated with commas. The only exception is if the document contains [Removed], then return a single white space character only. Here is the document to summarize:" +
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
    console.log("RESPONSE JSON from OpenAI API:");
    console.log(data);
    console.log("chatgpt response:");
    console.log(data.choices[0].message.content.trim());

    console.log("data.choices:");
    console.log(data.choices);

    console.log("data.choices.length:");
    console.log(data.choices.length);

    return data.choices && data.choices.length > 0
      ? data.choices[0].message.content.trim()
      : "No summary available";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Error calling OpenAI API";
  }
};

const generateSummaryWithRetry = async (content, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const summary = await OpenAIThemeSummaryCall(content);
    if (
      summary !== "No summary available" &&
      summary !== "Error calling OpenAI API"
    ) {
      console.log("Summary generated successfully!");
      console.log("Summary:");
      console.log(summary);
      return summary;
    }
    console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return "No summary available"; // Fallback if all attempts fail
};

const sources = [
  { label: "News API", value: "newsApi" },
  { label: "The News API", value: "theNewsApi" },
  { label: "Google News", value: "googleNews" },
];

export default function FeedScreen({ navigation }) {
  // for aptabase
  const [count, setCount] = useState(0);

  // To check if the component has mounted
  const hasMounted = useRef(false);

  const incrementNewsItemClick = () => {
    setCount(count + 1);
    trackEvent("newsItemClick", { count });
  };

  const decrement = () => {
    setCount(count - 1);
    trackEvent("decrement", { count });
  };

  ////////////////////////////
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { selectedThemes, selectedCountry, selectedLanguageCode } = useContext(
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

  const [activeTheme, setActiveTheme] = useState();
  const [localSelectedThemes, setLocalSelectedThemes] =
    useState(selectedThemes);
  const [andOperator, setAndOperator] = useState(false);

  const [htmlContent, setHtmlContent] = useState("");

  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity value is 1 (visible)

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

  const getCountryCode = (countryName) =>
    countries.find((country) => country.code === countryName)?.name;

  const getLanguageName = (languageCode) =>
    languages.find((language) => language.code === languageCode)?.name;
  var currentCountryName;

  const fetchNews = async (calledFrom) => {
    console.log("fetching news, called from: " + calledFrom);
    console.log("fetching news with these themes...");
    console.log(localSelectedThemes);
    setIsLoading(true);
    let response;
    console.log("using source: " + source);
    if (source === "newsApi") {
      let queryOperator = " OR ";
      if (andOperator) {
        queryOperator = " AND "; // set query operator to AND if toggled
      }
      response = await fetchAllNewsNA(
        localSelectedThemes.join(queryOperator),
        selectedLanguageCode
      ); // using OR operator to search for multiple themes
    } else if (source === "theNewsApi") {
      response = await fetchTNA(selectedCountry, localSelectedThemes.join(","));
    } else if (source === "googleNews") {
      response = await fetchRecommendedNews();
    }
    console.log("Fetching news from " + source + "...");

    currentCountryName = getCountryCode(selectedCountry);
    console.log("Current language Name: " + selectedLanguageCode);
    // console.log(response);
    console.log("Source: " + source);

    if (response) {
      let articles = [];
      // console.log("RESPONSE:");
      // console.log(response);

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
        // Filter out articles with null descriptions
        articles = articles.filter((article) => article.description !== null);

        articles = response.data.articles;
        //    articles = [
        //     {
        //         "author": "Anna Washenko",
        //         "content": "If you click 'Accept all', we and our partners, including 237 who are part of the IAB Transparency &amp; Consent Framework, will also store and/or access information on a device (in other words, use … [+678 chars]",
        //         "description": "Streaming provider Roku is adding a new free channel for sports content on August 12. The ad-supported Roku Sports Channel will go live with content both owned and licensed by the company. No subscription or sign-up will be required to access the channel. The…",
        //         "publishedAt": "2024-08-07T13:00:41Z",
        //         "source": {
        //             "id": null,
        //             "name": "Yahoo Entertainment"
        //         },
        //         "title": "Roku is launching the Roku Sports Channel on August 12",
        //         "url": "https://consent.yahoo.com/v2/collectConsent?sessionId=1_cc-session_96105bff-97b4-4b75-b3f9-248a9ca68fb0",
        //         "urlToImage": null
        //     },
        //     {
        //         "aiSummary": "politics, tech, sports, health, entertainment",
        //         "author": "About",
        //         "content": "This work is licensed under a\nCreative Commons Attribution-NonCommercial 2.5 License.\nThis means you're free to copy and share these comics (but not to sell them). More details.",
        //         "description": null,
        //         "publishedAt": "2024-07-26T04:00:00Z",
        //         "source": {
        //             "id": null,
        //             "name": "Xkcd.com"
        //         },
        //         "title": "Olympic Sports",
        //         "url": "https://xkcd.com/2964/",
        //         "urlToImage": "https://imgs.xkcd.com/comics/olympic_sports_2x.png"
        //     },
        //     {
        //         "author": null,
        //         "content": "A new company resurrected the classic TVR but will not build its new model in Wales\nThe failure of a deal to produce sports cars in Wales was part of a disappointing pattern of Welsh government inve… [+4986 chars]",
        //         "description": "The failed bid is described as \"part of a disappointing pattern\" in terms of attracting businesses.",
        //         "publishedAt": "2024-07-31T21:54:08Z",
        //         "source": {
        //             "id": null,
        //             "name": "BBC News"
        //         },
        //         "title": "Concerns over failed sports car deal 'overspend'",
        //         "url": "https://www.bbc.com/news/articles/c4ngwv2q5p5o",
        //         "urlToImage": "https://ichef.bbci.co.uk/news/1024/branded_news/3dad/live/672ec690-4ec4-11ef-a307-c9d56a508b94.jpg"
        //     }
        // ];
        // setNewsData(articles.slice(0, 3)); // set newsData variable as the articles, limit to 3 articles
        setNewsData(articles); // set newsData variable as the articles, limit to 3 articles

        console.log("set news data from the fetchnewz");

        // setIsLoading(false); // Set isLoading to false after data is fetched
      }

      // summarizeThemesInArticles(articles.slice(0, 3));

      console.log("Language: " + selectedLanguageCode);

      // console.log("full response is above ");
      console.log("Country: " + selectedCountry);

      // console.log("articles: ");
      // console.log(articles.slice(0, 3));

      // console.log("newsData is now:" + newsData);
      // setNewsWithSummaries(articles);

      // analyzeNewsSentiments(articles);
      // generateSummaries(articles);
    }
  };

  const generateSummary = async (articles) => {
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

  // const summarizeThemesInArticles = async (articles) => {
  //   const summarizedThemesList = await Promise.all(
  //     articles.map(async (article) => {
  //       const summary = await OpenAIThemeSummaryCall(article.content); // get a summary of the article as a list of terms
  //       return {
  //         ...article,
  //         summary,
  //       };
  //       console.log(summary);
  //     })
  //   );
  //   // console.log("full list of each article with summary");
  //   // console.log(summarizedThemesList);
  // };

  // Définir la couleur du cercle en fonction du score
  const getColor = (score) => {
    if (score > 50) return "#4CAF50"; // Vert pour un score élevé
    if (score > 20) return "#FFC107"; // Jaune pour un score moyen
    return "#F44336"; // Rouge pour un score bas
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

  createSummary = async (article) => {
    console.log("executing createSummary on article: ");
    console.log(article.title);
    console.log("selected themes");
    console.log(localSelectedThemes);

    console.log("adding article: ");
    console.log(article);

    if (article.description) {
      // Ensure Summary is resolved
      // --------------------------------
      // The News API
      if (source === "theNewsApi") {
        article.aiSummary = await OpenAIThemeSummaryCall(article.description);
      }
      // --------------------------------
      // News API
      else if (source === "newsApi") {
        console.log("ARTICLE CONTENT TO SUMMARIZE NOW:");
        console.log(article.title + article.description);
        if (article.description !== null) {
          console.log("-----------------");
          console.log("SUMMARIZING ARTICLE");
          console.log("-----------------");

          article.aiSummary = await generateSummaryWithRetry(
            article.title + " "+ article.description
          );
        } else {
          article.aiSummary = ""; // default summary is an empty string
        }
      }
      console.log("type of article.aiSummary: " + typeof article.aiSummary);
      console.log("content of article.aiSummary: " + article.aiSummary);

      if (typeof article.aiSummary === undefined) {
        console.log("-----------------");
        console.log("Summary generation failed!");
        article.aiSummary = "default summary"; // Provide a fallback summary
      } else {
        // Iterate over displayedNews and ensure aiSummary is correctly processed
        // newsData.forEach((article) => {
        //   console.log("add this article: " + article.title);
        //   console.log(article.aiSummary);
        //   console.log(article.content);

        //   var summary;
        //   if (typeof article.aiSummary === "object") {
        //     summary = Object.values(article.aiSummary).join(" ");
        //     console.log("article summary (from object): " + summary);
        //   } else if (typeof article.aiSummary === "string") {
        //     // for news api format
        //     summary = article.aiSummary;
        //     console.log("article content: " + article.content);
        //     console.log("article summary (from string): " + summary);
        //   }
        //   console.log("______________________");

        //   console.log("article summary: " + summary);
        //   console.log("______________________");

        tfidf.addDocument(article.aiSummary);
        console.log("-------- ADDING Article TO TFIDF -----------");
        console.log("Article");
        console.log(article.aiSummary);
        console.log("Total documents: " + tfidf.documents);

        // });
      }
    } else {
      console.log("No content to summarize");
    }
    return;
  };


  // console.log("LOCAL SELECTED THEMES:::");
  // console.log(localSelectedThemes);
  const processNewsData = async () => {
    if (!newsData || newsData.length === 0) {
      console.log("No news data available");
      setIsLoading(false);
    } else {
      console.log(newsData);
      console.log("NEWS DATA LENGTH: " + newsData.length);

      // First, process all summaries
      await Promise.all(
        newsData.map(async (article) => {
          await createSummary(article); // Assuming createSummary is an async function
        })
      );

      // Now, process TF-IDF after all summaries are done
      const updatedNewsData = await Promise.all(
        newsData.map(async (article) => {
          let scores;
          if (localSelectedThemes.length > 0) {
            scores = localSelectedThemes.map((term) =>
              tfidf.tfidf(term, article.aiSummary)
            );
          } else {
            scores = [0];
          }
          // Save the result of the reduce operation in a variable
          const totalScore = scores.reduce((acc, score) => acc + score, 0);

          // Log the total score
          console.log("Total TF-IDF Score:", totalScore);

          // Assign the total score to the article's tfidfScore property
          article.tfidfScore = totalScore * 150;

          return article;
        })
      );

      setNewsData(updatedNewsData);
      console.log("set news data from the activeTheme USEFFECT");
    }
  };













  useEffect(() => {
    console.log("---------ACTIVE THEME USEEFFECT--------");
    console.log("active theme: " + activeTheme);
    // toggleTheme(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    if (localSelectedThemes.length < 2) {
      // Hide with animation
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out to opacity 0
        duration: 500, // Duration of the animation
        useNativeDriver: true,
      }).start(() => setIsVisible(false)); // Set visibility to false after the animation
    } else {
      // Show with animation
      setIsVisible(true); // Make it visible before starting the animation
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade in to opacity 1
        duration: 500, // Duration of the animation
        useNativeDriver: true,
      }).start();
    }
  }, [localSelectedThemes, fadeAnim]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }
    if (!isLoading) {
      console.log("selected themes:::: " + localSelectedThemes);
      fetchNews("localselectedthemess changed");
    }
    processNewsData().catch((error) => console.log("error: " + error));

  
  }, [localSelectedThemes]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }

    if (!isLoading) {
      // fetchNews("andOperatorchangeds");
      if (!isLoading) {
        console.log("selected themes:::: " + localSelectedThemes);
        fetchNews("andOperatorchanged");
      }
      processNewsData().catch((error) => console.log("error: " + error));

      console.log("AND operator is now: " + andOperator);
    }
  }, [andOperator]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }

    if (!isLoading) {
      // fetchNews("source changeds");
      // currentCountryName = getCountryCode(selectedCountry);
    }
  }, [source]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }
    if (showSummaries) {
      generateSummary(newsWithSentiments);
    } else {
      // fetchNews();
    }
  }, [showSummaries]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }
    setIsLoading(false);
    console.log("---------NEWS DATA USEEFFECT----------");
    console.log("selected themes:::: " + localSelectedThemes);
    console.log("newsData in newsdata useeffect is now:");

    newsData.forEach((article) => {
      console.log("Title:", article.title);
    });
  }, [newsData]);

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

  // useEffect(() => {

  //     if (selectedThemes.includes(activeTheme)) {
  //       console.log("removing theme: " + activeTheme);
  //       // Remove the theme if it is already included
  //       const index = selectedThemes.indexOf(activeTheme);
  //       selectedThemes.splice(index, 1);
  //     } else {
  //       console.log("adding theme: " + activeTheme);
  //       // Add the theme if it is not included
  //       selectedThemes.push(activeTheme);
  //     }

  //     console.log("selected themes: ");
  //     console.log(selectedThemes);
  //     return selectedThemes;
  // }, [activeTheme]);

  // const { isLoading: isNewsLoading, data: myData } = useQuery({
  //   queryKey: ["news", source],
  //   queryFn: fetchNews("QUERY"),
  //   onSuccess: (myData) => {
  //     articles = source === "theNewsApi" ? myData : myData; // depending on the source, we parse the articles differently
  //     // console.log("articles: ");
  //     // console.log(articles);
  //     // console.log("data: ");
  //     // console.log(myData);

  //     // Set newsData variable as the articles
  //     setNewsData(myData);
  //     setIsLoading(false);
  //     // analyzeNewsSentiments(articles);
  //   },
  //   onError: (error) => {
  //     console.error("Error fetching news:", error);
  //   },
  // });

  const handleSelectCountry = (country) => {
    setCurrentCountry(country);
  };

  const changeTheme = (theme) => {
    console.log("Changing theme:", theme);
    setActiveTheme(theme); // Triggers the useEffect to update currentTheme
    toggleTheme(theme);
  };

  const handleNewsDetailsClick = (item) => {
    incrementNewsItemClick();
    navigation.navigate("NewsDetails", { item });
  };

  const toggleTheme = (theme) => {
    console.log("Toggling theme:", theme);

    if (!theme || typeof theme !== "string" || theme.trim() === "") {
      console.error("Invalid theme detected:", theme);
      return;
    }

    setLocalSelectedThemes((prevThemes) => {
      if (prevThemes.includes(theme)) {
        console.log("Removing theme:", theme);
        // Remove theme
        return prevThemes.filter((t) => t !== theme);
      } else {
        console.log("Adding theme:", theme);
        // Add theme
        return [...prevThemes, theme];
      }
    });

    // console.log("Selected themes after toggle:", localSelectedThemes);
  };

  const toggleAndOperator = () => {
    setAndOperator((prev) => !prev);
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

  [currentCountry, setCurrentCountry] = useState(selectedCountry || "en");

  [currentLanguageCode, setCurrentLanguageCode] = useState(
    selectedLanguageCode || "en"
  );

  const tfidf = new TfIdf();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Header />
      <MiniHeader
        label={translations[selectedLanguageCode].greeting}
        explanation={translations[selectedLanguageCode].newsSourceExplanation}
      />

      <View className="flex-row mx-4">
        <ThemesCard
          themes={themes}
          activeTheme={activeTheme}
          handleThemeChange={changeTheme}
          localSelectedThemes={localSelectedThemes} // Pass themes as a prop
        />
      </View>

      <View className="flex-row-reverse my-4 mx-4 ">
        {isVisible && (
          <Animated.View
            className="flex-row-reverse my-4 mx-4 "
            style={[styles.switchContainer, { opacity: fadeAnim }]}
          >
            <Switch
              style={styles.switch}
              value={andOperator}
              onChange={toggleAndOperator}
            />
            <Text className="my-2 mx-2 " style={styles.noPreferencesText}>
              {/* <Text className="my-2 mx-2 " style={styles.noPreferencesText}> */}
              {translations[selectedLanguageCode].newsMustContainAllThemes}
            </Text>
          </Animated.View>
        )}
        {/* 
        <Switch value={andOperator} onChange={toggleAndOperator} />
        <Text className="my-2 mx-2 " style={styles.noPreferencesText}>
          {translations[selectedLanguageCode].newsMustContainAllThemes}
        </Text> */}
      </View>
      <Text style={styles.subTitle}>
        {translations[selectedLanguageCode].subtitle}{" "}
        {getLanguageName(selectedLanguageCode)}.
      </Text>

      {/* <View style={styles.preferencesContainer}>
        <Text style={styles.subTitle}>Your topics:</Text>
        {localSelectedThemes.length > 0 ? (
          <View style={styles.themesContainer}>
            {localSelectedThemes.map((theme, index) => (
              <Text key={index} style={styles.themeText}>
                {theme}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.noPreferencesText}>No topics selected</Text>
        )}
      </View> */}

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
      ) : (
        <>
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
                      {article && article.urlToImage ? (
                        <Image
                          source={{
                            uri:
                              article.urlToImage ||
                              "https://picsum.photos/200/400",
                          }}
                          style={{
                            width: heightPercentageToDP(9),
                            height: heightPercentageToDP(10),
                          }}
                        />
                      ) : (
                        <Text>No Image Available</Text>
                      )}
                      <View className="w-[70%] pl-4 justify-center space-y-1">
                        <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
                          {article?.source?.name.length > 20
                            ? article.source.name.slice(0, 20) + "..."
                            : article.source.name}
                        </Text>
                        {article.description && (
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
                        )}
                        <Text className="text-xs text-gray-700 dark:text-neutral-400">
                          {formatDate(article.publishedAt)}
                        </Text>
                      </View>
                    </View>
                    {article.tfidfScore && (
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Svg height="20" width="20">
                            <Circle
                              cx="10"
                              cy="10"
                              r="8"
                              fill={getColor(article.tfidfScore)}
                            />
                          </Svg>
                          <Text style={{ marginLeft: 8 }}>Pref. Match: {Math.round(article.tfidfScore)}</Text>
                        </View>

                      
                      
                    )}
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
            <Loading />
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
  switchContainer: {
    flexDirection: "row-reverse",
    marginVertical: 2,
    marginHorizontal: 8,
    alignItems: "right",
  },
  inputContainer: {
    marginBottom: 16,
  },
  switch: {
    flexDirection: "row-reverse",
    alignItems: "right",
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
