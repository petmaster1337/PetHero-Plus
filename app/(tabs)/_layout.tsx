import { Tabs } from 'expo-router'
import TabBar from '@/components/tabbar/TabBar';
import React from "react";

const LayoutTabs = () => {

  return (
    <Tabs
      tabBar={(props: any) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >

    <Tabs.Screen
      name='index'
      options={{
        tabBarLabel: 'Home',
      }}
    />

    <Tabs.Screen
        name='petHero'
        options={{
          tabBarLabel: 'Hire',
        }}
      /> 

    <Tabs.Screen
        name='petStore'
        options={{
          tabBarLabel: 'Store',
        }}
      />

    <Tabs.Screen
        name='feed'
        options={{
          tabBarLabel: 'Feed',
        }}
      />

    <Tabs.Screen
        name='menu'
        options={{
          tabBarLabel: 'Menu',
        }}
      />

    </Tabs>
  )
}



export default LayoutTabs