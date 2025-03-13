import ChatBubble from "@/components/ChatBubble";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ScrollView, Text, View } from "react-native";

/**
 * Represents a single message in a conversation.
 */
interface Message {
    conversation_id: string;
    user_id: string;
    role: string;  // "user" or "assistant"
    message: string;
    timestamp: string;
}

/**
 * **ConversationDetailsScreen**
 * Displays the message history of a selected conversation with the fitness coach.
 * Allows users to view past messages and start a new conversation.
 *
 * @returns {JSX.Element} A screen showing chat messages.
 */
const ConversationDetailsScreen = () => {
    const { conversationId } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);

    /**
     * Fetches the messages for the given conversation.
     */
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

    // Fetch data when the component mounts or when conversationId changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <ScrollView className="flex-1 px-3 bg-white">
            {/* Header with back button and new chat button */}
            <CustomHeader title="Fitness coach" showBackButton={true}
                rightButton={
                    <TouchableOpacity className="bg-blue-500 rounded-full px-2 py-1"
                        onPress={() => router.push("../chat")}
                    >
                        <Text className="text-white font-bold">New Chat</Text>
                    </TouchableOpacity>
                } />
                
            {/* Chat messages display */}
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
        </ScrollView>
    );
};

export default ConversationDetailsScreen;