import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const EarlierChats = () => {
  interface Subject {
    conversation_id: string;
    user_id: string;
    subject: string;
    first_message: string;
    timestamp: string;
  }

  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/data/conversation_subjects/${config.USER_ID}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }

  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <ScrollView className="flex-1 px-3 bg-white">
      <CustomHeader title="Earlier conversations" showBackButton={true} />
      <View className="flex-1 mt-2">
        <Text className="text-black text-xl font-bold mb-4 text-center">
          Earlier conversations:
        </Text>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : subjects.length > 0 ? (
          subjects.map((subject) => (
            <ChatBubble
              key={subject.conversation_id}
              message={subject.subject}
              isUser={false}
              maxWidth={100}
              onPress={() => router.push(`/chat/conversationDetail/${subject.conversation_id}`)}
            />
          ))
        ) : (
          <Text>No conversations found.</Text>
        )}
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