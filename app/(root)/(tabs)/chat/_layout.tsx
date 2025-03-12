import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="earlierChats" options={{ headerShown: false }}/>
      <Stack.Screen name="chat" options={{ headerShown: false }}/>
      <Stack.Screen name="conversationDetail/[conversationId]" options={{ headerShown: false }}/>
    </Stack>
  );
}