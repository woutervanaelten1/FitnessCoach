import { Stack } from "expo-router";

/**
 * Root layout that wraps the tab-based navigation.
 * This layout includes a single screen that renders the bottom tab navigator,
 * and allows gestures (e.g., swipe back on iOS) by enabling gesture handling.
 */

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: true}} />
    </Stack>
  );
};

export default Layout;