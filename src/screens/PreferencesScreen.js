import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { UserPreferencesContext } from "../../App";
import styles from "../constants/styles";

const themes = ["tech", "sports", "politics", "health", "entertainment", "food", "travel"];

export const countries = [
  { code: 'ar', name: 'Argentina' },
  { code: 'am', name: 'Armenia' },
  { code: 'au', name: 'Australia' },
  { code: 'at', name: 'Austria' },
  { code: 'by', name: 'Belarus' },
  { code: 'be', name: 'Belgium' },
  { code: 'bo', name: 'Bolivia' },
  { code: 'br', name: 'Brazil' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'ca', name: 'Canada' },
  { code: 'cl', name: 'Chile' },
  { code: 'cn', name: 'China' },
  { code: 'co', name: 'Colombia' },
  { code: 'hr', name: 'Croatia' },
  { code: 'cz', name: 'Czechia' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'eg', name: 'Egypt' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'gr', name: 'Greece' },
  { code: 'hn', name: 'Honduras' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'in', name: 'India' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ir', name: 'Iran' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'Korea' },
  { code: 'mx', name: 'Mexico' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ni', name: 'Nicaragua' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pa', name: 'Panama' },
  { code: 'pe', name: 'Peru' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'qa', name: 'Qatar' },
  { code: 'ro', name: 'Romania' },
  { code: 'ru', name: 'Russia' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'za', name: 'South Africa' },
  { code: 'es', name: 'Spain' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'sy', name: 'Syria' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'th', name: 'Thailand' },
  { code: 'tr', name: 'Turkey' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States Of America' },
  { code: 'uy', name: 'Uruguay' },
  { code: 've', name: 'Venezuela' },
];

export default function PreferencesScreen() {
  const { selectedThemes, setSelectedThemes, selectedCountry, setSelectedCountry } = useContext(UserPreferencesContext);

  const [currentThemes, setCurrentThemes] = useState(selectedThemes || []);
  const [currentCountry, setCurrentCountry] = useState(selectedCountry || 'fr');

  useEffect(() => {
    setSelectedThemes(currentThemes);
    setSelectedCountry(currentCountry);
  }, [currentThemes, currentCountry, setSelectedThemes, setSelectedCountry]);

  const handleToggleTheme = (theme) => {
    setCurrentThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const handleSelectCountry = (country) => {
    setCurrentCountry(country);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your preferred news themes:</Text>
      <View style={styles.buttonContainer}>
        {themes.map((theme, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleToggleTheme(theme)}
            style={[
              styles.themeButton,
              currentThemes.includes(theme) && styles.selectedThemeButton,
            ]}
          >
            <Text
              style={[
                styles.themeButtonText,
                currentThemes.includes(theme) && styles.selectedThemeButtonText,
              ]}
            >
              {theme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.title}>Select your preferred country:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={currentCountry}
          onValueChange={(itemValue) => handleSelectCountry(itemValue)}
          style={styles.picker}
        >
          {countries.map((country, index) => (
            <Picker.Item key={index} label={country.name} value={country.code} />
          ))}
        </Picker>
      </View>
    </View>
  );
}