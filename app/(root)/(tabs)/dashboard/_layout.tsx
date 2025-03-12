import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="activeDetail" options={{ headerShown: false }}/>
      <Stack.Screen name="calorieDetail" options={{ headerShown: false }}/>
      <Stack.Screen name="dailyStep" options={{ headerShown: false }}/>
      <Stack.Screen name="sleepDetail" options={{ headerShown: false }}/>
      <Stack.Screen name="stepDetail" options={{ headerShown: false }}/>
      <Stack.Screen name="weightDetail" options={{ headerShown: false }}/>
    </Stack>
  );
}