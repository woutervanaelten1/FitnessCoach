import ChatBubble from "@/components/ChatBubble";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ScrollView, Text, View } from "react-native";

const ConversationDetailsScreen = () => {
    const { conversationId } = useLocalSearchParams();
    interface Message {
        conversation_id: string;
        user_id: string;
        role: string;
        message: string;
        timestamp: string;
    }

    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true); // Ensure loading state is updated
            const response = await fetch(
                `${config.API_BASE_URL}/data/conversation_messages/${conversationId}`
            );
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]); // Ensure fetchData changes only if conversationId changes

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <ScrollView className="flex-1 px-3 bg-white">
            <CustomHeader title="Fitness coach" showBackButton={true}
                rightButton={
                    <TouchableOpacity className="bg-blue-500 rounded-full px-2 py-1">
                        <Text className="text-white font-bold">New Chat</Text>
                    </TouchableOpacity>
                } />
            <View className="flex-1 mt-2">
                {isLoading ? (
                    <Text>Loading conversation...</Text>
                ) : messages.length > 0 ? (
                    messages.map((message, index) => (
                        <ChatBubble
                            key={index}
                            message={message.message}
                            maxWidth={90}
                            isUser={message.role === "user"}

                        />
                    ))
                ) : (
                    <Text>No messages found for this conversation.</Text>
                )}
            </View>

            {/* <View className="py-4 bg-white">
                <CustomButton
                    title="Start a new chat"
                    onPress={() => router.push("/chat/chat")}
                    className="w-full bg-blue-500 text-white font-bold py-3 text-lg"
                />
            </View> */}

        </ScrollView>
    );
};

export default ConversationDetailsScreen;