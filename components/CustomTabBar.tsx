import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import { useSegments, useRouter } from "expo-router";
import { icons } from "@/constants";

const tabs: { name: "home" | "dashboard" | "chat" | "progress" | "profile"; icon: any; label: string }[] = [
  { name: "home", icon: icons.home, label: "Home" },
  { name: "dashboard", icon: icons.graph, label: "Dashboard" },
  { name: "chat", icon: icons.chat, label: "Coach" },
  { name: "progress", icon: icons.target, label: "Progress" },
  { name: "profile", icon: icons.profile, label: "Profile" },
];

const CustomTabBar = () => {
  const segments = useSegments() as string[]; 
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        height: 78,
        backgroundColor: "white",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: -20,
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = segments.includes(tab.name); // Compare tab name with segments

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(`/${tab.name}`)}
            style={{ alignItems: "center" }}
          >
            <Image
              source={tab.icon}
              tintColor={isActive ? "#307FE2" : "#D3D3D3"}
              resizeMode="contain"
              className="w-9 h-9"
            />
            <Text style={{ color: isActive ? "#307FE2" : "#D3D3D3" }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
