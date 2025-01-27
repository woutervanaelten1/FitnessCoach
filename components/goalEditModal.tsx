import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Modal, ActivityIndicator, Image } from "react-native";
import CustomButton from "./CustomButton";
import config from "@/config";
import { icons } from "@/constants";

const GoalEditModal = ({
    isVisible,
    goal,
    metric,
    onClose,
    onSave,
}: {
    isVisible: boolean;
    goal: number;
    metric: string;
    onClose: () => void;
    onSave: (newGoal: number) => void;
}) => {
    const [inputValue, setInputValue] = useState<string>(goal.toString());
    const [goalSuggestion, setGoalSuggestion] = useState<{ goal: string; justification: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setFetchError(false);
        try {
            const response = await fetch(
                `${config.API_BASE_URL}/chat/new_goal?date=${config.FIXED_DATE}&metric=${metric}&current_goal=${goal}`
            );
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();
            console.log(data);
            if (data?.suggestion) {
                setGoalSuggestion({ goal: data.suggestion.goal, justification: data.suggestion.justification });
            } else {
                setFetchError(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setFetchError(true);
        } finally {
            setIsLoading(false);
        }
    }, [metric, goal]);

    useEffect(() => {
        if (isVisible) {
            setInputValue(goal.toString()); // Reset input value when modal opens
            fetchData();
        }
    }, [isVisible, fetchData, goal]);

    return (
        <Modal visible={isVisible} animationType="fade" transparent>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <View className="bg-white p-6 rounded-lg w-11/12">
                    <Text className="text-xl font-bold text-center mb-4">
                        {metric === "active_minutes"
                            ? "Change your activity goal"
                            : `Change your ${metric} goal`}
                    </Text>

                    <Text className="text-lg text-blue-500 font-bold">The fitness coach suggests:</Text>

                    <View>
                        {isLoading ? (
                            <View className="items-center mt-5">
                                <ActivityIndicator size="large" color="#307FE2" />
                                <Text className="text-lg font-bold">Loading...</Text>
                            </View>
                        ) : fetchError ? (
                            <View className="items-center mt-5">
                                <Text className="text-red-500 text-lg font-bold mb-4">
                                    Failed to load suggestion, do you want to try again?
                                </Text>
                                <CustomButton
                                    title="Retry"
                                    onPress={fetchData}
                                    className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mb-4 w-1/2"
                                />
                            </View>
                        ) : goalSuggestion ? (
                            <View className="pr-5">
                                <View className="flex-row items-center">
                                    <Image source={icons.target} tintColor="#307FE2" resizeMode="contain" className="w-5 h-5 mr-2" />
                                    <Text className="text-lg font-bold">New Goal: {goalSuggestion.goal}</Text>
                                </View>
                                <View className="flex-row items-start mb-2">
                                    <Image source={icons.question} tintColor="#307FE2" resizeMode="contain" className="w-5 h-5 mr-2 mt-1" />
                                    <Text className="text-base text-gray-700">{goalSuggestion.justification}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text className="text-base text-gray-500 font-bold text-center mb-2">
                                No suggestions available.
                            </Text>
                        )}
                    </View>

                    <TextInput
                        value={inputValue}
                        onChangeText={setInputValue}
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-md p-3 text-center text-lg"
                        placeholder={`Enter new ${metric.toLowerCase()} goal`}
                    />

                    <View className="flex-row justify-between mt-4">
                        <CustomButton
                            title="Cancel"
                            onPress={onClose}
                            className="w-1/2 bg-red-500"
                        />
                        <CustomButton
                            title="Save"
                            onPress={() => {
                                const numericValue = parseFloat(inputValue);
                                if (!isNaN(numericValue)) {
                                    onSave(numericValue); // Pass the latest input value
                                    onClose();
                                }
                            }}
                            className="w-1/2 px-4 ml-1"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default GoalEditModal;
