import React from "react";
import { View, Text } from "react-native";
import { VictoryPie } from "victory-native";

const FullCircle = ({ value, goal, metric="" }: { value: number; goal: number; metric?:string }) => {
  const percentage = Math.min((value / goal) * 100, 100);
  const remaining = 100 - percentage;

  return (
    <View
      style={{
        width: 75,
        height: 75,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 50,
      }}
    >
      <VictoryPie
        data={[
          { x: "Burned", y: percentage },
          { x: "Remaining", y: remaining },
        ]}
        colorScale={["#4A90E2", "#E0E0E0"]} 
        innerRadius={40} 
        width={200}
        height={200}
        style={{
          labels: { display: "none" },
        }}
      />
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#4A90E2" }}>
          {Math.round(percentage)}%
        </Text>
        <Text className="text-center" style={{ fontSize: 14,  color: "#4A90E2" }}>
          {`Goal: ${goal} ${metric}`}
        </Text>
      </View>
    </View>
  );
};

export default FullCircle;
