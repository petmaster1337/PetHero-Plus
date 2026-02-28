import React, { useEffect } from 'react'
import { Platform, Pressable, StyleSheet } from 'react-native'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { altitudo, Constants, latitudo } from '@/constants/Constants';
import { AntDesign, Feather, FontAwesome6, Fontisto } from '@expo/vector-icons';


const TabBarButton = (props: any) => {
    const { isFocused, label, routeName, color } = props;

    const icons: any = {
        index: (props: any) => <AntDesign name="home" size={altitudo(2.75)} {...props} />,
        petHero: (props: any) => <FontAwesome6 name="shield-dog" size={altitudo(2.75)} {...props} />,
        menu: (props: any) => <Fontisto name="player-settings" size={altitudo(2.75)} {...props} />,
        petStore: (props: any) => <Feather name="shopping-bag" size={altitudo(2.75)} {...props} />,
        feed: (props: any) => <FontAwesome6 name="list" size={altitudo(2.75)} {...props} />,
    }

    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(
            typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused,
            { duration: 250 }
        );
    }, [scale, isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(
            scale.value,
            [0, 1],
            [1, 1.618]
        );
        const top = interpolate(
            scale.value,
            [0, 1],
            [1, Constants.sizes.h / 100]
        );
        return {
            transform: [{ scale: scaleValue }],
            top
        }
    })
    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scale.value,
            [0, 1],
            [1, 0]
        );
        return { opacity }
    })



    return (
        <Pressable {...props} style={[styles.container, Platform.OS === 'android' ? {paddingVertical: 9, height: 52.5}:{}]}>
            <Animated.View style={[{ flex: 1 }, animatedIconStyle]}>
                {
                    icons[routeName]({
                        color
                    })
                }
            </Animated.View>

            <Animated.Text style={[{
                color,
                fontSize: altitudo(1.25)
            }, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        paddingVertical: 9,
        marginVertical: 6,
        marginHorizontal: 8,
        height: 60,
        width: 55,
    }
})

export default TabBarButton