import React from 'react';
import { Text, View } from 'react-native';
import CustomButton from './CustomButton';
import ChatBubble from './ChatBubble';

const DetailView = ({
    detail,
    onCheckOutPress,
}: {
    detail: { type: string; content: string };
    onCheckOutPress?: () => void;
}) => {
    return (
        <View className="mt-4">
            {detail.type === 'question' ? (
                <View className="items-center">
                    <Text className="text-lg font-bold">Suggested question</Text>
                    <ChatBubble message={detail.content} isUser={false} maxWidth={100} />
                    <CustomButton
                        title="Check it out"
                        onPress={onCheckOutPress}
                        className="mt-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg"
                    />
                </View>
            ) : (
                <View>
                    <Text className="text-lg font-bold">{detail.type}</Text>
                    <View className="items-center px-4">
                        <Text className="text-blue-500 text-lg font-bold">{detail.content}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default DetailView;
