import CustomHeader from "@/components/CustomHeader";
import IconTextBox from "@/components/IconTextBox";
import { icons } from "@/constants";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Fitness Dashboard" showBackButton={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 75 }} className="p-4">
        {/* Date Section */}
        <Text className="text-black text-xl font-bold mb-1">January 26th</Text>
        <Text className="text-blue-500 font-semibold text-sm mb-4">Touch one of the icons for more information</Text>


        <View className="flex-row justify-between mb-4">
          {/* Calories */}
          <IconTextBox icon={icons.fire} topText="1.235" bottomText="kcal"/>
          {/* Steps */}
          <IconTextBox icon={icons.walking} topText="7.215" bottomText="steps"/>
          {/* Active Minutes */}
          <IconTextBox icon={icons.timer} topText="41" bottomText="minutes"/>
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