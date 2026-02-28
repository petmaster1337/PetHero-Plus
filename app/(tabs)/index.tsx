import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider';
import HomePets from '@/components/HomePets';
import { altitudo, latitudo, Colors, SIZE_STATUSBAR, Constants } from '@/constants/Constants';
import { getLocation } from '@/services/auth'
import { updateUser } from '@/services/user.service';
import ServiceList from '../user/serviceList';
import { ScrollView } from 'react-native-gesture-handler';
const SIZE_AVATAR = altitudo(7.5);
const SIZE_MULTIPLIER = 3;
const SIZE_BORDER = altitudo(0.6);
const SIZE_SCROLL1 = altitudo(22.5);

const TabsHome = () => {
    const router = useRouter();
    const { user, services, messages, methods, token, hero }= useAuth();
    // const [infoMsg, setInfoMsg] = useState<string>("Dude, you ain't talk to nobody yet!");
    const [infoService, setInfoService] =useState<string>("Sadly, there is nothing happening");
    const scrollY = useSharedValue<number>(0)

    const handleScroll = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; })
    const animHeader = useAnimatedStyle(() => {
        const height = interpolate(
            scrollY.value,
            [0, SIZE_SCROLL1],
            [SIZE_AVATAR * SIZE_MULTIPLIER - SIZE_STATUSBAR! / 2, SIZE_AVATAR],
            Extrapolation.CLAMP,
        );
        return { height };
    });
    const animAvatar = useAnimatedStyle(() => {
        const width = interpolate(
            scrollY.value,
            [0, SIZE_SCROLL1],
            [SIZE_AVATAR * SIZE_MULTIPLIER, SIZE_AVATAR],
            Extrapolation.CLAMP,
        );
        const bottom = interpolate(
            scrollY.value,
            // [0, SIZE_AVATAR * SIZE_MULTIPLIER],
            [0, SIZE_SCROLL1],
            [-(SIZE_AVATAR * SIZE_MULTIPLIER / 2), -(SIZE_AVATAR / 2)],
            Extrapolation.CLAMP,
        );
        const borderWidth = interpolate(
            scrollY.value,
            // [0, SIZE_AVATAR * SIZE_MULTIPLIER],
            [0, SIZE_SCROLL1],
            [SIZE_BORDER * SIZE_MULTIPLIER, SIZE_BORDER],
            Extrapolation.CLAMP,
        );
        return { borderWidth, width, bottom };
    });

    const animBodyMain = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, SIZE_SCROLL1],
            [0, SIZE_SCROLL1],
            Extrapolation.CLAMP,
        );
        return {
            transform: [
                // { translateX },
                { translateY },
            ]
        };
    });

    useEffect(() => {
        ( async () => {
        const {latitude, longitude} = await getLocation();
        if (user.lat !== latitude || user.long !== longitude) {
            user.lat = latitude;
            user.long= longitude;
            await updateUser(`${user?._id}`, user);
            methods.setUser({...user});
        }
        })()
    }, []);

    useEffect(() => {
        let serviceCounter = 0;
        if (services) {
            const accumulated = services?.contractee.concat(services?.contractor) || [];
            for (const item of accumulated) {
                if (item.status !== 'ended') {
                    serviceCounter++;
                }
            }    
        }
        if (serviceCounter === 0) {
            setInfoService("Sadly, there is nothing happening");
        } else if (serviceCounter === 1) {
            setInfoService("Only one service");
        } else {
            setInfoService(`${serviceCounter} services`);
        }
    },[services, messages]);

    const sendToUserPage = () => {
        if (user) {
            router.replace(`/user/profile?userProfile=${ JSON.stringify(user) }`);
        }
    }

    return (
        <SafeAreaView style={[styles.container]}>

            {/* HEADER */}
            <Animated.View style={[{ top: latitudo(3), width: '100%', zIndex: 11, backgroundColor: Colors.primary }, animHeader]} >
                <Animated.View
                    style={[styles.rotonda, animAvatar]}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={ sendToUserPage }
                >
                    <Image
                        style={[{ flex: 1, borderRadius: altitudo(50), height: altitudo(15) }]}
                        source={{ uri: `${user?.image}?ts=${Date.now()}` }}
                        contentFit="fill"
                    />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>

            {/* BODY */}
            <Animated.ScrollView
                onScroll={handleScroll}
                style={{ backgroundColor: Colors.primary }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: altitudo(2), paddingTop: Constants.sizes.header.total, backgroundColor: Colors.bg }}
                scrollEventThrottle={16}
            >

                {/* PETS */}
                <Animated.View style={[animBodyMain]}>
                    {/* <Text style={styles.title}>Pets</Text> */}
                    <View style={{borderBottomWidth:1, borderColor: Colors.g5, marginBottom: 10}}></View>
                    <HomePets />
                </Animated.View>

                {/* SERVICES */}
                <Animated.View style={[animBodyMain, {borderWidth: 1, borderColor: Colors.g5, height: altitudo(48), marginBottom: 0, paddingBottom: 0}]}>
                    <View style={{borderBottomWidth:1, borderColor: Colors.g5}}></View>
 
                         <ServiceList />
 
                </Animated.View>
                <Animated.View style={[animBodyMain, { backgroundColor: Colors.white, height: altitudo(8)}]}>
                </Animated.View>
                <Animated.View style={[animBodyMain, { backgroundColor: Colors.primary, height: altitudo(22)}]}>
                </Animated.View>
{/* TESTS
                <Animated.View style={[{}, styles.cont1, animBodyMain]}>
                    <TouchableOpacity
                        onPress={openTest}
                    >
                    <Text style={{ fontSize: altitudo(1.5), fontFamily: 'mon' }} adjustsFontSizeToFit numberOfLines={1}>TEST</Text>
                    </TouchableOpacity>
                </Animated.View>
                
                <Animated.View style={[{}, styles.cont1, animBodyMain]}>
                    <TouchableOpacity
                        onPress={secondTest}
                    >
                    <Text style={{ fontSize: altitudo(1.5), fontFamily: 'mon' }} adjustsFontSizeToFit numberOfLines={1}>SECOND TEST</Text>
                    </TouchableOpacity>
                </Animated.View>
 END TESTS */}
                {/* CONTENT */}

            </Animated.ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },

    cont1old: {
        minHeight: 700,
        marginVertical: 50,
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 24,
        backgroundColor: 'white',
    },

    rotonda: {
        position: 'absolute',
        zIndex: 10,
        alignSelf: 'center',
        aspectRatio: 1,
        borderRadius: SIZE_AVATAR * SIZE_MULTIPLIER,
        borderColor: Colors.bg,
        backgroundColor: Colors.g4
    },
    imageOverlay: {
        height: SIZE_AVATAR * 3,
        ...StyleSheet.absoluteFillObject,
    },
    cont1: {
        justifyContent: 'center',
        paddingHorizontal: latitudo(5),
    },
    title: { 
        fontFamily: 'mon-b', 
        fontSize: altitudo(2.5), 
        color: Colors.g6,
        borderColor: '#DDD', 
        borderBottomWidth: 1, 
        margin: 10 
    }
})

export default TabsHome
