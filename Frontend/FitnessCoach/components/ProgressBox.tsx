import { Text, View } from "react-native";

/**
 * ProgressBox Component
 * Displays progress towards a target value with an optional progress bar.
 *
 * @param {number} [value] - The current progress value (optional).
 * @param {number} target - The goal or target value.
 * @param {string} metric - The name of the metric (e.g., "Steps", "Calories").
 * @param {boolean} progressBar - Whether to display a visual progress bar.
 * @param {number} weeklyAverage - The average value over the past 7 days.
 */
const ProgressBox = ({ value, target, metric, progressBar, weeklyAverage }: { value?: number; target: number, metric: string, progressBar: boolean; weeklyAverage: number }) => {
    // Default to 0 if value is undefined
    const progressValue = value ?? 0;
    // Ensure progress is within 0-100%
    const progress = Math.min(progressValue / target, 1);

    /**
     * Determines the color of the progress bar based on completion percentage.
     * 
     * - **Red (0-25%)**: Minimal progress
     * - **Orange (26-50%)**: Some progress
     * - **Blue (51-75%)**: Good progress
     * - **Purple (76-99%)**: Almost complete
     * - **Green (100%)**: Goal achieved
     */
    const getBarColorClass = () => {
        if (progress <= 0.25) return 'bg-red-500';
        if (progress <= 0.5) return 'bg-orange-500';
        if (progress <= 0.75) return 'bg-blue-500';
        if (progress < 1) return 'bg-purple-500';
        return 'bg-green-500';
    };

    return (
        <View className="bg-gray-100 p-4 rounded-lg my-2">
            {/* Display the current progress out of the target */}
            <Text className="text-xl font-bold text-black">
                {value !== undefined ? `${value}/${target}` : `${target}`} {metric}
            </Text>

            {/* Render progress bar if enabled */}
            {progressBar && (
                <View className="w-4/5 h-2 bg-gray-200 rounded-full mt-2">
                    <View
                        style={{ width: progress > 0 ? `${progress * 100}%` : '2%' }}
                        className={`h-full rounded-full ${getBarColorClass()}`}
                    />
                </View>
            )}

            {/* Display weekly average for comparison */}
            <Text className="text-base font-bold text-blue-500 mt-1">
                Last 7 day average: {weeklyAverage} {metric.toLowerCase()}
            </Text>
        </View>
    )
}

export default ProgressBox;