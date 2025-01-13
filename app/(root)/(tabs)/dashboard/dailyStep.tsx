import CustomHeader from "@/components/CustomHeader";
import FullCircle from "@/components/FullCircle";
import config from "@/config";
import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { icons } from "@/constants";
import LoadingErrorView from "@/components/LoadingErrorView";

const DailyStep = () => {
    const [steps, setSteps] = useState(0);
    const [stepGoal, setStepGoal] = useState(0);
    const [processedStepData, setProcessedStepData] = useState<{ time: number; steps: number }[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date(config.FIXED_DATE));
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);


    const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    const hours = Array.from({ length: 24 }, (_, i) => i);

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

    const fetchStepData = async (date: Date) => {
        try {
            setIsLoading(true);
            setHasError(false);
            const formattedDate = date.toISOString().split("T")[0]; // Format as yyyy-MM-dd
            setIsLoading(true);

            const [hourlyResponse, todayResponse, goalResponse] = await Promise.all([
                fetch(`${config.API_BASE_URL}/data/hourly_merged/by-date?date=${formattedDate}`),
                fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${formattedDate}`),
                fetch(`${config.API_BASE_URL}/data/goals/${config.USER_ID}/steps`)
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

            // Specific day data
            const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
            if (todayData) {
                setSteps(todayData.totalsteps);
            }

            // Map and preprocess the data
            const processedData = hours.map((hour) => {
                const match = hourlyDataArray.find(
                    (item: { timestamp: string; steptotal: number }) =>
                        new Date(item.timestamp).getHours() === hour
                );
                return {
                    time: hour,
                    steps: match ? match.steptotal : 0, // Set steps to 0 if no data
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

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    useEffect(() => {
        fetchStepData(selectedDate);
    }, [selectedDate]);

    if (isLoading || hasError) {
        return (
          <LoadingErrorView
            isLoading={isLoading}
            hasError={hasError}
            onRetry={() => fetchStepData(selectedDate)}
            loadingText="Loading your step data..."
            errorText="Failed to load your step data. Do you want to try again?"
            headerTitle="Targets & Progress"
          />
        );
      }

    return (
        <ScrollView className="flex-1 px-4 bg-white">
            <CustomHeader title="Hourly step overview" showBackButton={true} />

            <View className="flex-row justify-between items-center mt-4">
                <TouchableOpacity
                    className="bg-gray-200 rounded-full p-2"
                    onPress={() => changeDate(-1)}
                >
                    <Image
                        source={icons.backArrow}
                        resizeMode="contain"
                        className="w-7 h-7"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-blue-500 py-2 px-4 rounded-lg"
                    onPress={() => setDatePickerOpen(true)}
                >
                    <Text className="text-white font-bold">{selectedDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-gray-200 rounded-full p-2"
                    onPress={() => changeDate(1)}
                >
                    <Image
                        source={icons.forward}
                        resizeMode="contain"
                        className="w-7 h-7"
                    />
                </TouchableOpacity>
            </View>

            {isDatePickerOpen && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setDatePickerOpen(false);
                        if (date) setSelectedDate(date);
                    }}
                />
            )}

            <View className="flex-1 items-center justify-center">
                <View className="flex-row justify-between items-center mb-4 mt-4 w-1/2">
                    <View className="flex-1 items-center justify-center bg-gray-100 rounded-lg p-4 mx-1 py-8">
                        <FullCircle goal={stepGoal} value={steps} />
                    </View>
                </View>
            </View>

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
