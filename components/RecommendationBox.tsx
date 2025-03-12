import { icons } from "@/constants";
import { TouchableOpacity } from "react-native";
import { Image, Text, View } from "react-native";

interface Recommendation {
    recommendation: string;
    reason: string;
    benefit: string;
    based_on: string;
    metric: string;
}


const RecommendationBox = ({ recommendation, metric, onOpenModal }: { recommendation: string; metric: string; onOpenModal: (rec: Recommendation) => void }) => {
    const metricIcons: { [key: string]: any } = {
        activity: icons.bolt,
        sedentary: icons.sit,
        sleep: icons.sleeping,
        calories: icons.fire,
        steps: icons.walking,
        general: icons.heart,
    };

    const icon = metricIcons[metric] || icons.heart;

    return (
        <TouchableOpacity onPress={() => onOpenModal({ recommendation, metric, reason: "", benefit: "", based_on: "" })}>
            <View className="flex-row items-center bg-gray-100 p-4 rounded-lg my-1">
                <Image source={icon} tintColor="#307FE2" className="w-10 h-10" />
                <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-blue-500">{recommendation}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default RecommendationBox;