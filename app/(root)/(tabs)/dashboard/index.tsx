import CustomHeader from "@/components/CustomHeader";
import IconTextBox from "@/components/IconTextBox";
import config from "@/config";
import { icons } from "@/constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { VictoryChart, VictoryBar, VictoryAxis, VictoryLabel, VictoryTheme, VictoryArea, VictoryScatter } from "victory-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingErrorView from "@/components/LoadingErrorView";
import { useProfile } from "@/app/context/ProfileContext";
import DatePicker from "@/components/DatePicker";
import { logClick } from "@/utils/clickLogger";
import WeightChart from "@/components/WeightChart";

/**
 * Represents a single night's sleep summary.
 * @property day - Weekday label (e.g., 'Mon').
 * @property hours - Sleep duration in hours.
 * @property date - Full date string (YYYY-MM-DD).
 */
type SleepEntry = {
  day: string;
  hours: number;
  date: Date;
};

/**
 * Represents a heart rate data point sampled at a specific minute of the day.
 * @property time - Minute of the day (e.g., 0–1439 for 00:00 to 23:59).
 * @property rate - Heart rate value in beats per minute (BPM).
 */
type HeartRateEntry = {
  time: number;
  rate: number;
};

/**
 * Represents a weight measurement for a specific day.
 * @property day - Weekday label (e.g., 'Mon', 'Tue').
 * @property weight - Weight value in kilograms (kg).
 */
type WeightEntry = {
  day: string;
  weight: number;
};

/**
 * The Dashboard screen provides an overview of various fitness metrics, including:
 * - Steps
 * - Calories Burned
 * - Active Minutes
 * - Sleep Data
 * - Heart Rate
 * - Weight Data
 * 
 * @returns {JSX.Element} The Dashboard screen component.
 */

const Dashboard = () => {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [heartRateData, setHeartRateData] = useState<HeartRateEntry[]>([]);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [minWeight, setMinWeight] = useState<number | null>(null);
  const [maxWeight, setMaxWeight] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(config.FIXED_DATE));
  const { userId } = useProfile();

  const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];

  /**
   * Custom theme settings for the Victory Bar Chart.
   */
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

  /**
   * Custom theme settings for the Victory Line Chart.
   */
  const customThemeLineChart = {
    ...VictoryTheme.material,
    area: {
      style: {
        data: {
          fill: "rgba(74, 144, 226, 0.3)",
          stroke: "#4A90E2",
          strokeWidth: 2,
        },
        labels: { fontSize: 10, fill: "#333" },
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

  /**
   * Formats selectedDate to match API and dataset format (YYYY-MM-DD).
  */
  const getFormattedDate = (date: Date) => date.toISOString().split("T")[0];

  /**
   * Fetches dashboard data including steps, calories, active minutes, sleep, heart rate, and weight.
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const formattedDate = getFormattedDate(selectedDate);
      const yesterday = new Date(selectedDate);
      yesterday.setDate(selectedDate.getDate() - 1);
      const formattedYesterday = getFormattedDate(yesterday);
      const [todayResponse, sleepResponse, heartRateResponse, weightResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${formattedDate}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/daily_data/sleep-week-back?date=${formattedYesterday}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/heartrate/minute?bydate=${formattedDate}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/weight_log/week-back?date=${formattedDate}&user_id=${userId}`),
      ]);

      if (!todayResponse.ok || !sleepResponse.ok || !heartRateResponse.ok || !weightResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const todayDataArray = await todayResponse.json();
      const sleepDataArray = await sleepResponse.json();
      const heartRateDataArray = await heartRateResponse.json();
      const weightDataArray = await weightResponse.json();

      // Update state with the fetched data
      const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
      if (todayData) {
        setSteps(todayData.totalsteps);
        setCalories(todayData.calories);
        setActiveMinutes(todayData.veryactiveminutes);
        setCurrentWeight(todayData.weightkg);
      }

      // Process and set sleep data
      if (sleepDataArray?.available_sleep_data?.length > 0) {
        const processedSleepData = sleepDataArray.available_sleep_data.map((item: { date: string; total_sleep_minutes: number }) => {
          const date = new Date(item.date);
          const options: Intl.DateTimeFormatOptions = { weekday: "short" };
          return {
            day: new Intl.DateTimeFormat("en-US", options).format(date),
            hours: parseFloat((item.total_sleep_minutes / 60).toFixed(2)),
            date: getFormattedDate(date)
          };
        });
        setSleepData(processedSleepData);
      }

      // Process and set heart rate data
      if (heartRateDataArray?.heart_rate_values?.length > 0) {
        const processedHeartRateData = heartRateDataArray.heart_rate_values.map((value: number, index: number) => ({
          time: index,
          rate: value,
        }));
        setHeartRateData(processedHeartRateData);
      }

      // Process and set weight data
      if (weightDataArray.available_data?.length > 0) {
        const processedWeight = weightDataArray.available_data.map((item: { date: string; weightkg: number }) => {
          const date = new Date(item.date);
          const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
          return { day, weight: item.weightkg };
        });

        const weights = processedWeight.map((d: { day: string; weight: number }) => d.weight);
        setMinWeight(Math.min(...weights) - 0.5);
        setMaxWeight(Math.max(...weights) + 0.5);
        setWeightData(processedWeight);
      }

      // Cache the data in AsyncStorage. This can be used when new data like weight entry is added
      await AsyncStorage.setItem(
        'dashboardData',
        JSON.stringify({ steps, calories, activeMinutes, sleepData, heartRateData, weightData, currentWeight, minWeight, maxWeight })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('dashboardData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setSteps(parsedData.steps);
          setCalories(parsedData.calories);
          setActiveMinutes(parsedData.activeMinutes);
          setSleepData(parsedData.sleepData);
          setHeartRateData(parsedData.heartRateData);
          setWeightData(parsedData.weightData);
          setCurrentWeight(parsedData.currentWeight);
          setMinWeight(parsedData.minWeight);
          setMaxWeight(parsedData.maxWeight);
          setIsLoading(false); // Show cached data immediately
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
      }

      // Fetch fresh data in the background
      fetchData();
    };

    loadCachedData();
  }, []);

  // Fetch fresh data when the page is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userId, selectedDate])
  );


  if (isLoading || hasError) {
    return (
      <LoadingErrorView
        isLoading={isLoading}
        hasError={hasError}
        onRetry={fetchData}
        loadingText="Loading your data..."
        errorText="Failed to load your data. Do you want to try again?"
        headerTitle="Fitness Dashboard"
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );
  }

  return (
    <ScrollView className="px-3 flex-1 bg-white">
      <CustomHeader title="Fitness Dashboard" showBackButton={false} />

      {/* Date Section */}
      <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <Text className="text-blue-500 font-semibold text-sm mb-4">Touch one of the icons for more information</Text>

      {/* Overview Metrics */}
      <View className="flex-row justify-between mb-4 mt-4">
        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
          logClick("click", "Dashboard.CalorieBox");
          router.push("/dashboard/calorieDetail");
        }}>
          <IconTextBox icon={icons.fire} topText={calories.toLocaleString()} bottomText="kcal" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
          logClick("click", "Dashboard.StepBox");
          router.push("/dashboard/stepDetail");
        }}>
          <IconTextBox icon={icons.walking} topText={steps.toLocaleString()} bottomText="steps" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
          logClick("click", "Dashboard.ActivityBoxX");
          router.push("/dashboard/activeDetail");
        }}>
          <IconTextBox icon={icons.timer} topText={activeMinutes.toLocaleString()} bottomText="minutes" />
        </TouchableOpacity>
      </View>

      {/* Sleep Duration Section */}
      <Text className="text-black text-lg font-semibold mb-1">Sleep duration last week (hours)</Text>
      <Text className="text-blue-500 font-semibold text-sm mb-4">Touch the graph for more sleep information</Text>
      <TouchableOpacity className="relative z-10" onPress={() => {
        logClick("click", "Dashboard.SleepBox");
        router.push("/dashboard/sleepDetail");
      }}>
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
                  fill: ({ datum }) => (getFormattedDate(new Date(selectedDate.getTime() - 86400000)) === datum.date ? "#ff4d4d" : "#4A90E2"),
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
      </TouchableOpacity>

      {/* Heart Rate Section */}
      <Text className="text-black text-lg font-semibold mb-1">Daily heart rate summary</Text>
      <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
        <VictoryChart padding={{ top: 30, bottom: 40, left: 55, right: 35 }} height={224} theme={customThemeLineChart}>
          <VictoryAxis
            tickValues={[0, 240, 480, 720, 960, 1200, 1440]}
            tickFormat={(t) => timeLabels[Math.floor(t / 240)]}
            style={customThemeLineChart.axisBottom.style}
          />
          <VictoryAxis dependentAxis style={customThemeLineChart.axisLeft.style} />
          <VictoryArea
            data={heartRateData}
            x="time"
            y="rate"
            style={customThemeLineChart.area.style}
          />
        </VictoryChart>
      </View>

      {/* Weight Section */}
      <View className="relative">
        <Text className="text-black text-lg font-semibold mb-1">Weight journey (in kgs)</Text>
        <Text className="text-blue-500 font-bold mb-4">
          Current weight: <Text className="text-xl">{currentWeight?.toFixed(1)} kg</Text>
        </Text>
        <Text className="text-blue-500 font-semibold text-sm mb-4">Touch the graph for more weight information</Text>

        {/* Chart section */}
        <View className="h-56 bg-gray-200 rounded-lg mb-6 items-center justify-center">
          <WeightChart
            weightData={weightData}
            currentWeight={currentWeight ?? 0}
            minWeight={minWeight}
            maxWeight={maxWeight}
            showTitle={false}
          />
          {/* Transparent overlay button */}
          <TouchableOpacity
            onPress={() => router.push("/dashboard/weightDetail")}
            className="absolute top-0 left-0 right-0 bottom-0 z-20"
            activeOpacity={1}
          />
        </View>
      </View>

    </ScrollView>
  );
};

export default Dashboard;