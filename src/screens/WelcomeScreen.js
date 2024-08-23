import { View, Text, ImageBackground, TouchableOpacity } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskMedium: require('../fonts/SpaceGrotesk-Medium.ttf'),
    SpaceGroteskSemibold: require('../fonts/SpaceGrotesk-SemiBold.ttf'),
    SpaceGroteskBold: require('../fonts/SpaceGrotesk-Bold.ttf'),
  });
  return (
    <ImageBackground source={require('../../assets/images/welcome/splash-screen-1.png')} className="flex-1 items-center justify-center pb-6">

      <LinearGradient
      colors={['transparent', 'rgba(10,0,70, 0.9)']}
      style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%'}}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    />
  
    <View className='flex-1 items-center justify-end max-w-[85%] space-y-4'>
      <Text className='font-bold text-4xl shadow-2xl text-white text-center tracking-wider'
      style={{ 
        fontSize: wp(10),
        fontFamily: 'Helvetica',
       }}
        > 
        Explainews
        </Text>

        <Text className='text-white text-center max-w-[85%] leading-12 tracking-wider'
        style={{
          fontSize: wp(5),
          fontFamily: 'Helvetica',
          fontWeight:'bold'
        }}>
          A more transparent news feed.
        </Text>
    </View>

        <TouchableOpacity className='bg-green-900 rounded-full p-4 justify-center items-center w-[90%] mt-8'
        onPress={() => navigation.navigate('HomeTabs')}>
          <Text className='text-white text-center font-bold tracking-wider'
          style={{
            fontSize: wp(5),
            fontFamily: 'Helvetica',
          }}>
            Get Started
          </Text>


        </TouchableOpacity>


    </ImageBackground>

  )
}