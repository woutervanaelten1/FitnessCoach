import CustomHeader from "@/components/CustomHeader";
import ProgressBox from "@/components/ProgressBox";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Targets = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Adjust targets" showBackButton={true} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="p-4">
        <ProgressBox target={10000} metric="Steps" progressBar={false} weeklyAverage={6589} />
        <ProgressBox target={60} metric="Active minutes" progressBar={false} weeklyAverage={52} />
        <ProgressBox target={8} metric="Hours slept" progressBar={false} weeklyAverage={7.2} />
        <ProgressBox target={1000} metric="Kcal burned" progressBar={false} weeklyAverage={1039} />
        <ProgressBox target={1000} metric="other example" progressBar={false} weeklyAverage={1000} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Targets;