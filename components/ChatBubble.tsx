import { TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";

const ChatBubble = ({ message, isUser, maxWidth, onPress }: { message: string, isUser: boolean, maxWidth: number, onPress?: () => void; }) => {
  const BubbleComponent = onPress ? TouchableOpacity : View;

  return (
    <BubbleComponent
      onPress={onPress}
      style={{
        maxWidth: `${maxWidth}%`,
        flexShrink: 1,
      }}
      className={`my-2 p-3 rounded-lg ${isUser ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'
        } min-h-[40px]`}
    >
      <View>
        <Markdown
          style={{
            body: {
              color: isUser ? "white" : "black",
              fontSize: 16,
              width: '100%',
              marginVertical: 4
            },
            bullet_list: {
              color: isUser ? "white" : "black",
              marginLeft: 20, 
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
              flexShrink: 1,
              marginBottom: 12
            },
            table: { borderWidth: 1, borderColor: "black" },
            th: {
              backgroundColor: "#ddd",
              padding: 5,
              fontWeight: "bold",
              flex: 1,
              textAlign: "center"
            },
            td: {
              padding: 5,
              borderWidth: 1,
              borderColor: "black",
              flex: 1,
              textAlign: "center",
            },
          }}
        >
          {message}
        </Markdown>
      </View>
    </BubbleComponent>
  );
};

export default ChatBubble;