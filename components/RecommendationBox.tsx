import { icons } from "@/constants";
import { logClick } from "@/utils/clickLogger";
import { TouchableOpacity } from "react-native";
import { Image, Text, View } from "react-native";

/**
 * Recommendation Interface
 * Defines the structure of a recommendation item.
 */
interface Recommendation {
    recommendation: string;
    reason: string;
    benefit: string;
    based_on: string;
    metric: string;
}

/**
 * RecommendationBox Component
 * Displays a recommendation with an associated metric icon.
 * Allows users to tap on the box to see more details.
 *
 * @param {string} recommendation - The recommendation text.
 * @param {string} metric - The category of the recommendation (e.g., "steps", "calories").
 * @param {function} onOpenModal - Callback function to open the recommendation details modal.
 */

const RecommendationBox = ({ recommendation, metric, onOpenModal }: { recommendation: string; metric: string; onOpenModal: (rec: Recommendation) => void }) => {
    /**
     * Mapping of metric types to corresponding icons.
     */
    const metricIcons: { [key: string]: any } = {
        activity: icons.bolt,
        sedentary: icons.sit,
        sleep: icons.sleeping,
        calories: icons.fire,
        steps: icons.walking,
        general: icons.heart,
    };

    // Default to a general heart icon if metric is not recognized or failed to generate by LLM
    const icon = metricIcons[metric] || icons.heart;

    return (
        <TouchableOpacity onPress={() => {
            logClick("click", `Recommendationbox [metric: ${metric}, recommendation: ${recommendation}]`);
            onOpenModal({ recommendation, metric, reason: "", benefit: "", based_on: "" });
        }}>
            <View className="flex-row items-center bg-gray-100 p-4 rounded-lg my-1">
                {/* Display relevant icon for the metric */}
                <Image source={icon} tintColor="#307FE2" className="w-10 h-10" />

                {/* Display recommendation text */}
                <View className="flex-1 ml-4">
                    <Text className="text-base font-bold text-blue-500">{recommendation}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default RecommendationBox;