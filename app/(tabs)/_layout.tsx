// import { Tabs } from "expo-router";
// import React from "react";
// import { View, Text } from "react-native";
// import { useColorScheme } from "@/hooks/useColorScheme";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { BlurView } from "expo-blur";
// import { Platform } from "react-native";

// // Custom tab bar component for the special design shown in the image
// const TabBarBackground = () => {
//   return (
//     <View
//       style={{
//         position: "absolute",
//         bottom: 20,
//         width: "60%",
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: "#FFFFFF",
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 10,
//         overflow: "hidden",
//         alignSelf: "center",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       {Platform.OS === "ios" && (
//         <BlurView
//           intensity={80}
//           style={{
//             position: "absolute",
//             height: "100%",
//             width: "100%",
//           }}
//         />
//       )}
//     </View>
//   );
// };

// type TabIconProps = { color: string; focused: boolean };

// const HomeTab = ({ color, focused }: TabIconProps) => (
//   <View
//     style={{
//       width: 40,
//       height: 40,
//       borderRadius: 12,
//       backgroundColor: "#00C851",
//       alignItems: "center",
//       justifyContent: "center",
//       borderTopWidth: focused ? 4 : 0,
//       borderTopColor: focused ? "#00C851" : "transparent",
//       bottom: 7,
//     }}
//   >
//     <Ionicons name="home" size={24} color="white" />
//   </View>
// );

// const TextTab = ({ color, focused }: TabIconProps) => (
//   <View
//     style={{
//       width: 40,
//       height: 40,
//       borderRadius: 12,
//       backgroundColor: "#FF3B30",
//       alignItems: "center",
//       justifyContent: "center",
//       borderTopWidth: focused ? 3 : 0,
//       borderTopColor: focused ? "#FF3B30" : "transparent",
//       bottom: 7,
//     }}
//   >
//     <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Aa</Text>
//   </View>
// );
// // Custom profile tab
// const ProfileTab = ({ color, focused }: TabIconProps) => (
//   <View
//     style={{
//       width: 40,
//       height: 40,
//       borderRadius: 12,
//       backgroundColor: "#FF3B30",
//       alignItems: "center",
//       justifyContent: "center",
//       borderTopWidth: focused ? 3 : 0,
//       borderTopColor: focused ? "#FF3B30" : "transparent",
//       bottom: 7,
//     }}
//   >
//     <Ionicons name="person" size={22} color="white" />
//   </View>
// );

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
//         headerShown: false,
//         tabBarBackground: TabBarBackground,
//         tabBarStyle: {
//           position: "absolute",
//           backgroundColor: "transparent",
//           borderTopWidth: 0,
//           height: 64,
//           bottom: 20,
//           width: "100%", // same as TabBarBackground width
//           alignSelf: "center", // center horizontally
//           elevation: 0,
//           flexDirection: "row",
//           justifyContent:"center", // space tabs evenly inside
//           paddingHorizontal: 100,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "",
//           tabBarIcon: ({ color, focused }) => (
//             <HomeTab color={color} focused={focused} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="wordScreen"
//         options={{
//           title: "",
//           tabBarStyle: { display: "none" },
//           tabBarIcon: ({ color, focused }) => (
//             <TextTab color={color} focused={focused} />
//           ),
//         }}
//       />

//       {/* SCREEN NAME COMMENT: Use "profile" or "account" for your profile screen file */}
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "",
//           tabBarStyle: { display: "none" },
//           tabBarIcon: ({ color,focused }) => <ProfileTab color={color} focused={focused} />,
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

// Custom tab bar component for the new design
const TabBarBackground = () => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 70,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
      }}
    >
      {Platform.OS === "ios" && (
        <BlurView
          intensity={80}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
          }}
        />
      )}
    </View>
  );
};

type TabIconProps = { 
  color: string; 
  focused: boolean; 
  iconName: keyof typeof Ionicons.glyphMap;
  iconNameFocused: keyof typeof Ionicons.glyphMap;
  label: string;
};

const CustomTab = ({ color, focused, iconName, iconNameFocused, label }: TabIconProps) => (
  <View style={{ alignItems: "center", justifyContent: "center", minWidth: 60 }}>
    <View
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 1,
      }}
    >
      <Ionicons 
        name={focused ? iconNameFocused : iconName} 
        size={24} 
        color={focused ? "#4A90E2" : "#8E8E93"} 
      />
    </View>
    <Text
      style={{
        fontSize: 11,
        color: focused ? "#4A90E2" : "#8E8E93",
        fontWeight: focused ? "600" : "400",
        textAlign: "center",
        fontFamily: "lexend", // Ensure this font is loaded in your app
      }}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 70,
          bottom: 0,
          width: "100%",
          elevation: 0,
          paddingBottom: 5,
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          display: "none", // Hide default labels since we're using custom ones
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <CustomTab 
              color={color} 
              focused={focused} 
              iconName="home-outline"
              iconNameFocused="home"
              label="Home"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wordScreen"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <CustomTab 
              color={color} 
              focused={focused} 
              iconName="book-outline"
              iconNameFocused="book"
              label="Words"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <CustomTab 
              color={color} 
              focused={focused} 
              iconName="help-circle-outline"
              iconNameFocused="help-circle"
              label="Profile"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wordQuestions"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <CustomTab 
              color={color} 
              focused={focused} 
              iconName="chatbubble-ellipses-outline"
              iconNameFocused="chatbubble-ellipses"
              label="Questions"
            />
          ),
        }}
      />
    </Tabs>
  );
}