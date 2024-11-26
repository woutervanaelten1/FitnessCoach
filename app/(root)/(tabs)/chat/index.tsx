import CustomHeader from "@/components/CustomHeader";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Fitness Coach" showBackButton={false}/>
      <Text className="p-4">This is the chat page</Text>
    </SafeAreaView>
  );
};

export default Chat;