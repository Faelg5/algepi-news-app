import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Switch,
  Linking,
  FlatList,
} from "react-native";
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
} from "victory-native";

import { useColorScheme } from "nativewind";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
import Counter from "../../src/components/Counter";
import { ColorList } from "../constants/colors";

import { Picker } from "@react-native-picker/picker";
import { UserPreferencesContext } from "../../App";
import styles from "../constants/styles";
import translations from "../constants/translations"; // Import translations

import { UserHistoryContext } from "../context/UserHistoryContext";

export var themes = [
  "technology",
  "sports",
  "politics",
  "health",
  "entertainment",
  "food",
  "travel",
];

export var isTrackingEnabled = true;
export var isContentFilterEnabled = true;


export const countries = [
  { code: "ar", name: "Argentina" },
  { code: "am", name: "Armenia" },
  { code: "au", name: "Australia" },
  { code: "at", name: "Austria" },
  { code: "by", name: "Belarus" },
  { code: "be", name: "Belgium" },
  { code: "bo", name: "Bolivia" },
  { code: "br", name: "Brazil" },
  { code: "bg", name: "Bulgaria" },
  { code: "ca", name: "Canada" },
  { code: "cl", name: "Chile" },
  { code: "cn", name: "China" },
  { code: "co", name: "Colombia" },
  { code: "hr", name: "Croatia" },
  { code: "cz", name: "Czechia" },
  { code: "ec", name: "Ecuador" },
  { code: "eg", name: "Egypt" },
  { code: "fr", name: "France" },
  { code: "de", name: "Germany" },
  { code: "gr", name: "Greece" },
  { code: "hn", name: "Honduras" },
  { code: "hk", name: "Hong Kong" },
  { code: "in", name: "India" },
  { code: "id", name: "Indonesia" },
  { code: "ir", name: "Iran" },
  { code: "ie", name: "Ireland" },
  { code: "il", name: "Israel" },
  { code: "it", name: "Italy" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "Korea" },
  { code: "mx", name: "Mexico" },
  { code: "nl", name: "Netherlands" },
  { code: "nz", name: "New Zealand" },
  { code: "ni", name: "Nicaragua" },
  { code: "pk", name: "Pakistan" },
  { code: "pa", name: "Panama" },
  { code: "pe", name: "Peru" },
  { code: "pl", name: "Poland" },
  { code: "pt", name: "Portugal" },
  { code: "qa", name: "Qatar" },
  { code: "ro", name: "Romania" },
  { code: "ru", name: "Russia" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "za", name: "South Africa" },
  { code: "es", name: "Spain" },
  { code: "ch", name: "Switzerland" },
  { code: "sy", name: "Syria" },
  { code: "tw", name: "Taiwan" },
  { code: "th", name: "Thailand" },
  { code: "tr", name: "Turkey" },
  { code: "ua", name: "Ukraine" },
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States Of America" },
  { code: "uy", name: "Uruguay" },
  { code: "ve", name: "Venezuela" },
];

export const languages = [
  { code: "ar", name: "العربية" }, // Arabic
  { code: "de", name: "Deutsch" }, // German
  { code: "en", name: "english" }, // English
  { code: "es", name: "español" }, // Spanish
  { code: "fr", name: "français" }, // French
  { code: "he", name: "עברית" }, // Hebrew
  { code: "it", name: "italiano" }, // Italian
  { code: "nl", name: "nederlands" }, // Dutch
  { code: "no", name: "norsk" }, // Norwegian
  { code: "pt", name: "português" }, // Portuguese
  { code: "ru", name: "Pусский" }, // Russian
  { code: "sv", name: "svenska" }, // Swedish
  { code: "ud", name: "اردو" }, // Urdu
  { code: "zh", name: "中文" }, // Chinese
];

const findCodeByName = (name) => {
  const language = languages.find((lang) => lang.name === name);
  return language ? language.code : null;
};

const getCurrentMonth = () => {
  const date = new Date(); // Current date and time
  const month = date.getMonth(); // Returns 0-11 (0 for January, 11 for December)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[month]; // Get month name
};

export default function PreferencesScreen() {
  const { clickedTopics } = useContext(UserHistoryContext);


  // Compter la fréquence des topics cliqués
  const topicCounts = clickedTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  // Convertir les données pour le graphique
  const chartData = Object.entries(topicCounts).map(([topic, count]) => ({
    topic,
    count,
  }));

  // Préparer les données
  const processData = () => {
    console.log("clickedTopics:", clickedTopics);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredTopics = clickedTopics.filter(
      (entry) => new Date(entry.timestamp) >= thirtyDaysAgo
    );

    const topicCounts = filteredTopics.reduce((acc, { topic }) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(topicCounts).map(([topic, count]) => ({
      topic,
      count,
    }));
  };

  const data = processData();

  const { colorScheme } = useColorScheme();

  const {
    selectedThemes,
    setSelectedThemes,
    selectedCountry,
    setSelectedCountry,
    selectedLanguageCode,
    setSelectedLanguageCode,
  } = useContext(UserPreferencesContext);

  const { isContentFilterEnabled, setIsContentFilterEnabled } = useContext(UserPreferencesContext);


  const [currentThemes, setCurrentThemes] = useState(
    selectedThemes || ["technology", "sports"]
  );
  const [currentCountry, setCurrentCountry] = useState(selectedCountry || "en");
  const [currentLanguageCode, setCurrentLanguageCode] = useState(
    selectedLanguageCode || "fr"
  );

  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true); // Default to true
  
  useEffect(() => {
    setSelectedThemes(currentThemes);
    setSelectedCountry(currentCountry);
    setSelectedLanguageCode(currentLanguageCode);
    setCurrentLanguageCode(currentLanguageCode);

    console.log("current language code: " + currentLanguageCode);
  }, [
    currentThemes,
    currentCountry,
    currentLanguageCode,
    setSelectedThemes,
    setSelectedCountry,
    setSelectedLanguageCode,
  ]);

  const handleToggleTheme = (theme) => {
    setCurrentThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };
  const handleToggleTracking = () => {
    setIsTrackingEnabled((prevState) => !prevState);
  };

  const handleToggleContentFiltering = () => {
    setIsContentFilterEnabled((prevState) => !prevState);
  };

  const handleSelectCountry = (country) => {
    setCurrentCountry(country);
  };

  const handleSelectLanguage = (language) => {
    setCurrentLanguageCode(language);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Header />
      {/* <MiniHeader
        label={translations["en"].preferencesMiniHeader}
        explanation="Data from The News API, summaries by ChatGPT-3.5. Learn more here."
      /> */}

      {/* Tracking preference */}
      <View className="flex-row bg-white rounded-lg">
      <View className="mx-10 my-10" style={styles.trackingContainer}>
          <Text style={styles.title}>Enable usage tracking</Text>
          <Text style={styles.explanationText}>
            with{" "}
            <Text
              style={[
                styles.explanationText,
                { color: ColorList.primary, textDecorationLine: "underline" },
              ]}
              onPress={() =>
                Linking.openURL("https://aptabase.com/legal/privacy")
              }
            >
              AptaBase Analytics
            </Text>
          </Text>
        </View>
        <View className="mx-10 my-10" style={styles.trackingContainer}>
          <Switch
            value={isTrackingEnabled}
            onValueChange={handleToggleTracking}
            style={styles.switch}
          />
        </View>
        </View>




      {/* Content Filtering preference */}
      <View className="flex-row bg-gray rounded-lg">
        <View className="mx-10 my-10" style={styles.trackingContainer}>
          <Text style={styles.title}>
            {" "}
            {translations[selectedLanguageCode].enableFeedPersonalization}
          </Text>
          <Text style={styles.explanationText}>
            {translations[selectedLanguageCode].didYouKnow}{" "}
            {translations[selectedLanguageCode].contentFilterExplanation}
          </Text>

          <Text
            style={[
              styles.explanationText,
              { color: ColorList.primary, textDecorationLine: "underline" },
            ]}
            onPress={() => Linking.openURL("https://algepi.com")}
          >
            {translations[selectedLanguageCode].learnMore}
          </Text>
          <Switch
            value={isContentFilterEnabled}
            onValueChange={handleToggleContentFiltering}
            style={styles.switch}
          />
        </View>

      </View>

<View className="mx-10 my-10" style={styles.trackingContainer}>
  <Text style={styles.title}>{translations[selectedLanguageCode].clickedTopicsTitle}</Text>

  {data.length > 0 ? (
    <View className="mx-10 my-10" style={styles.trackingContainer}>
    <Text style={{ fontSize: 16, marginTop: 10 }}>
      {data.map(({ topic, count }) => `${topic} (${count})`).join(", ")}{" "}
      {/* Transforme les topics en texte formaté */}
     {translations[selectedLanguageCode].inText} {getCurrentMonth()}.
    </Text>
    </View>
  ) : (
    <Text style={{ textAlign: "center", marginTop: 20 }}>
      Aucun historique de topics pour les 30 derniers jours.
    </Text>
  )}
</View>


      {/* <View className="mx-10 my-10" style={styles.trackingContainer}>
        <Text style={styles.title}>Themes history:</Text>
        {selectedThemes && selectedThemes.length > 0 ? (
          <View style={styles.themesContainer}>
            {selectedThemes.map((theme, index) => (
              <Text key={index} style={styles.themeText}>
                {theme}
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.container}>
            <Text style={styles.title}>Topics History:</Text>

            <Text
              style={{ fontSize: 20, textAlign: "center", marginBottom: 10 }}
            >
              Historique des Topics
            </Text>

            {data.length > 0 ? (
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
                horizontal
              >
                <VictoryAxis
                  style={{ tickLabels: { fontSize: 10, padding: 5 } }}
                  dependentAxis
                />
                <VictoryAxis
                  style={{ tickLabels: { fontSize: 12, padding: 5 } }}
                />
                <VictoryBar
                  data={data}
                  x="topic"
                  y="count"
                  style={{
                    data: { fill: "blue" },
                  }}
                />
              </VictoryChart>
            ) : (
              <Text style={{ textAlign: "center", marginTop: 50 }}>
                Aucun historique de topics pour les 30 derniers jours.
              </Text>
            )}
          </View>
        )}
      </View> */}

      {/* Other preferences */}

      <Text className="mx-8 my-8" style={styles.title}>
        {translations[selectedLanguageCode].languagePreferenceText}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={currentLanguageCode}
          onValueChange={(itemValue) => handleSelectLanguage(itemValue)}
          style={styles.picker}
        >
          {languages.map((language, index) => (
            <Picker.Item
              key={index}
              label={language.name}
              value={language.code}
            />
          ))}
        </Picker>
      </View>
    </SafeAreaView>
  );
}
