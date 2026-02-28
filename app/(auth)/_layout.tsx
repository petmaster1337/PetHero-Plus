import { Stack } from 'expo-router'
import React from "react";



const LayoutAuth = () => {

  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        headerShown: true,
        headerTransparent: false,
        headerTitle: '',
        animation: 'fade',
      }}>
      <Stack.Screen name='initial' 
        options={{
          header: () => false,
        }}
      />
      <Stack.Screen name='loginScreen' 
          options={{
            header: () => false,
          }}
      />
      <Stack.Screen name='registerScreen' 
          options={{
            header: () => false,
          }}
      />
      <Stack.Screen name='updatePassword' 
          options={{
            header: () => false,
          }}
      />

    </Stack>
  )
}



export default LayoutAuth;