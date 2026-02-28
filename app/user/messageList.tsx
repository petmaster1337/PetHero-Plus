import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider'
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import MessageFlatList from '@/components/messageFlatList';
import { SafeAreaView } from 'react-native-safe-area-context';


const MessageList = () => {
  const [ type, setType] = useState<'sender'|'receiver'>('receiver');
  const { messages } = useAuth();

  function reorderedMessages(type: 'sender' | 'receiver') {
    return messages[type].sort((a:any, b:any) => {
      return new Date(a.message.createdAt) > new Date(b.message.createdAt) ? 1: -1;
    })
  }

  function countMessages(msgType: 'sender' | 'receiver') {
    let counter = 0;
    console.log(msgType, messages[msgType].length,  messages[msgType]);
    for (const msg of messages[msgType]) {
      if (msgType === 'receiver' && msg.type !== 'viewed' && msg.type !== 'ended') {
        counter++;
      } else if (msgType === 'sender' && msg.type !== 'ended') {
        counter++
      }
    }
    return counter;
  }
      
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.primary}}>
      <View style={[styles.container, {paddingTop: 0, top: -altitudo(7), width: "100%"}]}>
            <View style={{marginTop: altitudo(5), paddingTop: altitudo(0),  width: '100%'}}>
            <View style={{height: altitudo(5)}}>
              <Text style={{fontSize: latitudo(10), textAlign:'center', fontWeight: 'bold', color: 'black', marginBottom: 10, backgroundColor: Colors.primary, height: altitudo(8)}}>Messages</Text>
            </View>
            <View style={{zIndex: 999, backgroundColor: 'white', width: '100%', height: 'auto', minHeight: altitudo(80), marginBottom: 10, marginTop: altitudo(2), paddingTop: 1}}>
              <View
                style={{flexDirection: 'row', width: '100%', borderBottomWidth: 1, borderBottomColor: '#D0D0D0', alignSelf:'flex-end'}}
              >
                <TouchableOpacity
                  onPress={()=> {setType('receiver')}}
                >
                  <Text
                    style={[type === 'receiver' ? { color: Colors.primary, fontWeight: 'bold' }: { color: Colors.g2, fontWeight: 'normal' }, {textAlign: 'center', width: 100}]}
                    >Inbox 
                  {countMessages('receiver') > 0 ? (
                    ` (${ countMessages('receiver')})`
                    ): null
                    }</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={()=> {setType('sender')}}
                  >
                  <Text
                    style={[type === 'sender' ? { color: Colors.primary, fontWeight: 'bold' }: { color: Colors.g2, fontWeight: 'normal' }, {textAlign: 'center', width: 100}]}
                  >Sent
                  {countMessages('sender') > 0 ? (
                    ` (${ countMessages('sender')})`
                    ): null
                    }</Text>

                </TouchableOpacity>

              </View>
            {messages[type]?.length === 0 && (
              <Text style={styles.noMessage}>No Messages</Text>
            )}
            {messages?.hasOwnProperty(type) &&
    
              <FlatList
                data={ reorderedMessages(type) }
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={true}
                renderItem={({item}) => <MessageFlatList params={item} />}
              />
            
            }
            </View>
        </View>
      </View>
    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary
  },
  ctrImage: {
    flexDirection: 'row',
    width: 100,
    height: 100,
    borderRadius: 50
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
  noMessage: {
    textAlign: 'center',
    fontSize: latitudo(5),
    fontWeight: 'bold',
    marginTop: altitudo(15),
    color: Colors.g2
  }
})

export default MessageList
