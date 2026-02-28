import { API_ROOT_URL } from '@/config';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider'
import { TextInput } from 'react-native-gesture-handler'
import { getUserByUid } from '@/services/user.service';
import { addAttention } from '@/services/attention.service';
import { Data } from '@/constants/Services';
import UserStamp from '@/components/UserStamp';
import PetStamp from '@/components/PetStamp';

const HeroSchedule = () => {
    let { item, petType, serviceSelected, petInfo, date, size } = useLocalSearchParams()
    const [ description, setDescription ] = useState<string>(``);
    const { priceTypes, user, token, services, methods } = useAuth();
    const pet = JSON.parse(`${petInfo}`);
    const router = useRouter();


    useEffect(() => {
        console.log('DEBUG SCHEDULE')
        console.log( item, petType, serviceSelected, petInfo, date, size);
    }, []);

    useEffect(() => {
        if (petType === 'dog') petType = 'dogs';
        if (petType === 'cat') petType = 'cats';
    }, [])

    const serv = `${serviceSelected}`.trim() as keyof typeof Data;
    let periodicity = () => {
        return Data[serv].payCycle;
    }

    const calcTime = (value: number) => {
        return Data[serv].billing * value;
    }

    const serviceDate = new Date(parseInt(`${date}`));
    const endServiceDate = new Date(serviceDate);
    endServiceDate.setTime(endServiceDate.getTime() + calcTime(parseInt(`${size}`)));
    
    const hero = item ? JSON.parse(`${item}`) : {}

    const generateUid = () => {
        const time = Number(new Date().getTime());
        return `C0${(Math.floor((Math.random() * Math.pow(32, 6)) + (Math.random() * Math.pow(32, 6) + time))).toString(32)}`;
    };

    const goBack = async () => {
        router.replace(`/hero/selecting?date=${encodeURIComponent(String(date))}&pet=${encodeURIComponent(String(petInfo).trim())}&service=${encodeURIComponent(String(serviceSelected).trim())}&size=${encodeURIComponent(String(size).trim())}&avoid=''`
        );       
    };

    const sendRequest = async () => {
        try {
            const data = {
                uid: generateUid(),
                service: String(serviceSelected).trim(),
                contractor: user,
                pet: pet,
                contractee: hero,
                date: {
                    start: serviceDate,
                    end: endServiceDate,
                },
                contractedAt: new Date(),
                description,
                price: hero.price[0][`${petType}`.trim()][`${serviceSelected}`.trim()] * parseInt(`${size}`)
            }
            const heroUser = await getUserByUid(hero?.uid);
            await addAttention(token, heroUser?._id, 'request', 'hero/accept', {
                contract: JSON.stringify(data),
                contractor: JSON.stringify(user),
                sendTime: String(new Date().getTime())
               });
               await methods.sendContractRequest(heroUser?._id, JSON.stringify(data));
               await methods.sendReminder(heroUser?._id, {contract: data, subject: 'reminder'});
            if (heroUser?.notification)
                await methods.sendPushNotification(heroUser?.notification, 'Pet Hero', 'Confirm service');
            router.replace(`/message?message=Successfully Filed!\n Waiting hero confirmation`);
        } catch (e) {
            console.log('error', e)
            router.replace(`/message?message=ERROR! Please try again later`);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', marginTop: latitudo(5), gap: altitudo(2) }}>
            <Text style={[styles.textDefault, { fontSize: altitudo(6), color: Colors.g1 }]}>
                Scheduling
            </Text>
            <Text style={[styles.textDefault,{ fontSize: altitudo(4), color: Colors.g3 }]}>
                {`${petType}`.substring(0, `${petType}`.length - 1)} {`${serviceSelected}`.trim()}
            </Text>
            <Text style={[styles.textDefault,{ fontSize: altitudo(2), color: Colors.g3 }]}>
            {size}{Number(size) === 1 ? ` ${periodicity()}`: ` ${periodicity()}s`}
            </Text>
            <Text style={[styles.textDefault,{ fontSize: altitudo(2), color: Colors.g3 }]}>
                {hero?.name} and {pet?.name}
            </Text>
            <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{margin: 'auto'}}>
                <UserStamp user={hero?.user} superUser={hero?.super}/>
            </View>
            <View style={{margin: 'auto'}}>
                <PetStamp pet={pet} />                            
            </View>
            </View>
            <Text style={{ fontFamily: 'mon-b', textAlign: 'center', fontSize: altitudo(2), color: Colors.g3 }}>
                {`In ${serviceDate.toLocaleString()}`}
            </Text>

            <Text style={{marginLeft: latitudo(5), marginBottom: -15, fontWeight: 'bold', color:'#888'}}>Extra Instructions:</Text>
            <TextInput
                numberOfLines={3}
                value={description}
                onChangeText={(value: string) => {setDescription(value)}}
                placeholder='Supporting instructions'
                style={styles.textInput}
            >
            </TextInput>

        <View style={{flexDirection: 'row'}}>
        <TouchableOpacity 
        onPress={goBack}
        style={{width: latitudo(40), height: altitudo(5), backgroundColor: Colors.primary, borderRadius: 10, margin: 'auto', marginTop: -10}}
        >
            <Text style={{fontFamily: 'mon-b', fontSize: latitudo(5), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        onPress={sendRequest}
        style={{width: latitudo(40), height: altitudo(5), backgroundColor: Colors.primary, borderRadius: 10, margin: 'auto', marginTop: -10}}
        >
            <Text style={{fontFamily: 'mon-b', fontSize: latitudo(5), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>Confirm</Text>
        </TouchableOpacity>

        </View>
        <View
        style={{backgroundColor: Colors.primary, position: "absolute", bottom: 0, height: altitudo(8),width: '100%', zIndex: 999999}}
        >
        </View>

        </View>
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
    textDefault: {
        fontFamily: 'mon-b', 
        textAlign: 'center', 
        marginBottom: -20,
    },
    textInput: {
        borderWidth: 1, 
        height: altitudo(10), 
        width: latitudo(90), 
        margin: 'auto', 
        marginTop: 0, 
        marginBottom: 0,
        borderRadius: 10, 
        borderColor: '#DDD',
        textAlign: 'center',
        verticalAlign: 'top'
    }
})

export default HeroSchedule