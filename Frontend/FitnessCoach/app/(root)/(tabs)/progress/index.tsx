import { useProfile } from "@/app/context/ProfileContext";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import LoadingErrorView from "@/components/LoadingErrorView";
import ProgressBox from "@/components/ProgressBox";
import config from "@/config";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView } from "react-native";

/**
 * Targets & Progress screen displaying user activity metrics
 * and tracking progress toward fitness goals.
 *
 * @returns {JSX.Element} The Targets screen component.
 */
const Targets = () => {
  // States for current progress
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [sleep, setSleep] = useState(0);

  // States for weekly averages
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklySleep, setWeeklySleep] = useState(0);

  // States for user goals
  const [goalSteps, setGoalSteps] = useState(0);
  const [goalSleep, setGoalSleep] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(0);
  const [goalCalories, setGoalCalories] = useState(0);

  // Loading and error handling states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { userId } = useProfile();

  /**
   * Calculates the average value of a specified field across a week.
   *
   * @param {Array<any>} data - Array of daily entries.
   * @param {string} field - Key of the metric to average (e.g., 'totalsteps').
   * @returns {number} The weekly average for that metric.
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [todayResponse, weekResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${config.FIXED_DATE}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/goals/${userId}`)
      ]);

      if (!todayResponse.ok || !weekResponse.ok || !goalResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const todayDataArray = await todayResponse.json();
      const weeklyDataArray = await weekResponse.json();
      const goalDataArray = await goalResponse.json();

      // Todays data
      const todayData = todayDataArray.length > 0 ? todayDataArray[0] : null;
      if (todayData) {
        setSteps(todayData.totalsteps);
        setCalories(todayData.calories);
        setActiveMinutes(todayData.veryactiveminutes);
        setSleep(parseFloat((todayData.total_sleep_minutes / 60).toFixed(2)));
      }

      // Weekly data, calculate weekly averages
      if (weeklyDataArray?.available_data?.length > 0) {
        /**
         * Calculates the weekly average for a given metric.
         * @param {Array<any>} data - The array of weekly data.
         * @param {string} field - The field to calculate the average for.
         * @returns {number} The calculated weekly average.
         */
        const calculateWeeklyAverage = (data: any[], field: string): number => {
          const total = data.reduce((sum, day) => sum + (day[field] || 0), 0);
          return total / data.length;
        };

        setWeeklySteps(parseFloat(calculateWeeklyAverage(weeklyDataArray.available_data, "totalsteps").toFixed(0)));
        setWeeklyCalories(parseFloat(calculateWeeklyAverage(weeklyDataArray.available_data, "calories").toFixed(0)));
        setWeeklyMinutes(parseFloat(calculateWeeklyAverage(weeklyDataArray.available_data, "veryactiveminutes").toFixed(0)));
        setWeeklySleep(parseFloat((calculateWeeklyAverage(weeklyDataArray.available_data, "total_sleep_minutes") / 60).toFixed(2)));
      }

      // Process user goals
      if (goalDataArray && goalDataArray.length > 0) {
        /**
        * Mapping of metric names to state setters for updating goal values.
        */
        const metricSetters = {
          steps: setGoalSteps,
          sleep: setGoalSleep,
          active_minutes: setGoalMinutes,
          calories: setGoalCalories,
        };

        // Set goals based on API response
        goalDataArray.forEach((goal: { metric: keyof typeof metricSetters; goal: number }) => {
          const setter = metricSetters[goal.metric];
          if (setter) {
            setter(goal.goal);
          }
        });
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userId])
  );

  if (isLoading || hasError) {
    return (
      <LoadingErrorView
        isLoading={isLoading}
        hasError={hasError}
        onRetry={fetchData}
        loadingText="Loading your goals..."
        errorText="Failed to load your goals. Do you want to try again?"
        headerTitle="Targets & Progress"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 15 }} className="p-4 flex-1 bg-white">
      {/* Page Header */}
      <CustomHeader title="Targets & Progress" showBackButton={false} />

      {/* Progress Boxes */}
      <ProgressBox value={steps} target={goalSteps} metric="Steps" progressBar={true} weeklyAverage={weeklySteps} />
      <ProgressBox value={activeMinutes} target={goalMinutes} metric="Active minutes" progressBar={true} weeklyAverage={weeklyMinutes} />
      <ProgressBox value={sleep} target={goalSleep} metric="Hours slept" progressBar={true} weeklyAverage={weeklySleep} />
      <ProgressBox value={calories} target={goalCalories} metric="Kcal burned" progressBar={true} weeklyAverage={weeklyCalories} />

      {/* Action Buttons */}
      <CustomButton onPress={() => router.push("/dashboard/weightDetail")} title="Check weight progress" />
      <CustomButton onPress={() => router.push("/progress/editTargets")} title="Adjust targets" className="mt-2" />
    </ScrollView>
  );
};

export default Targets;