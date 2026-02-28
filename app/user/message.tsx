import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import Animated from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider'
import { Ionicons } from '@expo/vector-icons';
import { altitudo, dstyles, dtexts, latitudo, Colors } from '@/constants/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import SendMessageForm from '@/components/SendMessageForm';
import MessageReplies from '@/components/message.replies';

const MessageDetail = () => {
  const { sender, receiver, message } = useLocalSearchParams()
  const [ senderProfile, setSenderProfile ] = useState<any>(null);
  const [ receiverProfile, setReceiverProfile ] = useState<any>(null);
  const [ chat, setChat ] = useState<any>(null);
  const [ chatHour, setChatHour ] = useState<any>(null);
  const [ blackScreen, setBlackScreen ] = useState<boolean>(false);
  const [ alertVisible, setAlertVisible] = useState<boolean>(false);
  const { user, messages, methods } = useAuth();
  const [ listMessages, setListMessages ] = useState<any[]>([]);
  const [ oneRep, setOneRep ] = useState(1);
  useEffect(() => {
    if (oneRep === 1) {
      setOneRep(0);
      setSenderProfile(JSON.parse(`${sender}`));    
      setReceiverProfile(JSON.parse(`${receiver}`));    
      setChat(JSON.parse(`${message}`));    

    }
  }, [chat]);

  useEffect(() => {
    setChatHour(chat?.createdAt);
  }, [chat])

  useEffect(() => {
    setListMessages(treatMessages());
  }, [chat, messages]);

  const sendMessage=() => {
    setAlertVisible(!alertVisible);
  }

  const treatMessages = () => {
    let msgs = messages.sender.concat(messages.receiver);
    const msgList = msgs.filter((msg: any) => msg.message.contract === chat?.contract );
    let msgMap = new Map<string, any>();
    let answer: any[] = [];

    for (const msg of msgList) {
        msgMap.set(msg.message?._id, { message: msg, replies: [] });
    }

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
      <StatusBar style='light' animated backgroundColor={Colors.primary} />

      <View style={[styles.container, {paddingTop: 20, top: -altitudo(5), width: "100%"}]}>
        <ScrollView>

          {/* AVATAR */}
            <Animated.View style={[dstyles.imgProfiles, {alignContent: 'center'}]}>
              <Animated.View style={{ top: 0, width: '100%', zIndex: 11, backgroundColor: Colors.primary, overflow:"visible" }} >
                <Animated.View
                    style={{backgroundColor: "white", borderRadius: altitudo(100), width: latitudo(45), height: latitudo(45), marginTop: '5%'}}
                >
                  <Image
                    source={{ uri: `${ senderProfile?.image }?ts=${Date.now()}` }}
                    style={[senderProfile?.super ? {borderColor: Colors.golden }: {borderColor: 'white'}, { borderRadius: altitudo(50), borderWidth: altitudo(1.5), width: "100%", height:"100%"}]}
                  ></Image>
                  {senderProfile?.super ? (
                    <Text style={{color: '#FDA', fontSize: latitudo(3), marginLeft: 0, marginTop: -10, fontWeight: 'bold', textAlign: 'right', width: latitudo(78.5) }}>Super Hero</Text>
                ): null}
                </Animated.View>
              </Animated.View>
            </Animated.View>

          {/* INFO AREA */}
          <View style={{ position: "relative", zIndex: 2, backgroundColor: Colors.bg, minHeight: altitudo(52.5), paddingHorizontal: latitudo(5), paddingTop: altitudo(4) }}>

            {/* PERSONAL INFO */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: latitudo(2) }}>
            <Text>from:</Text>
            <Text style={[dtexts.textMain1, {color: '#333', fontSize: latitudo(4), width: latitudo(80), marginLeft: -25, textAlign: 'center'}]}>{ senderProfile?.name.substring(0, 19) }</Text>
              <View style={{ flexDirection: 'row', alignItems:'flex-start', position:'absolute', right: 10}}>
                {senderProfile?.super &&
                  <Ionicons size={altitudo(3)} name="star" color='goldenrod' onPress={() => setBlackScreen(!blackScreen)} />
                }
                {user?._id !== senderProfile?._id &&
                <Ionicons size={altitudo(3.5)}  color= {Colors.primary} name="mail" onPress={sendMessage} />                
              }
              </View>              
              
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: latitudo(2) }}>
              <Text>to:</Text>
              <Text style={[dtexts.textMain1, {color: '#333', fontSize: latitudo(4), width: latitudo(80), marginLeft: -5, textAlign: 'center'}]}>{ receiverProfile?.name.substring(0, 19) }</Text>
              <View style={{ flexDirection: 'row', alignItems:'flex-start', position:'absolute', right: 10}}>
                {senderProfile?.super &&
                  <Ionicons size={altitudo(3)} name="star" color='goldenrod' onPress={() => setBlackScreen(!blackScreen)} />
                }
                {user?._id !== receiverProfile?._id &&
                <Ionicons size={altitudo(3.5)}  color= {Colors.primary} name="mail" onPress={sendMessage} />                
              }
              </View>              
              
            </View>

            <View style={dstyles.divider} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: latitudo(4), paddingTop: altitudo(0.5), paddingBottom: altitudo(0.5) }}>
              <Text style={{ fontFamily: 'mon', width: '100%', fontSize: latitudo(4.5), fontWeight: 'bold', textAlign: 'center', color: Colors.g1}} >{chat?.subject}</Text>
            </View>

            <View style={dstyles.divider} />
              <Text style={{ fontFamily: 'mon', width: '100%', height: 'auto', minHeight: altitudo(10), fontSize: latitudo(3.75), fontWeight: 'bold', textAlign: 'justify'}} >{chat?.message}</Text>
            <View style={dstyles.divider} />

            {/* <MESSAGE FORM> */}
            <SendMessageForm alertVisible={alertVisible} setAlertVisible={setAlertVisible} subject={chat?.subject} reference={{sender: receiverProfile?._id, receiver: senderProfile?._id, type: 'Reply', reply: chat?._id, contract: ''}} />

            {/* LISTING MESSAGES*/}
            {listMessages.length > 0 ?  (
              <View>
                <View style={dstyles.divider} />
                <Text style={styles.messageHeader}>Messages</Text>
                <Text style={styles.title}>{ messages?.sender[0]?.message?.subject || messages?.receiver[0]?.message?.subject }</Text>
              </View>
            ) : null}
            {listMessages.map((entry) => (
              <MessageReplies key={entry.message?._id} message={entry.message} replies={entry.replies} sender={entry.message?.sender} receiver={entry.message?.receiver} contract={entry.message.contract} pressable={false}></MessageReplies>
            ))
            }

              <View style={{ flexDirection: 'column', position: 'relative', width: '100%', marginTop: 20 }}>
                <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.5), textAlign: 'right', zIndex: 9999 }]} >{new Date(chatHour).toLocaleString()}</Text>
              </View>

          </View>


          {/* MENU AREA  */}

        </ScrollView>  

      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary
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
},
  rotonda: {
      position: 'relative',
      zIndex: 10,
      bottom: -20,
      alignSelf: 'center',
      aspectRatio: 1,
      borderRadius: '100%',
      borderColor: Colors.bg,
      backgroundColor: Colors.g4
  },
  messageHeader: {
    fontSize: latitudo(4),
    fontWeight: 'bold',
    fontFamily: 'mon',
  },
  scrollViewMessages: {
    display: 'flex',
  },

  title: {
    fontSize: altitudo(1.75),
    color: Colors.g3,
    fontFamily: 'mon',
    fontWeight: 'bold',
    textAlign: 'center'
  },

})

export default MessageDetail