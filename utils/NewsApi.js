import { newsApiKey, theNewsApiKey } from "./ApiKey";
import axios from "axios";

const newsApiBaseUrl = "https://newsapi.org/v2";
const theNewsApiBaseUrl = "https://api.thenewsapi.com/v1/news";

const breakingNewsUrl = (country) => `${newsApiBaseUrl}/top-headlines?country=${country}&apiKey=${newsApiKey}`;
const recommendedNewsUrl = (country, category) => `${newsApiBaseUrl}/top-headlines?country=${country}&category=${category}&apiKey=${newsApiKey}`;
const discoverNewsUrl = (country, discover) => `${newsApiBaseUrl}/top-headlines?country=${country}&category=${discover}&apiKey=${newsApiKey}`;
const everythingUrlNA = (q, language) => `${newsApiBaseUrl}/everything?q=(${q})&language=${language}&apiKey=${newsApiKey}`;

const urlTNA = (locale, categories) => `${theNewsApiBaseUrl}/top?api_token=${theNewsApiKey}&locale=${locale}&categories=${categories}`;

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
    console.log("the RESPONSE");
    console.log(response);

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
  console.log("country: ", q);
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