import React, { useState, useEffect } from 'react';
import { altitudo, latitudo, Colors } from '@/constants/Constants'
import { ImageBackground } from 'expo-image';
import { TextInput, Pressable, View, Text, Alert, Platform, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { sendUpdatePassword, getUpdatePassToken, getToken } from '@/services/auth';


export default function UpdatePassword() {
  const [ePlaceHolder, setEPlaceHolder] = useState('Email');
  const [eToken, setEToken] = useState('Token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [stage, setStage] = useState<number>(0);
  const router = useRouter();

  const login = async () => {
    router.replace('/(auth)/loginScreen');
  }
  let sessionToken: string;

  const sendToken = async () => {
      sessionToken = `${ await getToken() }`;

    if (!email.includes('@')) {
      setEPlaceHolder('Provide email here!')
    } else {
      const sent = await getUpdatePassToken(email, sessionToken);
      if (sent.ok) {
        setEToken(`Token at ${email}`);
        setStage(1);
      }
    }
  }

  const updPassword = async () => {
    sessionToken = sessionToken ? sessionToken: `${ await getToken() }`;
    await sendUpdatePassword(email, sessionToken, token, password);
    login();
  }

  useEffect(()=> {
    if (token.length >= 9) {
      setStage(2)
    }
    }, [token])

  return (
    <SafeAreaView style={{backgroundColor: Colors.primary, height: altitudo(100), position: 'relative', borderColor: 'black', marginTop: 0}}>
      <View style={{flexDirection: 'row', width: '100%', height: 200, position: 'absolute', left: 0, top: 0}}>
      <ImageBackground
        source={require('@/assets/images/logo-splash.png')}
        contentFit="fill"
        contentPosition="left top"
        style={{ backgroundColor: Colors.primary, marginLeft: '5%', marginTop: altitudo(5), width: 75, height: 75, zIndex: 1, position:"absolute" }}
      />
      <Text style={{position: 'absolute', top: altitudo(6.5), left: 100, fontSize: 32, fontFamily: 'mon-b', color: Colors.g1}}>Pet Hero Plus</Text>
      </View>
    <View style={{ 
      borderWidth: 1,
      borderColor: Colors.g4,
      opacity: 0.95, 
      borderRadius: 8, 

      ...Platform.select({
        ios: {
          shadowOffset: { width: 1, height: 3 },
          shadowOpacity: 0.95,
          shadowRadius: 3,
          shadowColor: 'black',
        },
        android: {
          elevation: 10,
          shadowColor: 'black'
        },
      }),
      position:"relative", 
      shadowColor: Colors.g1, 
      width: '90%', 
      height: altitudo(35),  
      minHeight: 260,
      padding: 20, 
      marginLeft: '5%', 
      marginTop: '45%', 
      zIndex: 1, 
      backgroundColor: Colors.bg
      }}>
    <Text style={{
      textAlign: 'center', 
      marginBottom: 10, 
      fontWeight: 'bold', 
      display: 'flex', 
      flexDirection: 'row', 
      fontSize: 20}}>Setting new Password</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={ePlaceHolder}
        editable = {stage === 0}
        style={{
          marginBottom: 10,
          borderWidth: 1,
          padding: 8,
          borderRadius: 5,
          borderColor: '#ccc',
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {stage >= 1 && (
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder={eToken}
          style={{
            marginBottom: 10,
            borderWidth: 1,
            padding: 8,
            borderRadius: 5,
            borderColor: '#ccc',
          }}
          keyboardType="default"
          autoCapitalize="none"
        />

      )}
      {stage >= 2 && (
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New Password"
          style={{
            marginBottom: 10,
            borderWidth: 1,
            padding: 8,
            borderRadius: 5,
            borderColor: '#ccc',
          }}
          keyboardType="default"
          autoCapitalize="none"
        />
      )}

      <View style={{display:'flex', flexDirection:'row', flexWrap: 'nowrap'}}>

        {stage === 0 && (
          <Pressable
            onPress={sendToken}
            style={{ marginTop: 20, backgroundColor: Colors.primary, width: latitudo(30), height: 30, borderRadius: 6}}
          >
            <Text style={{textAlign: 'center', marginTop: 5, fontWeight: 'bold', display: 'flex', flexDirection: 'row'}}>Get Token</Text>
          </Pressable>

        )}
        {stage >= 1 && (
          <Pressable
            onPress={updPassword}
            style={{ marginTop: 20, marginLeft: latitudo(10), backgroundColor: Colors.primary, width: latitudo(30), height: 30, borderRadius: 6}}
          >
            <Text style={{textAlign: 'center', marginTop: 5, fontWeight: 'bold', display: 'flex', flexDirection: 'row'}}>Update</Text>
          </Pressable>
        )}      
      </View>
      <View>
        <Pressable
          onPress={login}
          style={{ marginTop: 20, width: '80%', marginLeft: '10%', height: 30, borderRadius: 6}}
        >
          <Text style={{textAlign: 'center', marginTop:5, fontWeight: 'bold', display: 'flex', flexDirection: 'row'}}>Back to Login</Text>
        </Pressable>
      </View>
    </View>
  </SafeAreaView>
      );
}

const styles = StyleSheet.create({

contLogins: {
  alignItems: 'center',
  marginBottom: 10,
},
});