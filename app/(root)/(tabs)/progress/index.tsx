import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import ProgressBox from "@/components/ProgressBox";
import config from "@/config";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Targets = () => {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklySleep, setWeeklySleep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [todayResponse, weekResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${config.FIXED_DATE}`)
      ]);

      // Check if responses are ok
      if (!todayResponse.ok || !weekResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      // Parse responses
      const todayDataArray = await todayResponse.json();
      const weeklyDataArray = await weekResponse.json();

      //Todays data
      const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
      if (todayData) {
        setSteps(todayData.totalsteps);
        setCalories(todayData.calories);
        setActiveMinutes(todayData.veryactiveminutes);
        setSleep(parseFloat((todayData.total_sleep_minutes / 60).toFixed(2)));
      }

      //Weekly data
      // Calculate weekly averages
      if (weeklyDataArray?.available_data?.length > 0) {

        const calculateWeeklyAverage = (data: any[], field: string): number => {
          const total = data.reduce((sum, day) => sum + (day[field] || 0), 0);
          return total / data.length;
        };
        
        setWeeklySteps(parseFloat(calculateWeeklyAverage(weeklyDataArray.available_data, "totalsteps").toFixed(0)));
        setWeeklyCalories(parseFloat(calculateWeeklyAverage(weeklyDataArray.available_data, "calories").toFixed(0)));
        setWeeklyMinutes(parseFloat(calculateWeeklyAverage(weeklyDataArray.available_data, "veryactiveminutes").toFixed(0)));
        setWeeklySleep(parseFloat((calculateWeeklyAverage(weeklyDataArray.available_data, "total_sleep_minutes")/ 60).toFixed(2)));
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
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Targets & Progress" showBackButton={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="p-4">
        <ProgressBox value={steps} target={10000} metric="Steps" progressBar={true} weeklyAverage={weeklySteps} />
        <ProgressBox value={activeMinutes} target={60} metric="Active minutes" progressBar={true} weeklyAverage={weeklyMinutes} />
        <ProgressBox value={sleep} target={8} metric="Hours slept" progressBar={true} weeklyAverage={weeklySleep} />
        <ProgressBox value={calories} target={1000} metric="Kcal burned" progressBar={true} weeklyAverage={weeklyCalories} />
        <ProgressBox value={751} target={1000} metric="other example" progressBar={true} weeklyAverage={1000} />
        <CustomButton title="Check weight progress" />
        <CustomButton onPress={() => router.push("/progress/editTargets")} title="Adjust targets" className="mt-2" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Targets;