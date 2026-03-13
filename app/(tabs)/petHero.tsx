import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Platform, SafeAreaView, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from "@/providers/AuthProvider";
import { Image } from 'expo-image';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { AntDesign, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Icon from '@/components/CustomIcon';
import { Data, DataPropsIndex, PayType, priceTypes } from '@/constants/Services';
import { API_ROOT_URL } from '@/config';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import SetHeader from '@/components/default.menu';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const bleu = Platform.OS === 'ios' ? 40 : latitudo(4);
const SIZE_PETAVATAR_END = altitudo(14);
const sizeAvatars = (number: number) => {
    if (number <= 2) return latitudo(35); // 2*35 = 70 = 100 - 20 - 10
    if (number <= 4) return latitudo(30);
    if (number <= 6) return latitudo(27.5);
    if (number <= 10) return latitudo(17.5);
    if (number <= 12) return latitudo(15);
    else return latitudo(12);
}

let globalSize = 0;

const PetHero = () => {
    const router = useRouter();
    let { pets, neighbors, methods, expoPushToken, user } = useAuth();

    const petArray = [...pets];
    globalSize = petArray.length;
    const heroArray = [...neighbors]
    const initialTime = new Date();
    const [ stage, setStage ] = useState<number>(0);
    const [ selectedPet, setSelectedPet ] = useState<any>({})
    const [ petInfo, setPetInfo ] = useState<any>(null);
    const [ petType, setPetType ] = useState<string>('dogs');
    const [ pickerDisplay, setPickerDisplay ] = useState<"spinner" | "calendar" | "compact" | "default" | "inline" | "clock">('spinner');
    const [ repetitions, setRepetitions ] = useState<number>(1);
    const [ petServices, setPetServices ] = useState<DataPropsIndex[]>([]);
    const [ serviceSelected, setServiceSelected ] = useState<DataPropsIndex>('walk');
    const [ dateTime, setDateTime ] = useState<Date>(initialTime);
    const [ mode, setMode ] = useState<"date" | "time">('date');
    const [ show, setShow ] = useState(false);
    const [ periodicity, setPeriodicity ] = useState<PayType>("half hour");
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    useEffect(() => {
        updateLocation();
    }, []);

    const updateLocation = async () => {
        return new Promise(resolve => {
            try {
            methods.registerForPushNotificationsAsync();
            if (expoPushToken !== user?.notification) {
                methods.updateUser(user._id, { ...user, notification: expoPushToken });
            }
            resolve(true);
            } catch (error) {
            console.log('Error', error);
            resolve(false);
            }
        });
    };
    
    const nextButton = (next: number) => {
        return (
            <TouchableOpacity
                onPress={()=> setStage(next)}
                style={{position: 'relative', marginTop: 10}}
                >
                    <View style={{flexDirection: "row", backgroundColor: Colors.primary, width: latitudo(40), borderColor: Colors.g3, borderWidth: 1, marginLeft: 'auto', marginRight: latitudo(5), borderRadius: 8}}>
                        <Text style={{color: 'white', fontSize: latitudo(6), fontWeight: 'bold', margin: 10}}>Next</Text>
                        <FontAwesome name="check" size={altitudo(3.5)} color={'white'} style={{margin: 10}}/>
                    </View>
            </TouchableOpacity>
        )
    }

    function onPetSelection(pet: any) {
        if (pet) {
            setSelectedPet(pet);
        } else {
            setSelectedPet({});
        }
        setPetInfo(pet);
    };

    function getMessage (number: number) {
        if (number === 0) return "There are no heroes";
        if (number === 1) return "There is one hero";
        return `There are ${number} heroes`;
    }

    function serviceAvailable(type: "dog" | "cat"): any {
        priceTypes.dogs.sort((a, b) => a > b ? -1: 1);
        priceTypes.cats.sort((a, b) => a > b ? -1: 1);
        setPetType(`${type}s`);
        return priceTypes[`${type}s`];
    }

    useEffect(() => {
        if (selectedPet.hasOwnProperty('type')) {
            const type = selectedPet.type;//dog/cat
            const serv = serviceAvailable(type);
            setPetServices(serv);    
        }
    }, [selectedPet])

    useEffect(() => {
        if (Platform.OS === 'ios' ||Platform.OS === 'macos') {
            setPickerDisplay("compact");
        }
    }, []);

    const showMode = (currentMode: "date" | "time") => {
        setShow(true);
        setMode(currentMode);
      };
    
      const showDatepicker = () => {
          showMode('date');
      };

    function petSelection() {
        if (!selectedPet.hasOwnProperty('uid')) return (
            <View style={styles.petSelectionMain}>

                <Text style={styles.text}>Which <Text style={styles.textBig}>Pet</Text> needs a Hero?</Text>

                <View style={styles.contArray}>
                    {petArray.map((pet: any) => (
                        <TouchableOpacity
                            key={pet.uid}
                            style={styles.contPets}
                            onPress={() => onPetSelection(pet)}
                        >
                            <Image
                                key={`${pet.uid}-pet`}
                                source={`${pet?.image}?ts=${Date.now()}`}
                                style={styles.img}
                            />
                            <Text style={{ maxWidth: sizeAvatars(globalSize), fontFamily: 'mon', fontSize: altitudo(2) }} numberOfLines={1} >{pet.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </View>
        )

        else return (
            <View style={styles.petSelectedMain}>

                <Pressable
                    style={{ flexDirection: 'row', gap: "auto" }}
                    onPress={() => onPetSelection(null)}
                >
                    {/* */}
                    <Image
                        style={[styles.petSelected]}
                        source={`${petInfo?.image}?ts=${Date.now()}`}
                    />
                    <View style={{ width: SIZE_PETAVATAR_END - latitudo(5) }} />
                    <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: altitudo(0.5) }}>

                        <Text style={{ fontFamily: 'mon-sb', width: '80%', textAlign: 'center', fontSize: altitudo(3), color: Colors.bg }} numberOfLines={1}>{petInfo.name}</Text>

                        <View style={{ flexDirection: 'row', gap: latitudo(1) }}>
                            <View style={{ flexDirection: 'row', marginLeft: 25, alignItems: 'flex-end' }}>
                                <Icon provider='FontAwesome6' name={petInfo.type === 'dog' ? 'dog' : 'cat'} size={altitudo(1.5)} color={Colors.bg} style={[styles.badges, styles.badgesBords]} />
                                <Icon provider='FontAwesome6' name={petInfo.sex === 'male' ? 'mars' : 'venus'} size={altitudo(1.5)} color={Colors.bg} style={[styles.badges, styles.badgesBords]} />
                                <View style={[styles.badges, styles.badgesBords]}><Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1.5), color: Colors.bg }}>{petInfo.size}</Text></View>
                            </View>
                            <View style={{ flex: 1 }} />
                            <View>
                                <View style={[styles.badges]}><Text style={{ fontFamily: 'mon', fontSize: altitudo(1.25), color: Colors.bg }}>{petInfo.cat_friendly ? 'cat-friendly' : null}</Text></View>
                                <View style={[styles.badges]}><Text style={{ fontFamily: 'mon', fontSize: altitudo(1.25), color: Colors.bg }}>{petInfo.dog_friendly ? 'dog-friendly' : null}</Text></View>
                            </View>
                        </View>
                    </View>
                </Pressable >
            </View>
        )
    };
    
    const onChangeTime = ( e: DateTimePickerEvent) => {
        let time = e.nativeEvent.timestamp;
        const selectedDate: Date = new Date(time) || new Date();
        setShow(Platform.OS === 'ios');
        setDateTime(selectedDate);
        if (mode === 'date') {
            showMode('time');
        }
        return true;
    };

    const setIconsSize = () => {
        return petType === "dogs" ? latitudo(7): latitudo(14);
    }

    function onServiceSelection(service: DataPropsIndex) {
        setPeriodicity(Data[service].payCycle)
        setServiceSelected(service);
    };
    
    function serviceSelection() {

        return (
            <View style={{width: latitudo(100), flex: 1, flexDirection: 'column'}}>
                    <Text style={{position: 'relative', fontFamily:'mon', fontSize: latitudo(7), height: 50, fontWeight: 'bold', display:'flex', backgroundColor: Colors.primary, color: Colors.bg, textAlign: 'center', marginLeft: latitudo(5), marginBottom: latitudo(2), paddingTop: 5, marginTop: latitudo(2), width: '90%', borderRadius: 20 }}>Select Service</Text>

                    {petServices.map((serv: DataPropsIndex, _index: number) => (
                        <View key = {serv} style={[ styles.contServices, serviceSelected === serv ? {height: 120}:{height: 70} ]}>
                            <TouchableOpacity style={{ gap: altitudo(1), flexDirection: 'column', width: '100%' }} onPress={() => { onServiceSelection(serv) }}>
                                <Animated.View  style={[ styles.serviceImage ]}>
                                        <Icon provider={Data[serv].provider} name={Data[serv].icon} color={serviceSelected === serv ? Colors.primary : 'white'} size={setIconsSize()} style={serviceSelected === serv ? styles.services : styles.servicesOff} />
                                        <Text style={{ fontFamily: 'mon-b', fontSize: altitudo(3), color: serviceSelected === serv ? 'white' : Colors.g5, marginTop: 5 }}> { serv } </Text>
                                </Animated.View>
                                <Text style={{ fontSize: 14, color: 'white', textAlign: 'center', width: '100%'}}>{ Data[serv].description }</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                {/* </View> */}
            {!serviceSelected ? null: nextButton(1)}
            </View>
        )
    };

    const selectHero = () => {
        router.push({
            pathname: "/hero/selecting",
            params: {
            date: dateTime.getTime(),
            pet: JSON.stringify(petInfo),
            service: serviceSelected,
            size: repetitions,
            avoid: JSON.stringify([]),
            },
        });    
    }
    
    const handleTextChange = (newValue: string) => {
        if (/^\d*$/.test(newValue)) { 
          if (newValue === "") {
            setRepetitions(0);
          } else {
            setRepetitions(parseInt(newValue));
          }
        }
      };

    return (
        <SafeAreaProvider style={styles.conteiner1}>
            <SetHeader title="Asking for a Hero" style={{marginTop: 0}} />

            {/* absolute BOTTOM SWIPER */}
            {selectedPet.hasOwnProperty('uid') ? null :
                <View style={{ position: 'absolute', bottom: altitudo(22.5), width: '100%', alignItems: 'center' }} >
                    <Text style={{ fontFamily: 'mon', fontSize: altitudo(1.5) }}><Text style={{ fontFamily: 'mon-sb', width: 'auto' }}>{getMessage(heroArray.length)}</Text> around you{heroArray.filter(item => item.super).length ? ',' : null}</Text>
                    {!heroArray.filter(item => item.super).length ? null : <Text style={{ fontFamily: 'mon', fontSize: altitudo(1.5) }}>and <Text style={{ fontFamily: 'mon-b' }}>{heroArray.filter(item => item.super).length} super heroes</Text> available!</Text>}
                </View>
            }

            {/* MAIN COMPONENTS */}
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: altitudo(10 + 10) }} showsVerticalScrollIndicator={false}>

                {/* PET */}
                {petSelection()}

                {/* SERVICES */}
                {stage === 0 && (
                    selectedPet.hasOwnProperty('uid') && serviceSelection()
                )}

                {/* SELECT TIME */}
                {stage === 1 && (
            <View style={{marginTop: 20, height: 'auto', alignContent: 'center', alignSelf: 'center', alignItems: 'center'}}>
                <TouchableOpacity 
                onPress={showDatepicker}
                style={{backgroundColor: Colors.primary, width: latitudo(90), height: altitudo(10), borderRadius: 20, margin: 'auto', marginTop: latitudo(2)}}
                >
                    { dateTime > today ?
                    <Text style={{fontFamily: 'mon-b', fontSize: latitudo(7), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>
                        {dateTime.toLocaleString()}
                    </Text>                    
                    :
                    <Text style={{ fontFamily: 'mon-b', fontSize: latitudo(7), height: '100%', fontWeight: 'bold', color: 'white', textAlign: 'center', verticalAlign:'middle'}}>When do you need it?</Text>
                    } 
                </TouchableOpacity>
                {show && (
                    <View style={{ backgroundColor: 'white', width: '100%', alignContent: 'center', alignItems:'center'}}>
                        <DateTimePicker
                            testID="dateTimePicker"
                            style={{backgroundColor: Colors.g4, opacity: 1, flex: 1, alignSelf: 'auto', alignContent: 'center', alignItems:'center', margin: 'auto'}}
                            value={dateTime}
                            minimumDate={today}
                            maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                            mode={mode}
                            is24Hour={true}
                            textColor='black'
                            accentColor='black'
                            onChange={(e) => onChangeTime(e)}
                            negativeButton={{label: 'Cancel', textColor: 'red'}}
                            display={ pickerDisplay }
                            minuteInterval={30}
                        />
                  </View>
                )}
                    
                {today >=dateTime ? null : //nextButton()
                <TouchableOpacity
                    style={{backgroundColor: Colors.primary, borderRadius: 20, width: latitudo(90), height: latitudo(15), marginTop: latitudo(5)}}
                    onPress={selectHero}
                    >
                        <Text style={{ textAlign: 'center', verticalAlign: 'middle', height: '100%', fontSize: 20, color: 'white', fontWeight: 'bold'}}> Choose Hero </Text>
                </TouchableOpacity>
            }

            </View>
        )}
{/* 
        {stage === 2 && (
            <View>
                <View
                    style={{backgroundColor: Colors.primary, width: latitudo(90), borderRadius: 20, margin: 'auto', marginTop: 20, marginBottom: 20, paddingTop: latitudo(4), paddingBottom: latitudo(4)}}
                >
                    <Text
                        style={{color:'white', display: 'flex', width: latitudo(90), textAlign:'center',  flexDirection: 'row', fontSize: latitudo(6), fontWeight: 'bold'}}
                    >How many {periodicity}s</Text>
                    <TextInput
                        style={{backgroundColor: '#F0F0F0', width: '80%', margin: 'auto', borderWidth: 1, borderColor: Colors.g3, fontSize: latitudo(6), fontWeight: 'bold', textAlign: 'center', borderRadius: 10}}
                        value={String(repetitions)}
                        onChangeText={(newValue) => { handleTextChange(newValue) }}
                        placeholder="Enter a number"
                        placeholderTextColor={Colors.g3}
                        autoCorrect={false}
                        multiline
                        maxLength={30}
                        keyboardType='numeric'
                    >
                    </TextInput>
                </View>
                <TouchableOpacity
                    style={{backgroundColor: Colors.primary, borderRadius: 20, width: latitudo(90), marginLeft: latitudo(5), height: latitudo(15), marginTop: latitudo(1)}}
                    onPress={selectHero}
                    >
                        <Text style={{ textAlign: 'center', verticalAlign: 'middle', height: '100%', fontSize: 20, color: 'white', fontWeight: 'bold'}}>{serviceSelected === 'walk'? 'Details': 'Choose Hero' }</Text>
                </TouchableOpacity>
            </View>
        )} */}
            </ScrollView>
        </SafeAreaProvider>
    )
}



const styles = StyleSheet.create({
    conteiner1: {
        flex: 1,
        backgroundColor: Colors.bg,
        color: '#000000'
        // alignItems: 'center'
    },
    contHeader: {
        width: '100%',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        height: altitudo(8),
        paddingTop: 10,
    },
    contArray: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        // justifyContent:'space-around',
        // justifyContent:'space-between',
        // justifyContent:'space-evenly',
        gap: latitudo(1)
    },

    contPets: {
        alignItems: 'center',
        marginVertical: latitudo(2),
        marginHorizontal: latitudo(1),
        paddingVertical: latitudo(1),
        paddingHorizontal: latitudo(1),
        borderColor: Colors.g1,
        // backgroundColor: Colors.g1,
        // backgroundColor: Colors.white,
        // paddingVertical: altitudo(1),
        // borderWidth: StyleSheet.hairlineWidth,
        // borderRadius: sizeAvatars() / 4,
        // elevation: 2,
    },
    petSelected: {
        aspectRatio: 1,
        width: SIZE_PETAVATAR_END,
        borderRadius: SIZE_PETAVATAR_END,
        borderWidth: latitudo(1.25),
        borderColor: Colors.primary,
        position: 'absolute',
        top: 3,
        left: -10
    },
    badges: {
        paddingHorizontal: latitudo(1),
        height: latitudo(5),
        minWidth: latitudo(5),
        borderRadius: latitudo(1.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgesBords: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.bg,
    },
    contServices: {
        transitionDuration: '2000',
        transitionDelay: '10',
        overflow: 'hidden',
        flexBasis: 'auto',
        position: 'relative',
        width: '90%',
        marginTop: altitudo(2),
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'flex-start',
        height: 70,
        backgroundColor: Colors.primary,
        paddingHorizontal: 'auto',
        paddingVertical: 'auto',
        margin: 'auto'
    },

    serviceImage: {
        flexDirection: 'row',
    },
    services: {
        alignItems: 'center',
        justifyContent: 'center',
        width: altitudo(8),
        margin: 5,
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: Colors.golden,
        borderRadius: altitudo(50),
        backgroundColor: 'white',
    },
    servicesOff: {
        alignItems: 'center',
        justifyContent: 'center',
        width: altitudo(8),
        aspectRatio: 1,
        borderColor: Colors.g5,
        borderRadius: latitudo(50),
    },

    petSelectionMain: {
        paddingTop: altitudo(5),
        gap: altitudo(2),
        alignItems: 'center',
        paddingHorizontal: latitudo(2.5),
    },
    petSelectedMain: {
        backgroundColor: Colors.primary,
        paddingHorizontal: latitudo(2.5),
        marginHorizontal: latitudo(5),
        borderRadius: latitudo(5),
        marginVertical: altitudo(5),
        position: 'relative'
    },
    img: {
        aspectRatio: 1,
        width: sizeAvatars(globalSize),
        // borderRadius: sizeAvatars() / 2,
        borderRadius: sizeAvatars(globalSize) / 2,
        borderWidth: latitudo(2),
        // borderWidth:30,
        borderColor: Colors.primary,
        elevation: 10,
    },

    text: {
        fontFamily: 'mon',
        fontSize: altitudo(2),
        color: Colors.g1,
    },
    textBig: {
        fontFamily: 'mon-b',
        fontSize: altitudo(3)
    },

})

export default PetHero