import CustomHeader from "@/components/CustomHeader";
import GoalEditModal from "@/components/goalEditModal";
import LoadingErrorView from "@/components/LoadingErrorView";
import ProgressBox from "@/components/ProgressBox";
import config from "@/config";

import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";


const Targets = () => {
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklySleep, setWeeklySleep] = useState(0);
  const [goalSteps, setGoalSteps] = useState(0);
  const [goalSleep, setGoalSleep] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(0);
  const [goalCalories, setGoalCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{
    metric: string;
    currentTarget: number;
  } | null>(null);
  const [newGoalValue, setNewGoalValue] = useState("");


  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [weekResponse, goalResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/data/daily_data/week-back?date=${config.FIXED_DATE}`),
        fetch(`${config.API_BASE_URL}/data/goals/${config.USER_ID}`)
      ]);


      // Check if responses are ok
      if (!weekResponse.ok || !goalResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const weeklyData = await weekResponse.json();
      const goalDataArray = await goalResponse.json();


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
  }, []);

  const handleSaveNewGoal = async (goalValue: number) => {
    if (selectedGoal) {
      const { metric } = selectedGoal;
      console.log(goalValue)

      try {
        // Post for new goal
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
        let text = "Saved successfully!"

        switch (metric) {
          case "steps":
            setGoalSteps(Number(newGoalValue));
            text = `The ${metric.toLowerCase()} goal was updated successfully!`;
            break;
          case "active_minutes":
            setGoalMinutes(Number(newGoalValue));
            text = "The active minutes goal was updated successfully!";
            break;
          case "sleep":
            setGoalSleep(Number(newGoalValue));
            text = `The ${metric.toLowerCase()} goal was updated successfully!`;
            break;
          case "calories":
            setGoalCalories(Number(newGoalValue));
            text = `The ${metric.toLowerCase()} goal was updated successfully!`;
            break;
          default:
            console.warn(`Unknown metric: ${metric}`);
            break;
        }
        fetchData();
        Toast.show({
          type: "success",
          text1: text,
          text2: "Your new goal has been saved.",
        });
      } catch (error) {
        console.error("Error saving goal:", error instanceof Error ? error.message : error);
        Toast.show({
          type: "error",
          text1: "Failed to update goal",
          text2: `An error occurred. Please try again.`,
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

      <TouchableOpacity
        onPress={() => {
          setSelectedGoal({ metric: "steps", currentTarget: goalSteps });
          setNewGoalValue(goalSteps.toString());
          setIsModalVisible(true);
        }}>
        <ProgressBox target={goalSteps} metric="Steps" progressBar={false} weeklyAverage={weeklySteps} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setSelectedGoal({ metric: "active_minutes", currentTarget: goalMinutes });
          setNewGoalValue(goalMinutes.toString());
          setIsModalVisible(true);
        }}>
        <ProgressBox target={goalMinutes} metric="Active minutes" progressBar={false} weeklyAverage={weeklyMinutes} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setSelectedGoal({ metric: "sleep", currentTarget: goalSleep });
          setNewGoalValue(goalSleep.toString());
          setIsModalVisible(true);
        }}>
        <ProgressBox target={goalSleep} metric="Hours slept" progressBar={false} weeklyAverage={weeklySleep} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setSelectedGoal({ metric: "calories", currentTarget: goalCalories });
          setNewGoalValue(goalCalories.toString());
          setIsModalVisible(true);
        }}>
        <ProgressBox target={goalCalories} metric="Kcal burned" progressBar={false} weeklyAverage={weeklyCalories} />
      </TouchableOpacity>

      <GoalEditModal
        isVisible={isModalVisible}
        goal={Number(newGoalValue)}
        metric={selectedGoal?.metric || ""}
        onClose={() => setIsModalVisible(false)}
        onSave={(newGoal) => {
          handleSaveNewGoal(newGoal); // Directly pass the latest input value
          setNewGoalValue(newGoal.toString()); // Optionally update the state
        }}
      // onChangeValue={setNewGoalValue}
      />
      <Toast />
    </ScrollView>
  );
};

export default Targets;