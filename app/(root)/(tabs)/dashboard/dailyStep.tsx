import CustomHeader from "@/components/CustomHeader";
import FullCircle from "@/components/FullCircle";
import config from "@/config";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import LoadingErrorView from "@/components/LoadingErrorView";
import { useProfile } from "@/app/context/ProfileContext";
import DatePicker from "@/components/DatePicker";

/**
 * Represents an hourly step data entry.
 */
type StepEntry = {
    time: number;
    steps: number;
};

/**
 * The DailyStep screen provides an overview of the user's hourly step tracking data
 * for a selected date, including a step goal comparison.
 *
 * @returns {JSX.Element} The DailyStep screen component.
 */
const DailyStep = () => {
    const [steps, setSteps] = useState(0);
    const [stepGoal, setStepGoal] = useState(0);
    const [processedStepData, setProcessedStepData] = useState<StepEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date(config.FIXED_DATE));
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const { userId } = useProfile();

    const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    const hours = Array.from({ length: 24 }, (_, i) => i);

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
                ticks: { stroke: "none" },
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

    /**
     * Fetches step data for a given date, including hourly steps and step goals.
     *
     * @param {Date} date - The selected date.
     */
    const fetchStepData = async (date: Date) => {
        try {
            setIsLoading(true);
            setHasError(false);
            const formattedDate = date.toISOString().split("T")[0]; // Format as yyyy-MM-dd
            setIsLoading(true);

            const [hourlyResponse, todayResponse, goalResponse] = await Promise.all([
                fetch(`${config.API_BASE_URL}/data/hourly_merged/by-date?date=${formattedDate}&user_id=${userId}`),
                fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${formattedDate}&user_id=${userId}`),
                fetch(`${config.API_BASE_URL}/data/goals/${userId}/steps`)
            ]);

            if (!hourlyResponse.ok || !todayResponse.ok || !goalResponse.ok) {
                throw new Error("Failed to fetch data");
            }

            const hourlyDataArray = await hourlyResponse.json();
            const todayDataArray = await todayResponse.json();
            const goalData = await goalResponse.json();

            if (goalData) {
                setStepGoal(goalData.goal);
            }

            // Daily step data
            const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
            if (todayData) {
                setSteps(todayData.totalsteps);
            }

            // Process hourly step data
            const processedData = hours.map((hour) => {
                const match = hourlyDataArray.find(
                    (item: { timestamp: string; steptotal: number }) =>
                        new Date(item.timestamp).getHours() === hour
                );
                return {
                    time: hour,
                    steps: match ? match.steptotal : 0,
                };
            });

            setProcessedStepData(processedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Changes the selected date by the given number of days.
     *
     * @param {number} days - The number of days to add or subtract.
     */
    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    useEffect(() => {
        fetchStepData(selectedDate);
    }, [selectedDate, userId]);

    if (isLoading || hasError) {
        return (
            <LoadingErrorView
                isLoading={isLoading}
                hasError={hasError}
                onRetry={() => fetchStepData(selectedDate)}
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
            <CustomHeader title="Hourly step overview" showBackButton={true} />

            {/* Date Selection */}
            <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>

            {/* Step Progress */}
            <View className="flex-1 items-center justify-center">
                <View className="flex-row justify-between items-center mb-4 mt-4 w-1/2">
                    <View className="flex-1 items-center justify-center bg-gray-100 rounded-lg p-4 mx-1 pt-8">
                        <FullCircle goal={stepGoal} value={steps} />
                        <Text className="text-blue-500 font-bold mt-4 text-lg">{steps} Steps</Text>
                    </View>
                </View>
            </View>

            {/* Hourly Steps Breakdown */}
            <Text className="text-black text-lg font-semibold mb-1 mt-6">Hourly step breakdown</Text>
            <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
                <VictoryChart
                    theme={customThemeBarChart}
                    padding={{ top: 30, bottom: 40, left: 65, right: 35 }}
                    height={224}
                >
                    <VictoryAxis
                        tickValues={[0, 4, 8, 12, 16, 20, 24]}
                        tickFormat={(t) => timeLabels[t / 4]}
                        style={customThemeBarChart.axisBottom.style}
                    />
                    <VictoryAxis dependentAxis style={customThemeBarChart.axisLeft.style} />
                    <VictoryBar
                        cornerRadius={{ top: 3 }}
                        data={processedStepData}
                        x="time"
                        y="steps"
                        barWidth={8}
                    />
                </VictoryChart>
            </View>
        </ScrollView>
    );
};

export default DailyStep;
