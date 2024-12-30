import ChatBubble from "@/components/ChatBubble";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { icons } from "@/constants";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const Chat = () => {
    type Message = {
        id: string;
        text: string;
        isUser: boolean;
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim()) return; // Prevent sending empty messages

        // Add the user's message to the messages array
        const userMessage = { id: Date.now().toString(), text: input, isUser: true };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput(''); // Clear input field
        setIsLoading(true);

        try {
            // Call your FastAPI endpoint using fetch
            const response = await fetch(`${config.API_BASE_URL}/chat/test/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: config.USER_ID,
                    message: input,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add chatbot's response to the messages array
            const botMessage = {
                id: Date.now().toString(),
                text: data.response,
                isUser: false,
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

            // Scroll to the bottom of the chat
            scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            const errorMessage = {
                id: Date.now().toString(),
                text: "Sorry, something went wrong. Please try again later.",
                isUser: false,
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <CustomHeader
                title="Fitness Coach"
                showBackButton={true}
                rightButton={
                    <TouchableOpacity className="bg-blue-500 rounded-full px-2 py-1">
                        <Text className="text-white font-bold">New Chat</Text>
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    className="flex-1"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message.text} isUser={message.isUser} maxWidth={90} />
                    ))}

                    {isLoading && (
                        <View className="items-center justify-center py-3">
                            <ActivityIndicator size="large" color="#307FE2" />
                            <Text className="text-base text-gray-500 mt-2">Loading response...</Text>
                        </View>
                    )}
                </ScrollView>

                <View className="bg-white border-t border-gray-300 p-3">
                    <View className="flex-row items-center">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-base"
                            placeholder="Type your message..."
                            value={input}
                            onChangeText={setInput}
                            textAlignVertical="center"
                        />
                        <TouchableOpacity
                            className="ml-3 bg-blue-500 rounded-full px-4 py-2 justify-center items-center"
                            onPress={handleSendMessage}
                        >
                            <Image source={icons.plane} tintColor="#fff" resizeMode="contain" className="w-5 h-5" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Chat;