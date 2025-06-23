// import { NEWS_CATCHER_API_KEY } from "@env";

import { newsApiKey, theNewsApiKey } from "./ApiKey";
import axios from "axios";
import dayjs from "dayjs";

const newsApiBaseUrl = "https://newsapi.org/v2";
const theNewsApiBaseUrl = "https://api.thenewsapi.com/v1/news";


const newsCatcherApiBaseURL = "https://api.newscatcherapi.com/v2";
const newsCatcherApiKey = process.env.EXPO_PUBLIC_NEWS_CATCHER_API_KEY;

// Calculer la date par défaut (3 mois avant aujourd'hui)
const DEFAULT_FROM_DATE = dayjs().subtract(1, "month").format("YYYY/MM/DD");

console.log(DEFAULT_FROM_DATE); // Affichera : 3 mois avant date actuelle

console.log("Clé API :", newsCatcherApiKey); // Vérifie que la clé est correctement chargée

const breakingNewsUrl = (country) =>
  `${newsApiBaseUrl}/top-headlines?country=${country}&apiKey=${newsApiKey}`;
const recommendedNewsUrl = (country, category) =>
  `${newsApiBaseUrl}/top-headlines?country=${country}&category=${category}&apiKey=${newsApiKey}`;
const discoverNewsUrl = (country, discover) =>
  `${newsApiBaseUrl}/top-headlines?country=${country}&category=${discover}&apiKey=${newsApiKey}`;
const everythingUrlNA = (q, language) => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 30);

  // Format the date to YYYY-MM-DD which is the format NewsAPI expects
  const fromDate = pastDate.toISOString().split("T")[0];

  /// IMPORTANT TODO PUT THIS BACK AFTER GETTING TO FILE ARTICLES
  return `${newsApiBaseUrl}/everything?q=(${q})&language=${language}&sortBy=relevancy&from=${fromDate}&apiKey=${newsApiKey}&pageSize=10`;

  // COMMENT THIS TODO IMPORTANT
  // return `${newsApiBaseUrl}/everything?q=news&from=${pastDate}&to=${today}&language=${language}&sortBy=publishedAt&apiKey=${newsApiKey}`;
};

const urlTNA = (locale, categories) =>
  `${theNewsApiBaseUrl}/top?api_token=${theNewsApiKey}&locale=${locale}&categories=${categories}`;

const apiCall = async (sourceName, endpoints, params) => {
  const options = {
    method: "GET",
    url: endpoints,
    params: params ? params : {},
  };

  try {
    console.log("the EndPoint");
    console.log(endpoints);

    const response = await axios.request(options);
    // console.log("the RESPONSE");
    // console.log(response);

    if (sourceName === "theNewsApi") {
      return response.data;
    } else {
      return response;
    }
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const fetchBreakingNews = async (country) => {
  return await apiCall("newsApi", breakingNewsUrl(country));
};

export const fetchRecommendedNews = async (country, category) => {
  console.log("fetching recommended news from News API");
  return await apiCall("newsApi", recommendedNewsUrl(country, category));
};

export const fetchAllNewsNA = async (q, language) => {
  console.log("fetching all news from News API");
  console.log("terms: ", q);
  console.log("language: ", language);

  const url = everythingUrlNA(q, language);
  return await apiCall("newsApi", url);
};

export const fetchSearchNews = async (query) => {
  const endpoint = everythingUrlNA(query);
  return await apiCall("newsApi", endpoint);
};

export const fetchTNA = async (locale, categories) => {
  const url = urlTNA(locale, categories);
  console.log("fetching news from The News API");
  console.log("locale: ", locale);
  console.log("categories: ", categories);

  return await apiCall("theNewsApi", url);
};

export const fetchNCA = async (
  query,
  sources = [],
  from = DEFAULT_FROM_DATE,
  page = 1,
  lang = "en" // Par défaut "en" si aucune langue n'est fournie
) => {
  console.log("QUERY: ", query);
  console.log(newsCatcherApiBaseURL);
  try {
    const fullUrl = `${newsCatcherApiBaseURL}/search/topic?` + new URLSearchParams({
      q: query,
      sources: sources.length > 0 ? sources.join(",") : undefined,
      page_size: 10,
      page,
      from,
      lang,
    }).toString();
    
    console.log("🧠 Full URL:", fullUrl);
    
    const response = await axios.get(`${newsCatcherApiBaseURL}/search/topic`, {
      params: {
        q: query,
        sources: sources.length > 0 ? sources.join(",") : undefined,
        page_size: 10, // Taille maximale de la page autorisée par l'API
        page, // Ajoutez la page demandée
        from, // Paramètre "from" pour filtrer les dates
        lang, // paramètre "lang" pour filtrer les langues
      },
      headers: { "x-api-key": newsCatcherApiKey },
    });

    console.log("full query: ", response);
    console.log("API RESPONSE: ", response.data); // Ajout de cette ligne pour déboguer

    return response.data; // Retournez les données complètes de la réponse
  } catch (error) {
    console.error("Erreur lors de la récupération des articles :", error);
    throw error; // Relancez l'erreur pour gestion ultérieure
  }
};
