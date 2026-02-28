import SetHeader from '@/components/default.menu';
import { Stack } from 'expo-router'
import React from "react";


const LayoutUser = () => {

  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        headerTransparent: false,
        headerShown: true,
        headerTitle: '',
        animation: 'fade'
      }}>
              <Stack.Screen name='index'
                options={{
                  header: () => <SetHeader title="Pet Hero" style={{marginTop: 0, zIndex:999, position:'absolute'}} />,
                }} 
              />
              <Stack.Screen name='fileScreen'
                options={{
                  header: () => <SetHeader title="Picture" style={{marginTop: 0, zIndex:999, position:'absolute'}} />,
                }} 
                />
              </Stack>
  )
}


export default LayoutUser