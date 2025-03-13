import React, { memo } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { icons } from "@/constants";
import { useRouter } from "expo-router";

/**
 * CustomHeader Component
 * A reusable header with a back button and optional right button.
 *
 * @param {string} title - The title displayed in the center.
 * @param {boolean} showBackButton - Whether to show the back button.
 * @param {React.ReactNode} rightButton - An optional right-side button.
 */
const CustomHeader: React.FC<{ title: string; showBackButton?: boolean; rightButton?: React.ReactNode }> = ({
  title,
  showBackButton = true,
  rightButton = null,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {showBackButton ? (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Go back">
          <Image source={icons.backArrow} resizeMode="contain" style={styles.backIcon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Title */}
      <Text style={[styles.title, rightButton ? styles.withRightButton : {}]}>
        {title.trim() || ""}
      </Text>

      {/* Right Button (Optional) */}
      {rightButton ? <View>{rightButton}</View> : <View style={styles.placeholder} />}
    </View>
  );
};

// Styles for better performance and maintainability
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: "#307FE2",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    color: "#307FE2",
    flex: 1,
  },
  withRightButton: {
    marginLeft: 48,
  },
  placeholder: {
    width: 32,
  },
});

// Optimize with React.memo to prevent unnecessary re-renders
export default memo(CustomHeader);
