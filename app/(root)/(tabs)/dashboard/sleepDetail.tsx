import { useProfile } from "@/app/context/ProfileContext";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import DetailView from "@/components/DetailComponent";
import IconTextBox from "@/components/IconTextBox";
import LoadingErrorView from "@/components/LoadingErrorView";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from "victory-native";

const SleepDetail = () => {
  const [sleepHours, setSleepHours] = useState(0);
  const [inBedHours, setInBedHours] = useState(0);
  const [sleepGoal, setSleepGoal] = useState(0);
  const [sleepPercentage, setSleepPercentage] = useState(0);
  const [sleepData, setSleepData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [detail, setDetail] = useState<{ type: string; content: string } | null>(null);
  const fixedDate = new Date(config.FIXED_DATE);
  const yesterday = new Date(fixedDate); // Create a new Date instance
  yesterday.setDate(yesterday.getDate() - 1); // Subtract 1 day
  const formattedYesterday = yesterday.toISOString().split('T')[0];
  const { userId } = useProfile();
  

  const customThemeBarChart = {
    ...VictoryTheme.material,
    bar: {
      style: {
        data: {
          fill: "#4A90E2",
          strokeWidth: 2,
        },
      },
    },
    axisBottom: {
      style: {
        axis: { stroke: "none" },
        tickLabels: {
          fill: "#4A90E2",
          fontSize: 14,
          fontWeight: "bold",
        },
        grid: { stroke: "none" },
        ticks: { stroke: "none" }
      },
    },
    axisLeft: {
      style: {
        axis: { stroke: "none" },
        grid: { stroke: "none" },
        tickLabels: { fill: "none" },
        ticks: { stroke: "none" }
      },
    },
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 25) return "bg-red-500";
    if (percentage <= 50) return "bg-orange-500";
    if (percentage <= 75) return "bg-blue-500";
    if (percentage < 100) return "bg-blue-500";
    return "bg-green-500";
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);


      const [todayResponse, weeklyResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/sleep_summary/by-date?date=${formattedYesterday}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/daily_data/sleep-week-back?date=${formattedYesterday}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/goals/${userId}/sleep`)
      ]);

      if (!todayResponse.ok || !weeklyResponse.ok || !goalResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const todayDataArray = await todayResponse.json();
      const weeklyDataArray = await weeklyResponse.json();
      const goalData = await goalResponse.json();

      // Goal Data
      if (goalData) {
        setSleepGoal(goalData.goal);
      }

      // Today Data
      const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
      if (todayData && goalData) {
        const minutes = todayData.total_minutes_in_bed - todayData.awake_minutes;
        const percentage = Math.round((minutes / (goalData.goal * 60)) * 100);
        setSleepHours(Math.floor(minutes / 60));
        setInBedHours(Math.floor(todayData.total_minutes_in_bed / 60));
        setSleepPercentage(percentage);
      }

      // Weekly sleep Data
      if (weeklyDataArray?.available_sleep_data?.length > 0) {
        const processedSleepData = weeklyDataArray.available_sleep_data.map((item: { date: string; total_sleep_minutes: number }) => {
          const date = new Date(item.date);
          const options: Intl.DateTimeFormatOptions = { weekday: "short" };
          return {
            day: new Intl.DateTimeFormat("en-US", options).format(date),
            hours: parseFloat((item.total_sleep_minutes / 60).toFixed(2)),
            isFixedDate: date.toDateString() === fixedDate.toDateString(),
          };
        });
        setSleepData(processedSleepData);
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
      const response = await fetch(`${config.API_BASE_URL}/chat/detail?date=${formattedYesterday}&metric=sleep`);
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
  }, [userId]);

  if (isLoading || hasError) {
    return (
      <LoadingErrorView
        isLoading={isLoading}
        hasError={hasError}
        onRetry={fetchData}
        loadingText="Loading your sleep data..."
        errorText="Failed to load your sleep data. Do you want to try again?"
        headerTitle="Targets & Progress"
      />
    );
  }


  return (
    <ScrollView className="flex-1 px-4 bg-white">
      <CustomHeader
        title="Sleep overview"
        showBackButton={true}
      />

      <View className="flex-row justify-between mb-4 mt-4">
        <IconTextBox icon={icons.sleepTime} topText={sleepHours.toLocaleString()} bottomText="Hours asleep" />
        <IconTextBox icon={icons.sleeping} topText={inBedHours.toLocaleString()} bottomText="Hours in bed" />
      </View>

      <View>
        <Text className="text-xl font-bold mt-4">Sleep goal progress</Text>
        <View className="w-full flex items-center">
          <View className="w-full h-8  bg-gray-200 rounded-full relative">
            <View
              className={`absolute  h-8 ${getProgressColor(sleepPercentage)} flex items-center justify-center rounded-full`}
              style={{ width: `${Math.min(sleepPercentage, 100)}%` }}
            >
              <Text className="text-white font-semibold">
                {`${sleepPercentage}%`}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between w-full mt-2">
            <Text className="text-black font-medium text-sm">0 hours</Text>
            <Text className="text-black font-medium text-sm">{Math.floor(sleepGoal)} hours</Text>
          </View>
        </View>
      </View>

      <View>
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

      <Text className="text-black text-lg font-semibold mb-1 mt-8">Sleep duration last week (hours)</Text>
      <View pointerEvents="none" className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
        <VictoryChart height={224} theme={customThemeBarChart} >
          <VictoryAxis
            style={customThemeBarChart.axisBottom.style}
          />
          <VictoryAxis
            dependentAxis
            style={customThemeBarChart.axisLeft.style}
          />
          <VictoryBar barWidth={20} cornerRadius={{ top: 3 }} data={sleepData} x="day" y="hours"
            style={{
              data: {
                fill: ({ datum }) => (datum.isFixedDate ? "#ff4d4d" : "#4A90E2"),
              },
            }}
            labels={({ datum }) => datum.hours}
            labelComponent={
              <VictoryLabel
                dy={-10}
                style={{ fontSize: 15, fill: "#307FE2" }}
              />
            } />
        </VictoryChart>
      </View>
    </ScrollView>


  );
};

export default SleepDetail;