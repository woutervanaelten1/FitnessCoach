import ChatBubble from "@/components/ChatBubble";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { icons } from "@/constants";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const Chat = () => {
    type Message = {
        id: string;
        text: string;
        isUser: boolean;
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { question } = useLocalSearchParams();
    const [hasSentInitialQuestion, setHasSentInitialQuestion] = useState(false);

    const handleSendMessage = useCallback(async (messageToSend: string) => {
        if (!messageToSend) return; // Prevent sending empty messages

        setInput(''); // Clear input field
        setIsLoading(false);

        // Add the user's message to the messages array
        const userMessage = { id: Date.now().toString(), text: messageToSend, isUser: true };
        // setMessages((prevMessages) => [...prevMessages, userMessage]);
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
        }, 1000); // Delay duration

        setIsLoading(true);

        try {
            // Call FastAPI endpoint using fetch
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
    }, [conversationId]);

    // useEffect(() => {
    //     const sendPreFilledQuestion = async () => {
    //         if (typeof question === "string" && question.trim() && !hasSentInitialQuestion) {
    //             setHasSentInitialQuestion(true); 
    //             await handleSendMessage(decodeURIComponent(question));
    //         }
    //     };

    //     // sendPreFilledQuestion();
    // }, [question, hasSentInitialQuestion, handleSendMessage]);

    useFocusEffect(
        useCallback(() => {
            // Reset state when the chat page becomes active
            setMessages([]);
            setConversationId(null);
            setHasSentInitialQuestion(false);

            // Define a local function to send the pre-filled question
            // If not working ==> Remove the !hasSentInitialQuestion
            const sendPreFilledQuestion = async () => {
                if (typeof question === "string" && question.trim()) {
                    // if (typeof question === "string" && question.trim() && !hasSentInitialQuestion) {
                    // setHasSentInitialQuestion(true); // Mark as sent
                    await handleSendMessage(decodeURIComponent(question));
                }
            };

            // Send pre-filled question after resetting the state
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
                        // Add these two props:
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
                </ScrollView>

                <View className="bg-white border-t border-gray-300 p-3">
                    <View className="flex-row items-center">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-3xl px-4 py-2 text-base"
                            placeholder="Type your message..."
                            value={input}
                            onChangeText={setInput}
                            textAlignVertical="center" // Center text vertically
                            multiline={true} // Allow multiple lines
                            numberOfLines={1} // Start with 1 line
                            style={{
                                maxHeight: 80, // Adjust this value based on your font size and line height
                                paddingTop: Platform.OS === 'android' ? 8 : 10, // Adjust padding for Android
                                paddingBottom: Platform.OS === 'android' ? 8 : 10, // Adjust padding for Android
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