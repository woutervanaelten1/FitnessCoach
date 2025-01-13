import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import DetailView from "@/components/DetailComponent";
import IconBoxMultiIcon from "@/components/IconBoxMultiIcon";
import LoadingErrorView from "@/components/LoadingErrorView";
import ProgressBar from "@/components/ProgressBar";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

const ActivityDetail = () => {
  const [lightlyActive, setLightlyActive] = useState(0);
  const [fairlyActive, setFairlyActive] = useState(0);
  const [highlyActive, setHighlyActive] = useState(0);
  const [activityGoal, setActivityGoal] = useState(0);
  const [sedentary, setSedentary] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [detail, setDetail] = useState<{ type: string; content: string } | null>(null);

  const getHoursAndMinutes = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
    return { hours, minutes };
  };


  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [activityResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_activity/by-date?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/data/goals/${config.USER_ID}/active_minutes`)
      ]);

      if (!activityResponse.ok || !goalResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await activityResponse.json();
      const goalData = await goalResponse.json();

      // Goal Data
      if (goalData) {
        setActivityGoal(goalData.goal);
      }

      const todayData = data.length > 0 ? data[0] : null;
      if (todayData) {
        setLightlyActive(todayData.lightlyactiveminutes);
        setFairlyActive(todayData.fairlyactiveminutes);
        setHighlyActive(todayData.veryactiveminutes);
        setSedentary(todayData.sedentaryminutes);
        getHoursAndMinutes(sedentary);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }

  };

  const fetchDetail = async () => {
    try {
      setDetailLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/chat/detail?date=${config.FIXED_DATE}&metric=activity`);
      if (!response.ok) throw new Error("Failed to fetch detail");

      const data = await response.json();
      setDetail(data.output);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setFetchError(true);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDetail();
  }, []);

  if (isLoading || hasError) {
    return (
      <LoadingErrorView
        isLoading={isLoading}
        hasError={hasError}
        onRetry={fetchData}
        loadingText="Loading your activity data..."
        errorText="Failed to load your activity data. Do you want to try again?"
        headerTitle="Targets & Progress"
      />
    );
  }

  return (
    <ScrollView className="flex-1 px-4 bg-white">
      <CustomHeader
        title="Activity overview"
        showBackButton={true}
      />

      <View className="flex-row justify-between mb-4 mt-4">
        <IconBoxMultiIcon amount={1} icon={icons.bolt} bottomText={lightlyActive.toLocaleString()} topText="Lightly active minutes" />
        <IconBoxMultiIcon amount={2} icon={icons.bolt} bottomText={fairlyActive.toLocaleString()} topText="Fairly active minutes" />
        <IconBoxMultiIcon amount={3} icon={icons.bolt} bottomText={highlyActive.toLocaleString()} topText="Very active minutes" />
      </View>

      <View className="mt-4">
        <Text className="text-black text-lg font-bold">
          You're{" "}
          <Text className="text-blue-500">{(activityGoal - highlyActive).toLocaleString()} very active minutes</Text> away from your goal!
        </Text>
        <ProgressBar value={highlyActive} target={activityGoal} />
      </View>

      <View className="mt-6">
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

      <View className="mt-2">
        {detailLoading ? (
          <View className="items-center mt-5">
            <ActivityIndicator size="large" color="#307FE2" />
            <Text className="text-lg font-bold">Loading...</Text>
          </View>
        ) : fetchError ? (
          <View className="items-center">
            <Text className="text-red-500 text-lg font-bold mb-4">Failed to load details</Text>
            <CustomButton
              title="Retry"
              onPress={fetchDetail}
              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg"
            />
          </View>
        ) : detail ? (
          <DetailView
            detail={{ type: detail.type, content: detail.content }}
          />
        ) : (
          <Text className="text-gray-500 text-lg">No details found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityDetail;