import {
  TouchableOpacity,
  View,
  Text,
  Switch,
  Image,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import MagnifyingGlassIcon from "react-native-heroicons/solid/MagnifyingGlassIcon";
import { ColorList } from "../constants/colors";

export default function Header({ handleThemeChange }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation = useNavigation();

  const isDarkMode = colorScheme === "dark";

  // State to control input visibility and input text
  const [isInputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState("");

  // Function to handle the input submission
  const handleInputSubmit = () => {
    if (inputText.trim() !== "") {
      handleThemeChange(inputText.trim());
      setInputText(""); // Clear the input field after submission
    }
    setInputVisible(false); // Hide the input field after submission
  };

  return (
    <View
      className="flex-row justify-between items-center mx-0 mt-2"
      style={{
        backgroundColor: isDarkMode ? "#999" : "#fff",
        padding: 2,
        borderRadius: 10,
      }}
    >
      <TouchableOpacity onPress={() => navigation.navigate("Explorer")}>
        <Image
          source={require("../../assets/icons/logo-humanist.png")}
          style={{
            resizeMode: "contain",
            marginLeft: 20,
            height: 40,
            width: 70,
            borderRadius: 15, // Add borderRadius for rounded corners
          }}
        />
      </TouchableOpacity>
      <Text className="px-0 text-sm font-normal">{/* Empty text space */}</Text>
      <View className="flex-row space-x-4 rounded-full justify-center items-center">
        {/* Conditionally render the input field */}
        {isInputVisible && (
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleInputSubmit}
            autoFocus
            placeholder="Enter theme..."
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
              padding: 8,
              borderRadius: 8,
              borderColor: isDarkMode ? "#555" : "#ccc",
              borderWidth: 1,
              marginRight: 10,
              width: 150, // Adjust the width of the input
            }}
          />
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={require("../../assets/icons/profile-circle.png")}
            style={{
              resizeMode: "contain",
              marginLeft: 20,
              height: 40,
              width: 70,
              borderRadius: 100, // Add borderRadius for rounded corners
            }}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            if (isInputVisible) {
              handleInputSubmit();
            } else {
              setInputVisible(true); // Show the input field
            }
          }}
          className="bg-gray-200 dark:bg-green-80 rounded-full p-2"
          style={{
            backgroundColor: isDarkMode ? '#333' : ColorList.backgroundSecondary, // Adjust background color for dark mode
          }}
        >
          <MagnifyingGlassIcon
            size={24}
            strokeWidth={2}
            color={isDarkMode ? ColorList.primaryDark : ColorList.BackgroundPrimary}
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}
