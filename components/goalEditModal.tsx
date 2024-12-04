import React from "react";
import { View, Text, TextInput, Modal } from "react-native";
import CustomButton from "./CustomButton";

const GoalEditModal = ({
    isVisible,
    goal,
    metric,
    onClose,
    onSave,
    onChangeValue,
}: {
    isVisible: boolean;
    goal: number;
    metric: string;
    onClose: () => void;
    onSave: () => void;
    onChangeValue: (value: string) => void;
}) => {
    return (
        <Modal visible={isVisible} animationType="fade" transparent>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <View className="bg-white p-6 rounded-lg w-4/5">
                    <Text className="text-lg font-bold text-center mb-4">
                        Set your {metric} goal
                    </Text>
                    <TextInput
                        value={goal.toString()}
                        onChangeText={onChangeValue}
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-md p-3 text-center text-lg"
                        placeholder={`Enter new ${metric.toLowerCase()} goal`}
                    />
                    <View className="flex-row justify-between mt-4">
                        {/* Cancel Button */}
                        <CustomButton
                            title="Cancel"
                            onPress={onClose}
                            className="w-1/2  bg-red-500"
                        />
                        <CustomButton
                            title="Save"
                            onPress={onSave}
                            className="w-1/2 px-4 ml-1"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default GoalEditModal;
