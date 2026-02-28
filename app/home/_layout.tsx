import { altitudo, dstyles, dtexts } from '@/constants/Constants'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import React from "react";


const LayoutHome = () => {
  const router = useRouter();
    const homeLink = () => {
        return (
            <View style={dstyles.contModalHeaderLeft}>
                <TouchableOpacity style={dstyles.ButtonRound} onPress={() => router.push('/(tabs)')}>
                    <Ionicons name="chevron-back" size={altitudo(4)} color='black' />
                    <Text style={dtexts.textModalBack}>home</Text>
                </TouchableOpacity>
            </View>
        );
    }
    const menuLink = () => {
        return (
            <View style={dstyles.contModalHeaderLeft}>
                <TouchableOpacity style={dstyles.ButtonRound} onPress={() => router.push('/(tabs)')}>
                    <Ionicons name="menu-outline" size={altitudo(4)} color='black' />
                    <Text style={dtexts.textModalBack}>Menu</Text>
                </TouchableOpacity>
            </View>        
        );
    }

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerTransparent: true,
        headerTitle: '',
        animation: 'fade'
      }}>

      <Stack.Screen name='index' 
              options={{
                headerRight: menuLink
            }}
    
      />

      <Stack.Screen name='history' 
        options={{
            headerLeft: homeLink,
            headerRight: menuLink
        }}
        />
      
      <Stack.Screen name='messages'
        options={{
            headerLeft: homeLink,
            headerRight: menuLink
        }}
      />

    </Stack>
  )
}



export default LayoutHome