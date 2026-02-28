import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { altitudo, latitudo, Colors } from '@/constants/Constants';
import { useAuth } from '@/providers/AuthProvider';

const Message = () => {
  let { message } = useLocalSearchParams();
  let imessage = message ? String(message).trim() : "Success!";
  const { user } = useAuth(); 

  const router = useRouter();

  function goBackHome() {
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={Platform.OS === 'android' ? [styles.container, { paddingTop: altitudo(1), width: latitudo(100), margin: 0 }] : styles.container}>
      <TouchableOpacity
        onPress={() => {goBackHome()}}
      >
      <View style={{backgroundColor: 'white', height: altitudo(90), width: latitudo(100), marginLeft: -20}}>
            <Text style={[{ fontFamily: 'mon-b', fontSize: altitudo(3), textAlign: 'center', color: Colors.primary, marginTop: altitudo(25) }]}>{imessage || "Success!" }</Text>      
      </View>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: latitudo(5),
  },

})


export default Message
