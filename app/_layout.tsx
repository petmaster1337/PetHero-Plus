import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AuthProvider from '@/providers/AuthProvider';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: '/', };


export default function RootLayout() {
  const [fontLoaded, fontError] = useFonts({
    'mon': require('@/assets/fonts/Montserrat-Regular.ttf'),
    'mon-sb': require('@/assets/fonts/Montserrat-SemiBold.ttf'),
    'mon-b': require('@/assets/fonts/Montserrat-Bold.ttf'),
  });
  useEffect(() => { if (fontError) throw fontError; }, [fontError]);
  useEffect(() => { if (fontLoaded) { SplashScreen.hideAsync(); } }, [fontLoaded]);
  if (!fontLoaded) {
    return (

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: altitudo(2), }}>
        <ActivityIndicator color={Colors.primary} size={altitudo(12)} />
        <View style={{ justifyContent: 'flex-start', gap: altitudo(1) }}>
          <View style={{ flexDirection: 'row', gap: latitudo(2) }}>
            <ActivityIndicator color={Colors.g1} size={altitudo(2)} style={{ marginHorizontal: altitudo(0.5) }} />
            <Text style={{ fontFamily: 'mon', fontSize: altitudo(1.618) }}>Loading assets...</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export function RootLayoutNav() {

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="user" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="message" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="hero" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}