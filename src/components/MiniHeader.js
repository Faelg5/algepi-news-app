import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { ColorList } from "../constants/colors";
import Svg, { Circle } from "react-native-svg";
import { UserPreferencesContext } from "../../App";
import { transparencyEnabled } from "../screens/PreferencesScreen";

export default function MiniHeader({
  label,
  explanation,
  includeVis,
  fillColor,
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  const handlePress = () => {
    setShowExplanation(!showExplanation);
  };

  const { isSurveyModeEnabled } = useContext(UserPreferencesContext);
  useEffect(() => {
    console.log("Survey Mode Enabled:", isSurveyModeEnabled);
  }, [isSurveyModeEnabled]);

  const { transparencyEnabled } = useContext(UserPreferencesContext);
  useEffect(() => {
    console.log("Transparency Enabled:", transparencyEnabled);
  }, [transparencyEnabled]);

  const { itemLevelTransparencyEnabled } = useContext(UserPreferencesContext);
  useEffect(() => {
    console.log(
      "Item-Level Transparency Enabled:",
      itemLevelTransparencyEnabled
    );
  }, [itemLevelTransparencyEnabled]);

  // console.log(fillColor)

  return (
    <View
      className="flex-col rounded-md max-w-[100%]"
      style={styles.headerContainer}
    >
      <View className="flex-col w-full">
        <View className="flex-col w-full rounded-md">
          <View className="w-full">
            {/* Row for title and button */}
            <View className="flex-row items-center">
              <Text
                className="flex-shrink pt-1 pb-0 px-6"
                style={styles.headerText}
              >
                {label}
              </Text>

              {transparencyEnabled && !isSurveyModeEnabled && (
                <TouchableOpacity
                  className="flex-col text-justify p-2"
                  onPress={handlePress}
                  style={[
                    styles.infoButton,
                    showExplanation && styles.infoButtonActive,
                  ]}
                >
                  <Text style={styles.infoButtonText}>i</Text>
                </TouchableOpacity>
              )}
            </View>
            {!transparencyEnabled && !itemLevelTransparencyEnabled && (
              <View className="h-[2px] bg-blue w-full my-0 mb-2" />
            )}
            {/* Horizontal Line BELOW */}
            <View className="h-[1px] bg-gray-300 w-full my-4 mb-2" />

            {!transparencyEnabled && !itemLevelTransparencyEnabled && (
              <View className="h-[10px] bg-blue w-full my-4 mb-2" />
            )}
          </View>
        </View>
        {transparencyEnabled && (
          <Text
            className="flex-wrap w-full px-4 py-0 text-gray-700 "
            style={styles.explanationText}
          >
            {explanation}
          </Text>
        )}
      </View>

      {showExplanation && (
        <View style={[styles.bubble]}>
          <Text
            className="text-base p-4 bg-red-500"
            style={styles.explanationText}
          >
            {explanation}
          </Text>

          {/* {includeVis && (
            <Svg height="20" width="20">
              <Circle
                cx="10"
                cy="10"
                r="8"
                fill={'#000000'}
              />
            </Svg>
          )} */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    position: "relative", // Ensure relative positioning for absolute child (bubble)
  },
  headerText: {
    fontSize: 26,
    color: "#000",
    fontFamily: "Roboto-Bold",
  },
  infoButton: {
    width: 20,
    height: 20,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2, // Ensure the "i" button is above everything
  },
  infoButtonActive: {
    backgroundColor: "#000",
  },
  infoButtonText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Roboto-Bold",
  },
  bubble: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    position: "absolute",
    top: "200%", // Position it below the header
    right: 10, // Adjust right position as needed
    // maxWidth: '65%', // Limit width to 80% of the parent width
    width: 50 + "%",
    height: "auto",
    zIndex: 999, // Lower zIndex to ensure it's below the "i" button
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  explanationText: {
    fontFamily: "Roboto",
    textAlign: "left",
    zIndex: 1000, // Lower zIndex to ensure it's below the "i" button
    // maxWidth: "94%",
  },
});
