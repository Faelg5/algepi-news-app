import { StyleSheet, Dimensions, PixelRatio } from "react-native";
import { ColorList } from "./colors.js";

export default StyleSheet.create({
  // Existing styles
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: ColorList.backgroundPrimary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  searchBar: {
    margin: 8,
  },
  textArea: {
    height: 10,
    borderColor: ColorList.borderColor,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  sentimentText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  articlesContainer: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "center",
    borderRadius: 8,
    margin: 12,
    backgroundColor: ColorList.backgroundSecondary,
    elevation: 10,
    padding: 8,
    // Shadow properties for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 10,
  },
  wideColumn: {
    flex: 2,
    alignItems: "center",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "transparent",
  },
  column: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "transparent",
    height: 70,
    // backgroundColor: ColorList.backgroundSecondary,
  },
  heatmapChartContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: ColorList.backgroundSecondary,
    margin: 10,
    marginTop: 20,
    padding: 5,
    borderRadius: 10,
    height: 100,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  legendColorBox: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 12,
  },
  subTitle: {
    fontSize: 16,
    color: "#666",
    marginLeft: 15,
  },
  subHeader: {
    marginTop: 10,
    marginLeft: 15,
    fontWeight: "bold",
  },
  toggleButtonContainer: {
    alignItems: "right",
    margin: 10,
    right: 0,
  },
  toggleButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 0,
    right: 0,
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoButton: {
    width: 20,
    height: 20,
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
  preferencesContainer: {
    backgroundColor: ColorList.backgroundPrimary,
  },
  // Styles for PreferencesScreen
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  themeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  selectedThemeButton: {
    backgroundColor: "#007BFF",
  },
  themeButtonText: {
    fontSize: 16,
  },
  selectedThemeButtonText: {
    color: "#fff",
  },
  countryButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  selectedCountryButton: {
    backgroundColor: "#007BFF",
  },
  countryButtonText: {
    fontSize: 16,
  },
  selectedCountryButtonText: {
    color: "#fff",
  },
  noPreferencesText: {
    fontSize: 16,
    color: "#666",
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#ccc",
    marginVertical: 10,
    width: "100%",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  switch: {
    marginVertical: 10,
  },
  trackingContainer: {
    flexDirection: "column",
    alignItems: "left",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  tfidfScoreContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 0, // Add margin between each section
  },
  tfidfBar: {
    height: 10, // Height of the bar
    borderRadius: 5, // Rounded corners for the bar
  },
  barContainer: {
    width: '100%', // Ensure the container takes up full width
    backgroundColor: "#e0e0e0", // Grey background for context
    borderRadius: 5, // Rounded corners
    overflow: "hidden", // Ensures the inner bar stays inside the container
    marginBottom: 0, // Add space between bars and other elements
  },
  themeTitle: {
    fontSize: 16, // Set the font size
    fontWeight: "bold", // Make text bold
    marginBottom: 2, // Add space below the title
  },
  bgGray: {
    marginBottom: 0, // Use a numeric value instead of "10px"
  },
  heatmapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  heatmapBlock: {
    width: 60,
    height: 30,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  heatmapText: {
    fontSize: 10,
    color: "#FFFFFF",
    textAlign: "center",
  },
  topicText: { fontSize: 16, padding: 5, marginVertical: 2 },
  noRecommendations: { fontSize: 14, color: "gray" },
});
