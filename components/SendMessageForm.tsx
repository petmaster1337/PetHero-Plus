import { Colors, latitudo } from "@/constants/Constants";
import { useAuth } from "@/providers/AuthProvider";
import { getUserById } from "@/services/user.service";
import React, { useEffect, useState } from "react";
import { TextInput, Text, TouchableOpacity } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

interface SendMessageFormProps {
  alertVisible: boolean;
  setAlertVisible: any;
  subject: string;
  reference: any;
}

export default function SendMessageForm({ alertVisible, setAlertVisible, subject, reference }: Readonly<SendMessageFormProps>) {
    const [ message, setMessage ] = useState<string>("");
    const { methods, expoPushToken, token, user } = useAuth();
    const sharedHeight = useSharedValue(alertVisible ? 200 : 0);
    async function uploadMessage() {
    const messageObj = {
        uid: `${reference.sender}.${reference.receiver}.${(Math.floor(Math.pow(32, 6) *  Math.random())).toString(32)}`,
        sender: reference.sender,
        receiver: reference.receiver,
        type: reference.type,
        reply: reference.reply,
        contract: reference.contract,
        subject,
        message,
    }
    setAlertVisible(false);
      setMessage('');
      await methods.sendInstantMessage(reference.receiver, messageObj);
      await methods.sendPushNotification(expoPushToken, 'Message Sent', `${message.substring(0, 20)}...`);
      const receiver = await getUserById(reference.receiver);
      if (receiver)
        await methods.sendPushNotification(receiver.notification, subject, `${message.substring(0, 20)}...`)
  }

  useEffect(() => {
    sharedHeight.value = withTiming(alertVisible ? 250 : 0, { duration: 500 });
  }, [alertVisible]);

  return (
    <Animated.View
      style={{
        height: sharedHeight,
        overflow: "hidden",
        width: "100%",
        backgroundColor: "white",
        borderRadius: 10,
      }}
    >
      <Text style={{ fontSize: latitudo(5), fontWeight: "bold", marginBottom: 5, paddingLeft: 10, color:'#666',  borderBottomWidth: 1, borderColor: '#CCC' }}>
        {reference.type === 'Reply'? `Reply to ${subject}`: subject}
      </Text>
      <TextInput
        style={{ fontSize: latitudo(4),  height: 120, borderWidth: 1, borderColor: '#EEE', borderRadius: 10 }}
        placeholder={`Write your message here`}
        onChangeText={(value) => setMessage(value)}
        value={message}
        multiline
      />
      <TouchableOpacity
        style={{ alignItems:'flex-end', width: '90%', margin: 5, marginLeft: '5%' }}
        onPress={ uploadMessage }
      >
        <Text
          style={{backgroundColor: Colors.primary, textAlign: 'center', borderRadius: 5, height: 30, elevation: 2, verticalAlign: 'middle', width: 100, marginRight: 5, color: 'white', fontWeight: 'bold'}}
        > Send </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}