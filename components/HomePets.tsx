import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native'
import { Link, useRouter } from 'expo-router';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { useAuth } from '@/providers/AuthProvider';
import { PetProps } from '@/constants/interfaces';
import { getUserPets } from '@/services/pet.service';

export default function HomePets() {
    const router = useRouter();
    const {methods, pets, user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [infoPets, setInfoPets] = useState<PetProps[]>([]);

    useEffect(() => {
        (async() => {
            const maybePets = await getUserPets(user)
            if (pets.length !== maybePets.length) {
                setInfoPets(maybePets);
            }
        })()
    }, [user])
    useEffect(() => {
        setInfoPets(pets);
        setLoading(false)
    }, [pets])



    const PetListItem = (infoPets: any) => {
        return (
            <TouchableOpacity
                style={styles.container}
                onPress={() => SendToPetProfile(infoPets)}
            >
            {infoPets.image ? 
            <View>
                <Image 
                    source={{uri: `${infoPets.image}?ts=${Date.now()}`}}
                    style={{width: 55, height: 55, borderWidth: 5, borderColor: "#AAA", borderRadius: 30}}
                />
            </View>
            :
            <View>
                <View 
                    style={{width: 55, height: 55, borderWidth: 5, borderColor: "#AAA", borderRadius: 30, padding: 6.5}}
                >
                    <FontAwesome6
                        name={infoPets?.pet_type === 'cat' ? 'cat' : 'dog'}
                        size={altitudo(3)}
                        color={Colors.g3}
                    />
                </View>
            </View>
            }
                <Text style={{ fontSize: altitudo(1.4), fontFamily: 'mon-sb', color: Colors.g3 }}>{infoPets?.name.substring(0, 10)}</Text>
            </TouchableOpacity>
        )
    }

    const SendToPetProfile = (pet: PetProps) => {
        if (!pet) {
            router.replace('/');
        }
        else { 
            router.push(`/(modals)/pet?petProfile=${JSON.stringify(pet)}`);
        }
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

            {/* ADD PET BUTTON */}
            <View style={{ gap: altitudo(0.5), alignItems: 'center', justifyContent: 'center', marginHorizontal: latitudo(5) }}>
                <Link href={'/(modals)/addPet'} asChild>
                    <TouchableOpacity
                        // style={{ aspectRatio: 1, borderWidth: 1, borderColor: Colors.g4, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                        style={{ borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                    >
                        {/* <Feather name="plus" size={48} color={Colors.g4} /> */}
                        <AntDesign name="plus" size={altitudo(4)} color={Colors.g4} />
                    </TouchableOpacity>
                </Link>
                <Text style={{ fontFamily: 'mon-b', fontSize: altitudo(1), color: Colors.g4 }}>Add Pet</Text>
            </View>

            <FlatList
                data={infoPets}
                renderItem={({ item }) => PetListItem(item)}
                horizontal
                style={{
                    // flex: 1,
                    // backgroundColor: Colors.bg,
                }}
                contentContainerStyle={{
                    alignContent: 'center',
                    paddingHorizontal: latitudo(5),
                    gap: latitudo(5),
                }}
                showsHorizontalScrollIndicator={false}
                refreshing={loading}
            />
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: latitudo(4),
        gap: altitudo(0.5),
    },
    contPet: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: altitudo(6),
        aspectRatio: 1,
        borderWidth: altitudo(0.5),
        borderColor: Colors.g4,
        borderRadius: latitudo(2.5),
    }
})