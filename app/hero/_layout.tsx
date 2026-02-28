import SetHeader from '@/components/default.menu'
import { Stack } from 'expo-router'
import React from 'react'

const LayoutHero = () => {

  
  return (
        <Stack
          screenOptions={{
            presentation: 'modal',
            headerTransparent: false,
            headerShown: true,
            headerTitle: '',
            animation: 'fade'
          }}>
          <Stack.Screen name='accept' 
            options={{
              header: () => <SetHeader title="Proposal" style={{marginTop: 0}} />,
            }}
          />
          <Stack.Screen name='customs' />
          <Stack.Screen name='earnings' />
          <Stack.Screen name='index' />
          <Stack.Screen name='schedule'            
            options={{
            header: () => <SetHeader title="Confirm" style={{marginTop: 0}} />,
          }} />
          <Stack.Screen name='selecting'
            options={{
            header: () => <SetHeader title="Select Hero" style={{marginTop: 0}} />,
          }} />
          </Stack>
    
  )
}




export default LayoutHero