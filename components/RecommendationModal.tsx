import { Modal, View, Text} from "react-native";
import CustomButton from "./CustomButton";

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
                    <Text className="text-xl text-blue-600 font-bold mb-3">{recommendation}</Text>
                    <Text className="text-base font-bold mb-2 text-gray-600"><Text className="text-lg font-bold text-blue-500">Reason: </Text>{reason}</Text>
                    <Text className="text-base font-bold mb-2 text-gray-600"><Text className="text-lg font-bold text-blue-500">Benefit: </Text>{benefit}</Text>
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
