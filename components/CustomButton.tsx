import { ButtonProps } from "@/types/type";
import { Text, TouchableOpacity } from "react-native";
import React, { memo } from "react";


/**
 * CustomButton Component
 * A reusable button component with customizable styles and enhanced feedback handling.
 *
 * @param {Function} onPress - The function to execute when the button is pressed.
 * @param {string} title - The button text.
 * @param {boolean} disabled - Whether the button is disabled.
 * @param {string} className - Additional class names for styling.
 */
const CustomButton = ({ onPress, title, className, ...props }: ButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-full bg-blue-500 rounded-lg p-3 flex flex-row justify-center items-center ${className}`} {...props}
    >
        <Text className="text-lg font-bold text-white">{title}</Text>
    </TouchableOpacity>
)

// Optimize with React.memo to prevent unnecessary re-renders
export default memo(CustomButton);