import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset, } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { altitudo, Constants, dstyles, latitudo, Colors } from '@/constants/Constants';
import { getUserById, getUserByUid } from '@/services/user.service';
import { TextInput } from 'react-native-gesture-handler';
import { getUserPets, updatePet, getPetByUid, deletePet } from '@/services/pet.service';
import { useAuth } from "@/providers/AuthProvider";
import { PetProps } from '@/constants/interfaces';
import { uploadImage } from '@/services/event.service';
import { getReviews } from '@/services/review.service';
import ReviewList from '@/components/reviewList';

const PetDetails = () => {
    const { petProfile  } = useLocalSearchParams();
    
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);
    const [ petOwnerInfo, setPetOwnerInfo] = useState<any>({});
    const [ petImage, setPetImage ] = useState<string>('');
    const [ pet, setPet ] = useState<PetProps|undefined>(undefined);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ updateDescription, setUpdateDescription ] = useState<boolean>(false);
    const [ description, setDescription ] = useState<string>('');
    const [ percentage, setPercentage ] = useState<number>(0);
    const [ reviewMessages, setReviewMessages ] = useState<any[]>([]);
    const [ iAmOwner, setIAmOwner ] = useState<boolean>(false);
    const { user, token, methods } = useAuth();     
    const router = useRouter();

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-Constants.sizes.IMG_modals, 0, Constants.sizes.IMG_modals, Constants.sizes.IMG_modals],
                        [-Constants.sizes.IMG_modals / 2, 0, Constants.sizes.IMG_modals * 0.75]
                    ),
                },
                {
                    scale: interpolate(scrollOffset.value, [-Constants.sizes.IMG_modals, 0, Constants.sizes.IMG_modals], [2, 1, 1]),
                },
            ],
        };
    });

    useEffect(() => {
        let pp = JSON.parse(`${petProfile}`);
        if (!pp.hasOwnProperty('_id')) {
            ( async (pp) => {
                pp = await getPetByUid(pp.uid);
                setPet(pp);
            }

            )(pp);
        }
        setPet(pp);
        setIAmOwner(pp?.owner === user?.uid)
    }, [petProfile]);
    
      useEffect(() => {
        if (pet) {
            setPetImage(pet?.image);

            setDescription(pet?.description);
            if (pet?.owner === user.uid) {
                setUpdateDescription(true);
            }
            if (!petImage) {
                (async()=> {
                    await petReviews();
                    await fetchPetAndOwner();
                })()
            }
        }
      }, [ pet, petImage]);
    
            
    async function fetchPetAndOwner() {
        if (pet) {
            const owner = await getUserByUid(pet.owner);
            setPetOwnerInfo(owner);  
            setLoading(false);    
        }
    }

    const changePicture = async () => {
        if (pet && iAmOwner) {
            const img: string = await uploadImage("pet", pet.uid, token);
            const newPet = {...pet};
            newPet.image = img;
            setPetImage(img);
            const test = await updatePet(`${pet?._id}`, newPet, token);
            setPet(test);
            const newPets = await getUserPets(user);  
            methods.setPets(newPets);

        }
    }

    const changePetDescription = async (value: string) => {
        if (pet && iAmOwner) {
            setDescription(value);
            pet.description = value;
            await updatePet(`${pet?._id}`, pet, token);  
            const newPets = await getUserPets(user);  
            methods.setPets(newPets);
        }
    }

    const petReviews = async () => {
        const reviews = await getReviews(String(pet?.uid));

        let total = 0;
        let number = 0;
        let messages = [];

        for (const review of reviews) {
            number+=10;
            total += review.grade;
            if (review.sender) {
                messages.push({
                    sender: await getUserById(review.sender),
                    grade: review.grade,
                    text: review.description
                });    
            }
        }
        setPercentage((total/number));
        setReviewMessages(messages);
    }
    const removePet = async () => {
        if (pet?._id) {
            Alert.alert(
            "Are you sure?",
            `Do you really want to delete ${pet.name}?`,
            [
                {
                text: "Cancel",
                style: "cancel",
                },
                {
                text: "OK",
                onPress: async () => {
                    try {
                        if (pet?._id) {
                            await deletePet(pet?._id, token);
                            Alert.alert("Deleted", `${pet.name} was removed.`);
                            router.replace("/(tabs)");
                        }
                    } catch (err) {
                    Alert.alert("Error", "Could not delete pet.");
                    }
                },
                },
            ]
            );
        }
    }
    
    const petReviewComponent =() => {
        return (
            <View>
                <View style={{ width: (100 * percentage), overflow: 'hidden', height: 30}}>
                    <Image
                        source={require('@/assets/images/star-bar.png')}
                        style={{position: 'absolute', top: 0, left: 0, width: 100, height: 20}}
                    />
                </View>
            </View>
        )
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TEST AFTER SOME: 
    const reviewMessageComponent = () => {
        return (
            <View>
                {reviewMessages.map((item, index) => (
                <View key={`${item.sender}${index}`}  style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'column'}}>
                        <Image source={{uri: `${ item.sender.image }`}} style={[styles.senderImg, {margin: 5, marginRight: latitudo(5)}]} />
                        <Text>{ item.sender.name }</Text>
                    </View>
                    <View style={{flexDirection: 'column'}}>
                    
                        <View style={{ width: (10 * item.grade), overflow: 'hidden', height: 30}}>
                            <Image
                                source={require('@/assets/images/star-bar.png')}
                                style={{position: 'absolute', top: 0, left: 0, width: 100, height: 20}}
                            />
                        </View>
                        <Text>
                            {item.text}
                        </Text>
                    </View>
                </View>

                ))}
            </View>
        )
    }

    const sendToUser = () => {
        router.push(`/user/profile?userProfile=${encodeURIComponent(JSON.stringify(petOwnerInfo))}`);
    }

    return (
        <View style={styles.container}>

            <View style={styles.container}>
                <Animated.ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ref={scrollRef}
                    scrollEventThrottle={16}
                >
                    <Animated.View style={[dstyles.imgProfiles, imageAnimatedStyle, {height: latitudo(80)}]}>
                    <TouchableOpacity
                        onPress={changePicture}
                            >
                        {loading ? (
                            <ActivityIndicator size={altitudo(10)} color={Colors.primary} style={{ flex: 1 }} />
                        ) : (
                            !petImage ? (
                                <View>
                                    <View 
                                        style={{width: 100, height: 100, margin: 'auto', marginTop: 100, borderWidth: 5, borderColor: "white", borderRadius: 30, padding: 12}}
                                    >
                                        <FontAwesome6
                                            name={pet?.type === 'cat' ? 'cat' : 'dog'}
                                            size={altitudo(6)}
                                            color={'white'}
                                        />
                                    </View>
                                </View>
                            ) : (
                                <Image
                                    source={{ uri: `${petImage}?ts=${Date.now()}` }}
                                    style={{margin: "auto", marginTop: 80, borderRadius: latitudo(50), width: latitudo(50), height: latitudo(50), zIndex: 2, borderWidth: 12, borderColor: Colors.border1}}
                                />
                            ))}
                            </TouchableOpacity>

                    </Animated.View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{pet?.name}</Text>
                        <Text style={styles.location}>{pet?.sex === 'F' ? 'Female' : 'Male'} {pet?.type}</Text>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            <View>
                                {petReviewComponent()}
                            </View>
                        </View>

                        <View style={dstyles.divider} />

                        <View style={styles.hostView}>
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                        <View style={{ flexDirection: 'row', gap: latitudo(2.5), width: '100%' }}>
                            <TouchableOpacity
                            onPress={sendToUser}
                            >
                                <Image source={{ uri: `${petOwnerInfo?.image}?ts=${Date.now()}` }} style={styles.host} />
                            </TouchableOpacity>
                            <View>
                                <Text style={{ fontFamily: 'mon', fontSize: altitudo(2) }}>Owned by fdg</Text>
                                <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(2) }}>{petOwnerInfo?.name}</Text>
                            </View>
                            {iAmOwner && (
                                <View style={{ position: 'absolute', top: 15, right: 0 }}>
                                    <Ionicons size={altitudo(3.5)} name="trash" style={{ marginLeft: 20 }} color={Colors.redish} onPress={removePet} />
                                </View>

                            )}
                                </View>
                            )}
                        </View>

                        <View style={dstyles.divider} />

                        <Text style={styles.description}>About</Text>
                        {updateDescription ?
                            <TextInput 
                                style={styles.textName}
                                value={description}
                                onChangeText={(newValue) => { changePetDescription(newValue) }}
                                placeholder="New Pet Description"
                                placeholderTextColor={Colors.g3}
                                autoCorrect={false}
                                multiline
                            ></TextInput>
                            :                            
                            <Text style={styles.textName}>{pet?.description}</Text>
                        }
                    <View style={dstyles.divider} />

                        <Text 
                        style={[{ fontFamily: 'mon-b', fontSize: altitudo(1.75), marginTop: 10, marginBottom: 5 }]}>Reviews</Text>
                        <ReviewList target={String(petProfile)} />

                    </View>

                </Animated.ScrollView>
            </View>
        </View >
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary
    },
    infoContainer: {
        padding: 24,
        backgroundColor: 'white',
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'mon-sb',
    },
    location: {
        fontSize: 18,
        marginTop: 10,
        fontFamily: 'mon-sb',
    },
    rooms: {
        fontSize: 16,
        color: Colors.g1,
        marginVertical: 4,
        fontFamily: 'mon',
    },
    ratings: {
        fontSize: 16,
        fontFamily: 'mon-sb',
    },
    host: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: Colors.primary,
        backgroundColor: Colors.g1,
    },
    hostView: {
        flexDirection: 'row',
        alignItems: 'center',
        height: altitudo(8),
        gap: 12,
    },
    description: {
        fontSize: 16,
        marginTop: 10,
        fontFamily: 'mon',
    },
    descriptionText: {
        fontSize: 18,
        marginTop: 10
    },
    textName: {
        textAlign: 'center',
        color: 'black',
        fontSize: altitudo(3),
        fontFamily: 'mon',
        flex: 1,
        textAlignVertical: "top",
        verticalAlign: "top",
        marginTop: 10,
        height: altitudo(20)
    },

    senderImg: {
        aspectRatio: 1,
        width: altitudo(10),
        borderRadius: altitudo(5),
        borderWidth: latitudo(1.5),
        borderColor: Colors.primary,
        elevation: 10,
        marginLeft: latitudo(8.5),
        zIndex: 2
    },
});

export default PetDetails;