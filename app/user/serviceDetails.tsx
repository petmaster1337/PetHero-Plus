import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router';
import { altitudo, latitudo, Colors } from '@/constants/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { getTrackByContract, updateContract } from '@/services/event.service';
import UserStamp from '@/components/UserStamp';
import PetStamp from '@/components/PetStamp';
import { useAuth } from '@/providers/AuthProvider';  
import ReviewInput from '@/components/review.input';
import { getUserByHeroId } from '@/services/user.service';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const ServiceMapAndPay = () => {
  const { contract, hero, pet } = useLocalSearchParams();
  const { user, token, tracks, services } = useAuth();
  const [ path, setPath ] = useState<any[]>([]);
  const [ service, setService ] = useState<any>([]);
  const [ amIHero, setAmIHero ] = useState<boolean>(false); 
  const [ timer, setTimer ] = useState<string>('');
  const [ region, setRegion ] = useState<any>();
  const [ mapProvider, setMapProvider] = useState<any>(PROVIDER_DEFAULT);
  const [ serviceStart, setServiceStart ] = useState<any>(null);
  const [ serviceEnd, setServiceEnd ] = useState<any>(null);
  // const memo = useRef<{bind: boolean, lastStep: string, updateOnce:boolean}>({bind: true,  lastStep: '', updateOnce: true})

  const router = useRouter();
  let contractObj = JSON.parse(`${contract}`);
  const heroObj = JSON.parse(`${hero}`);
  const petObj = JSON.parse(`${pet}`);

  useEffect(() => {
    const srv = findService(contractObj._id);
    if (srv) {
      setService(srv);
    }
    else {
      setService(contractObj);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setMapProvider(PROVIDER_GOOGLE);
    }
    setAmIHero(user._id === heroObj?.user?._id);
    const workTime = Math.floor((new Date(serviceEnd).getTime() - new Date(serviceStart).getTime())/1000) || 0; 
    setTimer(timeDisplay(workTime))
  }, [serviceEnd, serviceStart]);

  useEffect(() => {
    async function findPath() {
      if (!contract) return;
      let track = tracks[contractObj?._id]
      if ( !track ) {
        let obj = await getTrackByContract(contractObj, token);
        track = obj?.history;
      }
      if ( !track ) {
        track = [location];
      };

      setPath(track);
      setRegion({
        latitude: track[0]?.latitude || 37.36,
        longitude: track[0]?.longitude || -120.61,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      });

      if (service?.serviceStart) {
        setServiceStart(service?.serviceStart);
      }
      if (service?.serviceEnd) {
        setServiceEnd(service?.serviceEnd);
      }
        console.log('SERVICE', service.serviceEnd, JSON.stringify(service))
    }

    findPath();
  }, [service, services, timer]);

  function timeDisplay(seconds: number) {
    let list=[];
    list.push(Math.floor(seconds / 3600));
    seconds %= 3600; 
    list.push(Math.floor(seconds / 60));
    seconds %= 60; 
    list.push(seconds);
    return (`${list[0]}`.padStart(2, '0') + ':'+ `${list[1]}`.padStart(2, '0') +':'+ `${list[2]}`.padStart(2, '0'));
  }

  function findService(id: string) {
    for (const item of [...services.contractee]) {
      if (item.contract._id === id) return item.contract;
    }
    for (const item of [...services.contractor]) {
      if (item.contract._id === id) return item.contract;
    }

    return null;
  }

    const finalizeJob = () => {
      router.push('/(tabs)')
    }

    return (
      <SafeAreaView style={{flex: 1,backgroundColor: Colors.primary, position: "relative"}}>
        
        <View style={[styles.container]}>
        <ScrollView style={[styles.scroll]}>
          <View style={{flexDirection:'row', marginTop: 0, marginHorizontal: 'auto'}}>
            {amIHero ? (
            <View style={{width: 'auto', alignContent: 'center', alignItems:'center', alignSelf: 'center'}}>
              <PetStamp pet={petObj} />
            </View>
            ) : (
              <View style={{width: 'auto', alignContent: 'center', alignItems:'center', alignSelf: 'center'}}>
                <UserStamp user={heroObj.user} superUser={heroObj.super}/>              
              </View>

            )}
          </View>

          {service?.service &&(
            <View>
              <Text style={{textAlign: 'center', verticalAlign:'bottom', fontSize: 32, fontWeight: 'bold', color: Colors.g3}}>{service?.service.substring(0, 1).toUpperCase() + service?.service.substring(1)}</Text>
              {/* <Text style={{width: '80%', textAlign: 'justify', marginHorizontal: 'auto', marginVertical: 15, color:'#888'}}>{ service?.description }</Text> */}
            </View>
          )}
            <View style={styles.divider} />
            {(service?.step === 'ended' || service?.step === 'finalized' || service?.step === "paid") && (
              <View>
                {amIHero ? 
                  <View>
                    <ReviewInput 
                    title ={`Please Review Pet: ${ petObj?.name }`}
                    onSubmit={
                      () => finalizeJob()
                    }
                    target={{pet: petObj, type: 'pet', id: petObj?.uid}}
                    sender={ `${ user?._id }` }
                    contract={ service?._id }
                    />                    
                  </View>
                  :
                  <View>
                    <ReviewInput 
                      title ={`Please Review Hero: ${ heroObj?.user.name }`}
                      onSubmit={
                        () => finalizeJob()
                      }
                      target={{hero: heroObj, type: 'hero', id: heroObj?.uid}}
                      sender={ `${ user?._id }` }
                      contract={ service?._id }
                    />
                  </View>
                }
                </View>
              )}

            <View style={styles.divider} />
          
              {serviceStart && serviceEnd && (
              <View>
                {serviceStart &&
                <Text style={[styles.text,{marginBottom: 5}]} >Started: {new Date(serviceStart).toLocaleString()}</Text>
                }
                {serviceEnd &&
                <Text style={[styles.text,{marginBottom: 5}]} >Ended: {new Date(serviceEnd).toLocaleString()}</Text>
                }
                {timer && (
                  <View style={{flexDirection: 'row', width: 'auto', alignContent: 'center', alignItems:'center', alignSelf: 'center'}}>
                    <Text style={{ marginBottom: 5, fontFamily: 'mon', fontSize: 15, margin: 'auto'}}>Service Time:         </Text>
                    <Text style={{ marginBottom: 5, fontSize: 16, color: Colors.primary, fontWeight: 'bold', margin: 'auto'}}>{ timer }</Text>
                  </View>
                )}
              </View>
              )}

            {/* MAP AVAILABLE */}
        { path?.length > 0 &&
          <View style={{height: altitudo(47.5)}}>
            <View style={{ height: altitudo(7), width: '100%', borderWidth: 1}}>
              <Text style={{zIndex: 9, position: 'relative', height: '100%', fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: 'white', backgroundColor: Colors.primary, paddingBottom: 4}}>Map</Text>
            </View>

              <GestureHandlerRootView style={styles.map} >
                <MapView
                  provider={mapProvider}
                  style={styles.map}
                  zoomControlEnabled={true}
                  zoomEnabled={true}
                  scrollEnabled={true}
                  region={region}
                  >
                  {/* Start Marker */}
                  <Marker coordinate={path[0]} title="Start"  pinColor={ Colors.primary }/>

                  {/* End Marker */}
                  <Marker coordinate={path[path.length - 1]} title="End" pinColor="red" />

                  {/* Polyline to show the path */}
                  <Polyline
                    coordinates={path}
                    strokeColor="blue"
                    strokeWidth={4}
                  />
                  </MapView>
              </GestureHandlerRootView>
            </View>
          }
            </ScrollView>

          </View>

      </SafeAreaView>
    );
  };
    
  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors.primary,
    },
    map: {
      display: 'flex',
      position: 'relative',
      width: "100%",
      height: altitudo(40),
      zIndex: 999,
    },
    scroll: {
      position: 'relative',
      display: 'flex',
      borderWidth: 1,      
      borderColor: '#FFDCA0',
      height: altitudo(87.5),
      width: '100%',      
      marginTop: 0,
      paddingTop: 0,
      backgroundColor: Colors.white,

    },
    image: {
      width: latitudo(30),
      height: latitudo(30),
      margin: latitudo(2.5),
      marginLeft: 'auto',
      marginRight: 'auto',
      borderRadius: latitudo(15),
      borderWidth: latitudo(2),
    },
    text: {
      textAlign: 'center',
      fontFamily: 'mon',
      fontSize: 14
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: 'black',
      marginVertical: altitudo(1),
  },
  buttonText: {
    width: latitudo(40),
    height: latitudo(10),
    borderRadius: 8,
    elevation: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: Colors.primary,
    fontSize: 23,
    margin: latitudo(2),
    color: 'white',
    verticalAlign: 'middle',
  },
  messageHeader: {
    fontSize: latitudo(4),
    fontWeight: 'bold',
    fontFamily: 'mon',
  },
  title: {
    fontSize: altitudo(1.75),
    color: Colors.g3,
    fontFamily: 'mon',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  });
  
export default ServiceMapAndPay