import { Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";

const ChatBubble = ({ message, isUser, maxWidth, onPress }: { message: string, isUser: boolean, maxWidth: number, onPress?: () => void; }) => {
  const BubbleComponent = onPress ? TouchableOpacity : View;

  return (
    <BubbleComponent
      onPress={onPress}
      style={{
        maxWidth: `${maxWidth}%`,
        flexShrink: 1, // Add this to allow shrinking
      }}
      className={`my-2 p-3 rounded-lg ${isUser ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'}`}
    >
      <Markdown
        style={{
          body: { 
            color: isUser ? "white" : "black", 
            fontSize: 16,
            width: '100%', // Ensure body takes full available width
          },
          bullet_list: { 
            color: isUser ? "white" : "black",
            marginLeft: 20, // Reduce indentation for lists
          },
          list_item: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 4,
          },
          bullet_list_icon: {
            marginLeft: -15,
            marginRight: 5,
          },
          paragraph: {
            flexWrap: 'wrap',
            flexShrink: 1,
          }
        }}
      >
        {message}
      </Markdown>
    </BubbleComponent>
  );
};

export default ChatBubble;