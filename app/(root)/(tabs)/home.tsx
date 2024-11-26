import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import { router } from "expo-router";
import { Image, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import config from "@/config";
import { useEffect, useState } from "react";

const Home = () => {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const goalSteps = 10000;
  //const currentSteps = 7251;
  const progress = Math.min((currentSteps ?? 0) / goalSteps, 1);

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/data/daily_activity/by-date?date=${config.FIXED_DATE}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const todayData = data.length > 0 ? data[0] : null;
      setCurrentSteps(todayData.totalsteps);
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
    <SafeAreaView className="flex-1 p-0 h-full items-center justify-between bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100, alignItems: "center" }} className="w-full">
        <CustomHeader title="Home" showBackButton={false} />
        <Text className="p-4 text-blue-500 text-lg font-bold">Welcome John!</Text>
        <Image source={images.dumbell} className="z-0 w-full h-[250px]" />

        <View className="items-center my-5 w-full">
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
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

        <View className="w-4/5 my-5">
          <Text className="text-lg font-bold mb-2">Recommendations</Text>
          <Text className="text-base text-blue-500 mb-1">• Make a 20-minute walk</Text>
          <Text className="text-base text-blue-500 mb-1">• Aim for 8 hours of sleep tonight</Text>
          <Text className="text-base text-blue-500 mb-1">• Set a fitness goal for this week</Text>
        </View>

        <CustomButton title="Tell me why" onPress={() => router.replace("../(tabs)/chat/index")} className="w-11/12 " />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;