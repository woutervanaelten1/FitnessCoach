import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { icons } from "@/constants";
import { logClick } from "@/utils/clickLogger";

/**
 * Props for the DatePicker component.
 * @property selectedDate - The currently selected date.
 * @property setSelectedDate - Function to update the selected date.
 */
interface DatePickerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

/**
 * DatePicker Component
 * Allows users to view and select a specific date.
 * Includes previous/next buttons and an inline date picker modal.
 */
const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, setSelectedDate }) => {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);

  /**
   * Changes the selected date by the given number of days.
   *
   * @param {number} days - The number of days to add or subtract.
   */
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <View className="flex-row justify-between items-center mt-4">
      {/* Previous Date Button */}
      <TouchableOpacity className="bg-gray-200 rounded-full p-2" onPress={() => {
        const fromDate = selectedDate.toISOString().split("T")[0];
        const toDate = new Date(selectedDate);
        toDate.setDate(toDate.getDate() - 1);
        const toDateStr = toDate.toISOString().split("T")[0];

        logClick("click", `Previous date [${fromDate} -> ${toDateStr}]`);
        changeDate(-1);
      }}>
        <Image source={icons.backArrow} resizeMode="contain" className="w-7 h-7" />
      </TouchableOpacity>

      {/* Date Selection Button */}
      <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-lg" onPress={() => {
        logClick("click", `Choose date [current: ${selectedDate.toISOString().split("T")[0]}]`);
        setDatePickerOpen(true);
      }}>
        <Text className="text-white font-bold">{selectedDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {/* Next Date Button */}
      <TouchableOpacity className="bg-gray-200 rounded-full p-2" onPress={() => {
        const fromDate = selectedDate.toISOString().split("T")[0];
        const toDate = new Date(selectedDate);
        toDate.setDate(toDate.getDate() + 1);
        const toDateStr = toDate.toISOString().split("T")[0];

        logClick("click", `Next date [${fromDate} -> ${toDateStr}]`);
        changeDate(1);
      }}>
        <Image source={icons.forward} resizeMode="contain" className="w-7 h-7" />
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {isDatePickerOpen && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setDatePickerOpen(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </View>
  );
};

export default DatePicker;
