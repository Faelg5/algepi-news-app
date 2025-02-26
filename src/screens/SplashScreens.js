import { View, Text } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const navigation = useNavigation();
  const [fontsLoaded, fontError] = useFonts({
    RobotoMedium: require('../fonts/RobotoFont/static/Roboto-Medium.ttf'),
    RobotoSemibold: require("../fonts/RobotoFont/static/Roboto-SemiBold.ttf"),
    RobotoBold: require("../fonts/RobotoFont/static/Roboto-Bold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }

    setTimeout(() => {
      navigation.navigate('Home');
    }, 2000);
  }, [fontsLoaded, fontError]);

  useEffect(() => { // UseEffect is a hook that runs after the first render of the component
    onLayoutRootView();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/welcome/splash-screen-1.png')}
    className="flex-1 items-center justify-center"
    >

      <LinearGradient
      colors={['rgba(93,191,140,0.75)', 'rgba(10,0,70, 0.95)']}
      style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%'}}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    />

    <View onLayout={onLayoutRootView}>
    <Text className ='text-white text-3xl font-extrabold uppercase'>
      Algepi News
    </Text>

    </View>

    </ImageBackground>
  );
}
