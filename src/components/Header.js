import { TouchableOpacity, View, Text, Switch, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import MagnifyingGlassIcon from 'react-native-heroicons/solid/MagnifyingGlassIcon';
import { ColorList } from "../constants/colors";


export default function Header() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation = useNavigation();

  const isDarkMode = colorScheme === 'dark';

  return (
    <View
      className="flex-row justify-between items-center mx-0 mt-2"
      style={{ backgroundColor: isDarkMode ? '#999' : '#fff', padding: 2, borderRadius: 10}}
    >
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Image
          source={require('../../assets/images/welcome/logo-algepi.png')}
          style={{
            resizeMode: 'contain',
            marginLeft: 20,
            height: 30,
            width: 60,
            borderRadius: 15, // Add borderRadius for rounded corners
          }}
        />
      </TouchableOpacity>
      <Text className="px-0 text-sm font-normal">
        
      </Text>
      <View className="flex-row space-x-4 rounded-full justify-center items-center">
        {/* <Switch value={isDarkMode} onChange={toggleColorScheme} /> */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
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
        </TouchableOpacity>
      </View>
    </View>
  );
}