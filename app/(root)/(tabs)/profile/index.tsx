import { useProfile } from "@/app/context/ProfileContext";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { icons } from "@/constants";
import { useState } from "react";
import { FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const { activeProfile, userId, setActiveProfile } = useProfile();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSwitchUser = (userKey: keyof typeof config.PROFILES) => {
    setActiveProfile(userKey);
    setModalVisible(false);
  };

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
          <Text className="text-blue-500 text-xl font-bold">{config.PROFILES[activeProfile].username}</Text>
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
          <Text className="text-black text-xl font-bold">{config.PROFILES[activeProfile].age}</Text>
          <Text className="text-blue-500 text-base font-bold">Age</Text>
        </View>
        <View className="items-center">
          <Text className="text-black text-xl font-bold">{config.PROFILES[activeProfile].height} m</Text>
          <Text className="text-blue-500 text-base font-bold">Height</Text>
        </View>
      </View>

      <View>
        <CustomButton title="Edit information" className="mt-3" />
      </View>

      {/* Switch User Button */}
      <CustomButton title="Switch User" className="mt-3" onPress={() => setModalVisible(true)} />

      {/* User Switch Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View className="bg-white p-4 rounded-lg w-3/4">
            <Text className="text-lg font-bold mb-3">Select a User:</Text>
            <FlatList
              data={Object.keys(config.PROFILES)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-3 bg-gray-100 my-1 rounded-lg"
                  onPress={() => handleSwitchUser(item as keyof typeof config.PROFILES)}
                >
                  <Text className="text-center text-blue-500">{item}</Text>
                </TouchableOpacity>
              )}
            />
            <CustomButton title="Close" className="mt-3" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;