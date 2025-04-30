import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomButton from './CustomButton';
import ChatBubble from './ChatBubble';
import { router } from 'expo-router';
import Markdown from "react-native-markdown-display";


// Define types for detail content
interface Detail {
    type: "question" | "advice" | "insight";
    content: string;
}

/**
 * DetailView Component
 * Displays additional insights, advice, or chatbot-suggested questions for a metric.
 *
 * @param {Object} detail - Contains details to be displayed.
 * @param {string} detail.type - Type of detail (`"question"` or `"insight"`).
 * @param {string} detail.content - The content of the detail (text or chatbot question).
 */
const DetailView: React.FC<{ detail: Detail }> = ({ detail }) => {
    const handleNavigateToChat = () => {
        const encodedContent = encodeURIComponent(detail.content);
        router.push(`../chat/chat?question=${encodedContent}`);
    };

    return (
        <View style={styles.container}>
            {detail.type === "question" ? (
                <View style={styles.centered}>
                    <Text style={styles.title}>Suggested Question</Text>
                    <ChatBubble message={detail.content} isUser={false} maxWidth={100} />
                    <CustomButton
                        title="Check it out!"
                        onPress={handleNavigateToChat}
                        className="mt-2 w-3/4"
                    />
                </View>
            ) : (
                <View>
                    <Text style={styles.title}>{detail.type.charAt(0).toUpperCase() + detail.type.slice(1)}</Text>
                    <View style={styles.contentContainer}>
                        <Markdown style={{body: styles.contentText}}>{detail.content}</Markdown>
                    </View>
                </View>
            )}
        </View>
    );
};

// Styles for better performance
const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    centered: {
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    contentContainer: {
        alignItems: "center",
        paddingHorizontal: 16,
    },
    contentText: {
        fontSize: 16,
        color: "#307FE2",
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default DetailView;
