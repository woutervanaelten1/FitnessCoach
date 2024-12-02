import React from "react";
import { View, Text } from "react-native";

const ProgressBar = ({ value, target }: { value: number; target: number }) => {
  const progress = Math.min(value / target, 1) * 100;

  return (
    <View className="mt-4">
      <View className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <View
          style={{ width: `${progress}%` }}
          className="h-full bg-blue-500 rounded-full"
        />
      </View>

      <View className="flex-row justify-between mt-1">
        <Text className="text-black text-sm">0</Text>
        <Text className="text-blue-500 text-sm">{target.toLocaleString()}</Text>
      </View>
    </View>
  );
};

export default ProgressBar;
