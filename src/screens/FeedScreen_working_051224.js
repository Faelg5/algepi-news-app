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
  fetchNCA,
} from "../../utils/NewsApi";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
import PrefMatchScore from "../components/PrefMatchScore";
import ThemesCard from "../components/ThemesCard";
import SearchBar from "../components/SearchBar";

import { newsApiKey, theNewsApiKey, openAIApiKey } from "../../utils/ApiKey";

import Counter from "../components/Counter";
import { ColorList } from "../constants/colors";

import { useFonts } from "expo-font";
import Heatmap from "../components/Heatmap";
import { calculateMonthlyOccurrencesForAllThemes } from "../../utils/ProcessOffline";

import { UserPreferencesContext } from "../../App"; // Import context
import {
  countries,
  languages,
  themes,
  isTrackingEnabled,
} from "./PreferencesScreen"; // Import countries and languages list
import { TfIdf } from "../../utils/tfidf"; // Custom TF-IDF class
import styles from "../constants/styles";

import { Picker } from "@react-native-picker/picker";
import { heightPercentageToDP } from "react-native-responsive-screen";
import translations from "../constants/translations"; // Import translations

import { trackEvent } from "@aptabase/react-native";
import Svg, { Circle } from "react-native-svg";
import MagnifyingGlassIcon from "react-native-heroicons/solid/MagnifyingGlassIcon";

import * as FileSystem from "expo-file-system";

import dayjs from "dayjs"; // Assurez-vous que dayjs est installé et importé si nécessaire

const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";

const summarizationEnabled = true; // Boolean to enable or disable summarization with LLM

// Calculer la date par défaut (3 mois avant aujourd'hui)
const FROM_DATE = dayjs().subtract(1, "month").format("YYYY/MM/DD");

// HEATMAP Functions section

const getColorForValue = (value) => {
  if (value === 0) return "#E0F7FA"; // Bleu clair pour aucune donnée
  if (value < 5) return "#80DEEA"; // Bleu moyen
  if (value < 10) return "#00BCD4"; // Bleu foncé
  if (value < 20) return "#00838F"; // Très foncé
  return "#004D40"; // Bleu profond pour de fortes occurrences
};

////// API Calls Section
const OpenAIThemeSummaryCall = async (content, currentThemes) => {
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
          "You are an news app assistant specialized in to summarizing the text that I give you. You return a list of exactly 30 words from the list I provide you. The list represents the text, which means that the higher the count of a word in your summary, the more the text talks about this subject. You never say 'here's a tip,'. You directly give the answer in the form of a list of thirty words from the list I provide you. You never mention that you are OpenAI. You never mention that you are based on ChatGPT. You are never disrespectful. You never mention another word than the ones I provide you.",
      },
      {
        role: "user",
        content:
          "Your role is to return a list of terms that summarize the text using only thirty words from the list I give you. For example you can return something like: politics, sports, health, entertainment, tech,politics, sports, health, entertainment, tech. Add the word more times if you see it appears frequently in the article I give you at the end of the prompt. Select the terms only from the given list, in an objective, neutral and respectful way. Return only a list of words that summarize the themes in the given text, using exclusively the terms listed here: " +
          currentThemes.join(", ") +
          ". Never include a full sentence or another word than one of these specific terms I just mentioned, separated with commas. Please note: if the document I provide you contains [Removed], please return a only single white space character. Never, ever say another word than one that is here: " +
          currentThemes.join(", ") +
          ". Here is the document to summarize:" +
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
        Authorization: "Bearer " + openAIApiKey,
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

const generateSummaryWithRetry = async (
  content,
  currentThemes,
  retries = 3,
  delay = 1000
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const summary = await OpenAIThemeSummaryCall(content, currentThemes);
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
  //for newsCatcher API
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [monthlyData, setMonthlyData] = useState({});

  // Selection of specific news sources
  const [selectedSources, setSelectedSources] = useState([]);

  // To track the expanded XAI section
  const [expandedItem, setExpandedItem] = useState(null);
  const handleExpand = async (index) => {
    console.log("INDEX OF EXPANDED ITEM:", index);

    // Bascule l'élément développé
    setExpandedItem(expandedItem === index ? null : index);

    // Si l'élément est sélectionné pour la première fois
    if (expandedItem !== index) {
      const selectedArticle = newsData[index];

      if (!selectedArticle.aiSummary) {
        console.log("Generating summary for article:", selectedArticle.title);

        // Vérifiez que l'article a un contenu valide
        const contentToSummarize =
          selectedArticle.title + " " + selectedArticle.description;

        if (!contentToSummarize.trim()) {
          console.warn("Article content is empty. Cannot generate summary.");
          return;
        }

        // Appelez l'API pour générer un résumé
        const generatedSummary = await generateSummaryWithRetry(
          contentToSummarize,
          localSelectedThemes
        );

        console.log("Generated Summary:", generatedSummary);

        // Mettez à jour `newsData` avec le résumé
        setNewsData((prevNewsData) =>
          prevNewsData.map((article, i) =>
            i === index ? { ...article, aiSummary: generatedSummary } : article
          )
        );
      }
    }
  };

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

  // Dynamic source selection - update this variable if API change is required
  const [source, setSource] = useState("newsCatcherApi");

  const [unsortedNewsData, setUnsortedNewsData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [pageSize, setPageSize] = useState([]);

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
  const [sortByMatch, setSortByMatch] = useState(false);

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
    // Reset the tfidf instance at the beginning of fetching news process
    tfidf.current = new TfIdf();

    console.log("fetching news, called from: " + calledFrom);
    console.log("fetching news with these themes...", localSelectedThemes);

    setIsLoading(true);

    let articles = [];
    let page = 1;
    let totalPages = 1; // Placeholder for total pages, updated after the first response

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

    console.log("Source: " + source);

    if (response) {
      let articles = [];
      console.log("RESPONSE:");
      response.data.articles.forEach((article) => {
        console.log(article.title);
      });

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

        articles = response.data.articles;

        console.log("Saving " + articles.length + " articles:");

        /// SAVE TO A FILE
        // Convert the articles to JSON
        const jsonData = JSON.stringify(articles, null, 2);

        // Define the path to save the file (in the app's document directory)
        const fileUri = FileSystem.documentDirectory + "filteredArticles.json";

        // Write the JSON data to a file
        FileSystem.writeAsStringAsync(fileUri, jsonData)
          .then(() => {
            console.log("Filtered articles saved to", fileUri);
          })
          .catch((error) => {
            console.error("Error saving file:", error);
          });

        return articles;

        console.log("set news data from the fetchnews USEEFFECT");

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
        // const summary = await callOpenAIAPI(article.title);
        const summary = "no_summary";
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
  // const getColor = (score) => {
  //   if (score > 50) return "#4CAF50"; // Vert pour un score élevé
  //   if (score > 20) return "#FFC107"; // Jaune pour un score moyen
  //   return "#F44336"; // Rouge pour un score bas
  // };

  const getColor = (score) => {
    if (score >= 80) return "#1a9850"; // Dark green
    if (score >= 70) return "#66bd63"; // Light green
    if (score >= 60) return "#a6d96a"; // Yellow-green
    if (score >= 50) return "#d9ef8b"; // Yellow
    if (score >= 54) return "#fee08b"; // Light orange
    if (score >= 30) return "#fdae61"; // Orange
    if (score >= 20) return "#f46d43"; // Red-orange
    if (score >= 10) return "#d73027"; // Red
    return "#a50026"; // Dark red for scores below 10
  };

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
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
    // console.log(article);

    if (article.summary) {
      // Ensure Summary is resolved (only for NEWSCATCHER API AND NEWSAPI - old code here)
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
            article.title + " " + article.description,
            localSelectedThemes
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

        // replacement code for the export to the file
        // article.aiSummary = "default summary"; // Provide a fallback summary
        // tfidf.current.addDocument(article.aiSummary);

        // add article summary to current article
        tfidf.current.addDocument(article.aiSummary);

        console.log("-------- ADDING Article TO TFIDF -----------");
        console.log("Article");
        console.log(article.aiSummary);
        console.log("Total documents: " + tfidf.current.documents);
      }
    } else {
      console.log("No content to summarize");
    }
    return;
  };

  const processNewsData = async (calledFrom, storeToFile = false) => {
    console.log("Processing news data, called from: " + calledFrom);

    let allNewsData = [];
    const articlesPerMonth = 10; // Limite d'articles par mois
    const maxMonths = 1; // Période de récupération : 5 dernières années

    const currentDate = dayjs();
    const startDate = dayjs().subtract(maxMonths, "month");

    // Générer les plages mensuelles
    const monthlyRanges = [];
    let tempDate = startDate.startOf("month");

    while (tempDate.isBefore(currentDate)) {
      const from = tempDate.format("YYYY-MM-DD");
      const to = tempDate.endOf("month").format("YYYY-MM-DD");
      monthlyRanges.push({ from, to });
      tempDate = tempDate.add(1, "month");
    }

    console.log(
      `Generated ${monthlyRanges.length} date ranges for ${maxMonths} years.`
    );

    for (const { from, to } of monthlyRanges) {
      console.log(
        `Fetching up to ${articlesPerMonth} articles from ${from} to ${to}...`
      );

      try {
        let currentPage = 1;
        let fetchedArticles = [];
        let hasMorePages = true;

        while (
          hasMorePages &&
          (storeToFile
            ? fetchedArticles.length < articlesPerMonth
            : currentPage === 1)
        ) {
          const response = await fetchNCA(
            localSelectedThemes.join(" OR "), // Recherche par mots-clés
            [],
            from, // Date de début
            currentPage,
            { to, page_size: storeToFile ? 10 : articlesPerMonth } // Taille adaptée au mode
          );

          if (response && response.articles && response.articles.length > 0) {
            if (storeToFile) {
              // Mélanger les articles pour en obtenir un échantillon aléatoire
              const shuffledArticles = response.articles.sort(
                () => Math.random() - 0.5
              );

              // Ajouter les articles jusqu'à la limite d'articles par mois
              const articlesToAdd = shuffledArticles.slice(
                0,
                articlesPerMonth - fetchedArticles.length
              );
              fetchedArticles = fetchedArticles.concat(articlesToAdd);
            } else {
              // Si storeToFile est false, récupérer les articles de la première page
              fetchedArticles = fetchedArticles.concat(response.articles);
              hasMorePages = false; // On ne veut qu'une page dans ce mode
            }

            console.log(
              `Page ${currentPage}: ${
                storeToFile ? fetchedArticles.length : response.articles.length
              } articles added.`
            );
            currentPage++;
          } else {
            console.warn(`No more articles found for ${from} to ${to}.`);
            hasMorePages = false;
          }
        }

        // Ajouter les articles récupérés pour ce mois au tableau global
        allNewsData = allNewsData.concat(fetchedArticles);

        console.log(
          `Fetched ${fetchedArticles.length} articles for ${from} to ${to}.`
        );
      } catch (error) {
        console.error(`Error fetching articles for ${from} to ${to}:`, error);
      }
    }

    console.log(`Total articles fetched: ${allNewsData.length}`);

    if (allNewsData.length === 0) {
      console.log("No news data available");
      setIsLoading(false);
      return;
    }

    if (storeToFile) {
      console.log("Storing articles to file...");
      // Générer un nom de fichier avec les thèmes
      const themePart = localSelectedThemes
        .join("_")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 50); // Nettoyage et limite de taille
      const fileName = `articles_${themePart}_${dayjs().format(
        "YYYY-MM-DD"
      )}.json`;

      // Enregistrez tous les articles dans un fichier
      const jsonData = JSON.stringify(allNewsData, null, 2);
      const fileUri = FileSystem.documentDirectory + fileName;

      FileSystem.writeAsStringAsync(fileUri, jsonData)
        .then(() => {
          console.log(
            `All articles (${allNewsData.length}) saved to ${fileUri}`
          );
        })
        .catch((error) => {
          console.error("Error saving file:", error);
        });
    }

    // Mettez à jour les états avec les données
    setNewsData(allNewsData);
    setUnsortedNewsData(allNewsData);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("RUNNING GET NEWSCATCHER NEWS USEEFFECT");
    const getNewsCatcherNews = async () => {
      try {
        const news = await fetchNews(localSelectedThemes); // localSelectedThemes = les mots-clé souhaités
        setArticles(news);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getNewsCatcherNews();
  }, []);

  // code to calculate monthly occurences for alls elected themes
  useEffect(() => {
    console.log("useEffect triggered");
    const processDataOffline = async () => {
      console.log("processDataOffline called");
      try {
        const totals = await calculateMonthlyOccurrencesForAllThemes(
          fileUri,
          localSelectedThemes
        );
        console.log("Totals:", totals);
        setMonthlyData(totals);
      } catch (error) {
        console.error("Error in processDataOffline:", error);
      }
    };
    processDataOffline();
  }, []);

  useEffect(() => {
    console.log("Monthly Data:", monthlyData);
  }, [monthlyData]);

  useEffect(() => {
    console.log("---------ACTIVE THEME USEEFFECT--------");
    console.log("active theme: " + activeTheme);
    // toggleTheme(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    console.log("---------PageSize USEEFFECT--------");
    console.log("Page size changed to: " + pageSize);
  }, [pageSize]);

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

    let queryOperator = " OR ";
    if (andOperator) {
      queryOperator = " AND "; // set query operator to AND if toggled
    }

    console.log("selected themes:::: " + localSelectedThemes);

    // Appel de l'API NewsCatcher avec les thèmes sélectionnés

    // query string: topics, sources, from date
    fetchNCA(localSelectedThemes.join(queryOperator), [], FROM_DATE) // Envoie les thèmes comme une requête combinée avec "OR" ou "AND" selon le choix fait par l'utilisateur
      .then((fetchedNewsData) => {
        // console.log("fetched news data:", fetchedNewsData);

        setNewsData(fetchedNewsData); // Utilise les données récupérées pour le state newsData
        setUnsortedNewsData(fetchedNewsData); // Garde une copie non triée

        processNewsData("localSelectedThemes useEffect")
          .then(() => {
            // console.log(articles);

            // Sorting
            if (sortByMatch) {
              console.log("Sorting by match");

              // Sauvegarde `newsData` dans `unsortedNewsData` si ce n'est pas déjà fait
              if (unsortedNewsData.length === 0) {
                setUnsortedNewsData([...newsData]);
              }

              // Trie et met à jour `newsData`
              const sortedNewsData = [...newsData].sort(
                (a, b) => b.tfidfScore - a.tfidfScore
              );
              setNewsData(sortedNewsData);
            } else {
              console.log(
                "Resetting to default sort order (localSelectedThemes)"
              );

              // Réinitialise les données à l'ordre non trié
              if (unsortedNewsData.length > 0) {
                setNewsData([...unsortedNewsData]);
              }
            }
          })
          .catch((error) => console.log("Error in processNewsData:", error));
      })
      .catch((error) => console.log("Fetch NewsCatcher news error:", error));
  }, [localSelectedThemes]);

  useEffect(() => {
    // console.log("NEWS DATA: ");
    // console.log(newsData)
  }, [newsData]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }
    if (!isLoading) {
      setUnsortedNewsData(newsData);
    }
  }, [unsortedNewsData]);

  // useEffect(() => {
  //   if (!hasMounted.current) {
  //     // This will run only on the initial render
  //     hasMounted.current = true;
  //     return;
  //   }

  //   if (!isLoading) {
  //     // fetchNews("andOperatorchangeds");
  //     if (!isLoading) {
  //       console.log("selected themes:::: " + localSelectedThemes);
  //       fetchNews("andOperatorchanged");
  //     }
  //     // processNewsData("andOperator useEffect").catch((error) => console.log("error: " + error));

  //     console.log("AND operator is now: " + andOperator);
  //   }
  // }, [andOperator]);

  useEffect(() => {
    if (!hasMounted.current) {
      // This will run only on the initial render
      hasMounted.current = true;
      return;
    }

    if (sortByMatch) {
      console.log("Sorting by match");
      // Save the current newsData to unsortedNewsData if it's not already saved
      if (unsortedNewsData.length === 0) {
        setUnsortedNewsData([...newsData]);
      }

      // Sort and update newsData
      const sortedNewsData = [...newsData].sort(
        (a, b) => b.tfidfScore - a.tfidfScore
      );
      setNewsData(sortedNewsData);
    } else {
      console.log("Resetting to default sort order (sortByMatch)");

      // Reset to the original unsorted data
      if (unsortedNewsData.length > 0) {
        setNewsData([...unsortedNewsData]);
      }
    }
  }, [sortByMatch]);

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
    if (isTrackingEnabled) {
      incrementNewsItemClick();
    }
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
        if (!themes.includes(theme)) {
          // if displayed themes list does not include the theme, add it
          // Add theme
          themes.unshift(theme);
        }
        // return previous themes along with theme
        return [...prevThemes, theme];
      }
    });

    // console.log("Selected themes after toggle:", localSelectedThemes);
  };

  const toggleAndOperator = () => {
    setAndOperator((prev) => !prev);
    console.log("selected themes:::: " + localSelectedThemes);
    fetchNews("localselectedthemess changed")
      .then((fetchedNewsData) => {
        console.log("fetched news data: ");

        setNewsData(fetchedNewsData);
        setUnsortedNewsData(fetchedNewsData);

        processNewsData("localSelectedThemes useEffect")
          .then(() => {
            if (sortByMatch) {
              console.log("Sorting by match");
              // Save the current newsData to unsortedNewsData if it's not already saved
              if (unsortedNewsData.length === 0) {
                setUnsortedNewsData([...newsData]);
              }

              // Sort and update newsData
              const sortedNewsData = [...newsData].sort(
                (a, b) => b.tfidfScore - a.tfidfScore
              );
              setNewsData(sortedNewsData);
            } else {
              console.log(
                "Resetting to default sort order (toggleAndOperator)"
              );

              // Reset to the original unsorted data
              if (unsortedNewsData.length > 0) {
                setNewsData([...unsortedNewsData]);
              }
            }
          })
          .catch((error) => console.log("error: " + error));
      })
      .catch((error) => console.log("Fetch news error: " + error));
  };

  const toggleSortByMatch = () => {
    setSortByMatch((prev) => !prev);
  };

  function formatDate(isoDate, precision) {
    const date = new Date(isoDate);

    let options;
    switch (precision) {
      case "full":
        // Full date with time (day, month, year, hour, and minute)
        options = {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
        break;
      case "timezone unknown":
      case "date":
        // Only day, month, and year
        options = {
          day: "2-digit",
          month: "short",
          year: "numeric",
        };
        break;
      case "None":
      default:
        // Fallback to only the year
        options = {
          year: "numeric",
        };
    }

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

  // const tfidf = new TfIdf();
  const tfidf = useRef(new TfIdf()); // Preserved across renders

  return (
    <SafeAreaView className="my-10" style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Header handleThemeChange={changeTheme} />

      <View
        style={[styles.themesContainer, { alignItems: "center" }]}
        className="flex-row mx-2 my-4"
      >
        <SearchBar style={styles.searchBar} handleThemeChange={changeTheme} />

        <ThemesCard
          themes={themes}
          activeTheme={activeTheme}
          handleThemeChange={changeTheme}
          localSelectedThemes={localSelectedThemes} // Pass themes as a prop
        />
      </View>

      <View className="flex-row my-0 mx-0" style={{}}>
        {isVisible && (
          <Animated.View
            className="flex-row my-0 mx-3"
            style={[
              styles.switchContainer,
              {
                opacity: fadeAnim,
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              },
            ]}
          >
            <Switch
              style={styles.switch}
              value={andOperator}
              onChange={toggleAndOperator}
            />

            <Text className="my-0 mx-4" style={styles.noPreferencesText}>
              {translations[selectedLanguageCode].newsMustContainAllThemes}
            </Text>
          </Animated.View>
        )}
      </View>

      <Text className="my-2 mx-2 " style={styles.noPreferencesText}>
        {translations[selectedLanguageCode].found} {newsData.length}{" "}
        {translations[selectedLanguageCode].articlesIn}{" "}
        {getLanguageName(selectedLanguageCode)}{" "}
        {translations[selectedLanguageCode].sinceWhen}
        {365 * FROM_DATE}
        {translations[selectedLanguageCode].timeUnit}.
      </Text>

      {selectedThemes.length > 0 && Object.keys(monthlyData).length > 0 && (
        <SafeAreaView style={{ flex: 1, padding: 10 }}>
          {Object.keys(monthlyData).length > 0 ? (
            <Heatmap data={monthlyData} />
          ) : (
            <Text>Loading...</Text>
          )}
        </SafeAreaView>
      )}

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
        localSelectedThemes.length === 0 ? (
          <View className="flex-col my-4 mx-4">
            <Text className="my-0 mx-2 " style={styles.subTitle}>
              {/* <Text className="my-2 mx-2 " style={styles.noPreferencesText}> */}
              {translations[selectedLanguageCode].noThemesSelected}
            </Text>
          </View>
        ) : (
          <>
            <Loading />
            <Text
              className="text-m text-gray-700 dark:text-neutral-400"
              style={{ textAlign: "center" }}
            >
              Loading news feed and computing relevance...{" "}
            </Text>
          </>
        )
      ) : (
        <>
          <View
            className={`flex-row ${
              colorScheme === "dark" ? "bg-black" : "bg-gray-200"
            }`}
            style={{ alignItems: "center" }}
          >
            <MiniHeader
              className="bg-gray"
              label={translations[selectedLanguageCode].greeting}
              explanation={
                translations[selectedLanguageCode].newsSourceExplanation
              }
            />
            <View
              className="flex-row align-middle flex-wrap rounded-lg bg-gray-200 mt-0"
              style={{ alignItems: "center" }}
            >
              <Text
                className="my-2 mx-2"
                style={[styles.subTitle, { width: "50%" }]}
              >
                {translations[selectedLanguageCode].sortByMatch}
              </Text>
              <Switch
                className="my-2 mx-0 flex-wrap"
                value={sortByMatch}
                onChange={toggleSortByMatch}
              />
            </View>
          </View>
          {Array.isArray(newsData) && newsData.length > 0 ? (
            // console.log("LOG NEWS DATA::", JSON.stringify(newsData, null, 2)),
            <ScrollView>
              <View
                style={styles.articlesContainer}
                className={colorScheme === "dark" ? "bg-black" : "bg-white"}
              >
                {newsData.map((article, index) => (
                  <TouchableOpacity
                    className="mb-4 mx-4 space-y-1 p-4 rounded bg-gray-50"
                    key={index}
                    onPress={() => handleNewsDetailsClick(article)}
                  >
                    <View className="flex-row justify-start w-[100%] shadow-sm">
                      {article && article.media ? (
                        <Image
                          className="rounded"
                          source={{
                            uri:
                              article.media || "https://picsum.photos/200/400",
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
                          {article?.clean_url.length > 20
                            ? article.clean_url.slice(0, 20) + "..."
                            : article.clean_url}
                        </Text>
                        {article.title && (
                          <Text
                            className="text-neutral-800 capitalize max-w-[95%] dark:text-white"
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
                        {article.is_opinion && (
                          <Text className="text-xs text-blue-500 dark:text-blue-400">
                            Opinion (as rated by NCA)
                          </Text>
                        )}
                        <Text className="text-xs text-gray-700 dark:text-neutral-400">
                          {formatDate(
                            article.published_date,
                            article.published_date_precision
                          )}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#333" }}>
                          {article.is_opinion
                            ? "Contains opinion"
                            : "Not rated as opinion"}
                        </Text>
                      </View>
                      {/* Expandable Section */}
                      <View
                        style={{
                          position: "absolute",
                          bottom: 10,
                          right: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => handleExpand(index)}
                          style={{
                            backgroundColor: "#f0f0f0",
                            padding: 5,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: "#007AFF" }}>
                            {
                              translations[selectedLanguageCode]
                                .summarizeThisArticle
                            }
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Expanded Content */}
                    {expandedItem === index && (
                      <View style={styles.expandableContent}>
                        <Text style={{ fontSize: 12, color: "#555" }}>
                          {translations[selectedLanguageCode].summary}:{" "}
                          {article.aiSummary || "No summary available"}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#555" }}>
                          GPT Opinion: {article.chatgpt_opinion ? "Yes" : "No"}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <>
              <View style={styles.articlesContainer}>
                <Loading />
                <Text
                  className="text-m text-gray-700 dark:text-neutral-400"
                  style={{ textAlign: "center" }}
                >
                  Loading news feed and analyzing feed relevance...{" "}
                </Text>
              </View>
            </>
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
  themesContainer: {
    height: 20,
    alignItems: "center",
    verticalAlign: "center",
    backgroundColor: "red",
  },
  searchBar: {
    height: 26,
    backgroundColor: ColorList.primary,
    margin: 10,
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
