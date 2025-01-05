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


const Home = () => {
  interface Recommendation {
    recommendation: string;
    reason: string;
    benefit: string;
    based_on: string;
    metric: string;
    question: string;
  }


  const [currentSteps, setCurrentSteps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const goalSteps = 10000;
  const progress = Math.min((currentSteps ?? 0) / goalSteps, 1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  const fetchData = async () => {
    // CHANGE CHATS TO CHAT
    try {
      const [dailyResponse, recommendationsResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_activity/by-date?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/chats/recommendations?date=${config.FIXED_DATE}`)
      ]);


      if (!dailyResponse.ok || !recommendationsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const dailyData = await dailyResponse.json();
      const recommendationsData = await recommendationsResponse.json();

      setRecommendations(recommendationsData.recommendations || []);
      setCurrentSteps(dailyData.length > 0 ? dailyData[0].totalsteps : 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setModalVisible(true);
  };

  const handleAskChatbot = (question: string) => {
    if (!question.trim()) return; // Exit if something went wrong and the question is empty
  
    // Navigate to chatbot screen, passing the recommendation context
    setModalVisible(false)
    const encodedQuestion = encodeURIComponent(question);
    router.push(`../(tabs)/chat/chat?question=${encodedQuestion}`);
  };



  return (
    <ScrollView contentContainerStyle={{ alignItems: "center" }} className="w-full  bg-white">
      <CustomHeader title="Home" showBackButton={false} />
      <Text className="p-4 text-blue-500 text-4xl font-bold">Welcome John!</Text>
      <Image source={images.dumbell} className="z-0 w-full h-[200px]" />

      <View className="items-center my-5 w-full align-middle">
        {isLoading ? (
          <ActivityIndicator size="large" color="#307FE2" />
        ) : (
          <>
            <Text className="text-2xl font-bold">{currentSteps.toLocaleString()} Steps</Text>
            <View className="w-4/5 h-2 bg-gray-200 rounded-full mt-2">
              <View
                style={{ width: `${progress * 100}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </View>
          </>
        )}
      </View>

      <View className="w-11/12">
        <Text className="text-2xl font-bold mb-2">Recommendations</Text>
        <Text className="text-blue-500 font-semibold text-base mb-4">Touch one of the recommendations for more information</Text>

        {isLoading ? (
          <>
            <ActivityIndicator size="large" color="#307FE2" />
            <Text className="text-base text-gray-500 mt-2">Loading recommendations...</Text>
          </>
        ) : recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <RecommendationBox metric={rec.metric} recommendation={rec.recommendation} onOpenModal={() => handleOpenModal(rec)} key={index} />
          ))
        ) : (
          <Text className="text-base text-red-500">An error occurred while loading the recommendations.</Text>
        )}
      </View>


      <CustomButton title="Start a new chat!" onPress={() => router.replace("../(tabs)/chat/chat")} className="w-11/12 my-4" />

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