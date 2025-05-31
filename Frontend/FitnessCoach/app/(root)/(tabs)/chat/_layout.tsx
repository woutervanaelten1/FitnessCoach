import { Stack } from 'expo-router';
/**
 * Defines the stack navigation for the chat section.
 * Includes routes for:
 * - Chat overview (index)
 * - Earlier chats
 * - New chat screen
 * - Conversation detail view (with dynamic conversationId)
 */


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