import { Stack } from 'expo-router';
/**
 * Layout configuration for the Profile tab.
 * Defines a stack navigator with the profile index screen.
 *
 */
export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}