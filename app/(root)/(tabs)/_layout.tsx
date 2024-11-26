import { Tabs, usePathname } from "expo-router";
import { View, Image, ImageSourcePropType } from "react-native";
import { icons } from "@/constants";

const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
    <View className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-white" : "bg-white"}`}>
        <View className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-white" : ""}`}>
            <Image source={source} tintColor={focused ? "#307FE2" : "#D3D3D3"} resizeMode="contain" className="w-12 h-12" />
        </View>
    </View>
);

const Layout = () => {
    const pathname = usePathname();

    return (
        <Tabs initialRouteName="home"
            screenOptions={{
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "white",
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    borderRadius: 20,
                    paddingBottom: 20,
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
                name="dashboard/index"
                options={{
                    title: "Dashboard",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.graph} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat/index"
                options={{
                    title: "Coach",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.chat} />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress/index"
                options={{
                    title: "Targets & Progress",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => {
                        const isActive = pathname.startsWith("/progress");
                        return <TabIcon focused={isActive} source={icons.target} />;
                    },
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

            {/* HIDE THESE ROUTES FROM THE NAVIGATION BAR */}
            <Tabs.Screen
                name="progress/editTargets"
                options={{
                    title: "Edit Targets",
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="chat/earlierChats"
                options={{
                    href: null,
                }}
            />


        </Tabs>
    );
};

export default Layout;