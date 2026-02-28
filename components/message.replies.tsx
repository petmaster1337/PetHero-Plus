import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';


interface Message {
  _id: string;
  subject: string;
  message: string;
  uid: string;
  sender: string;
  receiver: string;
  type: string;
  contract: any;
}

interface MessageReplies {
  message: MessageObject;
  replies: MessageReplies[];
}

interface MessageObject {
  message: Message, 
  replies: MessageReplies[], 
  sender: any, 
  contract: any,
  receiver: any
}

interface MessageRepliesProps {
  message: MessageObject;
  sender: any;
  receiver: any;
  replies: MessageReplies[];
  contract: any;
  pressable?: boolean;
}

const MessageReplies: React.FC<MessageRepliesProps> = ({
  message,
  sender,
  receiver,
  contract,
  replies = [],
  pressable = true,
}) => {
  const { user, services } = useAuth();
  const [ youSent, setYouSent ] = useState<boolean>(false);
  const [ isImage, setIsImage ] = useState<boolean>(false);
  const [ exists, setExists ] = useState<boolean>(false);
  const router = useRouter();
  const chat: Message = message.message;

  useEffect(() => {
    setYouSent(user._id === sender._id);
    setIsImage(chat.message.endsWith('.jpg'));
  }, [sender, message]);

  useEffect(() => {
    (async function() {
    if (isImage) {
      if (typeof chat?.message === 'string') {
        let filedata = await FileSystem.getInfoAsync(getFileUri(chat.message));
        setExists(filedata.exists);
      }
    }
    })()
  }, [isImage])

  const openMessage = () => {
    router.push(`/user/message?sender=${ JSON.stringify(sender)}
        &receiver=${ JSON.stringify(receiver)}
        &message=${ JSON.stringify(chat)}`);
  };

  const findContractParams = (contractId: string) => {
    const serviceList = services.contractor.concat(services.contractee);
    let preanswer;
    for (const service of serviceList) {
      if (service.contract._id === contractId) {
        preanswer = {...service};
        break;
      }
    }
    const answer = {
      contractor: JSON.stringify(preanswer?.contractor),
      hero: JSON.stringify(preanswer?.contractee),
      service: JSON.stringify({...preanswer?.contract, contractee: preanswer?.contract?.contractee?._id, contractor: preanswer?.contract?.contractor?._id })
    };
    return answer;
  }

const sendBack: any = () => {
  return {
    pathname: '/user/service',
    params:   findContractParams(chat.contract)
  }
}

  const getFileUri = (filename: string) => {
    // if (filename.startsWith('file://')) return filename;
    let splitted = filename.split('/');
    let name = splitted[splitted.length -1];
    const baseUri = FileSystem.documentDirectory;
      return `${baseUri}${name}`;
  };

  const openImage = () => {        
    router.push({
      pathname:'/message/fileScreen', 
      params: {
        other: JSON.stringify(sender), 
        filename: getFileUri(chat.message), 
        goBack: JSON.stringify(sendBack())
      }
    });
  }

  const getMessage = () => {
    if (isImage) {
      return (
        <TouchableOpacity
          onPress={() => openImage()}

        >
          <Image
            source={{uri: getFileUri(chat.message) }}
            style={{width: 50, height: 60, borderRadius: 4}}
          />
        </TouchableOpacity>

      )

      } else {
      return (
        <Text style={[styles.text, youSent ? { color: Colors.primary } : { color: Colors.g1 }]}>
          {`${youSent ? 'You:' : '   '} ${chat.message}`}
        </Text>
      );
    }
  };

  // It did not display if is image and file does not exists
  if (isImage && !exists) return null;

  return (
    <View key={chat._id} style={styles.innerContainer}>
      <TouchableOpacity onPress={openMessage}>
        <View style={styles.messageContainer}>
            {getMessage()}
          {pressable && (
            <Ionicons
              name="mail"
              style={styles.icon}
              size={altitudo(2)}
              color={youSent ? Colors.primary : Colors.g1}
            />
          )}
        </View>
      </TouchableOpacity>
      {replies.length > 0 && (
        <View style={styles.replyContainer}>
          {replies.map((child) => (
            <MessageReplies
              key={child.message.message._id}
              message={child.message}
              replies={child.replies}
              sender={child.message.sender}
              receiver={child.message.receiver}
              contract={child.message.contract}
              pressable={pressable}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MessageReplies;

const styles = StyleSheet.create({
  innerContainer: {
    paddingBottom: 5,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: Colors.g5,
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
  text: {
    fontSize: altitudo(1.6),
    fontFamily: 'mon',
    marginTop: 10,
    marginLeft: 20,
    marginRight: 25
  },
  icon: {
    marginTop: 'auto',
    right: 5,
    position: 'absolute',
  },
  replyContainer: {
    marginLeft: -10,
    paddingLeft: latitudo(5),
  },
});
