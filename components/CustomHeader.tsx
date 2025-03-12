import { icons } from "@/constants";
import { RelativePathString, router, useRouter, useSegments } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native"

const CustomHeader = ({ title, showBackButton = true, rightButton = null }: { title: string; showBackButton: boolean, rightButton?: React.ReactNode; }) => {
    const router = useRouter();

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Fallback to home if no navigation history
            router.replace('/home');
        }
    };

    return (
        <View className="flex-row w-full items-center justify-between p-4 bg-white border-b border-gray-200">
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
            <Text
                className={`text-lg font-bold uppercase text-center ${rightButton ? "ml-12" : ""
                    }`}
                style={{ color: "#307FE2" }}
            >
                {title || ""}
            </Text>

            {rightButton ? <View>{rightButton}</View> : <View style={{ width: 32 }} />}
        </View>
    )
}

export default CustomHeader;