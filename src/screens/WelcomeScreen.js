import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [fontsLoaded, fontError] = useFonts({
    RobotoMedium: require("../fonts/RobotoFont/static/Roboto-Medium.ttf"),

    RobotoSemibold: require("../fonts/RobotoFont/static/Roboto-SemiBold.ttf"),

    RobotoBold: require("../fonts/RobotoFont/static/Roboto-Bold.ttf"),
  });
  return (
    <ImageBackground
      source={require("../../assets/images/welcome/splash-screen-1.png")}
      className="flex-1 items-center justify-center pb-6"
    >
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,1)"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View className="flex-1 items-center justify-end max-w-[85%] space-y-4">
        <Text
          className="font-bold text-4xl shadow-2xl text-white text-center tracking-wider"
          style={{
            fontSize: wp(10),
            fontFamily: "Helvetica",
          }}
        >
          NewsLens
        </Text>

        <Text
          className="text-white text-center max-w-[85%] leading-12 tracking-wider"
          style={{
            fontSize: wp(4),
            fontFamily: "Helvetica",
            fontWeight: "normal",
          }}
        >
Your news copilot.        </Text>
        <Text
          className="text-white text-justify max-w-[85%] leading-12 tracking-wider"
          style={{
            fontSize: wp(4),
            fontFamily: "Helvetica",
            fontWeight: "normal",
          }}
        >
Title Check — Reveal how headlines shape your perception.</Text>

  <Text
          className="text-white text-justify max-w-[85%] leading-12 tracking-wider"
          style={{
            fontSize: wp(4),
            fontFamily: "Helvetica",
            fontWeight: "normal",
          }}
        >
Monthly Topic Recap — Spot your reading trends.       </Text>

<Text
          className="text-white text-justify max-w-[85%] leading-12 tracking-wider"
          style={{
            fontSize: wp(4),
            fontFamily: "Helvetica",
            fontWeight: "normal",
          }}
        >
Summary — Your instant news digest.     </Text>



        <Text
          className="font-bold text-4xl shadow-2xl text-white text-center tracking-wider"
          style={{
            fontSize: wp(6),
            fontFamily: "Helvetica",
          }}
        >
          Consent notice:
        </Text>
        <Text
          className="text-white text-center max-w-[85%] leading-12 tracking-wider"
          style={{
            fontSize: wp(4),
            fontFamily: "Helvetica",
            fontWeight: "bold",
          }}
        >
           By clicking “Agree,” you allow anonymous click
          tracking. You can opt out anytime in the Profile tab.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-full p-4 justify-center items-center w-[90%] mt-8"
        onPress={() => navigation.navigate("HomeTabs")}
      >
        <Text
          className="text-white text-center font-bold tracking-wider"
          style={{
            fontSize: wp(5),
            fontFamily: "Helvetica",
          }}
        >
          Agree
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}
