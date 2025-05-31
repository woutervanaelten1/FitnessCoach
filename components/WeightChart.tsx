// components/WeightChart.tsx
import React from "react";
import { View, Text } from "react-native";
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryScatter, VictoryTheme } from "victory-native";

type WeightEntry = {
    day: string;
    weight: number;
    isFixedDate?: boolean;
};

type WeightChartProps = {
    weightData: WeightEntry[];
    currentWeight: number;
    minWeight: number | null;
    maxWeight: number | null;
    showTitle?: boolean;
};

const customThemeLineChart = {
    ...VictoryTheme.material,
    area: {
        style: {
            data: {
                fill: "rgba(74, 144, 226, 0.3)",
                stroke: "#4A90E2",
                strokeWidth: 2,
            },
            labels: { fontSize: 10, fill: "#333" },
        },
    },
    axisBottom: {
        style: {
            axis: { stroke: "none" },
            tickLabels: {
                fill: "#4A90E2",
                fontSize: 14,
                fontWeight: "bold",
            },
            grid: { stroke: "none" },
        },
    },
    axisLeft: {
        style: {
            axis: { stroke: "none" },
            grid: { stroke: "none" },
            tickLabels: {
                fill: "#4A90E2",
                fontSize: 14,
                fontWeight: "bold",
            },
            ticks: { stroke: "none" },
        },
    },
};

const WeightChart = ({
    weightData,
    currentWeight,
    minWeight,
    maxWeight,
    showTitle = true,
}: WeightChartProps) => {
    return (
        <View className="mt-4">
            {showTitle && (
                <>
                    <Text className="text-black text-lg font-semibold mb-1">Weight journey (in kgs)</Text>
                    <Text className="text-blue-500 font-bold mb-4">
                        Current weight: <Text className="text-xl">{currentWeight?.toFixed(1)} kg</Text>
                    </Text>
                </>
            )}
            {weightData.length > 0 ? (
                <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
                    <VictoryChart
                        padding={{ top: 30, bottom: 40, left: 60, right: 35 }}
                        height={224}
                        theme={customThemeLineChart}
                        domain={{ y: [minWeight ?? 0, maxWeight ?? 100] }}
                    >
                        <VictoryAxis tickFormat={(t) => t} style={customThemeLineChart.axisBottom.style} />
                        <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} style={customThemeLineChart.axisLeft.style} />
                        <VictoryArea data={weightData} x="day" y="weight" interpolation="monotoneX" style={customThemeLineChart.area.style} />
                        <VictoryScatter
                            data={weightData}
                            x="day"
                            y="weight"
                            size={3}
                            style={{ data: { fill: "#4A90E2" } }}
                            labels={({ datum }) => `${datum.weight.toFixed(1)} kg`}
                            labelComponent={
                                <VictoryLabel
                                    dy={-12}
                                    style={{ fontSize: 11, fill: "#307FE2" }}
                                />
                            }
                        />
                    </VictoryChart>
                </View>
            ) : (
                <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
                    <Text className="text-blue-500 font-bold text-lg text-center mt-4">
                        No weight data available for the past week.
                    </Text>
                </View>
            )}
        </View>
    );
};

export default WeightChart;
