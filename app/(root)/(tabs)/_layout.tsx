import { Tabs, usePathname } from "expo-router";
import { View, Image, ImageSourcePropType, SafeAreaView } from "react-native";
import { icons } from "@/constants";
import { useEffect, useRef } from "react";
import { logClick } from "@/utils/clickLogger";

/**
 * Tab icon component for the bottom navigation.
 * 
 * @param {object} props - Component props
 * @param {ImageSourcePropType} props.source - Icon source
 * @param {boolean} props.focused - Whether the tab is active
 * @param {string} props.title - Title of the tab
 * @returns {JSX.Element} - Tab icon component
 */
const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Image
            source={source}
            tintColor={focused ? "#307FE2" : "#D3D3D3"}
            resizeMode="contain"
            className="w-9 h-9 mt-3"
        />
    </View>
);

const Layout = () => {
    const pathname = usePathname();
    const lastScreen = useRef<string | null>(null);
    const startTime = useRef<number | null>(null);
  
    useEffect(() => {
      const now = Date.now();
  
      if (lastScreen.current && startTime.current) {
        const timeSpent = now - startTime.current;
        
        logClick(
          "screen_time",
          `From ${lastScreen.current} ==> ${pathname} (${timeSpent}ms)`
        );
        
      }
  
      // Update the current screen and start time
      lastScreen.current = pathname;
      startTime.current = now;
    }, [pathname]);

    /**
     * Determines if a tab should be highlighted based on the current path.
     * @param {string} tabPath - The base path of the tab
     * @returns {boolean} - Whether the tab is active
     */
    const isTabActive = (tabPath: string): boolean => pathname.startsWith(tabPath);
    
    return (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            <Tabs
              initialRouteName="home"
              screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                  flexDirection: "row",
                  height: 78,
                  backgroundColor: "white",
                  justifyContent: "space-around",
                  alignItems: "center",
                },
              }}
            >
              {/* Home Tab */}
              <Tabs.Screen
                name="home"
                options={{
                  title: "Home",
                  href: "/home",
                  headerShown: false,
                  tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.home} />,
                }}
              />
    
              {/* Dashboard Tab */}
              <Tabs.Screen
                name="dashboard"
                options={{
                  title: "Dashboard",
                  href: "/dashboard",
                  headerShown: false,
                  tabBarIcon: () => <TabIcon focused={isTabActive("/dashboard")} source={icons.graph} />,
                }}
              />
    
              {/* Chat Tab */}
              <Tabs.Screen
                name="chat"
                options={{
                  title: "Coach",
                  href: "/chat",
                  headerShown: false,
                  tabBarIcon: () => <TabIcon focused={isTabActive("/chat")} source={icons.chat} />,
                }}
              />
    
              {/* Progress Tab */}
              <Tabs.Screen
                name="progress"
                options={{
                  title: "Targets & Progress",
                  href: "/progress",
                  headerShown: false,
                  tabBarIcon: () => <TabIcon focused={isTabActive("/progress")} source={icons.target} />,
                }}
              />
    
              {/* Profile Tab */}
              <Tabs.Screen
                name="profile"
                options={{
                  title: "Profile",
                  href: "/profile",
                  headerShown: false,
                  tabBarIcon: () => <TabIcon focused={isTabActive("/profile")} source={icons.profile} />,
                }}
              />
    
              {/* Hidden Route Example */}
              <Tabs.Screen
                name="_layout_NEW"
                options={{
                  title: "Edit Targets",
                  headerShown: false,
                  href: null, // Prevents this route from appearing in the tab bar
                }}
              />
            </Tabs>
          </View>
        </SafeAreaView>
      );
    };

export default Layout;