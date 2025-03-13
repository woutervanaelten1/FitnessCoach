import { useProfile } from "@/app/context/ProfileContext";
import CustomHeader from "@/components/CustomHeader";
import GoalEditModal from "@/components/goalEditModal";
import LoadingErrorView from "@/components/LoadingErrorView";
import ProgressBox from "@/components/ProgressBox";
import config from "@/config";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

/**
 * Edit Targets screen that allows users to adjust their fitness goals.
 * It fetches current goals, allows modifications, and updates the values.
 *
 * @returns {JSX.Element} The Edit Targets screen component.
 */
const Targets = () => {
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

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { userId } = useProfile();

  // Modal states for goal editing
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{ metric: string; currentTarget: number; } | null>(null);
  const [newGoalValue, setNewGoalValue] = useState("");

  /**
   * Fetches weekly data and user goals from the API.
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [weekResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${config.FIXED_DATE}&user_id=${userId}`),
        fetch(`${config.API_BASE_URL}/data/goals/${userId}`)
      ]);

      if (!weekResponse.ok || !goalResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const weeklyData = await weekResponse.json();
      const goalDataArray = await goalResponse.json();

      // Function to calculate weekly averages
      const calculateWeeklyAverage = (data: any[], field: string): number => {
        const total = data.reduce((sum, day) => sum + (day[field] || 0), 0);
        return total / data.length;
      };

      // Process weekly averages if available
      if (weeklyData?.available_data?.length > 0) {
        setWeeklySteps(parseFloat(calculateWeeklyAverage(weeklyData.available_data, "totalsteps").toFixed(0)));
        setWeeklyCalories(parseFloat(calculateWeeklyAverage(weeklyData.available_data, "calories").toFixed(0)));
        setWeeklyMinutes(parseFloat(calculateWeeklyAverage(weeklyData.available_data, "veryactiveminutes").toFixed(0)));
        setWeeklySleep(parseFloat((calculateWeeklyAverage(weeklyData.available_data, "total_sleep_minutes") / 60).toFixed(2))); // Convert minutes to hours
      }

      // Mapping goal data to appropriate states
      if (goalDataArray && goalDataArray.length > 0) {
        const metricSetters = {
          steps: setGoalSteps,
          sleep: setGoalSleep,
          active_minutes: setGoalMinutes,
          calories: setGoalCalories,
        };

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

  useEffect(() => {
    fetchData();
  }, [userId]);

  /**
   * Handles updating the goal value in the API.
   * @param {number} goalValue - The new goal value to be saved.
   */
  const handleSaveNewGoal = async (goalValue: number) => {
    if (selectedGoal) {
      const { metric } = selectedGoal;

      try {
        const response = await fetch(
          `${config.API_BASE_URL}/data/goals/${config.USER_ID}/${metric.toLowerCase()}?goal_value=${Number(goalValue)}`,
          {
            method: "POST",
            headers: { "accept": "application/json" },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to update goal");
        }

        // Update state based on metric
        const metricSetters: Record<string, (value: number) => void> = {
          steps: setGoalSteps,
          active_minutes: setGoalMinutes,
          sleep: setGoalSleep,
          calories: setGoalCalories,
        };

        metricSetters[metric]?.(goalValue);

        fetchData(); // Refresh data after update

        Toast.show({
          type: "success",
          text1: `The ${metric.replace("_", " ")} goal was updated successfully!`,
          text2: "Your new goal has been saved.",
        });

      } catch (error) {
        console.error("Error saving goal:", error instanceof Error ? error.message : error);
        Toast.show({
          type: "error",
          text1: "Failed to update goal",
          text2: "An error occurred. Please try again.",
        });
      }
    }

    setIsModalVisible(false);
  };


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

      <CustomHeader title="Adjust targets" showBackButton={true} />

      <Text className="text-2xl  font-bold my-2">Select the target you want to change</Text>

      {/* Progress Boxes with Touchable Editing */}
      {[
        { metric: "steps", target: goalSteps, weekly: weeklySteps },
        { metric: "active_minutes", target: goalMinutes, weekly: weeklyMinutes },
        { metric: "sleep", target: goalSleep, weekly: weeklySleep },
        { metric: "calories", target: goalCalories, weekly: weeklyCalories },
      ].map(({ metric, target, weekly }) => (
        <TouchableOpacity
          key={metric}
          onPress={() => {
            setSelectedGoal({ metric, currentTarget: target });
            setNewGoalValue(target.toString());
            setIsModalVisible(true);
          }}
        >
          <ProgressBox target={target} metric={metric.replace("_", " ")} progressBar={false} weeklyAverage={weekly} />
        </TouchableOpacity>
      ))}

      {/* Goal Edit Modal */}
      <GoalEditModal
        isVisible={isModalVisible}
        goal={Number(newGoalValue)}
        metric={selectedGoal?.metric || ""}
        onClose={() => setIsModalVisible(false)}
        onSave={(newGoal) => {
          handleSaveNewGoal(newGoal); 
          setNewGoalValue(newGoal.toString()); 
        }}
      />
      <Toast />
    </ScrollView>
  );
};

export default Targets;