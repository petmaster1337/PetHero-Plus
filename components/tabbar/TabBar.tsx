import { View, StyleSheet, Platform } from 'react-native'
import TabBarButton from './TabBarButton';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import React from 'react';

const TabBar = ({ state, descriptors, navigation }: any) => {



  return (
    <View style={[styles.tabbar, Platform.OS==='android' ? {width: 350}:{}]}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            style={styles.tabbarItem}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? Colors.white : Colors.g1}
            label={label}
            backgroundColor={isFocused ? Colors.primary : Colors.white}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: altitudo(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 'auto',
    alignSelf: 'center',
    borderRadius: latitudo(20),
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 5,
    width: 380,

  },
  tabbarItem: {
    margin: 'auto'
  }
})

export default TabBar