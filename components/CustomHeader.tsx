import { icons } from "@/constants";
import { router, useRouter, useSegments } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native"

const CustomHeader = ({ title, showBackButton = true, rightButton = null }: { title: string; showBackButton: boolean, rightButton?: React.ReactNode; }) => {
    const segments = useSegments();

    const handleBackPress = () => {
        const isOnTabScreen = segments.length === 1; // Top-level tabs have 1 segment
      
        if (!isOnTabScreen) {
          // Go back in the stack if on a nested screen
          router.back();
        } else {
          console.log("Already on a main tab screen, no further back navigation.");
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