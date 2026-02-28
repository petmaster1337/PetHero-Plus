import { Stack, useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import React from "react";
import SetHeader from '@/components/default.menu';



const LayoutUser = () => {

  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        headerShown: true,
        headerTransparent: false,
        headerTitle: '',
        animation: 'fade',
      }}>
        <Stack.Screen name='profile' 
          options={{
            header: () => <SetHeader title="User Profile" style={{marginTop: 0}} />,
          }}
        />
        <Stack.Screen name='accepts' 
          options={{
            header: () => <SetHeader title="Price Proposal" style={{marginTop: 0}} />,
          }}
        />

          <Stack.Screen name='serviceList' 
            options={{
              header: () => <SetHeader title="Services" style={{marginTop: 0}} />,
            }}
          />                
          <Stack.Screen name='history' 
          options={{
            header: () => <SetHeader title="Purchase History" style={{marginTop: 0}} />,
          }}
        />              
          <Stack.Screen name='checkout' 
            options={{
            header: () => <SetHeader title="Checkout" style={{marginTop: 0}} />,
          }}
        />
          <Stack.Screen name='cart' 
            options={{
            header: () => <SetHeader title="Shopping Cart" style={{marginTop: 0}} />,
          }}
        />
          <Stack.Screen name='ongoingService'
              options={{
              header: () => <SetHeader title="Service Near Execution" style={{marginTop: 0}} />,
            }}
          />
          <Stack.Screen name='service' 
            options={{
              header: () => <SetHeader title="Service" style={{marginTop: 0, height: 50}} />,
            }}
          />
          <Stack.Screen name='serviceDetails' 
            options={{
              header: () => <SetHeader title="Service Details" style={{marginTop: 0}} />,
            }}
          />

          <Stack.Screen name='openBill'
            options={{
              header: () => <SetHeader title="Payment" style={{marginTop: 0}} />,
            }}
          />
          <Stack.Screen name='messageList' 
            options={{
              header: () => <SetHeader title="Messages" style={{marginTop: 0}} />,
            }}
          />
          <Stack.Screen name='message'
            options={{
              header: () => <SetHeader title="Message" style={{marginTop: 0}} />,
            }}
          />
          <Stack.Screen name='productPurchaseView'
            options={{
              header: () => <SetHeader title="Purchase Detail" style={{marginTop: 0}} />,
            }}
          />              
          <Stack.Screen name='contractPurchaseView'
          options={{
            header: () => <SetHeader title="Purchase Detail" style={{marginTop: 0}} />,
          }}
        />
      </Stack>
  )
}



export default LayoutUser;