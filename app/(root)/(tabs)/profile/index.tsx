import { useProfile } from "@/app/context/ProfileContext";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import config from "@/config";
import { icons } from "@/constants";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";

/**
 * Profile screen displaying user details and allowing profile switching.
 *
 * @returns {JSX.Element} The Profile screen component.
 */
const Profile = () => {
  const { activeProfile, setActiveProfile, userId } = useProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Handles switching between different user profiles.
   *
   * @param {keyof typeof config.PROFILES} userKey - The key of the selected user profile.
   */
  const handleSwitchUser = (userKey: keyof typeof config.PROFILES) => {
    setActiveProfile(userKey);
    setModalVisible(false);
  };

  /**
  * Fetches the user's weight data, goal weight, and historical weight logs.
  */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const todayResponse = await fetch(
        `${config.API_BASE_URL}/data/daily_data/by-date?date=${config.FIXED_DATE}&user_id=${userId}`
      );

      if (!todayResponse.ok) {
        throw new Error("Failed to fetch current weight data");
      }

      const todayDataArray = await todayResponse.json();

      // Set current weight if data is available
      if (todayDataArray.length > 0) {
        setCurrentWeight(todayDataArray[0].weightkg);
      }

    } catch (error) {
      console.error("Error fetching current weight:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current weight when userId changes
  useEffect(() => {
    fetchData();
  }, [userId]);

  return (
    <View className="flex-1 px-4 bg-white">
      {/* Header Section */}
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

      {/* Profile Info Section */}
      <View className="items-center mt-6">
        <View className="w-24 h-24 rounded-full bg-black items-center justify-center">
          <Text className="text-blue-500 text-6xl">
            <Image source={icons.smile} tintColor="yellow" resizeMode="contain" />
          </Text>
        </View>
        <View className="flex-row items-center mt-3">
          <Text className="text-blue-500 text-xl font-bold">{config.PROFILES[activeProfile].username}</Text>
          <Image
            source={icons.female}
            className="w-5 h-5 ml-2"
            style={{
              tintColor: "#3b82f6",
            }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* User Details Section */}
      <View className="flex-row justify-between mt-6 bg-gray-100 rounded-lg p-4">
        <View className="items-center">
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#307FE2" />
              <Text className="text-gray-500 mt-2 text-center">Loading weight...</Text>
            </>
          ) : hasError ? (
            <View className="p-4 rounded-lg flex items-center">
              <Text className="text-blue-500 text-base mb-2 font-bold">Failed to load weight.</Text>
              <CustomButton title="Retry" onPress={fetchData} className="w-1/2" />
            </View>
          ) : (
            <>
              <Text className="text-black text-xl font-bold">{currentWeight?.toFixed(1)} kg</Text>
              <Text className="text-blue-500 text-base font-bold">Weight</Text>
            </>
          )}
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

      {/* Action Buttons */}
      <View>
        <CustomButton title="Edit information" className="mt-3" />
        <CustomButton title="Switch User" className="mt-3" onPress={() => setModalVisible(true)} />
      </View>


      {/* User Switch Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View className="bg-white p-4 rounded-lg w-3/4">
            <Text className="text-lg font-bold mb-3">Select a User:</Text>
            <FlatList
              data={Object.entries(config.PROFILES)}
              keyExtractor={([key]) => key}
              renderItem={({ item: [key, profile] }) => (
                <TouchableOpacity
                  className="p-3 bg-gray-100 my-1 rounded-lg"
                  onPress={() => handleSwitchUser(key as keyof typeof config.PROFILES)}
                >
                  <Text className="text-center text-blue-500">{profile.username}</Text>
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