import CustomHeader from "@/components/CustomHeader";
import IconTextBox from "@/components/IconTextBox";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const todayData = data.length > 0 ? data[0] : null;
      setSteps(todayData.totalsteps);
      setCalories(todayData.calories);
      setActiveMinutes(todayData.veryactiveminutes);
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
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Fitness Dashboard" showBackButton={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 75 }} className="p-4">
        {/* Date Section */}
        <Text className="text-black text-xl font-bold mb-1">January 26th</Text>
        <Text className="text-blue-500 font-semibold text-sm mb-4">Touch one of the icons for more information</Text>


        <View className="flex-row justify-between mb-4">
          <IconTextBox icon={icons.fire} topText={calories.toLocaleString()} bottomText="kcal"/>
          <IconTextBox icon={icons.walking} topText={steps.toLocaleString()} bottomText="steps"/>
          <IconTextBox icon={icons.timer} topText={activeMinutes.toLocaleString()} bottomText="minutes"/>
        </View>

        {/* Sleep Duration Section */}
        <Text className="text-black text-lg font-semibold mb-1">Sleep duration this week</Text>
        <Text className="text-blue-500 font-semibold text-sm mb-4">Touch the graph for more sleep information</Text>
        <View className="h-56 bg-gray-200 rounded-lg mb-6">
          {/* Here comes graph */}
        </View>

        {/* Heart Rate Section */}
        <Text className="text-black text-lg font-semibold mb-1">Daily heart rate summary</Text>
        <View className="h-56 bg-gray-200 rounded-lg mb-6">
          {/* Here comes graph */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;