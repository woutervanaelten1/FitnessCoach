import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { icons } from "@/constants";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  return (
    <View className="flex-1 px-4 bg-white">
      <CustomHeader
        title="Profile"
        showBackButton={false}
        rightButton={
          <TouchableOpacity >
            <Image
              source={icons.settings}
              className="w-5 h-5"
              style={{
                tintColor: "#3b82f6",
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

      <View className="items-center mt-6">
        <View className="w-24 h-24 rounded-full bg-black items-center justify-center">
          <Text className="text-blue-500 text-6xl">
            <Image source={icons.smile} tintColor="yellow" resizeMode="contain" />
          </Text>
        </View>
        <View className="flex-row items-center mt-3">
          <Text className="text-blue-500 text-xl font-bold">Wouter Vanaelten</Text>
          <Image
            source={icons.male}
            className="w-5 h-5 ml-2"
            style={{
              tintColor: "#3b82f6",
            }}
            resizeMode="contain"
          />
        </View>
      </View>

      <View className="flex-row justify-between mt-6 bg-gray-100 rounded-lg p-4">
        <View className="items-center">
          <Text className="text-black text-xl font-bold">85,9 kg</Text>
          <Text className="text-blue-500 text-base font-bold">Weight</Text>
        </View>
        <View className="items-center">
          <Text className="text-black text-xl font-bold">25</Text>
          <Text className="text-blue-500 text-base font-bold">Age</Text>
        </View>
        <View className="items-center">
          <Text className="text-black text-xl font-bold">185 cm</Text>
          <Text className="text-blue-500 text-base font-bold">Height</Text>
        </View>
      </View>

      <View>
        <CustomButton title="Edit information" className="mt-3" />
      </View>
    </View>
  );
};

export default Profile;