import {React, useContext} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "nativewind";
import Ionicons from "react-native-vector-icons/Ionicons";
import AskGPTScreen from "../screens/AskGPTScreen";
import { ColorList } from "../constants/colors";
import { UserPreferencesContext } from "../../App"; // Import context
import translations from "../constants/translations"; // Import translations

import AIGuideScreen from "../screens/AIGuideScreen";
import FeedScreenXAI from "../screens/FeedScreenXAI";
// import FeedScreen from '../screens/FeedScreen_transparency_210125';
// import FeedScreen from '../screens/FeedScreen_latest';
import FeedScreen from "../screens/FeedScreen-WIP270125";

import PreferencesScreen, {
  isSurveyModeEnabled,
} from "../screens/PreferencesScreen"; // Import the new screen

import SummariesScreen from "../screens/SummariesScreen";
import SavedScreen from "../screens/SavedScreen";
import SplashScreens from "../screens/SplashScreens";
import WelcomeScreen from "../screens/WelcomeScreen";
import NewsDetailsScreen from "../screens/NewsDetailsScreen";

import "react-native-gesture-handler";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SwipeStack = createNativeStackNavigator(); // Utilisez le Native Stack Navigator



export default function AppNavigation() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { selectedThemes, selectedCountry, selectedLanguageCode } = useContext(
    UserPreferencesContext
  ); // Use context to get user preferences
  const profileName = translations[selectedLanguageCode]?.profileName || "Profile";

  const TabNavigator = () => {
    return (
      <Tab.Navigator
        initialRouteName="Fil" // Set initial route name here
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === "Storyteller") {
              iconName = focused ? "book" : "book-outline";
            }
            if (route.name === "Explorer" || route.name === "Fil") {
              iconName = focused ? "home" : "home-outline";
            }
            //  else if (route.name === 'Advice') {
            //     iconName = focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline';
            // }
            else if (route.name === "NewsDetails") {
              iconName = focused
                ? "document-text-sharp"
                : "document-text-outline";
            } else if (route.name === "Summary") {
              iconName = focused
                ? "document-text-sharp"
                : "document-text-outline";
            } else if (route.name === "Ask GPT") {
              iconName = focused
                ? "chatbubble-ellipses-sharp"
                : "chatbubble-ellipses-outline";
            } else if (route.name === "Profile" || route.name === "Profiel" || route.name === "Profil") {
              iconName = focused ? "person-sharp" : "person-outline";
            }
            const customSize = 24;

            return (
              <Ionicons
                name={iconName}
                size={customSize}
                color={focused ? "black": "gray"}
              />
            );
          },
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "HelveticaNeue",
          },
          tabBarStyle: {
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
          },
        })}
      >
        {/* <Tab.Screen name="Advice" component={AIGuideScreen} /> */}
        {isSurveyModeEnabled ? (
          <>
            <Tab.Screen name="Fil" component={FeedScreen} />
          </>
        ) : (
          <>
            <Tab.Screen name="Explorer" component={FeedScreen} />

            {/* <Tab.Screen name="Storyteller" component={FeedScreen} /> */}

            <Tab.Screen name="Summary" component={SummariesScreen} />
            {/* <Tab.Screen name="Ask GPT" component={AskGPTScreen} /> */}
          </>
        )}

        <Tab.Screen name={profileName} component={PreferencesScreen} />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splashs" component={SplashScreens} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Explorer" component={FeedScreen} />
        {isSurveyModeEnabled ? (
          <></>
        ) : (
          <>
            <Stack.Screen name="Summary" component={SummariesScreen} />
            <Stack.Screen name="Ask GPT" component={AskGPTScreen} />
            <Stack.Screen name={profileName} component={PreferencesScreen} />
          </>
        )}

        <Stack.Screen
          name="NewsDetails"
          component={NewsDetailsScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="HomeTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
    //     <NavigationContainer>
    //     <SwipeStack.Navigator screenOptions={{ gestureEnabled: true }}>
    //     {/* <SwipeStack.Screen name="Summary" component={SummariesScreen} /> */}

    //       <SwipeStack.Screen name="Feed" component={FeedScreen} />
    //       <SwipeStack.Screen name="Summary" component={SummariesScreen} />
    //     </SwipeStack.Navigator>
    //   </NavigationContainer>
  );
}
