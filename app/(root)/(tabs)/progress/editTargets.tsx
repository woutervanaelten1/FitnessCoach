import CustomHeader from "@/components/CustomHeader";
import ProgressBox from "@/components/ProgressBox";
import config from "@/config";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

const Targets = () => {
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklySleep, setWeeklySleep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${config.FIXED_DATE}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const weeklyData = await response.json();

      // Calculate weekly averages
      if (weeklyData?.available_data?.length > 0) {

        const calculateWeeklyAverage = (data: any[], field: string): number => {
          const total = data.reduce((sum, day) => sum + (day[field] || 0), 0);
          return total / data.length;
        };

        setWeeklySteps(parseFloat(calculateWeeklyAverage(weeklyData.available_data, "totalsteps").toFixed(0)));
        setWeeklyCalories(parseFloat(calculateWeeklyAverage(weeklyData.available_data, "calories").toFixed(0)));
        setWeeklyMinutes(parseFloat(calculateWeeklyAverage(weeklyData.available_data, "veryactiveminutes").toFixed(0)));
        setWeeklySleep(parseFloat((calculateWeeklyAverage(weeklyData.available_data, "total_sleep_minutes") / 60).toFixed(2)));
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
    <ScrollView contentContainerStyle={{ paddingBottom: 15 }} className="p-4 flex-1 bg-white">

      <CustomHeader title="Adjust targets" showBackButton={true} />
        <ProgressBox target={10000} metric="Steps" progressBar={false} weeklyAverage={weeklySteps} />
        <ProgressBox target={60} metric="Active minutes" progressBar={false} weeklyAverage={weeklyMinutes} />
        <ProgressBox target={8} metric="Hours slept" progressBar={false} weeklyAverage={weeklySleep} />
        <ProgressBox target={1000} metric="Kcal burned" progressBar={false} weeklyAverage={weeklyCalories} />
        <ProgressBox target={1000} metric="other example" progressBar={false} weeklyAverage={1000} />
      </ScrollView>
  );
};

export default Targets;