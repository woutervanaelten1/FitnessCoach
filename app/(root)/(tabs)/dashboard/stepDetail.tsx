import { useProfile } from "@/app/context/ProfileContext";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import DatePicker from "@/components/DatePicker";
import DetailView from "@/components/DetailComponent";
import IconTextBox from "@/components/IconTextBox";
import LoadingErrorView from "@/components/LoadingErrorView";
import ProgressBar from "@/components/ProgressBar";
import config from "@/config";
import { icons } from "@/constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from "victory-native";

/**
 * Represents a single entry in the weekly step data.
 *
 * @property day - The day of the week (e.g., "Mon", "Tue").
 * @property steps - Total number of steps taken on that day.
 * @property isFixedDate - Indicates whether the entry matches the selected (highlighted) date.
 */
type StepEntry = {
    day: string;
    steps: number;
    isFixedDate?: boolean;
};

/**
 * The StepDetail screen provides an overview of the user's step tracking data,
 * including total steps, distance covered, and weekly step trends.
 *
 * @returns {JSX.Element} The StepDetail screen component.
 */
const StepDetail = () => {
    const [steps, setSteps] = useState(0);
    const [stepGoal, setStepGoal] = useState(0);
    const [distance, setDistance] = useState(0);
    const [stepData, setStepData] = useState<StepEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [detailLoading, setDetailLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [detail, setDetail] = useState<{ type: string; content: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date(config.FIXED_DATE));
    const { userId } = useProfile();

    /**
     * Custom theme settings for the Victory Bar Chart.
     */
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

   /**
   * Checks if a given string is a valid detail type.
   *
   * @param {string} type - The type to validate.
   * @returns {boolean} `true` if the type is "question", "advice", or "insight"; otherwise, `false`.
   */
      const isValidDetailType = (type: string): type is "question" | "advice" | "insight" => {
        return ["question", "advice", "insight"].includes(type);
      };

    /**
     * Fetches step data, including daily step summary, weekly trends, and goals.
     */
    const fetchData = async () => {
        try {
            setIsLoading(true);
            setHasError(false);
            const formattedDate = selectedDate.toISOString().split("T")[0];
            const [todayResponse, weeklyResponse, goalResponse] = await Promise.all([
                fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${formattedDate}&user_id=${userId}`),
                fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${formattedDate}&user_id=${userId}`),
                fetch(`${config.API_BASE_URL}/data/goals/${userId}/steps`)
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
            setHasError(true);
        } finally {
            setIsLoading(false);
        }

    };

    /**
   * Fetches detailed step insights from the API.
   * This can be a question, insight or adivce for the user
   */
    const fetchDetail = async () => {
        try {
            setDetailLoading(true);
            const formattedDate = selectedDate.toISOString().split("T")[0];
            const response = await fetch(`${config.API_BASE_URL}/chat/detail?date=${formattedDate}&metric=steps&user_id=${userId}`);
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
    }, [userId, selectedDate]);


    if (isLoading || hasError) {
        return (
            <LoadingErrorView
                isLoading={isLoading}
                hasError={hasError}
                onRetry={fetchData}
                loadingText="Loading your step data..."
                errorText="Failed to load your step data. Do you want to try again?"
                headerTitle="Targets & Progress"
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
        );
    }

    return (
        <ScrollView className="flex-1 px-4 bg-white">
            <CustomHeader title="Steps overview" showBackButton={true} />
            <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            {/* Step Summary */}
            <View className="flex-row justify-between mb-4 mt-4">
                <IconTextBox icon={icons.walking} topText={steps.toLocaleString()} bottomText="Steps" />
                <IconTextBox icon={icons.ruler} topText={distance.toLocaleString()} bottomText="Km" />
            </View>

            {/* Step Progress */}
            <View>
                {steps >= stepGoal ? (
                    <Text className="text-black text-lg font-bold">
                        <Text className="text-blue-500">Goal reached!</Text> You've taken{" "}
                        <Text className="text-blue-500">{steps.toLocaleString()} steps</Text>. Keep going!
                    </Text>
                ) : (
                    <Text className="text-black text-lg font-bold">
                        You're{" "}
                        <Text className="text-blue-500">
                            {(stepGoal - steps).toLocaleString()} steps
                        </Text>{" "}
                        away from your goal!
                    </Text>
                )}
                <ProgressBar value={steps} target={stepGoal} />
            </View>

            {/* Step Details */}
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
                ) : detail && isValidDetailType(detail.type) ? (
                    <DetailView
                        detail={{ type: detail.type, content: detail.content }}
                    />
                ) : (
                    <Text className="text-gray-500 text-lg">No details found.</Text>
                )}
            </View>

            {/* Weekly Steps Summary */}
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

            <CustomButton className="mb-3" title="Daily step breakdown" onPress={() => router.push("/dashboard/dailyStep")} />
        </ScrollView>
    );
};

export default StepDetail;