import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';
import AIGuideScreen from '../screens/AIGuideScreen';
import FeedScreen from '../screens/FeedScreen';
import SummariesScreen from '../screens/SummariesScreen';
import SavedScreen from '../screens/SavedScreen';
import SplashScreens from '../screens/SplashScreens';
import WelcomeScreen from '../screens/WelcomeScreen';
import NewsDetailsScreen from '../screens/NewsDetailsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AskGPTScreen from '../screens/AskGPTScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    const TabNavigator = () => {
        return (
            <Tab.Navigator
                initialRouteName="Reasons" // Set initial route name here
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused }) => {
                        let iconName;
                        if (route.name === 'Feed') {
                            iconName = focused ? 'compass' : 'compass-outline';
                        }
                        //  else if (route.name === 'Advice') {
                        //     iconName = focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline';
                        // }
                        else if (route.name === 'Themes summary') {
                            iconName = focused ? 'document-text-sharp' : 'document-text-outline';
                        }
                        else if (route.name === 'Ask GPT') {
                            iconName = focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline';
                        }

                        const customSize = 24;

                        return (
                            <Ionicons name={iconName} size={customSize} color={focused ? 'green' : 'gray'} />
                        );
                    },
                    tabBarActiveTintColor: 'green',
                    tabBarInactiveTintColor: 'gray',
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontFamily: 'SpaceGroteskMedium',
                    },
                    tabBarStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                    },
                })}
            >
                <Tab.Screen name="Feed" component={FeedScreen} />
                {/* <Tab.Screen name="Advice" component={AIGuideScreen} /> */}
                {/* <Tab.Screen name="Saved" component={SummariesScreen} /> */}
                <Tab.Screen name="Themes summary" component={SummariesScreen} />
                <Tab.Screen name="Ask GPT" component={AskGPTScreen} />

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
                <Stack.Screen name="Themes summary" component={SummariesScreen} />
                <Stack.Screen name="Ask GPT" component={AskGPTScreen} />

                <Stack.Screen
                    name="NewsDetails"
                    component={NewsDetailsScreen}
                    options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="HomeTabs" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
