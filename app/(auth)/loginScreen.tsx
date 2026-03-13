import React, { useState, useEffect } from 'react';
import { 
  TextInput, Pressable, View, Text, Alert, Platform, 
  StyleSheet, ActivityIndicator 
} from 'react-native';
import { altitudo, latitudo, Colors } from '@/constants/Constants'
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { login, getToken } from '@/services/auth';
import { useAuth } from "@/providers/AuthProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserPets } from '@/services/pet.service';
import { getHeroByUser } from '@/services/hero.service';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  let { session, token, methods, user, expoPushToken } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (session.user?.uid && token) {
        router.replace('/(tabs)');
      }
      if (!token || token.length < 5) {
        token = `${await getToken()}`;
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const loginAnswer = await login(email.trim(), password);
      if (loginAnswer.user) {
        await AsyncStorage.setItem('user', JSON.stringify(loginAnswer.user));
        await AsyncStorage.setItem('token', `${loginAnswer.token}`);

        const thisHero = await getHeroByUser(loginAnswer.user);
        const petInfo = await getUserPets(loginAnswer.user);
        await AsyncStorage.setItem('pets', JSON.stringify(petInfo));

        methods.setUser(loginAnswer.user);
        methods.setToken(loginAnswer.token);
        methods.setHero(thisHero);
      }

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };




  const handleRegister = () => {
    router.replace('/(auth)/registerScreen');
  };

  const upScreen = () => {
    router.replace('/(auth)/updatePassword');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>

          {/* HEADER */}
          <View style={{
            flexDirection: 'row',
            width: '100%',
            height: 200,
            position: 'absolute',
            left: 0,
            top: 0
          }}>
            <ImageBackground
              source={require('@/assets/images/logo-splash.png')}
              contentFit="fill"
              contentPosition="left top"
              style={{
                backgroundColor: Colors.primary,
                marginLeft: '5%',
                marginTop: altitudo(5),
                width: 75,
                height: 75,
                zIndex: 1,
                position: "absolute"
              }}
            />
            <Text style={{
              position: 'absolute',
              top: altitudo(6.5),
              left: 100,
              fontSize: 32,
              fontFamily: 'mon-b',
              color: Colors.g1
            }}>
              Pet Hero Plus
            </Text>
          </View>

          {/* LOGIN BOX */}
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
            position: "relative",
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
              fontSize: 20
            }}>
              Login
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={'black'}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={'black'}
              secureTextEntry
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>
              <Pressable
                onPress={handleRegister}
                style={styles.btn}
              >
                <Text style={styles.btnText}>Register</Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                style={[styles.btn, { marginLeft: latitudo(43) }]}
              >
                <Text style={styles.btnText}>Login</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={upScreen}
              style={{ marginTop: 20, width: '80%', marginLeft: '10%', height: 30 }}
            >
              <Text style={styles.forgotText}>Forgot My Password</Text>
            </Pressable>
          </View>

          {/* 🔥 DARK OVERLAY + SPINNER */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    borderColor: '#ccc',
    color: 'black'
  },
  btn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    width: latitudo(20),
    height: 30,
    borderRadius: 6
  },
  btnText: {
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold'
  },
  forgotText: {
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  }
});
