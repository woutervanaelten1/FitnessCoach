import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import LoadingErrorView from "@/components/LoadingErrorView";
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
  const [hasError, setHasError] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const [totalConversations, setTotalConversations] = useState<number | null>(null);

  const fetchData = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true); // Show loading indicator for "Load More"
      } else {
        setIsLoading(true);
        setHasError(false);
      }

      const response = await fetch(
        `${config.API_BASE_URL}/data/conversation_subjects/${config.USER_ID}?offset=${offset}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const newSubjects = data.conversations || [];
      setTotalConversations(data.total); // Update the total count of conversations

      // Append or replace data while avoiding duplicates
      setSubjects((prev) => {
        const mergedSubjects = [...prev, ...newSubjects];
        return Array.from(
          new Map(mergedSubjects.map((item) => [item.conversation_id, item])).values()
        );
      });

      // Update offset
      setOffset(offset + limit);
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Load more conversations when "Load More" is pressed
  const loadMoreConversations = () => {
    if (subjects.length < (totalConversations || 0)) {
      setOffset((prevOffset) => prevOffset + limit); // Increase offset
      fetchData(true); // Fetch additional data
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (isLoading || hasError) {
    return (
      <LoadingErrorView
        isLoading={isLoading}
        hasError={hasError}
        onRetry={() => {
          setOffset(0);
          fetchData();
        }}
        loadingText="Loading your earlier conversations..."
        errorText="Failed to load your earlier conversations. Do you want to try again?"
        headerTitle="Fitness Dashboard"
      />
    );
  }

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

        {/* Load More Button */}
        {subjects.length < (totalConversations || 0) && (
          <CustomButton
            title={isLoadingMore ? "Loading..." : "Load More"}
            onPress={loadMoreConversations}
            className="w-full bg-blue-500 text-white font-bold py-3 text-lg my-4"
            disabled={isLoadingMore}
          />
        )}
      </View>



    </ScrollView>
  );
};

export default EarlierChats;