import { icons } from "@/constants";
import { router, useSegments } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native"

const CustomHeader = ({ title, showBackButton = true } : {title:string; showBackButton: boolean}) => {
    const segments = useSegments();

    const handleBackPress = () => {
        if (segments.length > 1) {
            router.back();
        } else {
            router.push("/(root)/(tabs)/home");
        }
    };

    return (
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
            {/* Back Button */}
            {showBackButton ? (
                <TouchableOpacity onPress={handleBackPress} className="flex items-center">
                    <View className="w-8 h-8 bg-white rounded-full items-center justify-center">
                        <Image
                            source={icons.backArrow}
                            resizeMode="contain"
                            className="w-7 h-7"
                            style={{ tintColor: "#307FE2" }}
                        />
                    </View>
                </TouchableOpacity>
            ) : (
                // If no back button
                <View style={{ width: 32 }} />
            )}
            <Text className="text-lg font-bold uppercase text-center flex-1" style={{ color: "#307FE2" }}>
                {title || ""}
            </Text>

            {/* Placeholder to keep the title centered */}
            <View style={{ width: 32 }} />
        </View>
    )
}

export default CustomHeader;