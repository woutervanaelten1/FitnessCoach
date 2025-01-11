import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import GoalEditModal from "@/components/goalEditModal";
import IconTextBox from "@/components/IconTextBox";
import InputModal from "@/components/inputModal";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryScatter, VictoryTheme } from "victory-native";

const StepDetail = () => {
    const [currentWeight, setCurrentWeight] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [weightData, setWeightData] = useState([]);
    const [minWeight, setMinWeight] = useState<number | null>(null);
    const [maxWeight, setMaxWeight] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGoalEditModalVisible, setIsGoalEditModalVisible] = useState(false);
    const [isInputModalVisible, setIsInputModalVisible] = useState(false);

    const [newGoalValue, setNewGoalValue] = useState("");

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
                ticks: { stroke: "none" }
            },
        },
    };


    const fetchData = async () => {
        try {
            const [todayResponse, weeklyResponse, goalResponse] = await Promise.all([
                fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}`),
                fetch(`${config.API_BASE_URL}/data/weight_log/week-back?date=${config.FIXED_DATE}`),
                fetch(`${config.API_BASE_URL}/data/goals/${config.USER_ID}/weight`)
            ]);

            if (!todayResponse.ok || !weeklyResponse.ok || !goalResponse.ok) {
                throw new Error("Failed to fetch data");
            }

            const todayDataArray = await todayResponse.json();
            const weeklyDataArray = await weeklyResponse.json();
            const goalData = await goalResponse.json();

            // Goal Data
            if (goalData) {
                setTargetWeight(goalData.goal);
            }

            //Current weight
            const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
            if (todayData) {
                setCurrentWeight(todayData.weightkg);
            }

            // Weight data
            if (weeklyDataArray.available_data?.length > 0) {
                const processedWeight = weeklyDataArray.available_data.map(
                    (item: { date: string; weightkg: number }) => {
                        const date = new Date(item.date);
                        const fixedDate = new Date(config.FIXED_DATE);
                        const options: Intl.DateTimeFormatOptions = { weekday: "short" };
                        return {
                            day: new Intl.DateTimeFormat("en-US", options).format(date),
                            weight: parseFloat(item.weightkg.toFixed(2)),
                            isFixedDate: date.toDateString() === fixedDate.toDateString(),
                        };
                    }
                );
                const weights = processedWeight.map((d: { day: string; weight: number }) => d.weight);
                setMinWeight(Math.min(...weights) - 0.5); // Add padding to min
                setMaxWeight(Math.max(...weights) + 0.5); // Add padding to max
                setWeightData(processedWeight);
            }


        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveNewGoal = async (inputTarget:number) => {
        try {
            // Post for new goal
            const response = await fetch(
                `${config.API_BASE_URL}/data/goals/${config.USER_ID}/weight?goal_value=${Number(inputTarget)}`,
                {
                    method: "POST",
                    headers: { "accept": "application/json" },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update goal");
            }
            let text = "Saved successfully!"

            setTargetWeight(Number(inputTarget));

            Toast.show({
                type: "success",
                text1: text,
                text2: "Your new goal has been saved.",
            });
        } catch (error) {
            console.error("Error saving goal:", error instanceof Error ? error.message : error);
            Toast.show({
                type: "error",
                text1: "Failed to update goal",
                text2: `An error occurred. Please try again.`,
            });
        }

        setIsGoalEditModalVisible(false);
    };


    const handleLogWeight = async (inputWeight:number) => {
        try {
            const heightInMeters = 1.60; // Example height
            const weight = Number(inputWeight);
            const bmi = (weight / (heightInMeters ** 2)).toFixed(2);
            const currentTimestamp = new Date();
            const fixedDateWithCurrentTime = `${config.FIXED_DATE} ${currentTimestamp.toTimeString().split(' ')[0]}`;
    
            const logEntry = {
                id: config.USER_ID,
                weightkg: weight,
                bmi: Number(bmi),
                timestamp: fixedDateWithCurrentTime,
                date: config.FIXED_DATE
            };
    
            // Post request to add the weight log entry
            console.log(logEntry);
            const response = await fetch(`${config.API_BASE_URL}/data/weight_log/add`, {
                method: "POST",
                headers: { 
                    "accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(logEntry)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to log weight");
            }

            setCurrentWeight(inputWeight);
    
            Toast.show({
                type: "success",
                text1: "Weight logged",
                text2: "Your new weight entry has been logged successfully."
            });
        } catch (error) {
            console.error("Error logging weight:", error instanceof Error ? error.message : error);
            Toast.show({
                type: "error",
                text1: "Failed to log weight",
                text2: "An error occurred. Please try again."
            });
        }
        setIsInputModalVisible(false);
    };


    return (
        <ScrollView className="flex-1 px-4 bg-white">
            <CustomHeader title="Weight overview" showBackButton={true} />

            <View className="flex-row justify-between mb-2 mt-4">
                <IconTextBox icon={icons.scale} topText={currentWeight.toLocaleString() + " kg"} bottomText="Current weight" />
                <IconTextBox icon={icons.target} topText={targetWeight.toLocaleString() + " kg"} bottomText="Target weight" />
            </View>
            <View className="flex-row justify-between">
                <View className="flex-1 mr-1">
                    <CustomButton title="Log Weight" onPress={() => setIsInputModalVisible(true)}/>
                </View>
                <View className="flex-1 ml-1">
                    <CustomButton title="New Target" onPress={() => setIsGoalEditModalVisible(true)} />
                </View>
            </View>

            <View className="mt-6">
                {/* Weight Section */}
                <Text className="text-black text-xl font-bold mb-1">Weight journey (in kgs)</Text>
                <Text className="text-blue-500 font-bold  mb-4">Current weight: <Text className="text-xl">{currentWeight} kg</Text></Text>
                <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
                    <VictoryChart padding={{ top: 30, bottom: 40, left: 60, right: 35 }} height={224} theme={customThemeLineChart} domain={{ y: [minWeight ?? 0, maxWeight ?? 100] }}>
                        <VictoryAxis
                            tickFormat={(t) => t} // Show days (e.g., "Mon", "Tue")
                            style={customThemeLineChart.axisBottom.style}
                        />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) => `${t}`} // Add "kg" to weight values
                            style={customThemeLineChart.axisLeft.style}
                        />
                        <VictoryArea
                            data={weightData}
                            x="day"
                            y="weight"
                            interpolation="monotoneX"
                            style={customThemeLineChart.area.style}
                        />
                        {weightData.length > 0 && (
                            <VictoryScatter
                                data={weightData}
                                x="day"
                                y="weight"
                                size={3}
                                style={{ data: { fill: "#4A90E2" } }}
                                labels={({ datum }) => `${datum.weight} kg`}
                                labelComponent={
                                    <VictoryLabel
                                        dy={-12}
                                        style={{ fontSize: 11, fill: "#307FE2" }}
                                    />
                                }
                            />
                        )}
                    </VictoryChart>
                </View>
            </View>

            <InputModal
                isVisible={isGoalEditModalVisible}
                title="Set a new target weight!"
                subtitle="Need a fresh goal? Update your target weight to keep pushing towards your dream!"
                placeholder={targetWeight}
                inputPlaceholder="Enter your target weight"
                onClose={() => setIsGoalEditModalVisible(false)}
                onSave={handleSaveNewGoal}
            />

            <InputModal
                isVisible={isInputModalVisible}
                title="Log your current weight"
                subtitle="Ready to update your progress? Enter your current weight to track changes over time."
                placeholder={currentWeight}
                inputPlaceholder="Enter current weight to log"
                onClose={() => setIsInputModalVisible(false)}
                onSave={handleLogWeight}
            />
            <Toast />
        </ScrollView>
    );
};
export default StepDetail;