import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import CustomHeader from './CustomHeader';
import CustomButton from './CustomButton';
import DatePicker from './DatePicker';

/**
 * LoadingErrorView Component
 * A reusable component to handle loading and error states in the app.
 * 
 * @param {boolean} isLoading - Determines if data is currently loading.
 * @param {boolean} hasError - Indicates whether an error occurred during data fetching.
 * @param {() => void} onRetry - Callback function to retry loading data.
 * @param {string} loadingText - Text displayed while loading. Defaults to "Loading...".
 * @param {string} errorText - Text displayed on error. Defaults to "Failed to load. Do you want to try again?".
 * @param {string} headerTitle - Title shown in the header. Defaults to "Fitness Coach".
 * @param {Date} [selectedDate] - Optional date value to display a DatePicker during error state.
 * @param {(date: Date) => void} [setSelectedDate] - Optional callback to update selectedDate.
 */
const LoadingErrorView = ({
  isLoading,
  hasError,
  onRetry,
  loadingText = "Loading...",
  errorText = "Failed to load. Do you want to try again?",
  headerTitle = "Fitness Coach",
  selectedDate,
  setSelectedDate,
}: {
  isLoading: boolean,
  hasError: boolean,
  onRetry: () => void,
  loadingText: string,
  errorText: string,
  headerTitle: string,
  selectedDate?: Date,
  setSelectedDate?: (date: Date) => void,
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
        {selectedDate && setSelectedDate && (
          <View className='justify-center px-4'>
            <DatePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </View>
        )}
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
