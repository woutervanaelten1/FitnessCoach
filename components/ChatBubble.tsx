import { StyleSheet, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import React, { memo } from "react";

// Define prop types
type ChatBubbleProps = {
  message: string;
  isUser: boolean;
  maxWidth: number;
  onPress?: () => void;
};

/**
 * ChatBubble component to display user and chatbot messages with Markdown support.
 * 
 * @param {string} message - The text content of the chat bubble.
 * @param {boolean} isUser - Determines if the message is from the user or bot.
 * @param {number} maxWidth - Maximum width of the chat bubble.
 * @param {Function} [onPress] - Optional function to handle press events.
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, maxWidth, onPress }) => {
  const BubbleComponent = onPress ? TouchableOpacity : View;

  return (
    <BubbleComponent
      onPress={onPress}
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        { maxWidth: `${maxWidth}%` },
      ]}
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

// Define styles using StyleSheet for better performance
const styles = StyleSheet.create({
  bubble: {
    flexShrink: 1,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 40,
  },
  userBubble: {
    backgroundColor: "#307FE2",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
});

export default memo(ChatBubble);