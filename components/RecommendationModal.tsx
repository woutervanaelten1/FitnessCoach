import { Modal, View, Text } from "react-native";
import CustomButton from "./CustomButton";

/**
 * RecommendationModal Component
 * Displays a detailed explanation of a fitness recommendation.
 * Allows users to either close the modal or ask the chatbot for further insights.
 *
 * @param {boolean} isVisible - Controls the visibility of the modal.
 * @param {string} recommendation - The recommendation text.
 * @param {string} metric - The category of the recommendation (e.g., "steps", "calories").
 * @param {string} reason - The reason why this recommendation is suggested.
 * @param {string} benefit - The expected benefit of following the recommendation.
 * @param {function} onClose - Function to close the modal.
 * @param {function} onAskChatbot - Function to navigate to the chatbot with a related question.
 */
const RecommendationModal = ({ isVisible, onClose, recommendation, reason, benefit, metric, onAskChatbot }: {
    isVisible: boolean;
    recommendation?: string;
    metric?: string;
    reason?: string;
    benefit?: string;
    onClose: () => void;
    onAskChatbot: () => void;
}) => {

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <View className="bg-white rounded-lg w-11/12 p-5">
                    {/* Recommendation Title */}
                    <Text className="text-xl text-blue-600 font-bold mb-3">{recommendation}</Text>

                    {/* Reason for the Recommendation */}
                    <Text className="text-base font-bold mb-2 text-gray-600"><Text className="text-lg font-bold text-blue-500">Reason: </Text>{reason}</Text>

                    {/* Benefit of the Recommendation */}
                    <Text className="text-base font-bold mb-2 text-gray-600"><Text className="text-lg font-bold text-blue-500">Benefit: </Text>{benefit}</Text>

                    {/* Buttons: Close or Ask Chatbot */}
                    <View className="flex-row justify-between mt-4">
                        <CustomButton
                            title="Close"
                            onPress={onClose}
                            className="w-1/2  bg-red-500"
                        />
                        <CustomButton
                            title="Ask chatbot"
                            onPress={onAskChatbot}
                            className="w-1/2 px-4 ml-1"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
};

export default RecommendationModal;
