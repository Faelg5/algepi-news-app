import React, { createContext, useState, useEffect } from 'react';
import AppNavigation from "./src/navigation";
import { QueryClient, QueryClientProvider } from "react-query";
import { LogBox } from "react-native";
import { XaiModeProvider } from "./src/context/XaiModeContext";
import { newsApiKey, theNewsApiKey } from "./utils/ApiKey";

import Aptabase from "@aptabase/react-native"; // Library for Aptabase, a GDPR-compliant database

Aptabase.init("A-EU-8338648806"); // Aptabase API key

var xaiMode = true;

LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); // Ignore all log notifications

const queryClient = new QueryClient(); // Create a new instance of the query client

// User Preferences Context
export const UserPreferencesContext = createContext();

const API_KEY = newsApiKey;
const API_URL = 'https://newsapi.org/v2/top-headlines';

// async function fetchAvailableCountries() {
//   try {
//     const response = await fetch(`${API_URL}?apiKey=${API_KEY}`);
//     const data = await response.json();
//     const countriesSet = new Set();

//     if (data.status === 'ok') {
//       data.sources.forEach(source => {
//         if (source.country) {
//           countriesSet.add(source.country);
//         }
//       });
//     }

//     return Array.from(countriesSet);
//   } catch (error) {
//     console.error('Error fetching sources:', error);
//     return [];
//   }
// }

export default function App() {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  // const [availableCountries, setAvailableCountries] = useState([]);

  // useEffect(() => {
  //   async function getCountries() {
  //     const countries = await fetchAvailableCountries();
  //     setAvailableCountries(countries);
  //   }
  //   getCountries();
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <XaiModeProvider>
        <UserPreferencesContext.Provider value={{ selectedThemes, setSelectedThemes, selectedCountry, setSelectedCountry }}>
            <AppNavigation />
        </UserPreferencesContext.Provider>
      </XaiModeProvider>
    </QueryClientProvider>
  );
}
