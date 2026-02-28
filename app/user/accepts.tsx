import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { Data, DataPropsIndex } from '@/constants/Services';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/providers/AuthProvider'
import { SafeAreaView } from 'react-native-safe-area-context';
import { addAttention, removeAttention } from '@/services/attention.service';
import PetStamp from '@/components/PetStamp';
import UserStamp from '@/components/UserStamp';
import { getUserByHeroId } from '@/services/user.service';

const UserAccept = () => {
    const { contract, contractee, justify, pet } = useLocalSearchParams();
    const { user, token, methods } = useAuth();
    const router = useRouter();

    const heroObj = JSON.parse(`${contractee}`);
    const contractObj = JSON.parse(`${contract}`);
    const petObj = JSON.parse(`${pet}`);
    const [ petInfo, setPetInfo ] = useState<any>();
    const [ heroInfo, setHeroInfo ] = useState<any>();
    const [ contractInfo, setContractInfo ] = useState<any>();

    useEffect(() => {
        const populate = async () => {
            setContractInfo(contractObj);
            setPetInfo(petObj);
            setHeroInfo(await getUserByHeroId(contractObj.contractee._id))
        }
        populate();
    }, []);

 
    const answerOffer = async (accept: boolean) => {
        try {
          const newContract = {...contractObj};
          newContract.status = accept ? 'accepted': 'rejected';
          if (accept ) {
            const data = {
              service: JSON.stringify(newContract), 
              hero: JSON.stringify(heroInfo), 
              pet: JSON.stringify(petInfo), 
              contractor: JSON.stringify(newContract.contractor),
              confirm: 'false',
              justify: ''
            }

            await addAttention(token, newContract.contractor._id, 'request', '/user/openBill', data);
              router.push({
                  pathname: "/user/openBill",
                  params: {
                  service: JSON.stringify(newContract),
                  hero: JSON.stringify(user),
                  pet: JSON.stringify(pet),
                  contractor: JSON.stringify(newContract.contractor),
                  confirm:'false',
                  justify: ''
                  },
              }); 
          } else { 
              router.push({
                  pathname: "/hero/selecting",
                  params: {
                  date: encodeURIComponent(String(contractObj.date.start)),
                  pet: encodeURIComponent(JSON.stringify(pet)),
                  service: encodeURIComponent(JSON.stringify(contractObj.service)),
                  size: encodeURIComponent(String(calculateSize())),
                  avoid: JSON.stringify(user._id),
                  },
              }); 
            if (newContract?.contractor?._id) {
              await removeAttention(token, newContract?.contractor._id, newContract?.uid);
            }
          }
        } catch (e) {
            console.log('error', e)
            router.replace(`/message?message='ERROR! Please try again later'`);
        }
    }

    const calculateSize = () => {
        const time = new Date(contractObj.date.end).getTime() - new Date(contractObj.date.start).getTime();
        const index: DataPropsIndex  = contractObj.service;
        let param = Data[index].billing;
        return Math.floor(time / param);
    }


    return (
        <SafeAreaView style={styles.container}>
          <Text style={[styles.title, {color: Colors.g3, height: 40, margin: 0}]}>{ contractInfo?.service }</Text>
          <View style={{flexDirection: 'row', width: 'auto', height: altitudo(20), margin: 0, alignItems: 'center'}}>
            {petInfo && (
              <PetStamp pet={petInfo} />
            )}
            {heroInfo && (
              <UserStamp user={heroInfo} superUser={heroObj.super}/>
            )}
          </View>
          <Text style={styles.priceText}>
            Price asked: <Text style={{ fontWeight: 'bold' }}>${Number(contractInfo?.price).toFixed(2)}</Text>
          </Text>
          <View style={{flexDirection: 'column', marginBottom: 20}}>
            <Text style={{fontSize: 14, color: Colors.g3}}>Start: {new Date(contractInfo?.date.start).toLocaleString()}</Text>
            <Text style={{fontSize: 14, color: Colors.g3}}>End: {new Date(contractInfo?.date.end).toLocaleString()}</Text>
          </View>
          <Text style={styles.description}>{ justify }</Text>
    
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.rejectButton} onPress={() => answerOffer(false)}>
              <Text style={styles.buttonText}>Deny</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={() => answerOffer(true)}>
              <Text style={styles.buttonText}>Accept & Pay</Text>
            </TouchableOpacity>
          </View>

          <View
          style={{backgroundColor: Colors.primary, position: "absolute", bottom: -1, left: -1, height: altitudo(8), width: '104%', zIndex: 999999}}
          >
          </View>
        </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        paddingTop: 0,
        margin: 0,
        alignItems: 'center',
        alignContent: 'center',
        width: latitudo(100),
        borderWidth: 1,
        flexDirection: 'column',
      },
      title: {
        fontSize: altitudo(4),
        fontWeight: 'bold',
        color: Colors.g1,
        marginBottom: altitudo(2),
      },
      priceText: {
        fontSize: altitudo(3),
        color: Colors.g3,
        marginVertical: altitudo(2),
        textAlign: 'center',
      },
      description: {
        fontSize: altitudo(2),
        color: Colors.g3,
        textAlign: 'center',
        marginBottom: altitudo(4),
      },
      buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: latitudo(5),
      },
      rejectButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: altitudo(1.5),
        paddingHorizontal: latitudo(6),
        borderRadius: 10,
      },
      acceptButton: {
        backgroundColor: Colors.primary,
        paddingVertical: altitudo(1.5),
        paddingHorizontal: latitudo(6),
        borderRadius: 10,
      },
      buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: latitudo(4),
        textAlign: 'center',
      },
    });
    
export default UserAccept