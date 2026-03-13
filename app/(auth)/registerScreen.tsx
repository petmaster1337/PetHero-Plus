// Updated RegisterScreen
// Maintains all existing behavior and ADDS a State selection step before City

import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, altitudo, latitudo } from '@/constants/Constants';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider';
import { createUser, isUsedEmail } from '@/services/user.service';
import { getToken } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { uploadImage } from '@/services/event.service';
import * as Location from "expo-location";

const RegisterScreen = () => {
    const SIZE_HEADER = altitudo(10);
    const router = useRouter();
    const { methods } = useAuth();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    // NEW
    const [stateRegion, setStateRegion] = useState('');
    const [showStateModal, setShowStateModal] = useState(false);

    const US_STATES = [
        'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
        'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
        'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
        'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
        'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
    ];

    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [ field_email_color, setField_email_color] = useState(Colors.black);
    const [ field_editable, setField_editable] = useState(true);
    const [lat, setLat] = useState(122.000234);
    const [long, setLong] = useState(-41.012232);
    const [image, setImage] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [uid, setUid] = useState<string>('');
    const [stage, setStage] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const generateUid = () => {
        const time = Number(new Date().getTime());
        return (Math.floor((Math.random() * Math.pow(32, 6)) + (Math.random() * Math.pow(32, 6)) + (Math.random() * Math.pow(32, 6) + time))).toString(32);
    };
    const getUserUid = async () => {
        setUid(generateUid());
        return Promise.resolve(true);
    }

    const pickImage = async () => {
        const token = await getToken();
        if (uid.length < 3) {
            await getUserUid();
        }
        let newImage: any = await uploadImage("user", uid, `${token}`);
        if (newImage) {
            setImage('');
            setTimeout(() => {
                setImage(newImage);
            }, 20);
        }

    }

    const manageImage = () => {
        setStage(3);        
    }

    const goBack = () => {
        router.replace("/(auth)/loginScreen");
    }

    // const getCurrentLocation = async () =>{
    //     let { status } = await Location.requestForegroundPermissionsAsync();
    //     let newLocation = await Location.getCurrentPositionAsync({});
    //     setLat(newLocation.coords.latitude)
    //     setLong(newLocation.coords.longitude)
    // }
    
    const setAnyLocation = () => {
        setLat(0.00);
        setLong(0.00);
    }
    useEffect (() => {
        setUid(generateUid());
    }, []);

    useEffect(() => {
        setAnyLocation();
    }, [image])

    const emailCheck = async () => {
        if (email.match(/^[a-z0-9._%+-]+\@[a-z0-9.-]+\.[a-z]{2,10}$/i)) {
        const used = await isUsedEmail(email);
            if (used) {
                setField_editable(false);
                setField_email_color(Colors.redish);
                let tempMail = email;
                setEmail('Email Already Used!');
                setTimeout(() => {
                    setEmail(tempMail);
                    setField_editable(true);
                    setField_email_color(Colors.black);
                }, 1500);

            } else {
                setStage(8);
            }
        } else {
                setField_editable(false);
                setField_email_color(Colors.redish);
                let tempMail = email;
                setEmail('Invalid Email!');
                setTimeout(() => {
                    setEmail(tempMail);
                    setField_editable(true);
                    setField_email_color(Colors.black);
                }, 1500);
        };
    }
    const insertUser = async () => {
        if (!uid) {
            await getUserUid()
        }
            let user = {
                token: '',
                uid: uid,
                name,
                state: stateRegion,
                city,
                address,
                lat,
                long,
                image,
                email,
                password,
                phone,
                history: []
            };
            createUser(user)
            .then((answer) => {
                AsyncStorage.setItem('user', JSON.stringify(user));
                methods.setUser(answer);
                router.replace('/(tabs)');
            });
    };


    return (
        <SafeAreaView style={Platform.OS === 'android' ? [styles.container, { paddingTop: SIZE_HEADER }] : styles.container}>
            <StatusBar style='dark' animated />

                <View style={{ flex: 65, gap: altitudo(2) }}>
                {stage === 1 ? ( 

                    <View style={styles.contW}>
                        <View style={styles.contWRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.textH2}>Name</Text>
                            </View>
                            <View style={{ flex: 8, flexDirection: 'row', gap: altitudo(2) }}>
                                <TextInput
                                    style={styles.textName}
                                    value={name}
                                    onChangeText={(newValue) => { setName(newValue) }}
                                    placeholder="enter your name"
                                    placeholderTextColor={Colors.g3}
                                    autoCorrect={false}
                                    multiline
                                    maxLength={30}
                                    keyboardType='default'
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => { setStage(2) }}>
                                    {!name || name.length < 5 ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>

                ): stage === 2 ? ( 
                    <View style={styles.contW}>
                        <View style={styles.contWRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.textH2}>Profile Picture</Text>
                                    <TouchableOpacity onPress={pickImage} style={{margin: 'auto', borderRadius: 4, backgroundColor: Colors.primary, width: 300, height: 40, paddingTop: 5}}>
                                    <Text style={{width: 300, height: 40, fontSize: 20, textAlign: 'center'}}>Select Image</Text>
                                    </TouchableOpacity>
                                    {image && (
                                    <View>
                                        <Image source={{ uri: `${image}?ts=${Date.now()}` }} style={{ width: 300, height: 300, marginLeft: 'auto', marginRight: 'auto', marginTop: 10, marginBottom: 10 }} />
                                        <TouchableOpacity onPress={manageImage} style={{margin: 'auto', borderRadius: 4, backgroundColor: Colors.primary, width: 300, height: 40, paddingTop: 5}}>
                                            <Text style={{width: 300, height: 40, fontSize: 20, textAlign: 'center'}}>Send Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                    )}
                        </View>
                    </View>
                </View>

                ): stage === 3 ? ( 

                    // NEW STEP: STATE / REGION (PRODUCTION SELECTOR)
                    <View style={styles.contW}>
                        {!showStateModal ? (
                        <View style={styles.contWRow}>
                                <Text style={[styles.textH2, {width: latitudo(15), color: Colors.black}]}>State</Text>
                                <TouchableOpacity
                                    style={[{flexDirection: 'row', width: latitudo(45), height: 40, borderWidth: 1, borderColor: Colors.g4, borderRadius: 9}]}
                                    onPress={() => setShowStateModal(true)}
                                >
                                    <Text style={[styles.dropdownText, {color: Colors.black, margin: 10}]}>
                                        {stateRegion || 'Select State'}
                                    </Text>
                                    <FontAwesome name="chevron-down" size={altitudo(2)} color={Colors.black} style={{alignSelf: 'center', marginLeft: 'auto', marginRight: 6 }}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setStage(4) }} style={{marginLeft: 'auto'}}>
                                    {!stateRegion ? null : <FontAwesome name="check" size={altitudo(4)} color='black'/>}
                                </TouchableOpacity>
                        </View>

                        ) : (
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalCard}>
                                    <Text style={styles.modalTitle}>Select your state</Text>

                                    <View style={styles.modalGrid}>
                                        {US_STATES.map((st) => (
                                            <TouchableOpacity
                                                key={st}
                                                style={styles.modalOption}
                                                onPress={() => {
                                                    setStateRegion(st);
                                                    setShowStateModal(false);
                                                }}
                                            >
                                                <Text style={styles.modalOptionText}>{st}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                    
                ): stage === 4 ? ( 

                    // CITY (shifted from stage 3)
                    <View style={styles.contW}>
                        <View style={styles.contWRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.textH2}>City</Text>
                            </View>
                            <View style={{ flex: 8, flexDirection: 'row', gap: altitudo(2) }}>
                                <TextInput
                                    style={styles.textName}
                                    value={city}
                                    onChangeText={(newValue) => { setCity(newValue) }}
                                    placeholder="Your City"
                                    placeholderTextColor={Colors.g3}
                                    autoCorrect={false}
                                    multiline
                                    maxLength={50}
                                    keyboardType='default'
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => { setStage(5) }}>
                                    {!city || city.length < 4 ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                ): stage === 5 ? ( 

                    <View style={styles.contW}>
                        <View style={styles.contWRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.textH2}>Address</Text>
                            </View>
                            <View style={{ flex: 8, flexDirection: 'row', gap: altitudo(2) }}>
                                <TextInput
                                    style={styles.textName}
                                    value={ address }
                                    onChangeText={(newValue) => { setAddress(newValue) }}
                                    placeholder="123 Street"
                                    placeholderTextColor={Colors.g3}
                                    autoCorrect={false}
                                    multiline
                                    numberOfLines={2}
                                    maxLength={100}
                                    keyboardType='default'
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => { setStage(6) }}>
                                    {!address || address.length < 2 ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                ): stage === 6 ? (

                    <View style={styles.contW}>
                        <View style={styles.contWRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.textH2}>Phone</Text>
                            </View>
                            <View style={{ flex: 8, flexDirection: 'row', gap: altitudo(2) }}>
                                <TextInput
                                    style={styles.textName}
                                    value={phone}
                                    onChangeText={(newValue) => { setPhone(newValue) }}
                                    placeholder="Your Phone"
                                    placeholderTextColor={Colors.g3}
                                    autoCorrect={false}
                                    multiline
                                    maxLength={30}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => { setStage(7) }}>
                                    {!phone || phone.length < 8 ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                ): stage === 7 ? (

                    <View style={styles.contW}>
                        <View style={styles.contWRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.textH2}>Email</Text>
                            </View>
                            <View style={{ flex: 8, flexDirection: 'row', gap: altitudo(2) }}>
                                <TextInput
                                    style={[styles.textName,{color: field_email_color}]}
                                    value={email}
                                    onChangeText={(newValue) => { setEmail(newValue.toLowerCase()) }}
                                    placeholder="Your Email"
                                    autoCorrect={false}
                                    multiline
                                    editable={field_editable}
                                    maxLength={200}
                                    keyboardType="email-address"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => { emailCheck() }}>
                                    {!email || email.length < 8 ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                ): stage > 7 ? (
                    <View>
                        <View style={styles.contW}>
                            <View style={styles.contWRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.textH2}>Password</Text>
                                </View>
                                <View style={{ flex: 8, flexDirection: 'row', gap: altitudo(2) }}>
                                    <TextInput
                                        style={[styles.textName,{ marginLeft: 25}]}
                                        value={showPassword ? password: `${password}`.replace(/[a-zA-Z0-9]/g,`*`)}
                                        onChangeText={(newValue) => {showPassword ? setPassword(newValue): 
                                            newValue[newValue.length - 1] === '*' ? setPassword(password.substring(0, newValue.length)) :
                                            setPassword(password + newValue[newValue.length - 1])
                                         }}
                                        placeholder="Your Password"
                                        placeholderTextColor={Colors.g3}
                                        autoCorrect={false}
                                        multiline={false}
                                        secureTextEntry={!showPassword}
                                        maxLength={50}
                                        keyboardType="visible-password"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(prev => !prev)}
                                        style={{ paddingHorizontal: altitudo(1) }}
                                    >
                                        <FontAwesome
                                        name={showPassword ? 'eye' : 'eye-slash'}
                                        size={altitudo(2.5)}
                                        color={Colors.g2}
                                        style={{marginTop: 15}}
                                    />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity onPress={() => { setStage(9) }}>
                                        {!password || password.length < 6 ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {stage ===9 ?(
                        <TouchableOpacity
                            style={ (!name || !stateRegion || !city || !address || !email || !phone || !password) ? [styles.buttonAdduser] : styles.buttonAdduser}
                            onPressOut={insertUser}
                            disabled={(!name || !stateRegion || !city || !address || !email || !phone ||!password) ? true : false}
                        >
                            <Text style={styles.textButton}> Add User </Text>
                        </TouchableOpacity>
                        ):null}
                    </View>
                ) : null 
                }
                    <View style={{marginTop: 50, marginLeft: 10}}>
                        <TouchableOpacity
                            onPressOut={goBack}
                        >
                            <Text style={{fontSize: altitudo(2.15), color: Colors.primary, fontWeight: 'bold'}}>Return</Text>
                        </TouchableOpacity>
                    </View>

            </View>


        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: latitudo(5),
    },

    contCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: latitudo(2),
        borderColor: Colors.g3,
        borderRadius: latitudo(5),
        paddingTop: altitudo(1),
        paddingBottom: altitudo(2),
        backgroundColor: 'white',
    },

    buttonTag: {
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: altitudo(1.618),
        marginTop: altitudo(1),
        borderRadius: altitudo(1)
    },

    contW: {
        width: '100%',
        backgroundColor: 'white',
        paddingHorizontal: latitudo(5),
        borderRadius: altitudo(3),
        paddingVertical: altitudo(2 * 1.618),
        gap: altitudo(2),
        borderWidth: StyleSheet.hairlineWidth,
        padding: latitudo(2),
    },
    
    contWOff: {
        backgroundColor: Colors.g4,
        borderWidth: StyleSheet.hairlineWidth,
    },

    contWRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    contButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: altitudo(5),
        backgroundColor: 'white',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        gap: altitudo(1),
        elevation: 4,
    },

    contButtonActive: {
        backgroundColor: 'black',
        borderWidth: 0,
        elevation: 1,
    },

    buttonAdduser: {
        alignSelf: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        marginVertical: altitudo(5),
        width: '61.8%',
        backgroundColor: Colors.primary,
    },

    textH2: {
        fontFamily: 'mon-b',
        fontSize: 14,
        width: 75,
    },

    textUsertype: {
        fontFamily: 'mon',
        color: Colors.g2,
        fontSize: 14,
    },

    textButton: {
        fontFamily: 'mon-sb',
        color: 'white',
        fontSize: altitudo(1.6),
    },

    textTag: {
        fontFamily: 'mon',
        fontSize: altitudo(1.6),
    },

    textName: {
        textAlign: 'center',
        color: 'black',
        fontSize: altitudo(3),
        fontFamily: 'mon',
        flex: 1,
    },

    // DROPDOWN / MODAL STYLES
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.g3,
        borderRadius: 12,
        paddingVertical: altitudo(1.2),
        paddingHorizontal: altitudo(2),
        textAlign: 'left',
        width: '100%',
        backgroundColor: 'white',
    },

    dropdownText: {
        fontFamily: 'mon',
        fontSize: altitudo(2),
        color: Colors.g2,
    },

    modalOverlay: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    modalCard: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: altitudo(2),
        elevation: 10,
        height: 'auto',
        marginBottom: -5,
    },

    modalTitle: {
        fontFamily: 'mon-b',
        fontSize: 18,
        textAlign: 'center',
        padding: 0,
        height: 60,
    },

    modalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: altitudo(1),
    },

    modalOption: {
        width: 40,
        height: 25,
        paddingTop: 2.5,
        marginTop: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.g2,
        borderRadius: 10,
        alignItems: 'center',
    },

    modalOptionText: {
        fontFamily: 'mon-sb',
        fontSize: 13,
        color: Colors.black,
    },

    modalClose: {
        marginTop: altitudo(2),
        alignSelf: 'center',
        paddingVertical: altitudo(1),
        paddingHorizontal: altitudo(4),
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },

    modalCloseText: {
        fontFamily: 'mon-sb',
        color: 'white',
        fontSize: altitudo(1.8),
    },
});

export default RegisterScreen;
