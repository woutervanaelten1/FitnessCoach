import { Stack } from 'expo-router';
/**
 * Defines the navigation stack for the home tab.
 * Currently contains only the main index screen.
 */

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}