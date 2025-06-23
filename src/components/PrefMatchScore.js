import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { ColorList } from "../constants/colors";
import Svg, { Circle } from "react-native-svg";


export default function MiniHeader({ label, explanation, includeVis, fillColor }) {
  const [showExplanation, setShowExplanation] = useState(false);

  const handlePress = () => {
    setShowExplanation(!showExplanation);
  };

  console.log(fillColor)

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{label}</Text>

      <TouchableOpacity
        onPress={handlePress}
        style={[styles.infoButton, showExplanation && styles.infoButtonActive]}
      >
        <Text style={styles.infoButtonText}>i</Text>
      </TouchableOpacity>

      {showExplanation && (
        <View style={[styles.bubble, styles.shadow]}>
          <Text style={styles.explanationText}>{explanation}</Text>

          {includeVis && (
            <Svg height="20" width="20">
              <Circle
                cx="10"
                cy="10"
                r="8"
                fill={fillColor}
              />
            </Svg>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 10,
    position: "relative", // Ensure relative positioning for absolute child (bubble)
    padding: 20,
    backgroundColor: ColorList.backgroundColor,
    borderRadius: 5,
  },
  headerText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Helvetica-Bold",
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
    fontSize: 12,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica",
    color: "#000",
    textAlign: "left",
    lineHeight: 14,
    zIndex: 1000, // Lower zIndex to ensure it's below the "i" button
  },
});
