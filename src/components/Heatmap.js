import React from "react";
import { View, StyleSheet, Text } from "react-native";

const Heatmap = ({ data, height = 100, showValues = true }) => {
  const labels = ["User Preferences", "Content Similarity", "User Behavior", "Other"];

  // Ensure we have exactly 4 items for the heatmap
  const items = data.slice(0, 4);

  // Calculate the maximum value for normalization
  const maxValue = Math.max(...items.map(item => item.value));

  // Function to interpolate between two colors
  const interpolateColor = (value) => {
    const startColor = { r: 222, g: 235, b: 247 }; // #deebf7
    const endColor = { r: 49, g: 130, b: 189 };   // #3182bd

    const factor = value / maxValue;
    const r = Math.round(startColor.r + factor * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + factor * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + factor * (endColor.b - startColor.b));

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <View style={[styles.heatmapContainer, { height }]}>
      {items.map((item, index) => {
        const backgroundColor = interpolateColor(item.value);
        
        return (
          <View
            key={index}
            style={[
              styles.heatmapSquare,
              { backgroundColor },
            ]}
          >
            {showValues && <Text style={styles.labelText}>{labels[index]}: {item.value.toFixed(1)}</Text>}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  heatmapContainer: {
    flexDirection: "row",
    width: "100%", // Take full width
    borderRadius: 10,
    overflow: "hidden", // Ensure squares stay within rounded corners
    padding: 5,
    marginBottom: 10,
  },
  heatmapSquare: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 2, // Add some spacing between squares
    width: 100+'%',
  },
  labelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export default Heatmap;