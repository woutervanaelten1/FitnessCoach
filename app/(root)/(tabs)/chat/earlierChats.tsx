import CustomHeader from "@/components/CustomHeader";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EarlierChats = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Profile" showBackButton={false}/>
      <Text className="p-4">This is the earlier chats page</Text>
    </SafeAreaView>
  );
};

export default EarlierChats;