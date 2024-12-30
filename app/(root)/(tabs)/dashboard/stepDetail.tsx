import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import IconTextBox from "@/components/IconTextBox";
import ProgressBar from "@/components/ProgressBar";
import config from "@/config";
import { icons } from "@/constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from "victory-native";

const StepDetail = () => {
    const [steps, setSteps] = useState(0);
    const [stepGoal, setStepGoal] = useState(0);
    const [distance, setDistance] = useState(0);
    const [stepData, setStepData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [detail, setDetail] = useState<{ type: string; content: string } | null>(null);


    const customThemeBarChart = {
        ...VictoryTheme.material,
        bar: {
            style: {
                data: {
                    fill: "#4A90E2",
                    strokeWidth: 2,
                },
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
                ticks: { stroke: "none" }
            },
        },
        axisLeft: {
            style: {
                axis: { stroke: "none" },
                grid: { stroke: "none" },
                tickLabels: { fill: "none" },
                ticks: { stroke: "none" }
            },
        },
    };



    const fetchData = async () => {
        try {
            const [todayResponse, weeklyResponse, goalResponse] = await Promise.all([
                fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}`),
                fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${config.FIXED_DATE}`),
                fetch(`${config.API_BASE_URL}/data/goals/${config.USER_ID}/steps`)
            ]);

            if (!todayResponse.ok || !weeklyResponse.ok || !goalResponse.ok) {
                throw new Error("Failed to fetch data");
            }

            const todayDataArray = await todayResponse.json();
            const weeklyDataArray = await weeklyResponse.json();
            const goalData = await goalResponse.json();

            // Goal Data
            if (goalData) {
                setStepGoal(goalData.goal);
            }


            // Today Data
            const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
            if (todayData) {
                setSteps(todayData.totalsteps);
                setDistance(todayData.totaldistance);
            }

            // Weekly step Data
            if (weeklyDataArray?.available_data?.length > 0) {
                const processedStepData = weeklyDataArray.available_data.map(
                    (item: { date: string; totalsteps: number }) => {
                        const date = new Date(item.date);
                        const fixedDate = new Date(config.FIXED_DATE);
                        const options: Intl.DateTimeFormatOptions = { weekday: "short" };
                        return {
                            day: new Intl.DateTimeFormat("en-US", options).format(date),
                            steps: item.totalsteps,
                            isFixedDate: date.toDateString() === fixedDate.toDateString(),
                        };
                    }
                );
                setStepData(processedStepData);

            }


        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }

    };

    const fetchDetail = async () => {
        try {
            setDetailLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/chat/detail?date=${config.FIXED_DATE}&metric=steps`);
            if (!response.ok) throw new Error("Failed to fetch detail");

            const data = await response.json();
            setDetail(data.output);
        } catch (error) {
            console.error("Error fetching detail:", error);
            setFetchError(true);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchDetail();
    }, []);

    return (
        <ScrollView className="flex-1 px-4 bg-white">
            <CustomHeader title="Steps overview" showBackButton={true} />

            <View className="flex-row justify-between mb-4 mt-4">
                <IconTextBox icon={icons.walking} topText={steps.toLocaleString()} bottomText="Steps" />
                <IconTextBox icon={icons.ruler} topText={distance.toLocaleString()} bottomText="Km" />
            </View>

            <View>
                <Text className="text-black text-lg font-bold">
                    You're{" "}
                    <Text className="text-blue-500">{(stepGoal - steps).toLocaleString()} steps</Text> away from your goal!
                </Text>
                <ProgressBar value={steps} target={stepGoal} />
            </View>

            <View>
                {detailLoading ? (
                    <View className="items-center mt-5">
                        <ActivityIndicator size="large" color="#307FE2" />
                        <Text className="text-lg font-bold">Loading...</Text>
                    </View>
                ) : fetchError ? (
                    <View className="items-center">
                        <Text className="text-red-500 text-lg font-bold mb-4">Failed to load details</Text>
                        <CustomButton
                            title="Retry"
                            onPress={fetchDetail}
                            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg"
                        />
                    </View>
                ) : detail ? (
                    detail.type === "question" ? (
                        <View className="mt-4 items-center">
                            <ChatBubble
                                message={detail.content}
                                isUser={false}
                                maxWidth={100}
                            />

                            <CustomButton
                                title="Check it out"
                                onPress={() => console.log("Check it out button clicked")}
                                className="mt-4 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg"
                            />
                        </View>
                    ) : (
                        <View>
                            <Text className="text-lg font-bold">{detail.type}</Text>
                            <View className="items-center px-4">
                                <Text className="text-blue-500 text-lg font-bold">{detail.content}</Text>
                            </View>
                        </View>
                    )
                ) : (
                    <Text className="text-gray-500 text-lg">No details found.</Text>
                )}
            </View>

            <Text className="text-black text-lg font-semibold mb-1 mt-6">Weekly steps summary</Text>
            <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
                <VictoryChart height={224} theme={customThemeBarChart}>
                    <VictoryAxis style={customThemeBarChart.axisBottom.style} />
                    <VictoryAxis
                        dependentAxis
                        style={customThemeBarChart.axisLeft.style}
                    />
                    <VictoryBar
                        barWidth={20}
                        cornerRadius={{ top: 3 }}
                        data={stepData}
                        x="day"
                        y="steps"
                        style={{
                            data: {
                                fill: ({ datum }) => (datum.isFixedDate ? "#ff4d4d" : "#4A90E2"),
                            },
                        }}
                        labels={({ datum }) => datum.steps.toLocaleString()}
                        labelComponent={
                            <VictoryLabel
                                dy={-10}
                                style={{ fontSize: 15, fill: "#307FE2" }}
                            />
                        } />
                </VictoryChart>
            </View>

            <CustomButton title="Daily step breakdown" onPress={() => router.push("/dashboard/dailyStep")} />
        </ScrollView>
    );
};

export default StepDetail;