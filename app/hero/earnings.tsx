import { altitudo } from '@/constants/Constants'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { View, Text } from 'react-native'




const HeroEarnings = () => {



    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: altitudo(2) }}>
            <StatusBar style='light' animated />
            <Text style={{ fontFamily: 'mon-b', fontSize: altitudo(6) }}>Earnings</Text>
        </View>
    )
}



export default HeroEarnings