import { Stack } from 'expo-router';

export default function ProgressLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="editTargets" options={{ headerShown: false }}/>
    </Stack>
  );
}