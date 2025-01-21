import {
  View,
  Text,
  TouchableOpacity,
  Touchable,
  ActivityIndicator,
  Dimensions
} from "react-native";
import React, { useState } from "react";
import { ChevronLeftIcon, ShareIcon } from "react-native-heroicons/outline";
import { BookmarkIcon } from "react-native-heroicons/solid";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { ColorList, colorList }  from "../constants/colors";
import { trackEvent } from "@aptabase/react-native";


const { width, height } = Dimensions.get("window");

export default function NewsDetailsScreen() {
  // For Aptabase
  const [count, setCount] = useState(0);


  // For WebView
  const {params: item} = useRoute();
  const navigation = useNavigation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [visible, setVisible] = useState(false);
  const toggleBookMarkAndSave = () => {};
  return (
    <>
      <View className="w-full flex-row justify-between items-center px-4 pt-10 pb-4 bg-white">
        <View className="bg-gray-100 p-2 rounded-full items-center justify-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={25} color="gray" strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <View className="space-x-3 my-5 rounded-full items-center justify-center flex-row">
          <Text>Topic:{ item.item.topic }</Text> 
          
          <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
            <ShareIcon size={25} color="gray" strokeWidth={3} />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-100 p-2 rounded-full"
            onPress={toggleBookMarkAndSave}
          >
            <BookmarkIcon size={25} color="gray" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
      <View>

        {visible && (
          console.log(item.item.link),
          <ActivityIndicator
            size={"large"}
            color={"green"}
            style={{
              position: "absolute",
              top: height / 2,
              left: width / 2,
            }}
          />
        )}
      </View>

              {/* WebView */}
              <WebView
          source={{ uri: item.item.link }}
          onLoadStart={() => setVisible(true)}
          onLoadEnd={() => setVisible(false)}
          onError={() => setLoading(false)} // Handle load errors
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: ColorList.backgroundPrimary,
            marginTop: 20,
          }}
        />
    </>
  );
}
