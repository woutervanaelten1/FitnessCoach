import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import React from 'react';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const Index = () => {
  interface Question {
    question: string;
  }
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/chat/suggested_questions`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setQuestions(data.questions || []);
      console.log(questions)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <View className="flex-1 px-4 bg-white">

      <CustomHeader title="Fitness Coach" showBackButton={false} />

      <View className="flex-1 mt-2">
        <Text className="text-black text-xl font-bold mb-4 text-center">
          Suggested conversations:
        </Text>

        {isLoading ? (
          <View>
            <ActivityIndicator size="large" color="#307FE2" />
            <Text className="text-base text-gray-500 mt-2">Loading suggested questions...</Text>
          </View>
        ) : questions.length > 0 ? (
          <View>
            {questions.map((question, index) => (
              <ChatBubble
                key={index}
                message={question.question}
                isUser={false}
                maxWidth={100}
                onPress={() => router.push(`/chat/chat?question=${question.question}`)}
              />
            ))}
          </View>
        ) : (
          <Text className="text-base text-red-500">An error occurred while loading the questions.</Text>
        )}
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
