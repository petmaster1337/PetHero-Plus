import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text } from 'react-native';
import { Colors } from '@/constants/Constants';
import React from 'react';
import { PUSH_TOKEN } from "@/config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, 
    shouldShowList: true
  }),
});

export function useNotification() {
  const [ expoPushToken, setExpoPushToken ] = useState('');
  const [ notification, setNotification ] = useState<any>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (notification) {
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        return setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('User interacted with notification:', response);
        });

        return () => {
        if (notificationListener.current) {
            notificationListener.current.remove();
            // Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
            responseListener.current.remove();        
            // Notifications.removeNotificationSubscription(responseListener.current);
        }
        };
    }
  }, []);

    
  async function registerForPushNotificationsAsync() {
    let token = '';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: Colors.primary,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notifications permission not granted!');
        return '';
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: PUSH_TOKEN,
      })).data;
    } else {
      console.warn('Must use a physical device for push notifications.');
    }
    setExpoPushToken(token);
    return token;
  }
  return { expoPushToken, notification, sendPushNotification, registerForPushNotificationsAsync, showNotification };
}

async function showNotification(msg: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; body: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) {
    return (
        <View style={{position: 'absolute', width: '100%', height: '10%', top: 0, left: 0}}>
            <Text>{msg?.title}</Text>
            <Text>{msg?.body}</Text>
        </View>
    )

}

async function sendPushNotification(expoToken: string, title: string, body: string) {
    if (!expoToken || !body) {
      console.log('ERROR', 'NOTIFICATION', 'Missing token')
      return; // Silent error!
    }
  
    const message = {
      to: expoToken,
      sound: 'default',
      title: title,
      body: body,
    };
  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
}


