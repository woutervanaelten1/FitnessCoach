import { useProfile } from "@/app/context/ProfileContext";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import DatePicker from "@/components/DatePicker";
import DetailView from "@/components/DetailComponent";
import IconBoxMultiIcon from "@/components/IconBoxMultiIcon";
import LoadingErrorView from "@/components/LoadingErrorView";
import ProgressBar from "@/components/ProgressBar";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

/**
 * The ActivityDetail screen provides an overview of the user's activity levels,
 * including active minutes, sedentary time, progress towards their goal, and additional details.
 *
 * @returns {JSX.Element} The ActivityDetail screen component.
 */
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
  const [selectedDate, setSelectedDate] = useState(new Date(config.FIXED_DATE));
  const { userId } = useProfile();

  /**
  * Updates hours and minutes state from total sedentary minutes.
  *
  * @param {number} totalMinutes - Total sedentary minutes.
  */
  const getHoursAndMinutes = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
    return { hours, minutes };
  };

  /**
   * Checks if a given string is a valid detail type.
   *
   * @param {string} type - The type to validate.
   * @returns {boolean} `true` if the type is "question", "advice", or "insight"; otherwise, `false`.
   */
  const isValidDetailType = (type: string): type is "question" | "advice" | "insight" => {
    return ["question", "advice", "insight"].includes(type);
  };

  /**
   * Fetches activity data and user's active minutes goal from the API.
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const [activityResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_activity/by-date?date=${formattedDate}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/goals/${userId}/active_minutes`)
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
        getHoursAndMinutes(todayData.sedentaryminutes);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }

  };

  /**
   * Fetches a personalized insight, question, or advice for the user
   * related to their active minutes on the selected date.
   */
  const fetchDetail = async () => {
    try {
      setDetailLoading(true);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await fetch(`${config.API_BASE_URL}/chat/detail?date=${formattedDate}&metric=active_minutes&user_id=${userId}`);
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
  }, [userId, selectedDate]);

  if (isLoading || hasError) {
    return (
      <LoadingErrorView
        isLoading={isLoading}
        hasError={hasError}
        onRetry={fetchData}
        loadingText="Loading your activity data..."
        errorText="Failed to load your activity data. Do you want to try again?"
        headerTitle="Targets & Progress"
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );
  }

  return (
    <ScrollView className="flex-1 px-4 bg-white">
      <CustomHeader
        title="Activity overview"
        showBackButton={true}
      />
      <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {/* Active Minutes Breakdown */}
      <View className="flex-row justify-between mb-4 mt-4">
        <IconBoxMultiIcon amount={1} icon={icons.bolt} bottomText={lightlyActive.toLocaleString()} topText="Lightly active minutes" />
        <IconBoxMultiIcon amount={2} icon={icons.bolt} bottomText={fairlyActive.toLocaleString()} topText="Fairly active minutes" />
        <IconBoxMultiIcon amount={3} icon={icons.bolt} bottomText={highlyActive.toLocaleString()} topText="Very active minutes" />
      </View>

      {/* Progress towards goal */}
      <View className="mt-4">
        {highlyActive >= activityGoal ? (
          <Text className="text-black text-lg font-bold">
            <Text className="text-blue-500">Goal reached!</Text> You've completed{" "}
            <Text className="text-blue-500">{highlyActive.toLocaleString()} very active minutes</Text>. Keep up the great work!
          </Text>
        ) : (
          <Text className="text-black text-lg font-bold">
            You're{" "}
            <Text className="text-blue-500">
              {(activityGoal - highlyActive).toLocaleString()} very active minutes
            </Text>{" "}
            away from your goal!
          </Text>
        )}
        <ProgressBar value={highlyActive} target={activityGoal} />
      </View>

      {/* Additional Insights (question, advice or insight)*/}
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
        ) : detail && isValidDetailType(detail.type) ? (
          <DetailView detail={{ type: detail.type, content: detail.content }} />
        ) : (
          <Text className="text-gray-500 text-lg">No details found.</Text>
        )}
      </View>

      {/* Sedentary Time */}
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


    </ScrollView>
  );
};

export default ActivityDetail;