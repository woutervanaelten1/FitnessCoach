import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

const IconBoxMultiIcon = ({ amount, topText, bottomText, icon }: { amount: number; topText: string; bottomText: string; icon: ImageSourcePropType; }) => {
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
            <Text className="text-black font-semibold text-center mb-2">{topText}</Text>
            <View className="flex-row justify-center mb-2">
                {renderIcons()}
            </View>
            <Text className="text-black font-semibold text-xl">{bottomText}</Text>
        </View>
    );
};

export default IconBoxMultiIcon;
