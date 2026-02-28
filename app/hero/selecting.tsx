import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import HeroFlatList from '@/components/heroFlatList';

const HeroSelecting = () => {
    const { date, pet, service, size, avoid } = useLocalSearchParams();
    const [ filteredHeroes, setFilteredHeroes] = useState<any[]>([]);
    const { token, neighbors, methods, user } = useAuth();
    const router = useRouter();
    const petInfo = JSON.parse(pet as string);
    const avoidInfo = JSON.parse(avoid as string)

    const populateHeroes = async() => {
        let day = new Date(parseInt(`${date}`));
        let answer = [];
        let current;
        let ignore = false;
        if (neighbors) {
            for (const hero of neighbors) {
                methods.checkUserOnline((hero.user._id), (isOnline: boolean) => {
                    hero.online = isOnline;
                })

                ignore = false;
                const servicePrice = hero.price[0][`${petInfo.type}s`.trim()][`${service}`.trim()];
                if (
                    servicePrice === 0 || 
                    servicePrice === null || 
                    servicePrice === undefined ||
                    avoidInfo.includes(hero._id) ||
                    hero.uid === user.uid
                ) {
                    continue;
                }
                if (!ignore) {
                    answer.push(hero);
                }
            }
        }
        let orderedAnswer = toSorted(answer);

        setFilteredHeroes(orderedAnswer);
    }

    function toSorted(list: any) {
        return list.sort((a:any, b:any) => {
            if (a.super > b.super) {
                return -1;
            } else if (a.super < b.super) {
                return 1;
            } else if (a.price[0][`${ petInfo.type }s`.trim()][`${service}`.trim()] > b.price[0][`${ petInfo.type }s`.trim()][`${service}`.trim()]) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    useEffect(() => {
        populateHeroes();
    }, []);

    const buyIt = async (item: any, petType: string, serviceSelected: string) => {
    router.push({
        pathname: "/hero/schedule",
        params: {
        item: JSON.stringify(item),
        petType: String(petType).trim(),
        serviceSelected: String(serviceSelected).trim(),
        petInfo: JSON.stringify(petInfo),
        date: String(date),
        size: String(size),
        },
    });
    };


    return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.primary}}>
      <View style={[styles.container, {paddingTop: 0, top: -altitudo(7), width: "100%"}]}>
            <View style={{marginTop: altitudo(5), paddingTop: altitudo(0),  width: '100%', height: 100}}>
                <View style={{height: altitudo(5)}}>
                <Text style={{fontSize: latitudo(8), textAlign:'center', fontWeight: 'bold', color: 'white', marginBottom: 0, marginTop: 15, backgroundColor: Colors.primary, height: altitudo(10)}}>{ String(service).toUpperCase() }</Text>
                </View>
            </View>

            <ScrollView style={{ width: '100%', backgroundColor: 'white', minHeight: altitudo(75) }} contentContainerStyle={{ paddingBottom: altitudo(0) }} showsVerticalScrollIndicator={false}>
                <View style={{ marginTop: altitudo(10) }}>
                    <FlatList
                        data={ filteredHeroes }
                        keyExtractor={item => item.uid}
                        scrollEnabled={false}
                        renderItem={({item}) => (
                            
                                <HeroFlatList
                                    hero={item}
                                    buyIt={buyIt}
                                    petType={`${petInfo.type}s`}
                                    serviceSelected={String(service).trim()}
                                    isOnline={item.online}
                                    methods={methods}
                                    user={user}
                                />)}
                        ListEmptyComponent={ <Text style={{ textAlign: 'center', color: '#666', fontSize: 18, marginTop: 20, height: 100, width: '100%'}}> No hero around to { String(service).trim() } your { String(petInfo.type).trim() }!</Text>}
                    />
                </View>
            </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    img: {
        aspectRatio: 1,
        width: altitudo(20),
        borderRadius: altitudo(20) / 2,
        borderWidth: latitudo(2),
        borderColor: Colors.primary,
        elevation: 10,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.primary
      },
})

export default HeroSelecting
