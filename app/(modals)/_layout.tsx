import { Stack, useRouter } from 'expo-router'
import React from "react";
import SetHeader from '@/components/default.menu';



const LayoutModals = () => {
  const router = useRouter();



  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerTransparent: true,
        headerTitle: '',
        animation: 'fade'
      }}>

      <Stack.Screen name='pet'
        options={{
          header: () => <SetHeader title="Pet" style={{marginTop: 0}} />,
        }}
      />
      <Stack.Screen name='beHero' 
        options={{
          header: () => <SetHeader title="Register as Hero" style={{marginTop: 0}} />,
        }}
      />
      <Stack.Screen name='infoHeroes'
        options={{
          header: () => <SetHeader title="Info" style={{marginTop: 0}} />,
        }}
       />
       <Stack.Screen name='setPrices'
         options={{
           header: () => <SetHeader title="Update Your Prices" style={{marginTop: 0}} />,
         }}
        />
      <Stack.Screen name='addPet'
        options={{
          header: () => <SetHeader title="Add Pet" style={{marginTop: 0}} />,
        }}
      />

    </Stack>
  )
}



export default LayoutModals