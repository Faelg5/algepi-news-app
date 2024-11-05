import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { heightPercentageToDP } from "react-native-responsive-screen";

export default function ThemesCard({ themes, activeTheme, handleThemeChange,  localSelectedThemes //passed as a prop
}) {
  // console.log("THEMESSSS");
  // console.log(themes);
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="space-x-1"
        contentContainerStyle={{
          paddingRight: 20,
        }}
      >
        {themes.map((theme, index) => {
          const isActive = localSelectedThemes.includes(theme); // Check if the theme is in localSelectedThemes
          const activeButtonClass = isActive
            ? "bg-green-700"
            : "bg-black/10 dark:bg-neutral-600";
          const activeTextClass = isActive
            ? "text-white"
            : "text-gray-900 dark:text-neutral-600";

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                handleThemeChange(theme),
                  console.log("Pressed theme: " + theme);
              }}
              className="flex items-center space-y-1"
            >
              <View className={"rounded-full py-2 px-4 " + activeButtonClass}>
                <Text
                  className={"capitalize " + activeTextClass}
                  style={{
                    fontSize: heightPercentageToDP(1.6),
                  }}
                >
                  {theme}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
