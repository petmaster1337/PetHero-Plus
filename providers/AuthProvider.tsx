import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, altitudo, latitudo } from '@/constants/Constants';
import { useSession } from '@/hooks/useSession';
import { useLocation } from '@/hooks/useLocation';
import { usePolling } from '@/hooks/usePolling';
import { useNotification } from '@/hooks/useNotification';
import { useRouter } from 'expo-router';
import { useAttention } from '@/hooks/useAttention';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from '@/services/user.service';
import { AttentionProps, PetProps, SessionProps, UserProps } from '@/constants/interfaces';
import { useWebSocket } from '@/hooks/useWebsocket';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(true);

type Auth = {
  session: SessionProps;
  location: { latitude: number, longitude: number };
  neighbors: any;
  notification: any;
  attention: AttentionProps | undefined;
  messages: {sender: any[], receiver: any[]};
  services: {contractee: any[], contractor: any[]};
  priceTypes: any;
  token: string;
  pets: PetProps[],
  user: UserProps,
  hero: any,
  expoPushToken: any,
  isAuthenticated: boolean;
  isConnected: boolean;
  methods: any;
  incomingCall: any;
  workingOn: any;
  tracks: any;
};

const AuthContext = createContext<Auth | undefined>(undefined);

export default function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { session, token, setToken, user, setUser, pets, setPets, updateSession } = useSession();
  const location = useLocation();
  const { neighbors, messages, setMessages, services, setServices, priceTypes, hero, setHero, updateMessages, updateServices, updateSpecificContract, workingOn } = usePolling(user, token, pets);
  const isAuthenticated = (typeof session?.user !== 'undefined' ) || false;
  const { expoPushToken, notification, sendPushNotification, registerForPushNotificationsAsync, showNotification } = useNotification();
  const { attention, setAttention, getCurrentAttention, addCurrentAttention, deleteAttention, setImune } = useAttention(token, user);
  const {       
    isConnected, 
    checkUserOnline, 
    sendInstantMessage, 
    sendCallRequest, 
    sendCallAnswer, 
    sendContractRequest, 
    sendReminder,
    sendEvent,
    filename,
    incomingCall,
    setIncomingCall,
    sendPhoto,
    setGoBack,
    goBack,
    tracks
  } = useWebSocket(user, setMessages, messages, getCurrentAttention, services, setServices, hero, token );
  const logOut = async () => {
    await AsyncStorage.clear();
    updateSession({});
    setToken('');
    setUser(null);
  };
  const router = useRouter();

  const methods = {
    updateSession,
    logOut,
    setToken,
    setPets,
    setUser,
    setHero,
    setServices,
    setMessages,
    sendPushNotification,
    addCurrentAttention,
    deleteAttention,
    checkUserOnline, 
    sendInstantMessage, 
    sendCallRequest,
    sendContractRequest,
    sendReminder,
    sendCallAnswer, 
    sendEvent,
    setIncomingCall,
    sendPhoto,
    setImune,
    setGoBack,
    registerForPushNotificationsAsync,
    updateMessages,
    updateServices,
    updateUser,
    updateSpecificContract,
    }

  useEffect(() => {
    const addNotification = async() => {
      if ( user && expoPushToken != user.notification) {
        const newUser = JSON.parse(JSON.stringify(user));
        const id = newUser._id;
        newUser.notification = expoPushToken;

        await updateUser(id, newUser);  
      }
    }
    if(expoPushToken) {
      addNotification();
    }
  }, [expoPushToken])

  useEffect(() => {
    setAttention(attention)
  }, [attention])

  useEffect(() => {
    if (user)
      updateUser(user._id, {...user, lat: location.latitude, long: location.longitude});
  }, [location])

  useEffect(() => {
    showNotification(notification);
  }, [notification]);

if (incomingCall && user) {
    router.push({pathname:'/message/fileScreen', params: {other: JSON.stringify(incomingCall), filename, goBack: JSON.stringify(goBack)}});
  } else if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: altitudo(2) }}>
        <ActivityIndicator color={Colors.primary} size={altitudo(12)} />
        <View style={{ justifyContent: 'flex-start', gap: altitudo(1) }}>
          <View style={{ flexDirection: 'row', gap: latitudo(2) }}>
            <Ionicons name="checkmark-circle" size={altitudo(3)} color={Colors.g1} />
            <Text style={{ fontFamily: 'mon', fontSize: altitudo(1.618) }}>Assets loaded.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: latitudo(2) }}>
            <ActivityIndicator color={Colors.g1} size={altitudo(2)} style={{ marginHorizontal: altitudo(0.5) }} />
            <Text style={{ fontFamily: 'mon', fontSize: altitudo(1.618) }}>Connecting to database...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{session,  priceTypes, token,  expoPushToken, isAuthenticated, isConnected,  methods, user, hero, pets, attention, location, neighbors, messages, services, notification, incomingCall, workingOn, tracks}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
