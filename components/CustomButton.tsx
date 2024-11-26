import { ButtonProps } from "@/types/type";
import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({ onPress, title, className, ...props }: ButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-full bg-blue-500 rounded-lg p-3 flex flex-row justify-center items-center ${className}`} {...props}
    >
        <Text className="text-lg font-bold text-white">{title}</Text>
    </TouchableOpacity>
)

export default CustomButton;