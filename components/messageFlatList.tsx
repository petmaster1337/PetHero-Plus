import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Icon from "@/components/CustomIcon";
import { altitudo, Colors, latitudo } from "@/constants/Constants";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

const MessageFlatList = ({ params }: { params: any }) => {
    const [sender, setSender] = useState<any>(null);
    const [receiver, setReceiver] = useState<any>(null);
    const [message, setMessage] = useState<{subject: string, message: string, createdAt?: any}>({subject:'', message:''});
    const { user } =  useAuth();
    const router = useRouter();
    useEffect(() => {
        setSender(params.sender);
        setReceiver(params.receiver);
        setMessage(params.message);
    }, []);

    const treatText = (txt: string) => {
        return (txt.length > 20) ? `${txt.substring(0, 19)}...` : txt;
    }

    function selectMessage() {
        router.push({
            pathname: '/user/message',
            params: {
                sender: JSON.stringify(sender), 
                receiver: JSON.stringify(receiver),
                message: JSON.stringify(message)
            }
        });
    }

    return (
        <View style={{marginTop: 15, marginBottom: -10}}>
            {sender && (
                <TouchableOpacity
                    style={[styles.heroRender, sender.super && { borderColor: Colors.golden, borderWidth: latitudo(1.5) }]}
                    onPress={selectMessage}
                >
                    {/* Avatar & Super Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#AAA'}} source={`${sender?.image}`} />
                        {sender?.super && (
                            <View style={{ position: 'absolute', right: -altitudo(5.5 / 2), width: 40, height: 40, backgroundColor: 'white', borderRadius: altitudo(50) }}>
                                <Icon provider='AntDesign' name='star' size={altitudo(3)} color={Colors.primary} />
                                <Text style={{ fontSize: altitudo(1), color: Colors.g1 }}>super</Text>
                            </View>
                        )}
                    </View>

                    {/* Service Info */}
                    <View style={[styles.heroCard, {borderRadius: 0}]}>
                        <Text style={{fontSize: latitudo(4), fontFamily: 'mon-b'}} numberOfLines={1}>
                            {sender?.name}
                        </Text>
                        <Text>{ treatText(message?.subject) }</Text>
                        <Text numberOfLines={2}>{ treatText(message?.message) }</Text>
                        <Text style={{ textAlign: 'right', marginLeft: 30, fontSize: latitudo(3), color: Colors.g3 }}>
                            Sent: {new Date(message.createdAt).toLocaleString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    heroRender: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.g1,
        padding: latitudo(2),
        backgroundColor: Colors.bg,
        borderRadius: latitudo(1),
        marginHorizontal: latitudo(2.5),
        marginBottom: altitudo(0.5),
        // elevation: altitudo(0.5),
    },

    heroCard: {
        flex: 1,
        paddingHorizontal: latitudo(2.5),
        borderRadius: latitudo(5),
    },

    imgHeroes: {
        // borderWidth: latitudo(1),
        borderWidth: 1,
        borderColor: Colors.g1,
        width: altitudo(15),
        height: "100%",
        aspectRatio: 1,
        borderRadius: latitudo(5),
    },

    iconHeroServices: {
        aspectRatio: 1,
        borderRadius: latitudo(5),
        padding: latitudo(.5),
        justifyContent: 'center',
        alignItems: 'center'
    },

    iconSuperHero: {
        aspectRatio: 1,
        borderRadius: latitudo(5),
        justifyContent: 'center',
        alignItems: 'center',
    },

    heroRenderSelected: {
        height: altitudo(30),
        elevation: 4,
    },

    textBig: {
        fontFamily: 'mon-b',
        fontSize: altitudo(3)
    },

})



export default MessageFlatList;