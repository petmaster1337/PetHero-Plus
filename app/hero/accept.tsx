import { API_ROOT_URL } from '@/config';
import { altitudo, Colors, latitudo, PRICE_PERCENTAGE } from '@/constants/Constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/providers/AuthProvider'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { getUserByHeroId, getUserByUid } from '@/services/user.service';
import { getPetById } from '@/services/pet.service';
import { Data, PayType } from '@/constants/Services';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { addAttention, removeAttention } from '@/services/attention.service';
import PetStamp from '@/components/PetStamp';

const HeroAccept = () => {
    const [ petInfo, setPetInfo ] = useState<any>();
    const [ changed, setChanged ] = useState<boolean>(false);
    const [ changePriceVisible, setChangePriceVisible ] = useState<boolean>(false);
    const { contract, contractor, sendTime } = useLocalSearchParams()
    const { user, token, services, methods } = useAuth();
    const [ justify, setJustify] = useState<string>('');
    const sharedHeight = useSharedValue(changePriceVisible ?  350: 40);
    const contractorObj = JSON.parse(`${contractor}`);
    const contractObj = JSON.parse(`${contract}`);
    const [ price, setPrice ] = useState<string>(String(Number(contractObj?.price) * (PRICE_PERCENTAGE)));
    const router = useRouter();
    
    useEffect(() => {
        const populatePet = async () => {
            const pet = await getPetById(`${contractObj?.pet?._id}`);
            setPetInfo(pet);    
        }
        const populatePrice = async () => {
            setPrice(String(Number(contractObj.price) * PRICE_PERCENTAGE));
        }
        populatePet();
        populatePrice();
    }, []);

    const periodicity = () => {
        const service = contractObj?.service;
        const serv = service as keyof typeof Data;
        return Data[serv].payCycle;
    }

    const getSize = () => {
        const end = contractObj?.date.end;
        const start = contractObj?.date.start;
        const service = contractObj?.service;
        const ms = new Date(end).getTime() - new Date(start).getTime();
        const serv = service as keyof typeof Data;
        const answer = Math.floor(ms / Data[serv].billing);
        return answer;
    }
    
    useEffect(() => {
    sharedHeight.value = withTiming(changePriceVisible ? 250 : 40, { duration: 600 });
    }, [changePriceVisible]);

    const changePrice = async () => {
        console.log('CHANGE PRICE')
        setChanged(true);
        setChangePriceVisible(false);
        setTimeout(async() => {
            await answerOffer(true, true);
        }, 200);
    }

    const togglePrice = () => {
        setChangePriceVisible(!changePriceVisible);
    }

    const updatePrice = (text: string) => {
        let managed = text.replace(/[^0-9.]/g, '');
        const parts = managed.split('.');
        if (parts.length > 2) {
            managed = parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
        }
        managed = Number(managed).toFixed(2);
        const match = managed.match(/^\d{0,3}(\.\d{0,2})?$/);
        if (match) {
            setPrice(managed);
        }
    }
 
    const answerOffer = async (accept: boolean, changedPrice: boolean = false) => {
        try {
                const newContract = {...contractObj};
                for (const item in newContract) {
                    if (typeof newContract[item] === "string" && 
                        (
                            newContract[item].startsWith("{") ||
                            newContract[item].startsWith("[")
                        )
                    ) {
                        newContract[item] = JSON.parse(newContract[item]);
                        for (const sub in newContract[item]) {
                            if (
                                typeof newContract[item][sub] === "string" &&
                                (
                                    newContract[item][sub].startsWith("{") ||
                                    newContract[item][sub].startsWith("[")
                                )                         
                            )
                            newContract[item][sub] = JSON.parse(newContract[item][sub]);
                        }
                    }
                }

                newContract.status = accept ? 'accepted': 'rejected';
            if (accept && !changedPrice) {
                const data = {
                    service: JSON.stringify(newContract), 
                    hero: JSON.stringify(user), 
                    pet: JSON.stringify(petInfo), 
                    contractor: JSON.stringify(contractorObj),
                    confirm: 'false',
                    justify: ''
                }
                await addAttention(
                    token, 
                    contractorObj._id, 
                    'request', 
                    '/user/openBill', 
                    data
                );
                ///


                ///
                await methods.sendContractRequest(contractorObj._id, JSON.stringify(data))
               await methods.sendReminder(contractorObj?._id, {contract: data, subject: 'reminder'});

            } else if (accept && changedPrice) {
                newContract.price = (Number(price) / PRICE_PERCENTAGE);
                const data = {
                    service: JSON.stringify(newContract), 
                    hero: JSON.stringify(user), 
                    pet: JSON.stringify(petInfo), 
                    contractor: JSON.stringify(contractorObj),
                    confirm: 'true',
                    justify: justify
                }
                await addAttention(
                    token, 
                    newContract?.contractor._id, 
                    "request" , 
                    "/user/accepts", 
                    {
                        contract: JSON.stringify(newContract),
                        contractee: JSON.stringify(user),                    
                        pet: JSON.stringify(petInfo), 
                        justify
                    }
                );

                await methods.sendContractRequest(newContract?.contractor?._id, JSON.stringify(data));
                await methods.sendReminder(newContract?.contractor?._id, {contract: data, subject: 'reminder'});

            } else {                
                const data = {
                        date: String(newContract?.date.start), 
                        service: String(newContract?.service), 
                        pet: JSON.stringify(petInfo), 
                        size: getSize(),
                        additional: String(newContract?.description),
                        avoid: JSON.stringify([newContract?.contractee._id])
                    }
                if (newContract?.contractee?.user?._id) {
                    await removeAttention(token, String(newContract?.contractee.user._id), String(newContract?.uid));
                } else {
                    const heroUser = await getUserByHeroId(newContract.contractee._id);
                    await removeAttention(token, String(heroUser._id), String(newContract?.uid));
                }
                await methods.sendContractRequest(newContract?.contractor?._id, JSON.stringify(data))
                await methods.sendReminder(newContract?.contractor?._id, {contract: data, subject: 'reminder'});
            }

            if (user?._id) {
                await removeAttention(token, user._id, newContract?.uid);
            }


            // TEST REAL NOTIFICATIONS
            if (contractorObj.notification)
                await methods.sendPushNotification(contractorObj.notification, 'Pet Hero', accept ? 'Service Accepted': 'Service Rejected');
            if (user?.notification)   
                await methods.sendPushNotification(user?.notification, 'Pet Hero', accept ? 'Service Accepted': 'Service Rejected');
            router.replace(`/message?message=Successfully Filed!\n Waiting confirmation`);
        } catch (e) {
            console.log('error', e);
            router.replace(`/message?message=ERROR! Please try again later`);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', marginTop: latitudo(5), gap: altitudo(2) }}>
                <Text style={[styles.textDefault, { fontSize: altitudo(4), color: Colors.g1 }]}>
                    Do You Accept
                </Text>
                <Text style={[styles.textDefault,{ fontSize: altitudo(2), color: Colors.g3 }]}>
                    {`To ${ contractObj?.service.substring(0, 1).toUpperCase() }${ contractObj?.service.substring(1).toLowerCase() } `}
                    {`${getSize()} ${getSize() === 1 ? periodicity() : periodicity() + 's'}`}
                </Text>
                <Text style={[styles.textDefault,{ fontSize: altitudo(2), color: Colors.g3 }]}>
                    With {petInfo?.name} for ${ Number(price).toFixed(2) }?
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <View style={{width: '100%', margin: 'auto', alignItems: 'center'}}>
                    <PetStamp pet={petInfo} />
                </View>
                </View>
                <Text style={{ fontFamily: 'mon-b', textAlign: 'center', fontSize: altitudo(2), color: Colors.g3 }}>
                {`Start: ${new Date(contractObj.date.start).toLocaleString()}`}
                {`\nEnd:   ${new Date(contractObj.date.end).toLocaleString()}`}
                </Text>
            <ScrollView style={{paddingBottom: 10, height: altitudo(50)}}>

                <View style={[styles.textInput, {marginBottom: 20}]} >
                    <Text style={[{textAlign: 'justify', color: '#8A8A8A', fontSize: latitudo(3.75), margin: 5}]}> 
                        {`Instructions:\n`}
                    </Text>
                    <Text style={[{paddingLeft: 25, textAlign: 'justify', color: '#5F5F5F', fontSize: latitudo(5)}]}> 
                        {`${contractObj?.description}`}
                    </Text>
                </View>

                <Animated.View style={{height: sharedHeight, overflow: 'hidden', marginBottom: 10, width: latitudo(90), marginLeft: latitudo(5)}}>
                <TouchableOpacity 
                    onPress={() => togglePrice()}
                    style={{width: '100%', height: altitudo(5), backgroundColor: Colors.primary, borderRadius: 10, margin: 'auto', marginTop:0 }}
                    >
                        <Text style={{fontFamily: 'mon-b', fontSize: latitudo(5), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>Change Price</Text>
                </TouchableOpacity>
                    <Text style={{marginLeft: 10, marginTop: 10, color: Colors.g2}}>Justification</Text>
                    <TextInput
                            placeholder={`Explain your reasons to change price` } 
                            value={ justify }
                            multiline={true}
                            onChangeText={(text)=>{setJustify(text)}}
                            style={{fontSize: 18, borderWidth: 1,borderRadius: 10, borderColor: Colors.g4, minHeight: 60, height: 'auto', paddingLeft: 10}}
                            keyboardType='default'
                            maxLength={150}
                    ></TextInput>

                    <View style={{flexDirection:'row', height: altitudo(40)}}>
                        <View style={{width: '50%', marginLeft: 10}}>
                            <Text style={{color: Colors.g2}}>New Price</Text>
                            <TextInput
                                placeholder={`${contractObj?.price.toFixed(2)}` } 
                                value={String(price)}
                                onChangeText={(text)=>{updatePrice(text)}}
                                style={{fontSize: 25, borderWidth: 1,borderRadius: 10, borderColor: Colors.g4, height: 50, paddingLeft: 10}}
                                keyboardType='numeric'
                            ></TextInput>
                        </View>
                        <TouchableOpacity 
                        onPress={() => changePrice()}
                        style={{width: latitudo(40), height: altitudo(5), backgroundColor: Colors.primary, borderRadius: 10, marginTop: 'auto', marginLeft: 'auto'}}
                        >
                            <Text style={{fontFamily: 'mon-b', fontSize: latitudo(5), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>Send</Text>
                        </TouchableOpacity>

                    </View>
                </Animated.View>

                {!changePriceVisible && (
                <View style={{flexDirection: "row"}}>
                    <TouchableOpacity 
                    onPress={() => answerOffer(false, false)}
                    style={{width: latitudo(40), height: altitudo(5), backgroundColor: Colors.primary, borderRadius: 10, margin: 'auto', marginTop: 0}}
                    >
                        <Text style={{fontFamily: 'mon-b', fontSize: latitudo(5), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                    onPress={ () => answerOffer(true, false)}
                    style={{width: latitudo(40), height: altitudo(5), backgroundColor: Colors.primary, borderRadius: 10, margin: 'auto', marginTop: 0}}
                    >
                        <Text style={{fontFamily: 'mon-b', fontSize: latitudo(5), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>Accept</Text>
                    </TouchableOpacity>

                </View>

                )}

            </ScrollView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    img: {
        aspectRatio: 1,
        width: latitudo(50),
        alignContent:'center',
        marginLeft: latitudo(25),
        marginRight: latitudo(25),
        borderRadius: latitudo(25),
        borderWidth: latitudo(2),
        borderColor: Colors.primary,
        elevation: 10,
    },
    textDefault: {
        fontFamily: 'mon', 
        textAlign: 'center', 
        fontSize: 13,
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1, 
        minHeight: altitudo(15),
        height: 'auto', 
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

export default HeroAccept