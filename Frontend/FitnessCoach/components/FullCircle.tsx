import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { VictoryPie } from "victory-native";


/**
 * FullCircle Component
 * A circular progress indicator showing progress towards a goal.
 *
 * @param {number} value - The current progress value.
 * @param {number} goal - The target value for the goal.
 * @param {string} [metric=""] - Optional metric (e.g., "steps", "kcal").
 */
const FullCircle = ({ value, goal, metric="" }: { value: number; goal: number; metric?:string }) => {
  const percentage = Math.min((value / goal) * 100, 100);
  const remaining = 100 - percentage;

  return (
    <View style={styles.container}>
      <VictoryPie
        data={[
          { x: "Achieved", y: percentage },
          { x: "Remaining", y: remaining },
        ]}
        colorScale={["#4A90E2", "#E0E0E0"]}
        innerRadius={40}
        width={200}
        height={200}
        style={{ labels: { display: "none" } }}
      />
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#4A90E2" }}>
          {Math.round(percentage)}%
        </Text>
        <Text className="text-center" style={{ fontSize: 14,  color: "#4A90E2" }}>
          Goal: {goal} {metric}
        </Text>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  goalText: {
    fontSize: 12,
    color: "#4A90E2",
    textAlign: "center",
  },
});

export default FullCircle;
