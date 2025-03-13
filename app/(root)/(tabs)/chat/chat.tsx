import ChatBubble from "@/components/ChatBubble";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { icons } from "@/constants";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * Represents a chat message.
 */
type Message = {
    id: string;
    text: string;
    isUser: boolean;
};

/**
 * Chat screen where users can send messages and receive responses from the AI.
 * Users can also start a new chat or retry failed messages.
 *
 * @returns {JSX.Element} The chat screen component.
 */
const Chat = () => {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { question } = useLocalSearchParams();
    const [hasSentInitialQuestion, setHasSentInitialQuestion] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    /**
     * Sends a user message to the backend and updates the chat UI.
     *
     * @param {string} messageToSend - The message to send.
     */
    const handleSendMessage = useCallback(async (messageToSend: string) => {
        if (!messageToSend) return; // Prevent sending empty messages

        setInput('');
        setIsLoading(false);
        setHasError(false);
        setLastMessage(messageToSend);

        // Show a temporary placeholder for the user's message
        const placeholderMessage = { id: Date.now().toString(), text: "Sending...", isUser: true };
        setMessages((prevMessages) => [...prevMessages, placeholderMessage]);
        setTimeout(() => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === placeholderMessage.id
                        ? { ...msg, text: messageToSend } // Replace placeholder with actual message
                        : msg
                )
            );
        }, 1000);

        setIsLoading(true);

        try {
            const response = await fetch(`${config.API_BASE_URL}/chat/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: config.USER_ID,
                    message: messageToSend,
                    conversation_id: conversationId || null
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            const data = await response.json();

            // Set conversation ID if it is provided in the response
            if (data.conversation_id) {
                setConversationId(data.conversation_id);
            }

            // Display chatbot's response
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
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]);

    /**
     * Retries sending the last message if an error occurred.
     */
    const handleRetry = () => {
        setHasError(false);
        setIsLoading(false);

        if (lastMessage) {
            handleSendMessage(lastMessage);
        }
    };

    useFocusEffect(
        useCallback(() => {
            // Reset state when the chat page becomes active
            setMessages([]);
            setConversationId(null);
            setHasSentInitialQuestion(false);

            /// Automatically send a pre-filled question if available
            const sendPreFilledQuestion = async () => {
                if (typeof question === "string" && question.trim()) {
                    await handleSendMessage(decodeURIComponent(question));
                }
            };

            sendPreFilledQuestion();
        }, [question])
    );

    return (
        <View className="flex-1 bg-white">
            <CustomHeader
                title="Fitness Coach"
                showBackButton={true}
                rightButton={
                    <TouchableOpacity className="bg-blue-500 rounded-full px-2 py-1"
                        onPress={() => {
                            setMessages([]);
                            setConversationId(null);
                        }}
                    >
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
                    contentContainerStyle={{
                        paddingHorizontal: 10,
                        flexGrow: 1,
                        justifyContent: 'flex-end',
                        minHeight: '100%'
                    }}
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

                    {hasError && (
                        <View className="flex-row justify-start my-2"
                            style={{
                                maxWidth: `${90}%`,
                                flexShrink: 1,
                            }}>
                            <View className="bg-gray-200 p-3 rounded-lg items-center">
                                <Text className="text-base">Failed to send message. Do you want to try again?</Text>
                                <TouchableOpacity onPress={handleRetry} className="mt-2 bg-blue-500 px-4 py-2 rounded-lg w-1/2">
                                    <Text className="text-white font-bold text-center text-base">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>

                <View className="bg-white border-t border-gray-300 p-3">
                    <View className="flex-row items-center">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-3xl px-4 py-2 text-base"
                            placeholder="Type your message..."
                            value={input}
                            onChangeText={setInput}
                            textAlignVertical="center"
                            multiline={true}
                            numberOfLines={1}
                            style={{
                                maxHeight: 80,
                                paddingTop: Platform.OS === 'android' ? 8 : 10,
                                paddingBottom: Platform.OS === 'android' ? 8 : 10,
                            }}
                        />
                        <TouchableOpacity
                            className="ml-3 bg-blue-500 rounded-full px-4 py-2 justify-center items-center"
                            onPress={() => handleSendMessage(input)}
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