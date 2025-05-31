import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

/**
 * IconBoxMultiIcon Component
 * Displays multiple icons with text above and below them.
 *
 * @param {number} amount - Number of icons to display.
 * @param {string} topText - Text displayed above the icons.
 * @param {string} bottomText - Text displayed below the icons.
 * @param {ImageSourcePropType} icon - Image source for the icons.
 */
const IconBoxMultiIcon = ({ amount, topText, bottomText, icon }: { amount: number; topText: string; bottomText: string; icon: ImageSourcePropType; }) => {
    // Renders the specified number of icons
    const renderIcons = () => {
        const icons = [];
        for (let i = 0; i < amount; i++) {
            icons.push(
                <Image
                    key={i}
                    source={icon}
                    tintColor="#307FE2" resizeMode="contain" className="w-7 h-7"
                />
            );
        }
        return icons;
    };

    return (
        <View className="flex-1 items-center bg-gray-100 rounded-lg p-4 mx-1">
            {/* Top text */}
            <Text className="text-black font-semibold text-center mb-2">{topText}</Text>
            {/* Icons Row */}
            <View className="flex-row justify-center mb-2">
                {renderIcons()}
            </View>
            {/* Bottom text */}
            <Text className="text-black font-semibold text-xl">{bottomText}</Text>
        </View>
    );
};

export default IconBoxMultiIcon;
