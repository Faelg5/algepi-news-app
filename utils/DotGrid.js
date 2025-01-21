import React from "react";
import { View, Text, ScrollView } from "react-native";
import Svg, { Rect, G } from "react-native-svg";

const DotGrid = ({ clickedTopics }) => {
  // Group data by topic and day
  const groupedData = groupByTopicAndDay(clickedTopics);

  const cellSize = 20; // Base size of each square
  const spacing = 5; // Space between squares

  // Transform grouped data into an array for rendering
  const topics = Object.keys(groupedData);
  const dates = Array.from(
    new Set(
      clickedTopics.map(({ timestamp }) =>
        new Date(timestamp).toISOString().split("T")[0]
      )
    )
  );

  return (
    <ScrollView horizontal>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10, textAlign: "center" }}>
          Topic Activity Grid
        </Text>
        <Svg
          width={dates.length * (cellSize + spacing)}
          height={topics.length * (cellSize + spacing)}
        >
          <G>
            {topics.map((topic, rowIndex) => {
              return dates.map((date, colIndex) => {
                const count = groupedData[topic][date] || 0; // Default count to 0
                const size = count * 5 + cellSize; // Adjust size based on count

                return (
                  <Rect
                    key={`${topic}-${date}`}
                    x={colIndex * (cellSize + spacing)}
                    y={rowIndex * (cellSize + spacing)}
                    width={size}
                    height={size}
                    fill="steelblue"
                    opacity={count > 0 ? 0.7 : 0.1}
                  />
                );
              });
            })}
          </G>
        </Svg>
        {/* Display topic labels */}
        {topics.map((topic, index) => (
          <Text key={topic} style={{ marginTop: 5, textAlign: "left" }}>
            Row {index + 1}: {topic}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

// Helper function
const groupByTopicAndDay = (clickedTopics) => {
    console.log("Grouping data by topic and day");
  const groupedData = {};

  clickedTopics.forEach(({ topic, timestamp }) => {
    const date = new Date(timestamp).toISOString().split("T")[0]; // Extract YYYY-MM-DD

    if (!groupedData[topic]) {
      groupedData[topic] = {};
    }

    if (!groupedData[topic][date]) {
      groupedData[topic][date] = 0;
    }

    groupedData[topic][date] += 1; // Count clicks
  });

  console.log("DONE GROUPING DATA:");
  console.log(groupedData);

  return groupedData;
};

export default DotGrid;