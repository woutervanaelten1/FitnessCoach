import { Text, View } from "react-native";


const ProgressBox = ({ value, target, metric, progressBar, weeklyAverage }: { value?: number; target: number, metric: string, progressBar: boolean; weeklyAverage: number }) => {
    const progressValue = value ?? 0;
    const progress = Math.min(progressValue / target, 1);

    const getBarColorClass = () => {
        if (progress <= 0.25) return 'bg-red-500';
        if (progress <= 0.5) return 'bg-orange-500';
        if (progress <= 0.75) return 'bg-blue-500';
        if (progress < 1) return 'bg-purple-500';
        return 'bg-green-500';
    };

    return (
        <View className="bg-gray-100 p-4 rounded-lg my-2">
            <Text className="text-xl font-bold text-black">
                {value !== undefined ? `${value}/${target}` : `${target}`} {metric}
            </Text>

            {progressBar && (
                <View className="w-4/5 h-2 bg-gray-200 rounded-full mt-2">
                    <View
                        style={{ width: progress > 0 ? `${progress * 100}%` : '2%' }}
                        className={`h-full rounded-full ${getBarColorClass()}`}
                    />
                </View>
            )}

            <Text className="text-base text-blue-500 mt-1">
                Last 7 day average: {weeklyAverage} {metric.toLowerCase()}
            </Text>
        </View>
    )
}

export default ProgressBox;