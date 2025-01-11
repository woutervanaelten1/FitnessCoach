import { Stack } from "expo-router";
import { SafeAreaView, View } from "react-native";
import CustomTabBar from "@/components/CustomTabBar";

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false, // Disable header globally for all screens
          }}
        />
        <CustomTabBar />
      </View>
    </SafeAreaView>
  );
}
