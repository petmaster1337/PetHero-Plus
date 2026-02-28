import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';

export default function SetHeader({ title = "Home", style = {} }) {
  const router = useRouter();
  const { methods, incomingCall } = useAuth();
  return (
    <SafeAreaView 
      edges={['top']} 
      style={[{ backgroundColor: Colors.primary}, style]}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        height: 56,
        width: '100%',
        backgroundColor: Colors.primary,
      }}>
        {/* Back Button */}
        <TouchableOpacity 
          style={{ flexDirection: 'row',width: '15%', alignItems: 'center', zIndex: 9999999 }} 
            onPress={() => {
              if (incomingCall)
              methods.setIncomingCall(null);
              router.replace('/(tabs)')
            }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 16 }}>Home</Text>
        </TouchableOpacity>

        {/* Centered Title */}
        <Text style={{
          color: 'white',
          fontSize: 16,
          position: 'relative',
          width: '70%',
          textAlign: 'center',
          zIndex: 2
        }}>{title}</Text>

        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => {
            if (incomingCall) {
              methods.setIncomingCall(null);
            }
            router.replace('/(tabs)/menu')
          }}    
          style={{ zIndex: 9999999, width: '15%', alignSelf: 'flex-end' }}   
        >
          <Ionicons name="menu" size={24} color="white" style={{marginLeft: 'auto'}}/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
