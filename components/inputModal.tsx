import { View, Text, TextInput, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import CustomButton from "./CustomButton";

const InputModal = ({
    isVisible,
    title,
    subtitle,
    placeholder,
    inputPlaceholder,
    onClose,
    onSave,
}: {
    isVisible: boolean;
    title: string;
    subtitle: string;
    placeholder: number;
    inputPlaceholder: string;
    onClose: () => void;
    onSave: (inputValue: number) => void;
}) => {
    const [inputValue, setInputValue] = useState<string>("");

    // Set initial input value when modal is opened
    useEffect(() => {
        if (isVisible) {
            setInputValue(placeholder.toString());
        }
    }, [isVisible, placeholder]);

    return (
        <Modal visible={isVisible} animationType="fade" transparent>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <View className="bg-white p-6 rounded-lg w-11/12">
                    <Text className="text-xl font-bold text-center mb-4">{title}</Text>
                    <Text className="text-blue-500 font-bold text-center mb-4">{subtitle}</Text>

                    <TextInput
                        value={inputValue}
                        onChangeText={(text) => setInputValue(text)}
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-md p-3 text-center text-lg"
                        placeholder={inputPlaceholder}
                    />

                    <View className="flex-row justify-between mt-4">
                        {/* Cancel Button */}
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
                                    onSave(numericValue); // Pass the numeric value to onSave
                                    setInputValue("");
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

export default InputModal;
