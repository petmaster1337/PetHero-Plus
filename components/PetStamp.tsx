import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { PetProps } from '@/constants/interfaces';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { getReviews } from '@/services/review.service';

const PetStamp: React.FC<{ pet: PetProps }> = ({ pet }) => {
    const [ percentage, setPercentage ] = useState<number>(0);
    const router = useRouter();
    
    const sendToPetDetails = () => {
        router.push({pathname:'/(modals)/pet', params: {'petProfile': JSON.stringify(pet)}});
    }

    useEffect(() => {
        petReviews();
    }, []);

    const petReviews = async () => {
        const reviews = await getReviews(String(pet?.uid));

        let total = 0;
        let number = 0;
        for (const review of reviews) {
            number+=10;
            total += review.grade;
        }
        setPercentage((total/number));

    }
    const petReviewComponent =() => {
        return (
                <View style={{ width: (100 * percentage), overflow: 'hidden', height: 20, position: 'relative', margin: 'auto'}}>
                    <Image
                        source={require('@/assets/images/star-bar.png')}
                        style={{position: 'absolute', top: 0, left: 0, width: 100, height: 20}}
                    />
                </View>
        )
    }
    
    return (        
        <View style={styles.container}>
            <TouchableOpacity
            onPress={() => sendToPetDetails()}
            >
                <Image source={{uri: `${pet?.image}?ts=${Date.now()}`}} style={[styles.img]} />
                <Text style={[styles.textTag, {color: 'black'}]}>{ pet?.name }</Text>
                <View style={{flexDirection:"row"}}>
                {pet?.sex === "M" ? (
                    <View style={styles.tagSquare}>
                        <Ionicons name="male-outline" size={altitudo(3)} color={ 'white' } />
                        <Text style={styles.textTag}>Male</Text>
                    </View>
                ): (
                    <View style={styles.tagSquare}>
                        <Ionicons name="female-outline" size={altitudo(3)} color={ 'white' } />
                        <Text style={styles.textTag}>Female</Text>
                    </View>
                )}
                <View style={styles.tagSquare}>
                    <Text style={styles.textTag}>{ pet?.size }</Text>
                </View>
                </View>
                    <View style={{width: '100%'}}>
                        {petReviewComponent()}
                    </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flexDirection: 'column', width: latitudo(40), height: latitudo(40) },
    button: { backgroundColor: 'red', padding: 10, borderRadius: 5 },
    buttonStop: { backgroundColor: 'black', padding: 10, borderRadius: 5 },
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
    },
    tagSquare: {
        flexDirection:"row", 
        backgroundColor: Colors.primary, 
        borderRadius: 5, 
        width: latitudo(16), 
        margin: 5
    }
});

export default PetStamp;
