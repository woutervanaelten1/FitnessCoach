import CustomHeader from "@/components/CustomHeader";
import IconTextBox from "@/components/IconTextBox";
import config from "@/config";
import { icons } from "@/constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { VictoryChart, VictoryBar, VictoryAxis, VictoryLabel, VictoryTheme, VictoryArea } from "victory-native";

const Dashboard = () => {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [sleepData, setSleepData] = useState([]);
  const [heartRateData, setHeartRateData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];



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


  const fetchData = async () => {
    try {
      const [todayResponse, sleepResponse, heartRateResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/data/daily_data/sleep-week-back?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/heartrate/minute?bydate=${config.FIXED_DATE}`),
      ]);

      if (!todayResponse.ok || !sleepResponse.ok || !heartRateResponse) {
        throw new Error("Failed to fetch data");
      }

      const todayDataArray = await todayResponse.json();
      const sleepDataArray = await sleepResponse.json();
      const heartRateDataArray = await heartRateResponse.json();


      // Today Data
      const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
      if (todayData) {
        setSteps(todayData.totalsteps);
        setCalories(todayData.calories);
        setActiveMinutes(todayData.veryactiveminutes);
      }

      // Sleep Data
      if (sleepDataArray?.available_sleep_data?.length > 0) {
        const processedSleepData = sleepDataArray.available_sleep_data.map((item: { date: string; total_sleep_minutes: number }) => {
          const date = new Date(item.date);
          const fixedDate = new Date(config.FIXED_DATE);
          const options: Intl.DateTimeFormatOptions = { weekday: "short" };
          return {
            day: new Intl.DateTimeFormat("en-US", options).format(date),
            hours: parseFloat((item.total_sleep_minutes / 60).toFixed(2)),
            isFixedDate: date.toDateString() === fixedDate.toDateString(),
          };
        });
        setSleepData(processedSleepData);
      }

      // Heart rate data
      if (heartRateDataArray?.heart_rate_values?.length > 0) {
        const processedHeartRateData = heartRateDataArray.heart_rate_values.map((value: number, index: number) => {
          return {
            time: index,
            rate: value,
          };
        });
        setHeartRateData(processedHeartRateData);
      }

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
    <ScrollView className="px-3 flex-1 bg-white">
      <CustomHeader title="Fitness Dashboard" showBackButton={false} />

      {/* Date Section */}
      <Text className="text-black text-xl font-bold mb-1 mt-2">{config.FIXED_DATE}</Text>
      <Text className="text-blue-500 font-semibold text-sm mb-4">Touch one of the icons for more information</Text>


      <View className="flex-row justify-between mb-4 mt-4">
        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/dashboard/calorieDetail")}>
          <IconTextBox icon={icons.fire} topText={calories.toLocaleString()} bottomText="kcal" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/dashboard/stepDetail")}>
          <IconTextBox icon={icons.walking} topText={steps.toLocaleString()} bottomText="steps" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/dashboard/activeDetail")}>
          <IconTextBox icon={icons.timer} topText={activeMinutes.toLocaleString()} bottomText="minutes" />
        </TouchableOpacity>
      </View>

      {/* Sleep Duration Section */}
      <Text className="text-black text-lg font-semibold mb-1">Sleep duration last week (hours)</Text>
      <Text className="text-blue-500 font-semibold text-sm mb-4">Touch the graph for more sleep information</Text>
      <TouchableOpacity className="relative z-10" onPress={() => {router.push("/dashboard/sleepDetail");}}>
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
    </ScrollView>
  );
};

export default Dashboard;