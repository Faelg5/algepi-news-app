import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { trackEvent } from "@aptabase/react-native";

export function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    trackEvent("increment", { count: newCount });
  };

  const decrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    trackEvent("decrement", { count: newCount });
  };

  return (
    <View>
      <Button onPress={increment} title="Increment" />
      <Button onPress={decrement} title="Decrement" />
      <Text>Count is + {count}</Text>
    </View>
  );
}