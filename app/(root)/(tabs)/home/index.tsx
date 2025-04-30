import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import { router } from "expo-router";
import { Image, ScrollView, Text, View, ActivityIndicator } from "react-native";
import config from "@/config";
import { useEffect, useState } from "react";
import React from 'react';
import RecommendationBox from "@/components/RecommendationBox";
import RecommendationModal from "@/components/RecommendationModal";
import { useProfile } from "@/app/context/ProfileContext";

/**
 * Represents a recommendation object.
 */
interface Recommendation {
  recommendation: string;
  reason: string;
  benefit: string;
  based_on: string;
  metric: string;
  question: string;
}

/**
 * Home screen component displaying step progress, recommendations, and navigation.
 *
 * @returns {JSX.Element} The Home screen component.
 */
const Home = () => {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const goalSteps = 10000;
  const progress = Math.min((currentSteps ?? 0) / goalSteps, 1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [hasError, setHasError] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const { userId, activeProfile } = useProfile();
  const username = config.PROFILES[activeProfile]?.username || "User";

  /**
   * Fetches the user's step data for the current date.
   */
  const fetchStepData = async () => {
    try {
      setHasError(false);
      setIsLoadingData(true);
      const dailyResponse = await fetch(`${config.API_BASE_URL}/data/daily_activity/by-date?date=${config.FIXED_DATE}&user_id=${userId}`);
      if (!dailyResponse.ok) throw new Error("Failed to fetch step data");
      const dailyData = await dailyResponse.json();
      setCurrentSteps(dailyData.length > 0 ? dailyData[0].totalsteps : 0);
    } catch (error) {
      console.error("Error fetching step data:", error);
      setHasError(true);
    } finally {
      setIsLoadingData(false);
    }
  };

  /**
   * Fetches the recommendations for the current date.
   */
  const fetchRecommendations = async () => {
    try {
      setFetchError(false);
      setIsLoadingRecommendation(true);
      const recommendationsResponse = await fetch(`${config.API_BASE_URL}/chat/recommendations?date=${config.FIXED_DATE}&user_id=${userId}`);
      if (!recommendationsResponse.ok) throw new Error("Failed to fetch recommendations");
      const recommendationsData = await recommendationsResponse.json();
      setRecommendations(recommendationsData.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setFetchError(true);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };


  useEffect(() => {
    fetchStepData();
    fetchRecommendations();
  }, [userId]);

  /**
   * Opens the recommendation modal with details.
   *
   * @param {Recommendation} rec - The selected recommendation.
   */
  const handleOpenModal = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setModalVisible(true);
  };

  /**
 * Navigates to the chatbot with the selected recommendation's question.
 * This automatically sends the question to the chatbot
 *
 * @param {string} question - The question to ask the chatbot.
 */
  const handleAskChatbot = (question: string) => {
    if (!question.trim()) return; // Exit if something went wrong or the question is empty
    setModalVisible(false)
    const encodedQuestion = encodeURIComponent(question);
    router.push(`../(tabs)/chat/chat?question=${encodedQuestion}`);
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: "center" }} className="w-full  bg-white">
      <CustomHeader title="Home" showBackButton={false} />
      <Text className="p-4 text-blue-500 text-4xl font-bold">Welcome {username}!</Text>
      <Image source={images.dumbell} className="z-0 w-full h-[200px]" />

      {/* Step Data Section */}
      <View className="items-center my-5 w-full align-middle">
        {isLoadingData ? (
          <ActivityIndicator size="large" color="#307FE2" />
        ) : hasError ? (
          <View className="p-4 rounded-lg flex items-center">
            <Text className="text-blue-500 text-base mb-2 font-bold">Failed to load step data.</Text>
            <CustomButton
              title="Retry"
              onPress={fetchStepData}
              className="w-1/2 bg-blue-500 rounded-lg p-3 px-5"
            />
          </View>
        ) : currentSteps ? (
          <>
            <Text className="text-2xl font-bold">{currentSteps.toLocaleString()} Steps</Text>
            <View className="w-4/5 h-2 bg-gray-200 rounded-full mt-2">
              <View
                style={{ width: `${progress * 100}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </View>
          </>
        ) : (
          <Text className="text-gray-500 text-lg text-center">No step data found.</Text>
        )}
      </View>

      {/* Recommendations for today */}
      <View className="w-11/12">
        <Text className="text-2xl font-bold mb-2">Recommendations</Text>
        <Text className="text-blue-500 font-semibold text-base mb-4">
          Touch one of the recommendations for more information
        </Text>
        {isLoadingRecommendation ? (
          <>
            <ActivityIndicator size="large" color="#307FE2" />
            <Text className="text-base text-gray-500 mt-2 text-center">Loading recommendations...</Text>
          </>
        ) : fetchError ? (
          <View className="p-4 rounded-lg flex items-center">
            <Text className="text-blue-500 text-base mb-2 font-bold">Failed to load recommendations.</Text>
            <CustomButton title="Retry" onPress={fetchRecommendations} className="w-1/2" />
          </View>
        ) : recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <RecommendationBox metric={rec.metric} recommendation={rec.recommendation} onOpenModal={() => handleOpenModal(rec)} key={index} />
          ))
        ) : (
          <Text className="text-gray-500 text-lg">No recommendations found.</Text>
        )}
      </View>

      {/* Start a new chat */}
      <CustomButton title="Start a new chat!" onPress={() => router.push("../(tabs)/chat/chat") } className="w-11/12 my-4" />

      {/* Recommendation Modal */}
      <RecommendationModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        recommendation={selectedRecommendation?.recommendation}
        reason={selectedRecommendation?.reason}
        benefit={selectedRecommendation?.benefit}
        onAskChatbot={() => handleAskChatbot(selectedRecommendation?.question || "")}
      />
    </ScrollView>
  );
};

export default Home;
