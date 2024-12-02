import ChatBubble from "@/components/ChatBubble";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import IconBoxMultiIcon from "@/components/IconBoxMultiIcon";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

const ActivityDetail = () => {
  const [lightlyActive, setLightlyActive] = useState(0);
  const [fairlyActive, setFairlyActive] = useState(0);
  const [highlyActive, setHighlyActive] = useState(0);
  const [sedentary, setSedentary] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);


  const fetchData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/data/daily_activity/by-date?date=${config.FIXED_DATE}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const todayData = data.length > 0 ? data[0] : null;
      setLightlyActive(todayData.lightlyactiveminutes);
      setFairlyActive(todayData.fairlyactiveminutes);
      setHighlyActive(todayData.veryactiveminutes);
      setSedentary(todayData.sedentaryminutes);
      getHoursAndMinutes(sedentary);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, []);

  const getHoursAndMinutes = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
    return { hours, minutes };
  };


  return (
    <View className="flex-1 px-4 bg-white">
      <CustomHeader
        title="Activity overview"
        showBackButton={true}
      />

      <View className="flex-row justify-between mb-4 mt-4">
        <IconBoxMultiIcon amount={1} icon={icons.bolt} bottomText={lightlyActive.toLocaleString()} topText="Lightly active minutes" />
        <IconBoxMultiIcon amount={2} icon={icons.bolt} bottomText={fairlyActive.toLocaleString()} topText="Fairly active minutes" />
        <IconBoxMultiIcon amount={3} icon={icons.bolt} bottomText={highlyActive.toLocaleString()} topText="Very active minutes" />
      </View>

      <View>
        <Text className="text-lg font-bold">Sedentary time</Text>
        <View className="items-center my-2">
          <Image
            source={icons.sit}
            tintColor="#307FE2" resizeMode="contain"
          />
        </View>
        <View className="items-center px-4">
          <Text className="text-black text-lg font-bold">
            You have sat down{" "}
            <Text className="text-blue-500">{sedentary.toLocaleString()} minutes</Text> today or{" "}
            <Text className="text-blue-500">{hours.toLocaleString()} hours</Text> and{" "}
            <Text className="text-blue-500">{minutes.toLocaleString()} minutes</Text>
          </Text>
        </View>
      </View>


      <View className=" items-center justify-center mt-6">
        <ChatBubble isUser={false} maxWidth="100" message="Try to take some active breaks and keep your sedentary time under 9 hours!" />
        <CustomButton title="Get more activity tips" className="w-3/4" />
      </View>
    </View>
  );
};

export default ActivityDetail;