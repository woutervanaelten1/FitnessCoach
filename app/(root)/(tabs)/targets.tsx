import CustomHeader from "@/components/CustomHeader";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Targets = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Targets & Progress" showBackButton={false}/>
      <Text className="p-4">This is the targets and progress page</Text>
    </SafeAreaView>
  );
};

export default Targets;