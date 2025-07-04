import { useProfile } from "@/app/context/ProfileContext";
import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import LoadingErrorView from "@/components/LoadingErrorView";
import config from "@/config";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

/**
 * Represents the metadata of a past conversation.
 * @property conversation_id - Unique ID for the conversation.
 * @property user_id - ID of the user who participated.
 * @property subject - Short description or topic of the conversation.
 * @property first_message - The initial message of the conversation.
 * @property timestamp - When the conversation started.
 */
interface Subject {
  conversation_id: string;
  user_id: string;
  subject: string;
  first_message: string;
  timestamp: string;
}


/**
 * The EarlierChats screen displays past conversations of the user.
 * Users can view, load more, and navigate to individual conversations.
 *
 * @returns {JSX.Element} The EarlierChats screen component.
 */
const EarlierChats = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const [totalConversations, setTotalConversations] = useState<number | null>(null);
  const { userId } = useProfile();

  /**
   * Fetches earlier conversations from the API.
   * Handles loading, errors, and pagination.
   *
   * @param {boolean} [loadMore=false] - Whether to load more conversations or fetch fresh data.
   */
  const fetchData = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setHasError(false);
      }

      const response = await fetch(
        `${config.API_BASE_URL}/data/conversation_subjects/${userId}?offset=${offset}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const newSubjects = data.conversations || [];
      setTotalConversations(data.total); // Update the total count of conversations

      // Append new data while avoiding duplicates
      setSubjects((prev) => {
        const mergedSubjects = [...prev, ...newSubjects];
        return Array.from(
          new Map(mergedSubjects.map((item) => [item.conversation_id, item])).values()
        );
      });

      // Update offset for pagination
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

  /**
   * Loads more conversations if there are remaining ones.
   */
  const loadMoreConversations = () => {
    if (subjects.length < (totalConversations || 0)) {
      setOffset((prevOffset) => prevOffset + limit); // Increase offset
      fetchData(true); // Fetch additional data
    }
  };

  // Fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userId])
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