import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { Colors, latitudo } from '@/constants/Constants';
import OngoingServiceTab from './ongoingServiceTab';
import { ScrollView } from 'react-native-gesture-handler';


const DIFFERENCE_TIME = 30;

const OngoingService = () => {
    const [ isContractor, setIsContractor ] = useState<boolean>(true);
    const [contracteeList, setContracteeList] = useState<any[]>([]);
    const [contractorList, setContractorList] = useState<any[]>([]);
    const [ selectedIndex, setSelectedIndex ] = useState<number>(0);
    const { user, methods, nearContractee, nearContractor, messages, hero } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {

        if (!hero) {
            setIsContractor(true);
        }
        if (isContractor) {
            const newContractor = [...nearContractor];
            const orderedContractor = newContractor.splice(selectedIndex, 1);
            if (orderedContractor[0]) {
                newContractor.unshift(orderedContractor[0]) 
                setContractorList(newContractor);    
            }
        } else {
            const newContractee = [...nearContractee];
            const orderedContractee = newContractee.splice(selectedIndex, 1);
            if (orderedContractee[0]) {
                newContractee.unshift(orderedContractee[0]) 
                setContracteeList(newContractee);
            }
        }

    }, [isContractor]);

    useEffect(() => {
        if (selectedIndex !== 0) {

            setTimeout(() => {
                if (contractorList.length > 0 && selectedIndex < contractorList.length) {
                    const newContractorList = [...nearContractor]; 
                    const selectedItem = newContractorList.splice(selectedIndex, 1)[0]; 
                    if (selectedItem) {
                        newContractorList.unshift(selectedItem);
                        setContractorList(newContractorList);    
                    }
                }
            
                if (contracteeList.length > 0 && selectedIndex < contracteeList.length) {
                    const newContracteeList = [...nearContractee]; 
                    const selectedItem = newContracteeList.splice(selectedIndex, 1)[0]; 
                    if (selectedItem) {
                        newContracteeList.unshift(selectedItem);
                        setContracteeList(newContracteeList);
                    }
                }
                setTimeout(() => {
                    setSelectedIndex(0);  
  
                }, 500);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });

             }, 500);
        }
    }, [selectedIndex]);

    const getList = (type: string) => {
        if (type === 'contractor') {
            return (
                <View>
                {contractorList.map((item, index) => (
                    <OngoingServiceTab 
                        key={`${item?.uid}${index}`} 
                        item={item} 
                        index={index} 
                        selectedIndex={selectedIndex} 
                        setSelectedIndex={setSelectedIndex} 
                    />
                ))}
                </View>
            );
        } else  {
            return (
                <View>
                {contracteeList.map((item, index) => (
                    <OngoingServiceTab 
                        key={`${item?.uid}ee${index}`} 
                        item={item} 
                        index={index} 
                        selectedIndex={selectedIndex} 
                        setSelectedIndex={setSelectedIndex} 
                    />
                ))}
                </View>
            );
        }
    }

    return (        
        <View>
            <View style={styles.container}>
            {hero &&
                <View style={{flexDirection: 'row', backgroundColor: Colors.primary, height: 75}}>
                    <TouchableOpacity
                        onPress={() => setIsContractor(true)}
                        style={{margin: 'auto'}}
                    >
                        <Text style={[styles.toggleButton, isContractor ? {backgroundColor: Colors.primary} : {backgroundColor: Colors.secondary}]}>
                            Contractor
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsContractor(false)}
                        style={{margin: 'auto'}}
                    >
                        <Text style={[styles.toggleButton, !isContractor ? {backgroundColor: Colors.primary} : {backgroundColor: Colors.secondary}]}>
                            Hero
                        </Text>
                    </TouchableOpacity>
                </View>
            }
                <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 280 }}>
                    {isContractor ? 
                            getList('contractor')
                    :
                            getList('contractee')
                        }
                </ScrollView>

            </View>
        
        </View>
    );
};

const styles = StyleSheet.create({
    container: {  marginTop: 0},
    button: { backgroundColor: 'red', padding: 10, borderRadius: 8 },
    buttonStop: { backgroundColor: 'black', padding: 10, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16 },
    toggleButton: {
        width: latitudo(40),
        height: latitudo(10),
        borderRadius: 8,
        elevation: 5,
        textAlign: 'center',
        borderColor: Colors.primary,
        fontSize: 23,
        margin: latitudo(2),
        color: 'white',
        verticalAlign: 'middle',
    }
});

export default OngoingService;
