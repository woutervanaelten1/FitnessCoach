import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { router } from "expo-router";
import { Text, View } from "react-native";

const Index = () => {
  const messages = [
    { id: "1", text: "How can I improve my sleep quality?", isUser: false },
    { id: "2", text: "Tips to increase my running endurance based on previous runs.", isUser: false },
    { id: "3", text: "Recommendations on new fitness goals.", isUser: false },
  ];

  return (
    <View className="flex-1 px-4 bg-white">

      <CustomHeader title="Fitness Coach" showBackButton={false} />

      <View className="flex-1 mt-2">
        <Text className="text-black text-xl font-bold mb-4 text-center">
          Suggested conversations:
        </Text>

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message.text} isUser={message.isUser} maxWidth="100" />
        ))}
      </View>

      <View className="py-4 bg-white">
        <CustomButton
          title="Browse earlier chats..."
          onPress={() => router.push("/chat/earlierChats")}
          className="w-full bg-blue-500 text-white mb-2"
        />
        <CustomButton
          title="Start a new chat"
          onPress={() => router.push("/chat/chat")}
          className="w-full bg-blue-500 text-white font-bold py-3 text-lg"
        />
      </View>
    </View>

  );
};

export default Index;
