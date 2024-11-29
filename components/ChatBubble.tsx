import { Text, View} from "react-native";

const ChatBubble = ({ message, isUser, maxWidth = "85%" } : {message:string, isUser:boolean, maxWidth:string}) => {
    return (
      <View
        className={`my-2 p-3 rounded-lg max-w-[${maxWidth}%] ${
          isUser ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'
        }`}
      >
        <Text className={`${isUser ? 'text-white' : 'text-black'} text-base`}>
          {message}
        </Text>
      </View>
    );
  };
  
  export default ChatBubble;