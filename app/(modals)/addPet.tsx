import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Colors, altitudo, latitudo  } from '@/constants/Constants';
import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_ROOT_URL } from '@/config';
import { createPet } from '@/services/pet.service';
import { uploadImage } from '@/services/event.service';



const ModalAddPet = () => {
    const SIZE_HEADER = altitudo(10);
    const router = useRouter();
    const { user, token, pets, methods } = useAuth();
    const [pet_name, setPet_name] = useState<string | null>(null);
    const [image, setImage] = useState('');
    const [pet_type, setPet_type] = useState<string | null>(null);
    const [pet_size, setPet_size] = useState<'small' | 'medium' | 'large' | null>(null);
    const [pet_sex, setPet_sex] = useState<'M' | 'F' | null>(null);
    const [stage, setStage] = useState(1);
    const [canSend, setCanSend] = useState<boolean>(false);
    const [uid, setUid] = useState<string>('');

    const getPermissions = async () => {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        return true;
    };

    useEffect(() => {
        getPermissions();
    },[]);

    const generateUid = () => {
        const time = Number(new Date().getTime());
        return (Math.floor((Math.random() * Math.pow(32, 6) + time))).toString(32);
    };

    const pickImage = async () => {
        if (!uid) {
            setUid(generateUid());
        }
        setTimeout(async () => {
            let newImage: any = await uploadImage("pet", uid, token);
            if (newImage) {
                setImage(newImage);
            }
            setStage(3);

        }, 10);
    }

    const sendPet = async () => {
        if (user.uid && pet_name && pet_type && pet_size && pet_sex) {
        if (!uid) {
            setUid(generateUid());
        }        
        const pet = {
            uid: uid,
            name: pet_name,
            type: pet_type,
            size: pet_size,
            sex: pet_sex,                  
            image,          
            owner: user.uid,
            history: [],
            description: ''
        }
        createPet(pet, token)
        .then((answer: any) => {
            const newList = [...pets];
            newList.push(pet)
            methods.setPets(newList);
            router.replace('/(tabs)');
        })
        .catch((error: any) => {
            alert('Error: Please try again later!');
        });
        }
    };

    function nameSize() {
        let l1 = 7;
        let l2 = 9;
        let f1 = 1.618 * 3;
        let q = 0.618;

        return (
            (!pet_name) ? null :
                ((pet_name?.length <= l1) ? { color: 'black', fontSize: altitudo(f1), fontFamily: 'mon-sb' } :
                    ((pet_name?.length <= l2) ? { color: 'black', fontSize: altitudo(4), fontFamily: 'mon-sb' } :
                        { color: 'black', fontSize: altitudo(3), fontFamily: 'mon-sb' }))
        )
    }

    useEffect(() => {
        setCanSend((pet_type !== null && pet_size !== null && pet_sex !== null));
    }, [pet_name, pet_sex, pet_size, pet_type, image]);

    return (
        <SafeAreaView style={Platform.OS === 'android' ? [styles.container, { paddingTop: SIZE_HEADER }] : styles.container}>

            <View style={{ flex: 35, justifyContent: 'center' }}>
                <View style={styles.contCard}>
                    <View style={{ alignItems: 'center', paddingHorizontal: latitudo(2) }}>
                        {!pet_type ? (
                            <MaterialIcons name="pets" size={altitudo(12)} color={Colors.g3} />
                        ) : (
                            (image ? 
                                <TouchableOpacity 
                                onPress={() => { pickImage() }} >
                                    <Image 
                                        source={{ uri: `${image}?ts=${Date.now()}` }} 
                                        style={{ width: 125, height: 125, borderRadius: 62, marginLeft: 'auto', marginRight: 'auto', marginTop: 10, marginBottom: 10 }}
                                    />
                                    <Text style={{ fontSize: altitudo(1.4), textAlign: 'center' }}>click to upload Image</Text>
                                </TouchableOpacity>
                            : (
                                <TouchableOpacity onPress={() => { pickImage() }} >
                                    <FontAwesome5 name={pet_type} size={altitudo(12)} color={Colors.g3} />
                                    <Text style={{ fontSize: altitudo(1.4), textAlign: 'center' }}>click to upload Image</Text>
                                    </TouchableOpacity>
                                )
                            )
                        )}
                    </View>
                    { stage >= 1 ? (
                        <View style={{}}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: latitudo(1) }}>
                                <TouchableOpacity onPress={() => { setStage(2) }} >
                                    <Text style={[nameSize(), { color: 'black', marginRight: latitudo(2) }]}>{pet_name}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: latitudo(2) }}>
                                <TouchableOpacity style={styles.buttonTag} onPress={() => { setPet_type(null) }}>
                                    <Text style={styles.textTag}>{pet_type}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonTag} onPress={() => { setPet_size(null) }}>
                                    <Text style={styles.textTag}>{pet_size}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonTag} onPress={() => { setPet_sex(null) }}>
                                    <Text style={styles.textTag}>{pet_sex}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ) : null}
                </View>
            </View>

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
                                    value={pet_name!}
                                    onChangeText={(newValue) => { setPet_name(newValue) }}
                                    placeholder="enter pet name"
                                    placeholderTextColor={Colors.g3}
                                    autoCorrect={false}
                                    multiline
                                    numberOfLines={2}
                                    maxLength={30}
                                    keyboardType='default'
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => { setStage(3) }}>
                                    {!pet_name ? null : <FontAwesome name="check" size={altitudo(4)} color='black' />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : null }

                {stage >= 2 ? (
                    <>
                        <View style={styles.contW}>
                            {/* // TYPE start                           */}
                            <View style={styles.contWRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.textH2}>Type</Text>
                                </View>
                                <View style={{ flex: 9, flexDirection: 'row', gap: altitudo(2) }}>
                                    <TouchableOpacity
                                        style={pet_type === 'dog' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_type('dog') }}
                                    >
                                    <FontAwesome5 name="dog" size={altitudo(3)} color={pet_type === 'dog' ? 'white' : Colors.g3} />
                                    <Text style={pet_type === 'dog' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>dog</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={pet_type === 'cat' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_type('cat') }}
                                    >
                                        <FontAwesome5 name="cat" size={altitudo(3)} color={pet_type === 'cat' ? 'white' : Colors.g3} />
                                        <Text style={pet_type === 'cat' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>cat</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* // SIZE start                           */}
                            <View style={styles.contWRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.textH2}>Size</Text>
                                </View>
                                <View style={{ flex: 9, flexDirection: 'row', gap: altitudo(1) }}>
                                    <TouchableOpacity
                                        style={pet_size === 'small' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_size('small') }}
                                    >
                                        <Text style={pet_size === 'small' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>0-15 lb</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={pet_size === 'medium' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_size('medium') }}
                                    >
                                        <Text style={pet_size === 'medium' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>15-40 lb</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={pet_size === 'large' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_size('large') }}
                                    >
                                        <Text style={pet_size === 'large' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>41+ lb</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* // SEX start                           */}
                            <View style={styles.contWRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.textH2}>Sex</Text>
                                </View>
                                <View style={{ flex: 9, flexDirection: 'row', gap: altitudo(2) }}>
                                    <TouchableOpacity
                                        style={pet_sex === 'M' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_sex('M') }}
                                    >
                                        <Ionicons name="male-outline" size={altitudo(3)} color={pet_sex === 'M' ? 'white' : Colors.g3} />
                                        <Text style={pet_sex === 'M' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>male</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={pet_sex === 'F' ? [styles.contButton, styles.contButtonActive] : styles.contButton}
                                        onPress={() => { setPet_sex('F') }}
                                    >
                                        <Ionicons name="female-outline" size={altitudo(3)} color={pet_sex === 'F' ? 'white' : Colors.g3} />
                                        <Text style={pet_sex === 'F' ? [styles.textPettype, { color: 'white' }] : styles.textPettype}>female</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                        { canSend ? (
                        <TouchableOpacity
                            style={styles.buttonAddpet}
                            onPress={ sendPet }
                        >
                            <Text style={styles.textButton}>Add Pet</Text>
                        </TouchableOpacity>
                        )
                        : null }
                    </>
                ) : (
                    null
                )}

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
        // backgroundColor: 'white',
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: altitudo(1.618),
        marginTop: altitudo(1),
        // paddingVertical: altitudo(0.5),
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
    buttonAddpet: {
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
        fontSize: altitudo(2),
    },
    textPettype: {
        fontFamily: 'mon',
        color: Colors.g2,
        // fontSize: 14,
    },
    textButton: {
        fontFamily: 'mon-sb',
        color: 'white',
        fontSize: 18,
    },
    textTag: {
        fontFamily: 'mon',
        fontSize: altitudo(1.618),
    },
    textName: {
        textAlign: 'center',
        color: 'black',
        fontSize: altitudo(3),
        fontFamily: 'mon',
        flex: 1,
    },
})




export default ModalAddPet;