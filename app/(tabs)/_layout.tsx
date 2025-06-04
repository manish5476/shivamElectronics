// // import { Tabs } from 'expo-router';
// // import React from 'react';
// // import { Platform } from 'react-native';

// // import { HapticTab } from '@/components/HapticTab';
// // import { IconSymbol } from '@/components/ui/IconSymbol';
// // import TabBarBackground from '@/components/ui/TabBarBackground';
// // import { Colors } from '@/constants/Colors';
// // import { useColorScheme } from '@/hooks/useColorScheme';

// // export default function TabLayout() {
// //   const colorScheme = useColorScheme();

// //   return (
// //     <Tabs
// //       screenOptions={{
// //         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
// //         headerShown: false,
// //         tabBarButton: HapticTab,
// //         tabBarBackground: TabBarBackground,
// //         tabBarStyle: Platform.select({
// //           ios: {
// //             // Use a transparent background on iOS to show the blur effect
// //             position: 'absolute',
// //           },
// //           default: {},
// //         }),
// //       }}>
// //       <Tabs.Screen
// //         name="index"
// //         options={{
// //           title: 'Home',
// //           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="explore"
// //         options={{
// //           title: 'Explore',
// //           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
// //         }}
// //       />
// //     </Tabs>
// //   );
// // }

// // app/_layout.tsx
// import React, { useEffect, useState } from 'react';
// import { Stack, SplashScreen } from 'expo-router'; // Import SplashScreen from expo-router
// import { authService } from '../src/api/AuthService'; // Adjust path
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useFonts } from 'expo-font';

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loadedFonts] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // Adjust path if necessary
//   });

//   const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

//   useEffect(() => {
//     // Check authentication status on app load
//     const checkAuthStatus = async () => {
//       try {
//         const authenticated = await authService.isAuthenticated();
//         setIsAuthenticated(authenticated);
//       } catch (e) {
//         console.error("Error checking auth status:", e);
//         setIsAuthenticated(false); // Assume not authenticated on error
//       } finally {
//         SplashScreen.hideAsync(); // Hide splash screen after checking auth status
//       }
//     };

//     checkAuthStatus();
//   }, []);

//   // Show a loading indicator until authentication status is determined and fonts are loaded
//   if (isAuthenticated === null || !loadedFonts) {
//     return (
//       <View style={layoutStyles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         {isAuthenticated ? (
//           // Authenticated user: Go to main app (tabs)
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         ) : (
//           // Unauthenticated user: Go to authentication flow
//           <Stack.Screen name="login" options={{ headerShown: false }} />
//         )}
//         {/* Define other screens that might exist outside the main flow */}
//         <Stack.Screen name="forgot-password" options={{ headerShown: true, title: "Forgot Password" }} />
//         <Stack.Screen name="reset-password" options={{ headerShown: true, title: "Reset Password" }} />
//         <Stack.Screen name="signup" options={{ headerShown: true, title: "Sign Up" }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//     </ThemeProvider>
//   );
// }

// const layoutStyles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
// app/_layout.tsx
// (Your first large code block goes here)
import { useColorScheme } from '@/hooks/useColorScheme';
import { authService } from '@/src/api/AuthService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loadedFonts] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (e) {
        console.error("Error checking auth status:", e);
        setIsAuthenticated(false);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    checkAuthStatus();
  }, []);

  if (isAuthenticated === null || !loadedFonts) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: true, title: "Forgot Password" }} />
        <Stack.Screen name="reset-password" options={{ headerShown: true, title: "Reset Password" }} />
        <Stack.Screen name="signup" options={{ headerShown: true, title: "Sign Up" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/*
          IMPORTANT: Do NOT uncomment the `name="home"` screen here if you're using `(tabs)`
          as your main authenticated route, as it will cause the "unique screen names" error.
          Only uncomment if you plan to use `app/home.tsx` as a *separate* route, not part of tabs.
        */}
        {/* <Stack.Screen name="home" options={{ headerShown: false }} /> */}
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />

        {isAuthenticated ? (
          <Redirect href="/(tabs)" />
        ) : (
          <Redirect href="/login" />
        )}
      </Stack>
    </ThemeProvider>
  );
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});