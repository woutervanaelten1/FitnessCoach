import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

const EarlierChats = () => {
  const earlierConversations = [
    { id: "1", text: "How can I improve my sleep quality?", isUser: false },
    { id: "2", text: "Tips to increase my running endurance based on previous runs.", isUser: false },
    { id: "3", text: "Recommendations on new fitness goals.", isUser: false },
    { id: "4", text: "Help me train for a marathon in 5 months", isUser: false },
    { id: "5", text: "How can I loose 5 kilos", isUser: false },
    { id: "6", text: "Insights on my sleep data the last week", isUser: false },
  ];


  return (
    <ScrollView className="flex-1 px-3 bg-white">
      <CustomHeader title="Earlier conversations" showBackButton={true} />
      <View className="flex-1 mt-2">
        <Text className="text-black text-xl font-bold mb-4 text-center">
          Suggested conversations:
        </Text>

        {earlierConversations.map((message) => (
          <ChatBubble key={message.id} message={message.text} isUser={message.isUser} maxWidth="100" />
        ))}
      </View>

      <View className="py-4 bg-white">
        <CustomButton
          title="Start a new chat"
          onPress={() => router.push("/chat/chat")}
          className="w-full bg-blue-500 text-white font-bold py-3 text-lg"
        />
      </View>

    </ScrollView>
  );
};

export default EarlierChats;