import { Text, TouchableOpacity, View } from "react-native";

const ChatBubble = ({ message, isUser, maxWidth, onPress }: { message: string, isUser: boolean, maxWidth: number, onPress?: () => void; }) => {
  const BubbleComponent = onPress ? TouchableOpacity : View;
  return (
    <BubbleComponent
      onPress={onPress}
      style={{
        maxWidth: `${maxWidth}%`
      }}
      className={`my-2 p-3 rounded-lg max-w-[${maxWidth}%] ${isUser ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'
        }`}
    >
      <Text className={`${isUser ? 'text-white' : 'text-black'} text-base`}>
        {message}
      </Text>
    </BubbleComponent>
  );
};

export default ChatBubble;