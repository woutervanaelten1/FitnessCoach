import { Image, ImageSourcePropType, Text, View } from "react-native";

/**
 * IconTextBox Component
 * Displays an icon with two lines of text below it.
 *
 * @param {ImageSourcePropType} icon - The image source for the icon.
 * @param {string} topText - The first line of text below the icon.
 * @param {string} bottomText - The second line of text below the icon.
 */
const IconTextBox = ({ icon, topText, bottomText } : {icon:ImageSourcePropType; topText:string, bottomText:string}) => {
    return (
        <View className="flex-1 items-center bg-gray-100 rounded-lg p-4 mx-1">
            {/* Icon */}
            <Image source={icon} tintColor="#307FE2" resizeMode="contain" className="w-10 h-10" />
            {/* Top Text */}
            <Text className="text-black font-semibold text-lg mt-1">{topText}</Text>
            {/* Bottom Text */}
            <Text className="text-black font-semibold text-lg ">{bottomText}</Text>
        </View>
    )
}

export default IconTextBox;