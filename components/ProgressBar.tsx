import React from "react";
import { View, Text } from "react-native";

/**
 * ProgressBar Component
 * A visual indicator of progress towards a goal.
 *
 * @param {number} value - The current progress value.
 * @param {number} target - The goal or target value.
 */
const ProgressBar = ({ value, target }: { value: number; target: number }) => {
  // Ensure the progress percentage is within 2% to 100% range for visibility
  const progress = Math.max(Math.min(value / target, 1) * 100, 2);

  return (
    <View className="mt-4">
      {/* Background bar */}
      <View className="w-full h-2 bg-gray-200 rounded-full mt-2">
        {/* Progress bar */}
        <View
          style={{ width: `${progress}%` }}
          className="h-full bg-blue-500 rounded-full"
        />
      </View>
      {/* Labels for start (0) and target value */}
      <View className="flex-row justify-between mt-1">
        <Text className="text-black text-sm">0</Text>
        <Text className="text-blue-500 text-sm">{target.toLocaleString()}</Text>
      </View>
    </View>
  );
};

export default ProgressBar;
