import { Image, ImageSourcePropType, Text, View } from "react-native";


const IconTextBox = ({ icon, topText, bottomText } : {icon:ImageSourcePropType; topText:string, bottomText:string}) => {
    return (
        <View className="flex-1 items-center bg-gray-100 rounded-lg p-4 mx-1">
            <Image source={icon} tintColor="#307FE2" resizeMode="contain" className="w-10 h-10" />
            <Text className="text-black font-semibold text-lg mt-1">{topText}</Text>
            <Text className="text-black font-semibold text-lg ">{bottomText}</Text>
        </View>
    )
}

export default IconTextBox;