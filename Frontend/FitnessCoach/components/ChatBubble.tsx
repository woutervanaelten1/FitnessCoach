import { StyleSheet, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import React, { memo } from "react";

/**
 * Props for the ChatBubble component.
 * 
 * @property message - Message content to display, supports Markdown.
 * @property isUser - Whether the message was sent by the user.
 * @property maxWidth - Max width of the bubble in percentage (e.g., 80 means 80%).
 * @property onPress - Optional handler when the bubble is pressed.
 */
type ChatBubbleProps = {
  message: string;
  isUser: boolean;
  maxWidth: number; // still using percentage
  onPress?: () => void;
};

/**
 * ChatBubble renders a chat message bubble, supporting both user and bot messages.
 * It supports optional markdown formatting and click behavior.
 *
 * @param {ChatBubbleProps} props - The props for the chat bubble.
 * @returns {JSX.Element} The rendered chat bubble.
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, maxWidth, onPress }) => {
  const BubbleComponent = onPress ? TouchableOpacity : View;

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        marginHorizontal: 10,
      }}
    >
      <BubbleComponent
        onPress={onPress}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          {
            maxWidth: `${maxWidth}%`,
            flexShrink: 1,
          },
        ]}
      >
        <Markdown
          style={{
            body: {
              color: isUser ? "white" : "black",
              fontSize: 16,
              marginVertical: 4,
              flexShrink: 1,
            },
            bullet_list: {
              marginLeft: 16,
            },
            ordered_list: {
              marginLeft: 16,
            },
            list_item: {
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 6,
              flexWrap: "wrap",
              flexShrink: 1,
            },
            bullet_list_icon: {
              marginRight: 6,
            },
            paragraph: {
              marginBottom: 8,
              flexShrink: 1,
              flexWrap: "wrap",
            },
            table: {
              borderWidth: 1,
              borderColor: "black",
            },
            th: {
              backgroundColor: "#ddd",
              padding: 5,
              fontWeight: "bold",
              flex: 1,
              textAlign: "center",
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
      </BubbleComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    flexShrink: 1,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 40,
    overflow: "hidden",
  },
  userBubble: {
    backgroundColor: "#307FE2",
  },
  botBubble: {
    backgroundColor: "#E5E7EB",
  },
});

export default memo(ChatBubble);
