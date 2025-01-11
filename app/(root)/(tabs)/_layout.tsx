import { Tabs, usePathname } from "expo-router";
import { View, Image, ImageSourcePropType, SafeAreaView } from "react-native";
import { icons } from "@/constants";

const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
    <View className="flex items-center justify-center">
        <Image
            source={source}
            tintColor={focused ? "#307FE2" : "#D3D3D3"}
            resizeMode="contain"
            className="w-12 h-12"
        />
    </View>
);

const Layout = () => {
    const pathname = usePathname();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <View style={{ flex: 1 }}>
                <Tabs initialRouteName="home"
                    screenOptions={{
                        tabBarShowLabel: false,
                        tabBarStyle: {
                            backgroundColor: "white",
                            overflow: "hidden",
                            height: 78,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexDirection: "row",
                            marginBottom: -25,
                        },
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
                            tabBarIcon: ({ focused }) => {
                                const isActive = pathname.startsWith("/dashboard");
                                return <TabIcon focused={isActive} source={icons.graph} />;
                            },
                        }}
                    />
                    <Tabs.Screen
                        name="chat/index"
                        options={{
                            title: "Coach",
                            headerShown: false,
                            tabBarIcon: ({ focused }) => {
                                const isActive = pathname.startsWith("/chat");
                                return <TabIcon focused={isActive} source={icons.chat} />;
                            },
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
                            tabBarIcon: ({ focused }) => {
                                const isActive = pathname.startsWith("/profile");
                                return <TabIcon focused={isActive} source={icons.profile} />;
                            },
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
                            title: "Edit Targets",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="chat/chat"
                        options={{
                            title: "New Chat",
                            headerShown: false,
                            tabBarStyle: { display: "none" },
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="chat/conversationDetail/[conversationId]"
                        options={{
                            title: "Earlier conversation",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="dashboard/activeDetail"
                        options={{
                            title: "Activity Overview",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="dashboard/calorieDetail"
                        options={{
                            title: "Calories Overview",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="dashboard/sleepDetail"
                        options={{
                            title: "Sleep Overview",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="dashboard/stepDetail"
                        options={{
                            title: "Steps Overview",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="dashboard/weightDetail"
                        options={{
                            title: "Weight Overview",
                            headerShown: false,
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="dashboard/dailyStep"
                        options={{
                            title: "Hourly Steps",
                            headerShown: false,
                            href: null,
                        }}
                    />


                </Tabs>
            </View>
        </SafeAreaView>
    );
};

export default Layout;