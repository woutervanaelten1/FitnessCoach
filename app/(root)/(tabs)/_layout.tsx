import { Tabs } from "expo-router";
import { View, Image, ImageSourcePropType } from "react-native";
import { icons } from "@/constants";

const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
    <View className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-general-300" : ""}`}>
        <View className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-white" : ""}`}>
            <Image source={source} tintColor={focused ? "#307FE2" : "#D3D3D3"} resizeMode="contain" className="w-10 h-10" />
        </View>
    </View>
);

const Layout = () => {
    return (
        <Tabs initialRouteName="index"
            screenOptions={{
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "white",
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    borderRadius: 20,
                    paddingBottom: 0,
                    overflow: "hidden",
                    marginBottom: 20,
                    marginHorizontal: 5,
                    height: 78,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    position: "absolute",
                }
            }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.home} />
                    ),
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.graph} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Coach",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.chat} />
                    ),
                }}
            />
            <Tabs.Screen
                name="targets"
                options={{
                    title: "Targets & Progress",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.target} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.profile} />
                    ),
                }}
            />


        </Tabs>
    );
};

export default Layout;