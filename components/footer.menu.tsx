import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider'
import { Ionicons } from '@expo/vector-icons';
import { altitudo, latitudo, Colors } from '@/constants/Constants';
import { uploadImage } from '@/services/event.service';
import { updateUser } from '@/services/user.service';


export default function footerMenu(setImage: any, profile: any){
  const router = useRouter();
  const { token, methods, expoPushToken, user} = useAuth();

    const logout = async() =>{
        await methods.logOut();
        router.replace('/(auth)/loginScreen');
      }
        
    const pickImage = async () => {
        let newImage = await uploadImage("user", user.uid, token);
        if (newImage) {
            setImage(newImage);
            setTimeout(async() => {
            await updateUserImage(newImage);
            }, 250)
        }
    }

    const updateUserImage = async (img: string) => {
        profile.image = img;

        await updateUser(profile._id, profile)
      }
    return (
        <View style={{height: 40, marginTop: 40, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
        <View style={styles.buttonInfos}>
            <Pressable
            onPress={pickImage}
            style={styles.pressable1}
            >
            <Ionicons name="image-outline" size={altitudo(3)} color="white" />
            <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1), color: "white" }}>Change</Text>
            <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1), color: "white" }}>Avatar</Text>
            </Pressable>
        </View>
        <View style={styles.buttonInfos}>
            <Pressable
            onPress={() => router.push('/(modals)/beHero')}
            style={styles.pressable1}
            >
            <Ionicons name="paw-outline" size={altitudo(3)} color="white" />
            <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1), color: 'white' }}>Be a</Text>
            <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1), color: 'white' }}>HERO</Text>
            </Pressable>
        </View>
        <View style={styles.buttonInfos}>
            <Pressable
            onPress={logout}
            style={styles.pressable1}
            >
            <Ionicons name="log-out-outline" size={altitudo(3)} color="white" />
            <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1), color: 'white' }}>Log</Text>
            <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1), color: 'white' }}>Out</Text>
            </Pressable>
        </View>
        </View>
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
        // justifyContent: 'space-evenly',
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
    })
          
          