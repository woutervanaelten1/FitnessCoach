import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import React from 'react';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import LoadingErrorView from "@/components/LoadingErrorView";

const Index = () => {
  interface Question {
    question: string;
  }
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const response = await fetch(`${config.API_BASE_URL}/chat/suggested_questions`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <View className="flex-1 px-4 bg-white">

      {isLoading || hasError ? (
        <LoadingErrorView
          isLoading={isLoading}
          hasError={hasError}
          onRetry={fetchData}
          loadingText="Loading suggested questions..."
          errorText="Failed to load suggested questions. Do you want to try again?"
          headerTitle="Fitness Coach"
        />
      ) : (
        <View className="flex-1 mt-2">
          <CustomHeader title="Fitness Coach" showBackButton={false} />
          <Text className="text-black text-xl font-bold mb-4 text-center">
            Suggested conversations:
          </Text>

          {questions.length > 0 ? (
            <View>
              {questions.map((question, index) => (
                <ChatBubble
                  key={index}
                  message={question.question}
                  isUser={false}
                  maxWidth={100}
                  onPress={() => {
                    const encodedContent = encodeURIComponent(question.question);
                    router.push(`/chat/chat?question=${encodedContent}`)
                  }}
                />
              ))}
            </View>
          ) : (
            <Text className="text-base text-gray-500 text-center">No suggested questions available.</Text>
          )}
        </View>
      )}

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
