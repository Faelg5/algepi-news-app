import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Switch,
  Linking
} from "react-native";
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

export var themes = [
  "tech",
  "sports",
  "politics",
  "health",
  "entertainment",
  "food",
  "travel",
];

export var isTrackingEnabled = true;

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

export default function PreferencesScreen() {
  const { colorScheme } = useColorScheme();

  const {
    selectedThemes,
    setSelectedThemes,
    selectedCountry,
    setSelectedCountry,
    selectedLanguageCode,
    setSelectedLanguageCode,
  } = useContext(UserPreferencesContext);

  const [currentThemes, setCurrentThemes] = useState(
    selectedThemes || ["tech", "sports"]
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
      with{' '}
      <Text
        style={[styles.explanationText, { color: ColorList.primary, textDecorationLine: 'underline' }]}
        onPress={() => Linking.openURL('https://aptabase.com/legal/privacy')}
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

      {/* Other preferences */}
      <Text className="mx-10 my-8" style={styles.title}>
        Show news written in:
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
