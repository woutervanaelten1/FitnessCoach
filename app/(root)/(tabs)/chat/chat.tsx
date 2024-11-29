import ChatBubble from "@/components/ChatBubble";
import CustomHeader from "@/components/CustomHeader";
import { icons } from "@/constants";
import { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const Chat = () => {
    const messages = [
        { id: '1', text: 'How can I assist with your fitness goals?', isUser: false },
        { id: '2', text: 'I want to know more about my steps data', isUser: true },
        { id: '3', text: 'I want to know more about my steps data', isUser: true },
        { id: '4', text: 'I want to know more about my steps data I want to know more about my steps data', isUser: false },
        { id: '5', text: 'I want to know more about my steps data', isUser: true },
        { id: '6', text: 'I want to know more about my steps data', isUser: true },
        { id: '7', text: 'This is the last message', isUser: false },
    ];

    const [input, setInput] = useState('');
    const scrollViewRef = useRef(null);


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
                keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 0} // Offset for header (if any)
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    className="flex-1"
                >
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message.text} isUser={message.isUser} maxWidth="85" />
                    ))}
                </ScrollView>

                <View className="bg-white border-t border-gray-300 p-3">
                    <View className="flex-row items-center">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-base"
                            placeholder="Type your message..."
                            value={input}
                            onChangeText={setInput}
                        />
                        <TouchableOpacity
                            className="ml-3 bg-blue-500 rounded-full px-4 py-2 justify-center items-center"
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