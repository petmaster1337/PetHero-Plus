import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import SetHeader from '@/components/default.menu';

interface CallProps {
  other: any;
  filename: any;
}

const FileScreen: React.FC<CallProps> = ( ) => {
  const { other, filename, goBack } = useLocalSearchParams()
  const [ exists, setExists ] = useState<boolean>(true);
  const [ imageUri, setImageUri ] = useState<string>(String(filename));
  const [ sender, setSender ] = useState<any>(undefined);
  const { methods } =  useAuth();
  const router = useRouter();
  const memo = useRef<any>({limit: 1})

  useEffect(() => {
    if (memo.current.limit <= 0) return;
    if (filename.length> 2) {
      if (!checkFileExists(String(imageUri))) {
        fixFileName();
        memo.current.limit--;
      }

    }
  }, [imageUri]);

  useEffect(() => {
    setSender(JSON.parse(String(other)));
  }, [other])
  const fixFileName = () => {
    let fNameArr = String(imageUri).split('/');
    let fName = fNameArr[fNameArr.length - 1];
    let base = FileSystem.documentDirectory;
    if (!base?.startsWith('file://')) {
      base = `file://${base}`
    }
    setImageUri (`${base}${fName}`);
  }

  const leave = () => {
    try {
      let path = JSON.parse(String(goBack));
        methods.setIncomingCall(null);
      if (!path?.params) {
        router.back();
      } else {
        router.push({pathname: path.pathname, params: {...path.params}});
      }
    } catch (error) {
        router.back();
    }
  }

  const checkFileExists = async (filePath: string) => {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    setExists(fileInfo.exists);
  };

  return (
    <SafeAreaView style={styles.incomingCall}>   
    <SetHeader title="Picture" style={{marginTop: 0, zIndex:999, position: 'absolute', top: 0}} />
        <TouchableOpacity
          onPress={leave}
          style={{width: '100%', height: '100%'}}
        >
       <View style={styles.headerBlock}>
        {sender?.image ? (
          <View style={{flexDirection: 'row'}}>
              <Image
                source={{ uri: `${sender?.image}?ts=${Date.now()}` }}
                style={styles.viewPhoto}
              />
                <Text style={styles.title}>Image Received</Text>
          </View>
        )

         : (
          <Text style={styles.callerName}>{sender?.name.substring(0, 12) || 'Unknown'}</Text>
        )}
      </View>

      {exists && (
          <Image source={{ uri: imageUri }} style={styles.viewImage} />
      )}

      </TouchableOpacity> 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  incomingCall: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    position: 'relative',
    width: latitudo(100),
    height: altitudo(100),
    zIndex: 99,

  },
  viewImage: {
    margin: "auto",
    position: 'absolute',
    marginTop: 0,
    width: '100%',
    height: '100%',
    zIndex: 998,
  },
  callerName: {
    fontSize: 20,
    color: 'white',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  returnButton: {
    backgroundColor: '#A74',
    opacity: 0.5,
    position: 'absolute',
    width: latitudo(20),
    height: latitudo(20),
    textAlign: 'center',
    borderRadius: latitudo(10),
    bottom: 30,
    right: 30,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: latitudo(2),
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  headerBlock: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 30,
    zIndex: 9999,
    width: '100%',
    alignItems: 'center',
    margin: 'auto',
    paddingRight: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    margin: 'auto',
    elevation: 2,
  },
  viewPhoto: {
    margin: "auto",
    marginTop: 0,
    borderRadius: latitudo(10),
    width: latitudo(16),
    height: latitudo(16),
    zIndex: 99,
    marginRight: 25,
    borderWidth: latitudo(1.25),
    borderColor: Colors.border1
  }
});

export default FileScreen;
