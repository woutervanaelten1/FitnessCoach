import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import CustomHeader from './CustomHeader';
import CustomButton from './CustomButton';

/**
 * LoadingErrorView Component
 * A reusable component to handle loading and error states in the app.
 * 
 * @param {boolean} isLoading - Determines if data is still loading.
 * @param {boolean} hasError - Indicates if an error occurred during data fetching.
 * @param {() => void} onRetry - Function to retry loading the data.
 * @param {string} loadingText - Customizable text displayed while loading.
 * @param {string} errorText - Customizable error message when data fails to load.
 * @param {string} headerTitle - Title displayed in the CustomHeader.
 */
const LoadingErrorView = ({
  isLoading,
  hasError,
  onRetry,
  loadingText = "Loading...",
  errorText = "Failed to load. Do you want to try again?",
  headerTitle = "Fitness Coach"
}: {
  isLoading: boolean,
  hasError: boolean,
  onRetry: () => void,
  loadingText: string,
  errorText: string,
  headerTitle: string
}) => {
  // Show loading state
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

  // Show error state with retry button
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

  // Return nothing if no error and not loading
  return null;
};

export default LoadingErrorView;
