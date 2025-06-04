// app/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { authService } from '@/src/api/AuthService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router'; // Import SplashScreen from expo-router
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loadedFonts] = useFonts({
    // Make sure this path is correct if you use custom fonts:
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
        {isAuthenticated ? (
          // Authenticated user: Go to main app (tabs)
          <Stack.Screen name="home" options={{ headerShown: false }} />
        ) : (
          // Unauthenticated user: Go to authentication flow
          <Stack.Screen name="login" options={{ headerShown: false }} />
        )}
        {/* Define other screens that might exist outside the main flow */}
        {/* These should be directly under app/ (e.g., app/forgot-password.tsx) */}
        {/* <Stack.Screen name="home" options={{ headerShown: false }} /> */}
        <Stack.Screen name="forgot-password" options={{ headerShown: true, title: "Forgot Password" }} />
        <Stack.Screen name="reset-password" options={{ headerShown: true, title: "Reset Password" }} />
        <Stack.Screen name="signup" options={{ headerShown: true, title: "Sign Up" }} />
        <Stack.Screen name="+not-found" />
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