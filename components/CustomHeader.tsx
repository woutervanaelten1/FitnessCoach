import { icons } from "@/constants";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native"

const CustomHeader = ({ title, showBackButton = true } : {title:string; showBackButton: boolean}) => {
    return (
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
            {/* Back Button */}
            {showBackButton ? (
                <TouchableOpacity onPress={() => router.back()} className="flex items-center">
                    <View className="w-8 h-8 bg-white rounded-full items-center justify-center">
                        <Image
                            source={icons.backArrow}
                            resizeMode="contain"
                            className="w-4 h-4"
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