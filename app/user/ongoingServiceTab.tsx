import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, latitudo, getDistance, altitudo } from '@/constants/Constants';
import PetStamp from '@/components/PetStamp';
import { useAuth } from '@/providers/AuthProvider';
import UserStamp from '@/components/UserStamp';
import { useRouter } from 'expo-router';

const OngoingServiceTab: React.FC<{ item: any, index: number, selectedIndex: number, setSelectedIndex: (index: number) => void }> = ({ item, index, selectedIndex, setSelectedIndex }) => {
    const [ petInfo, setPetInfo] = useState<any>();
    const { user } = useAuth();
    const [ isSelected, setIsSelected] = useState<boolean>(index === selectedIndex);
    const [ isHero, setIsHero ] = useState<boolean>(false);

    const router = useRouter();

    const youAreContractor = () => {
        return (item?.contractor._id === user?._id)
    }
    useEffect(() => {
        setIsHero(!youAreContractor());
    }, [item]);

    useEffect(() => {
        const populateParams = async () => {
            setPetInfo(item.pet);
        }

        populateParams();

    }, []);

    const heightAnim = useRef(new Animated.Value(170)).current;


    useEffect(() => {
        setIsSelected(index === selectedIndex);

    }, [selectedIndex])
    useEffect(() => {
            Animated.timing(heightAnim, {
                toValue: isSelected ? 280 : 170, 
                duration: 1000,
                useNativeDriver: false,
            }).start();        
    }, [isSelected]);


    const serviceDetails = async() => {

        router.push(`/user/serviceDetails?contract=${ JSON.stringify(item.contract) } 
                &hero= ${ JSON.stringify(item.contractee)}
                &pet= ${ JSON.stringify(item.pet)}`);

    }

    return (        
        <Animated.View 
        style={[styles.container, { height: heightAnim }]}
        >
            {petInfo && 
            (
                <View style={[{flexDirection: 'column', height: altitudo(40), width: '100%'}, index === selectedIndex ? {backgroundColor: Colors.primary, height: altitudo(40)}: {backgroundColor: '#EEE'}]}>
                    <TouchableOpacity 

                    onPress={index === selectedIndex? ()=> null: ()=> setSelectedIndex(index)}
                    >
                        <View style={[styles.innerContainer]}>
                            <PetStamp pet={petInfo} />
                                {isHero ? (
                                    <View style={{flexDirection: 'column', position: 'absolute', right: 10, height: latitudo(80)}}>
                                        <Text style={ styles.header }>{item.contract.service}</Text>
                                        <Text style={ styles.text }>{ item.contractor.city}</Text>
                                        <Text style={ styles.text }>{ getDistance(item.contractor, item.contractee.user) } miles</Text>
                                        <Text style={ styles.text }>Start: {new Date(`${item.contract.date.start}`).toLocaleString()}</Text>
                                        <Text style={ styles.text }>End:   {new Date(`${item.contract.date.end}`).toLocaleString()}</Text>
                                        <Text style={[ styles.text, {height: 'auto'} ]} numberOfLines={3}>{item.contract.description }</Text>

                                        {/*  ADVICE WHEN SERVICE STARTED */}

                                        <TouchableOpacity
                                            onPress={serviceDetails}
                                        >
                                            <Text
                                                style={[ styles.buttonText, {backgroundColor: Colors.cyan} ]}
                                            >Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                ):(
                                    <View style={{flexDirection: 'column', position: 'absolute', right: 10, height: latitudo(80)}}>
                                        <Text style={ styles.header }>{item.contract.service}</Text>
                                        <Text style={ styles.text }>{ item.contractee.user.city}</Text>
                                        <Text style={ styles.text }>{ getDistance(item.contractor, item.contractee.user) } miles</Text>
                                        <Text style={ styles.text }>Start: {new Date(`${item.contract.date.start}`).toLocaleString()}</Text>
                                        <Text style={ styles.text }>End:   {new Date(`${item.contract.date.end}`).toLocaleString()}</Text>
                                        <Text style={[ styles.text, {height: 'auto'} ]} numberOfLines={3}>{item.contract.description }</Text>

                                        <TouchableOpacity
                                            onPress={serviceDetails}

                                        >
                                            <Text
                                                style={[ styles.buttonText, {backgroundColor: Colors.cyan} ]}                                                
                                            >Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
    
                        </View>                     

                    </TouchableOpacity>
                    <View>

                        {index === selectedIndex && (
                            isHero ? (
                                <View>
                                    <UserStamp user={item.contractor} superUser={false}/>
                                </View>
                            ):(
                                <View>
                                    <UserStamp user={item.contractee.user} superUser={item.contractee.super}/>  
                                </View>
                            )
                        )}
                    </View>

                </View>

            )} 
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { 
        borderWidth: 1, 
        borderColor: '#999', 
        marginHorizontal: 10, 
        marginVertical: 5, 
        width: '95%',
        borderRadius: 20, 
        flexDirection: 'row',
        transitionDuration: '2s',
        height: 170,
        overflow: 'hidden',
    },
    innerContainer: { flexDirection: 'row' },
    button: { backgroundColor: Colors.gr1, padding: 10, borderRadius: 6, elevation: 6, shadowColor: 'black',  },
    buttonStop: { backgroundColor: Colors.primary, color: 'white', padding: 10, borderRadius: 6, elevation: 6, shadowColor: 'black' },
    buttonText: { 
        color: 'white', 
        fontSize: 16, 
        textAlign: 'center', 
        fontWeight: 'bold', 
        height: altitudo(4), 
        verticalAlign: 'middle',
        borderWidth: 1, 
        borderColor: Colors.primary, 
        borderRadius: 40, 
        marginTop: 30 
    },
    header: {
        fontSize: latitudo(10),
        fontWeight: 'bold',
        color: Colors.g1
    },
    text: {
        fontSize: latitudo(4),
        color: Colors.g1
    },
    extraInfo: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
    },
    extraText: {
        fontSize: latitudo(4),
        width: '100%',
        color: 'white',
        fontWeight: 'bold',
    }
});

export default OngoingServiceTab;
