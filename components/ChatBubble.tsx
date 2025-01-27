import { Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";

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
      {/* <Text className={`${isUser ? 'text-white' : 'text-black'} text-base`}>
        {message}
      </Text> */}
      <Markdown
        style={{
          body: { color: isUser ? "white" : "black", fontSize: 16 },
          bullet_list: { color: isUser ? "white" : "black" },
        }}
      >
        {message}
      </Markdown>
    </BubbleComponent>
  );

};

export default ChatBubble;