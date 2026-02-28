import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider'
import { Ionicons } from '@expo/vector-icons';
import { altitudo, dstyles, dtexts, latitudo, Colors, HOUR_EARLIER } from '@/constants/Constants';
import { getPetById } from '@/services/pet.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import SendMessageForm from '@/components/SendMessageForm';
import { cancelContract, getTrackByContract } from '@/services/event.service';
import MessageReplies from '@/components/message.replies';
import { Data } from '@/constants/Services';
import Icon from '@/components/CustomIcon';
import PetStamp from '@/components/PetStamp';
import { chargeService } from '@/services/stripe.service';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getUserByHeroId } from '@/services/user.service';
import AddressLink from '@/components/AddressLink';

const ServiceDetail = () => {
  const { service, hero, contractor } = useLocalSearchParams();
  const [ profile, setProfile ] = useState<any>(null);
  const [ profileImage, setProfileImage] = useState<string>('');
  const [ contract, setContract ] = useState<any>(null);
  const [ pet, setPet ] = useState<any>(null);
  const [ blackScreen, setBlackScreen ] = useState<boolean>(false);
  const [ alertVisible, setAlertVisible] = useState<boolean>(false);
  const [ messageSubject, setMessageSubject ] = useState<string>('');
  const { user, token, services, messages, location, methods,  workingOn, tracks } = useAuth();
  const [ listMessages, setListMessages ] = useState<any[]>([]);
  const [ button, setButton ] = useState({text: '', click: []});
  const [ buttonVisible, setButtonVisible] = useState<boolean>(false);
  const [ possible, setPossible ] = useState<boolean>(false);
  const [ workTime, setWorkTime ] = useState<string>('');
  const [ execution, setExecution ] = useState<any>(null);
  const [ path, setPath ] = useState<any>([]);
  const [ region, setRegion ] = useState<any>(null);
  const [ tracker, setTracker ] = useState<any>([]);
  const [ mapProvider, setMapProvider] = useState<any>(PROVIDER_DEFAULT);
  const [ loop, setLoop ] = useState<any>();
  const [ startingDate, setStartingDate] = useState<any>();
  const [ endingDate, setEndinggDate] = useState<any>();
  const [ poll, setPoll ] = useState<boolean>(true);
  // const [ address, setAddress] = useState<any>();
  
  const router = useRouter();
  const execRef = useRef<any>(null);
  const memo = useRef<{bind: boolean, msgAttempt: number, lastStep: string}>({bind: true, msgAttempt: 0, lastStep: ''})

  function timeDisplay(seconds: number) {
    let list=[];
    list.push(Math.floor(seconds / 3600));
    seconds %= 3600; 
    list.push(Math.floor(seconds / 60));
    seconds %= 60; 
    list.push(seconds);
    return (`${list[0]}`.padStart(2, '0') + ':'+ `${list[1]}`.padStart(2, '0') +':'+ `${list[2]}`.padStart(2, '0'));
  }

  useEffect(() => {
  setStartingDate(new Date(contract?.serviceStart || contract?.date?.start).toLocaleString());
  setEndinggDate(new Date(contract?.serviceEnd || contract?.date?.end).toLocaleString());

  }, [contract?.serviceStart, contract?.serviceEnd, contract?.date]);

  useEffect(() => {
    if (contract && memo.current.bind) {
      memo.current.bind = false;
      bindService();
    }
    if (!memo?.current?.bind) {
      execRef?.current?.update();
      if (execRef?.current?.button) {
        updateButton(execRef?.current?.button);
        if (execRef?.current?.button?.visible) {
          setButtonVisible(true)
        }
      }
    }
  }, [contract, possible]);


  useEffect(() => {
    if (Platform.OS === 'android') {
      setMapProvider(PROVIDER_GOOGLE);
    }
  }, []);

  useEffect(() => {
    if (!contract) return;
    if (!poll) return;
    const startTime = () => new Date(contract?.serviceStart || contract?.date?.start).getTime();
    const endTime = () => contract?.serviceEnd ? new Date(contract.serviceEnd).getTime() : null;
    if (contract?.serviceEnd) {
      setPoll(false);
    }
    const tick = () => {
      const now = Date.now();
      const s = startTime();
      const e = endTime();
      setPossible(isNearStart());
      setPoll(true);
      if (e) {
        setWorkTime(timeDisplay(Math.floor((e - s) / 1000)));
         clearInterval(id);
      } else {
        setWorkTime(timeDisplay(Math.floor((now - s) / 1000)));
      }
    };
    if (poll)
      tick();
    const id = setInterval(tick, 1000);

    if (memo.current.lastStep !== contract?.step) {
      memo.current.lastStep = contract?.step;
      execRef.current?.update();
      if (execRef.current.button.visible)
        setButtonVisible(true);
    }

    return () => clearInterval(id);
  }, [contract, poll]);

  useEffect(() => {
    let mounted = true;
    const fetchPage = async () => {
      try {
        const serviceObj = JSON.parse(`${service}`) || {};      
        const contractorObj = JSON.parse(`${contractor}`)|| {};
        const heroObj = JSON.parse(`${hero}`) || {};
        const petData = await getPetById(serviceObj?.pet);

        if (!mounted) return;
        await getActualContract(serviceObj?._id, true)
        if (!mounted) return;
        setContract(serviceObj);
        setPet(petData);

        if (heroObj?.user?._id === user?._id) {
          contractorObj.user = {...contractorObj};
          setProfile(contractorObj);
        } else {
          setProfile(heroObj);
        }
      } catch (e) {
        console.log('fetchPage error', e);
      }
    }
    fetchPage();
    return () => { mounted = false; }
  }, [service, hero, contractor, user]);

  useEffect(() => {
    if (tracks?.length > 2)
      setPath(tracks)
  }, [tracker]);

  useEffect(() => {
      setTimeout(async () => {await updateTracks()}, 10);
  }, [tracks, execRef?.current?.trackHistory, location, contract]);

  useEffect(() => {
    try {
      setMessageSubject(`${capitalizeContract()}:   ${new Date(contract?.date?.start).toLocaleString()}`);
    } catch (e) {
      setMessageSubject('');
    }
  }, [pet, profile, contract]);

  useEffect(() => {
    let msgs:any = treatMessages()
    if (msgs)
      setListMessages(msgs);
  }, [messages, contract, execution]);


  useEffect(() => {
      if (
        messages?.receiver?.length === 0 &&
        messages?.sender?.length === 0 &&
        memo.current.msgAttempt < 1
      ) {
        const it = setInterval( () => {
          methods.setMessages(messages);
          return () => clearInterval(it)
        }, 100);
        memo.current.msgAttempt++;
      }

  }, [messages, contract, execution]);

  useEffect(() => {
    setProfileImage(profile?.user?.image || '');
  }, [profile]);

  useEffect(() => {
    const ctrId = execRef?.current?.contract?._id;
    setTimeout( async () => {
      let foundContract = await getActualContract(ctrId, false);
      if (foundContract && execRef.current)  {
        execRef.current.setContract(foundContract);
        setContract(foundContract);
        execRef.current.update();
      }

    }, 10);
  }, [execution, services]);

  const getActualContract = async (ctrId: string, reboot: boolean = true) => {
    if (reboot)
      await methods.updateServices();

    for (const item of services.contractee) {
      if (item.contract?._id === ctrId) {
        setContract(item.contract);
        return item.contract;
      }
    }
    for (const item of services.contractor) {
      if (item.contract?._id === ctrId) {
        setContract(item.contract);
        return item.contract;
      }
    }
    return false;
  }
    
  const isNearStart = () => {
    if (!contract) return false;
    let serviceDate = new Date(contract.date.start).getTime();
    let now = new Date().getTime() + HOUR_EARLIER * 60 * 60 * 1000;
    let afterWork = new Date(contract.date.end).getTime() + 12 * 60 * 60 * 1000;
    return now >= serviceDate && now < afterWork;
  };

  const sendPicture = async () => {
    execRef.current.hero ?
      methods.sendPhoto(contract?.contractor, contract?._id)
      :
      methods.sendPhoto(await manageHeroUser(), contract?._id);
  }

  const manageHeroUser = async() => {
    const user = await getUserByHeroId(contract?.contractee);
    return user?._id;
  }

  const capitalizeContract = () => {
    return contract?.service?.substring(0,1).toUpperCase() + contract?.service?.substring(1).toLowerCase();
  }

  const sendMessage=() => {
    setAlertVisible(!alertVisible);
  }

  const cancelService = () => {
    cancelContract(contract, token);
    let newList: {contractee:any[]; contractor:any[]} = {contractee: [], contractor: []};
    const contractees = services?.contractee || [];
    for (const ctr of contractees) {
      if (ctr?._id !== contract?._id) {
        newList.contractee.push(ctr);
      }
    }
    const contractors = services?.contractor || [];
    for (const ctr of contractors) {
      if (ctr?._id !== contract?._id) {
        newList.contractor.push(ctr);
      }
    }
    methods.setServices(newList);
    router.push('/(tabs)')
  }

  const getUserIdFromContractee = () => {
    const heroId = contract?.contractee;
    for (let srvc of services?.contractee) {
      if (srvc?.contractee?._id === heroId) {
        return srvc?.contractee?.user?._id;
      }
    }
    return null;
  }

  const updateTracks = async () => {
    let mp = execRef?.current?.hero ? execRef.current.trackHistory : tracks?.[execRef?.current?.contract?._id];
    if ((!mp || mp?.length === 0) && tracks?.[execRef?.current?.contract?._id] ) {
      mp = tracks?.[execRef?.current?.contract?._id];
    } else if (!mp && contract?._id) {
      const tk = await getTrackByContract(contract, token);
      if (tk?.history?.length > 0)
        mp = [...tk?.history];
      else 
        mp = [location]
    }
    setPath(mp || [location]);
    setTracker(mp || [location]);

    const base = (mp?.length > 0) ? mp[0] : location;
    if (base) {
      setRegion({
        latitude: base.latitude || 37.36,
        longitude: base.longitude || -120.61,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      });
    }
  }

  const bindService = () => {
    if (!contract) return;
    if (workingOn.current.has(contract?._id)) {
      let exec = workingOn.current.get(contract?._id);
      execRef.current = exec;
      execRef.current.update();
      execRef.current.setContract(contract);
      setExecution(exec);
    } else {
      try {
        const key = contract?.service as keyof typeof Data;
        let serviceClass = Data[key].class;
        const ctrId = getUserIdFromContractee()
        const exec = new serviceClass(methods.sendEvent, contract, user, token, ctrId === user?._id);
        workingOn.current.set(contract?._id, exec);
        exec.binding(updateButton);
        exec.addRoute(openDetails, 'detail');
        exec.addRoute(openBill, 'payBill');
        execRef.current = exec;
        execRef.current.update();
        setExecution(exec);
      } catch (e) {
        console.log('325 error', e);
      }
    }
  }

  async function openBill() {
    console.log(340, 'charge', contract?._id, token );
    const charge = await chargeService(contract?._id, token );
    console.log('CHARGE', charge);
  }

  function openDetails() {
    setTimeout(() => {
      router.push({pathname: '/user/serviceDetails', params: {pet : JSON.stringify(pet), hero,  contract: JSON.stringify(contract)} });
    }, 200);
  }

  function updateButton(value: any) {
    const btn = {
      click: value.click,
      text: value.text
    }

    if (value.text === 'Finalized') {
      clearInterval(loop);
      setLoop(undefined);
      setWorkTime('');
    }
    
    if (value.visible != buttonVisible) {
      setButtonVisible(value.visible);
    }  

    setButton(btn);
  }

  const clickNext = () => {
    if (!button) return;
    if (!execRef.current) return;
    if (! button.click) {
      button.click = execRef.current.buttonClick() || [];
    }
    if (button.click?.length === 2) {
      execRef.current[button.click[0]](button.click[1]);
    } else if (button.click?.length === 1) {
      execRef.current[button.click[0]]();
    } else {
      () => {}
    }

    methods.updateSpecificContract(contract);
  }

  const removeService=() => {
    Alert.alert(
      `Cancel ${ capitalizeContract()} `,
      "Are you sure you want to proceed?",
      [
        {
          text: "NO",
          style: "cancel"
        },
        { text: "YES", onPress: () => {
            cancelService();
          }
        }
      ],
      { cancelable: true }
    ); 
  }

  const isEnded = () => {
      return (!isNearStart() && (contract?.step === "ended" || contract?.step === "paid" || contract?.step === "finalized"));
  }

 
  const treatMessages = () => {
    let msgs = messages.sender.concat(messages?.receiver);
    const msgUnordered = msgs.filter((msg: any) => msg?.message?.contract === contract?._id );
    const msgList = msgUnordered.sort((a, b) => {
      return new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime()
    })
    let msgMap = new Map<string, any>();
    let answer: any[] = [];

    for (const msg of msgList) {
        msgMap.set(msg.message?._id, { message: msg, replies: [] });
    }
    if (msgList?.length === 0) return false;

    for (const msg of msgList) {
        let msgObj = msgMap.get(msg.message?._id);
        if (!msgObj) continue;

        if (msg.message.reply === 'false') {
            answer.push(msgObj);
        } else {
            let parentMsg = msgMap.get(msg.message.reply);
            if (parentMsg) {
                parentMsg.replies.push(msgObj);
            }
        }
    }

    return answer;
  };
 
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.primary}}>
      <View style={[styles.container, {  width: "100%"}]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={[{ backgroundColor: Colors.primary}]}>
          {/* AVATAR */}
            <View style={[ {  marginTop: 25, marginBottom: 20, width: '100%'}]}>
              <View style={{ top: 0, width: '100%', zIndex: 11,  backgroundColor: Colors.primary, overflow:"visible" }} >
                <View
                    style={{ width: "100%", marginTop: 0, alignContent:'center', alignItems:'center'}}
                >
                  <Image
                    source={{ uri: `${ profileImage }` }}
                    style={[profile?.super ? {borderColor: Colors.golden }: {borderColor: 'white'}, { borderRadius: altitudo(11.75), borderWidth: 10, width: altitudo(21.5), height:altitudo(21.5)}]}
                  ></Image>
                  {profile?.super ? (
                    <View style={{height: 300, width: 300, position: 'absolute'}}>
                      <View style={{ alignItems: 'center', position: 'absolute', right: latitudo(15), top: latitudo(32.5), backgroundColor: 'rgba(255,255,255,0.75)', borderColor: Colors.bg, borderRadius: altitudo(5), borderWidth: 5, width: altitudo(7), aspectRatio: 1 }}>
                          <Icon provider='AntDesign' name='star' size={altitudo(4)} color={Colors.primary} style={styles.iconSuperHero} />
                          <Text style={[{ fontFamily: 'mon-sb', fontSize: 8, color: Colors.primary, marginTop: -3 }]}>super</Text>
                      </View>
                    </View>
                ): null}
                </View>
              </View>
            </View>

          {/* INFO AREA */}
          <View style={{ zIndex: 2, backgroundColor: Colors.bg, paddingHorizontal: latitudo(5), paddingTop: altitudo(4), minHeight: altitudo(70)}}>

            {/* PERSONAL INFO */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: latitudo(2) }}>
              <Text style={[dtexts.textMain1]}>{ profile?.user?.name?.substring(0, 19) }</Text>
              <View style={{ flexDirection: 'row', alignItems:'flex-start', position:'absolute', right: 0}}>
                {profile?.super &&
                  <Ionicons size={altitudo(3.75)} name="paw" color='goldenrod' onPress={() => setBlackScreen(!blackScreen)} />
                }

                {!contract?.serviceStart &&
                  <Ionicons size={30} name="trash" style={{ marginLeft: 20 }} color={Colors.redish} onPress={removeService} />              
                }
                {contract?.serviceStart && !contract?.serviceEnd && execRef?.current?.hero &&
                  <TouchableOpacity
                    onPress={ () => sendPicture()}
                    style={{margin: 0 }}
                  >
                    <Ionicons
                        name="camera"
                        size={35}
                        color={Colors.primary}
                      />
                  </TouchableOpacity>

                }

              {contract?.serviceStart && !contract?.serviceEnd &&
                <Ionicons size={35}  color= {Colors.primary} name="mail" style={{ marginLeft: 20 }} onPress={sendMessage} />                
              }
              </View>              
              
            </View>
            <View style={dstyles.divider} />

            <View style={{ flexDirection: 'column', alignItems: 'center', gap: latitudo(4), paddingTop: altitudo(0.5), paddingBottom: altitudo(0.5) }}>
              <Text style={{ fontFamily: 'mon', width: '100%', fontSize: altitudo(4), fontWeight: 'bold', textAlign: 'center', color: Colors.primary}} >{capitalizeContract()}</Text>
            </View>

            {/* <MESSAGE FORM> */}

            <SendMessageForm alertVisible={alertVisible} setAlertVisible={setAlertVisible} subject={messageSubject} reference={{sender: user?._id, receiver: profile?.user?._id, type: 'Contract', reply: false, contract: contract?._id}} />

            {/* INFO */}

            <View style={dstyles.divider} />
              <View style={{ flexDirection: 'row', height: 'auto' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{width: latitudo(35)}}>
                    <PetStamp pet={pet} />
                  </View>
                  <View style={{ flexDirection: 'column'}}>
                    <Text style={[{ fontFamily: 'mon-b', fontSize: altitudo(2.5), marginLeft: latitudo(5) }]}>{ pet?.name }</Text>
                    <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.66), marginLeft: latitudo(5) }]} >From: {startingDate}</Text>
                    <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.66), marginLeft: latitudo(5) }]} >To:       {endingDate}</Text>
                    {execRef?.current?.hero && (
                    <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.75), marginLeft: latitudo(5) }]} >Price: ${ parseFloat(contract?.price).toFixed(2) }</Text>
                    )
                    }
                  {contract?.serviceStart  &&  <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.75), marginLeft: latitudo(5) }]} >{contract?.service?.substring(0,1).toUpperCase() + contract?.service?.substring(1)} time: { workTime }</Text>}
                  { buttonVisible  && possible &&
                  <TouchableOpacity
                    onPress = {() => {clickNext()}}
                  >
                    <Text style={ styles.startButton }>{ button.text }</Text>
                  </TouchableOpacity>
                  }

                  </View>
                </View>
              </View>
              <AddressLink address={`${profile?.address}, ${profile?.city}`} />
              <View style={{height: 0.5, borderBottomWidth: 1, borderColor: Colors.g4}} />
              <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.75), marginLeft: latitudo(5) }]} >{ contract?.description }</Text>

            {/* LISTING MESSAGES*/}
            {listMessages?.length > 0 ?  (
              <View>
                <Text style={styles.messageHeader}>Messages</Text>
                <Text style={styles.title}>{ messages?.sender[0]?.message?.subject || messages?.receiver[0]?.message?.subject }</Text>
              </View>
            ) : null}              
              <View>
                <ScrollView  nestedScrollEnabled={true}  style ={{ height: altitudo(40), borderWidth: 1, borderColor: Colors.g5, borderRadius: 15 }}  contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={true}>
                {listMessages?.map((entry) => (
                  <MessageReplies key={entry.message?._id} message={entry.message} replies={entry.replies} sender={entry.message.sender} receiver={entry.message.receiver} contract={entry.message.contract} pressable={true}></MessageReplies>
                ))
                }                        
                </ScrollView>
              </View>

            <Text style={{color: Colors.g4, textAlign: 'right'}}>Status: {contract?.step}</Text>

            {/* CONTRACT INFO */}
             <View style={dstyles.divider} />
            {/* MAP AVAILABLE */}
          {path?.length > 0 &&
          <View style={{height: altitudo(37.5)}}>
          <View style={{height: altitudo(35) + 3, width: '100%', borderWidth: 1, zIndex: 999999, borderRadius: 15, borderColor: Colors.g3, elevation: 3, overflow: 'hidden'}}>
            <View style={{ height: altitudo(5), width: '100%', borderBottomWidth: 1, zIndex: 99}}>
              <Text style={{zIndex: 9, position: 'relative', height: '100%', fontSize: 26, verticalAlign: 'middle', paddingBottom: 2, fontWeight: 'bold', textAlign: 'center', color: 'white', backgroundColor: Colors.primary}}>{contract?.service?.substring(0,1).toUpperCase() + contract?.service?.substring(1)} Map</Text>
            </View>

            <GestureHandlerRootView style={[styles.map, {borderWidth: 1}]} >
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
                <Marker coordinate={path[path?.length - 1]} title="End" pinColor="red" />

                {/* Polyline to show the path */}
                <Polyline
                  coordinates= { path }
                  strokeColor= { Colors.primary }
                  strokeWidth={3}
                />
                </MapView>
            </GestureHandlerRootView>
          </View>
          </View>
          }
        </View>      

        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  messageHeader: {
    fontSize: latitudo(4),
    fontWeight: 'bold',
    fontFamily: 'mon',
  },

  container: {
    flex: 1,
    backgroundColor: Colors.primary
  },
  title: {
    fontSize: altitudo(1.75),
    color: Colors.g3,
    fontFamily: 'mon',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  cont1: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: latitudo(2.5),
    gap: latitudo(5),
    justifyContent: 'center',
  },
  ButtonAtTheBottom: {
    backgroundColor: 'white',
    borderRadius: latitudo(5),
    paddingHorizontal: latitudo(5),
    paddingVertical: altitudo(2),
    alignItems: 'center',
    gap: altitudo(1),
    borderWidth: 1,
    elevation: 5,
  },

  startButton: {
    borderRadius: 4,
    textAlign: 'center',
    verticalAlign: 'middle',
    fontWeight: 'bold',
    width: 120,
    fontSize: 13,
    height: 22,
    backgroundColor: Colors.primary,
    color: 'white',
    margin: 'auto',
    marginTop: 5,
    elevation: 3
  },

  pressable1: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: latitudo(5),
    paddingHorizontal: latitudo(3),
    paddingVertical: altitudo(0.5),
    gap: latitudo(1),
    elevation: 3,
  },
  avatarCheck: {
    position: 'absolute',
    bottom: altitudo(2),
    flexDirection: 'row',
    paddingVertical: altitudo(2),
    justifyContent: 'center',
    width: latitudo(100),
    alignItems: 'center',
    gap: latitudo(2),
  },

  buttonInfos: {
    width: latitudo(20),
    alignItems: 'center',
    gap: altitudo(0.5),
  },

  textName: {
    textAlign: 'center',
    color: 'black',
    fontSize: altitudo(1.75),
    fontFamily: 'mon',
    flex: 1,
    textAlignVertical: "top",
    verticalAlign: "top",
    marginTop: 10,
    height: altitudo(25)
},
  iconSuperHero: {
    margin: 5,
    marginBottom: 0,
    aspectRatio: 1,
    borderRadius: latitudo(5),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  },
  map: {
    display: 'flex',
    position: 'relative',
    width: "100%",
    height: altitudo(30),
    zIndex: 2,
  },

})

export default ServiceDetail;
