import { Stack } from 'expo-router';

/**
 * Layout configuration for the Progress tab.
 * Defines the stack navigator for the progress overview and editing targets.
 *
 */
export default function ProgressLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="editTargets" options={{ headerShown: false }}/>
    </Stack>
  );
}