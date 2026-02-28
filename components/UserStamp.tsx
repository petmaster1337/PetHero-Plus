import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { UserProps } from '@/constants/interfaces';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Icon from './CustomIcon';
import { getReviews } from '@/services/review.service';

const UserStamp: React.FC<{ user: UserProps, superUser?:boolean }> = ({ user, superUser=false }) => {
    const [ percentage, setPercentage ] = useState<number>(0);
    const router = useRouter();
    
    const sendToUserDetails = () => {
        router.push({pathname:'/user/profile', params: {'userProfile': JSON.stringify(user)}});
    }

    useEffect(() => {
        userReviews();
    }, []);
    
    const userReviews = async () => {
        const reviews = await getReviews(String(user?.uid));

        let total = 0;
        let number = 0;
        for (const review of reviews) {
            number += 10;
            total += Number(review.grade);
        }
        if (number !== 0) {
            setPercentage((total/number));     
        }
    }

    const userReviewComponent =() => {
        if (percentage > 0.2) {
            return (
                <View style={{flexDirection: 'row'}}>
    
                    <View style={{ width: (100 * percentage), overflow: 'hidden', height: 20, position: 'relative', margin: 'auto'}}>
                        <Image
                            source={require('@/assets/images/star-bar.png')}
                            style={{position: 'absolute', top: 0, left: 0, width: 100, height: 20}}
                        />
                    </View>
                    <Text style={{}}>{`${ (percentage / 0.2).toFixed(2) } / 5` }</Text>
                </View>
            )    
        }
        else {
            return (
                <View></View>
            )
        }
    }

    return (        
        <View style={styles.container}>
            <TouchableOpacity
            onPress={() => sendToUserDetails()}
            >
                <Image source={{uri:`${user?.image}?ts=${Date.now()}`}} style={[styles.img, {marginTop: 5}, superUser &&{borderColor: Colors.golden}]} />
                {
                    superUser && (
                        <View style={{ position: 'absolute', right: 35, top: latitudo(12.5), alignItems: 'center', justifyContent: 'center', borderColor: Colors.bg, borderRadius: altitudo(5), borderWidth: altitudo(0.5), width: altitudo(3), height: altitudo(3), zIndex: 99, elevation: 4}}>
                            <View style={{ position: 'relative', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderColor: Colors.g1, borderRadius: altitudo(5), borderWidth: 1, width: altitudo(3), aspectRatio: 1, zIndex: 99 }}>
                                <Icon provider='AntDesign' name='star' size={altitudo(1.75)} color={Colors.primary} style={styles.iconSuperHero} />
                                <Text style={[{ fontFamily: 'mon', fontWeight: 'bold', fontSize: altitudo(0.75), color: Colors.primary }]}>super</Text>
                            </View>
                        </View>
                    )
                }
                <View style={styles.tagSquare}>
                    <Text style={styles.textTag}>{ user?.name }</Text>
                </View>
                <View style={{width: '100%'}}>
                    {userReviewComponent()}
                </View>
                <Text style={[styles.textTag, {color: Colors.g2}]}>{ user.city }</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column', 
        width: 145, 
        height: 145 
    },
    button: { 
        backgroundColor: 'red', 
        padding: 10, 
        borderRadius: 5 
    },
    buttonStop: { 
        backgroundColor: 'black', 
        padding: 10, 
        borderRadius: 5 
    },
    buttonText: { color: 'white', fontSize: 16 },
    img: {
        aspectRatio: 1,
        width: latitudo(18),
        borderRadius: latitudo(10),
        borderWidth: latitudo(1.5),
        borderColor: Colors.primary,
        elevation: 10,
        alignSelf: 'center',
        marginTop: 5,
    },
    header: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    textTag: {
        fontFamily: 'mon',
        fontSize: altitudo(1.618),
        color: 'white',
        marginVertical: 'auto',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 'auto', 
        width: '100%'
    },
    tagSquare: {
        flexDirection:"row", 
        backgroundColor: Colors.primary, 
        borderRadius: 5, 
        width: '100%',
        textAlign: 'center',
    },
    iconSuperHero: {
        position: 'absolute',
        top: 6.6,
        aspectRatio: 1,
        borderRadius: latitudo(1),
        justifyContent: 'center',
        alignItems: 'center',
    }
});
export default UserStamp;
