import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import CustomHeader from './CustomHeader';
import CustomButton from './CustomButton';

const LoadingErrorView = ({ 
  isLoading, 
  hasError, 
  onRetry, 
  loadingText = "Loading...", 
  errorText = "Failed to load. Do you want to try again?", 
  headerTitle = "Fitness Coach" 
} : {
    isLoading: boolean,
    hasError: boolean, 
    onRetry: () => void , 
    loadingText: string, 
    errorText: string, 
    headerTitle: string
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader title={headerTitle} showBackButton={false} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#307FE2" />
          <Text className="text-base text-gray-500 mt-2">{loadingText}</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader title={headerTitle} showBackButton={false} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-lg font-bold mb-4">{errorText}</Text>
          <CustomButton title="Retry" onPress={onRetry} className="py-3 px-6 w-1/2" />
        </View>
      </View>
    );
  }

  return null;
};

export default LoadingErrorView;
