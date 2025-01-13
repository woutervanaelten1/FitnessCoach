import CustomHeader from "@/components/CustomHeader";
import IconTextBox from "@/components/IconTextBox";
import FullCircle from "@/components/FullCircle";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import CustomButton from "@/components/CustomButton";
import DetailView from "@/components/DetailComponent";
import LoadingErrorView from "@/components/LoadingErrorView";

const CalorieDetail = () => {
  const [calories, setCalories] = useState(0);
  const [caloriegoal, setCalorieGoal] = useState(0);
  const [hourlyCalories, setHourlyCalorie] = useState<{ time: number; calories: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [detail, setDetail] = useState<{ type: string; content: string } | null>(null);
  const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
  const hours = Array.from({ length: 24 }, (_, i) => i);


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
        tickLabels: {
          fill: "#4A90E2",
          fontSize: 14,
          fontWeight: "bold",
        },
        ticks: { stroke: "none" }
      },
    },
  };



  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [todayResponse, hourlyResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/data/hourly_merged/by-date?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/data/goals/${config.USER_ID}/calories`),
      ]);

      if (!todayResponse.ok || !hourlyResponse.ok || !goalResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const todayDataArray = await todayResponse.json();
      const hourlyDataArray = await hourlyResponse.json();
      const goalData = await goalResponse.json();

      // Goal Data
      if (goalData) {
        setCalorieGoal(goalData.goal);
      }

      // Today Data
      const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
      if (todayData) {
        setCalories(todayData.calories);
      }

      // Hourly calorie Data
      if (hourlyDataArray) {
        const processedData = hours.map((hour) => {
          const match = hourlyDataArray.find(
            (item: { timestamp: string; calories: number }) => new Date(item.timestamp).getHours() === hour
          );
          return {
            time: hour,
            calories: match ? match.calories : 0,
          };
        });
        setHourlyCalorie(processedData);
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
      const response = await fetch(`${config.API_BASE_URL}/chat/detail?date=${config.FIXED_DATE}&metric=calories`);
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
        loadingText="Loading your calorie data..."
        errorText="Failed to load your calorie data. Do you want to try again?"
        headerTitle="Targets & Progress"
      />
    );
  }

  return (
    <ScrollView className="flex-1 px-4 bg-white">
      <CustomHeader title="Calorie overview" showBackButton={true} />

      <View className="flex-row justify-between mb-4 mt-4">
        <IconTextBox icon={icons.fire} topText={calories.toLocaleString()} bottomText="kcal burned" />
        <View className="flex-1 items-center justify-center bg-gray-100 rounded-lg p-4 mx-1">
          <FullCircle value={calories} goal={caloriegoal} metric={"kcal"} />
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
            detail={{ type: detail.type, content: detail.content}}
            onCheckOutPress={() => console.log('Check it out button clicked')}
          />
        ) : (
          <Text className="text-gray-500 text-lg">No details found.</Text>
        )}
      </View>

      <Text className="text-black text-lg font-semibold mb-1 mt-6">Hourly calorie breakdown</Text>
      <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
        <VictoryChart
          theme={customThemeBarChart}
          padding={{ top: 30, bottom: 40, left: 65, right: 35 }}
          height={224}
        >
          <VictoryAxis
            tickValues={[0, 4, 8, 12, 16, 20, 24]}
            tickFormat={(t) => timeLabels[t / 4]}
            style={customThemeBarChart.axisBottom.style}
          />
          <VictoryAxis
            dependentAxis
            style={customThemeBarChart.axisLeft.style}
          />
          <VictoryBar
            cornerRadius={{ top: 3 }}
            data={hourlyCalories}
            x="time"
            y="calories"
            barWidth={8}
            style={{
              data: {
                fill: ({ datum }) => (datum.isFixedDate ? "#ff4d4d" : "#4A90E2"),
              },
            }}
          />
        </VictoryChart>
      </View>

    </ScrollView>
  );
};

export default CalorieDetail;