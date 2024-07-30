import { newsApiKey, theNewsApiKey } from "./ApiKey";
import axios from "axios";

const newsApiBaseUrl = "https://newsapi.org/v2";
const theNewsApiBaseUrl = "https://api.thenewsapi.com/v1/news";

const breakingNewsUrl = (country) => `${newsApiBaseUrl}/top-headlines?country=${country}&apiKey=${newsApiKey}`;
const recommendedNewsUrl = (country, category) => `${newsApiBaseUrl}/top-headlines?country=${country}&category=${category}&apiKey=${newsApiKey}`;
const discoverNewsUrl = (country, discover) => `${newsApiBaseUrl}/top-headlines?country=${country}&category=${discover}&apiKey=${newsApiKey}`;
const searchNewsUrl = (query) => `${newsApiBaseUrl}/everything?q=${query}&api_token=${newsApiKey}`;

const TNAUrl = (locale, categories) => `${theNewsApiBaseUrl}/top?api_token=${theNewsApiKey}&locale=${locale}&categories=${categories}`;

const apiCall = async (sourceName, endpoints, params) => {
  const options = {
    method: "GET",
    url: endpoints,
    params: params ? params : {},
  };

  try {
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

export const fetchDiscoverNews = async (country, discover) => {
  return await apiCall("newsApi", discoverNewsUrl(country, discover));
};

export const fetchSearchNews = async (query) => {
  const endpoint = searchNewsUrl(query);
  return await apiCall("newsApi", endpoint);
};

export const fetchTNA = async (locale, categories) => {
  const url = TNAUrl(locale, categories);
  console.log("fetching news from The News API");
  console.log("locale: ", locale);
  console.log("categories: ", categories);

  return await apiCall("theNewsApi", url);
};