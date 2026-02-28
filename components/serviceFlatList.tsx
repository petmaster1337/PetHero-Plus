import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { altitudo, Colors, latitudo } from "@/constants/Constants";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import UserStamp from "./UserStamp";
import { getUserByUid } from "@/services/user.service";
import { Ionicons } from "@expo/vector-icons";

const ServiceFlatList = ({ params }: { params: any }) => {
    const [contractee, setContractee] = useState<any>(null);
    const [contractor, setContractor] = useState<any>(null);
    const [role, setRole] = useState<'contractee' | 'contractor'>('contractee');
    const [service, setService] = useState<any>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const profile = async() => {
            contractee.user = await getUserByUid(contractee.uid);
            if (user._id === contractor._id) {
                setRole('contractor')
            }    
        }
        setContractee(params.contractee);
        setContractor(params.contractor);
        setService(params.contract);
        if (contractor && contractee) {
            profile();
        }
    }, [contractee, contractor]);

    function selectService() {
        router.push({
            pathname: '/user/service',
            params: {
                service: JSON.stringify(service), 
                hero: JSON.stringify(contractee),
                contractor: JSON.stringify(contractor),
            }
        });
    }

    return (
        <View style={{marginTop: 5}}>
            {contractee && (
                <TouchableOpacity
                    style={[styles.heroRender, contractee?.super && { borderColor: Colors.golden, borderWidth: 1 }]}
                    onPress={selectService}
                >
                    {/* Avatar & Super Badge */}
                    {role === "contractor" ? (
                        <UserStamp user={contractee.user} superUser={contractee?.super} />
                    ):(
                        <UserStamp user={contractor} superUser={false} />
                    )}

                    {/* Service Info */}
                    <View style={styles.heroCard}>
                        <View style={{flexDirection:'row'}}>
                            <Text style={[styles.textBig,{width: latitudo(35)}]} numberOfLines={1}>
                                {service?.service}
                            </Text>
                            <Text style={{ textAlign: 'center', marginTop: 5, width: latitudo(15), verticalAlign: 'top', color: Colors.primary, fontSize: latitudo(4) }}>
                                ${String(service?.price).substring(0, 15)}
                            </Text>
                        </View>
                        <View style={{margin: 10}} >
                            <Ionicons size={altitudo(2.5)} name="mail" color={Colors.primary} />
                        </View>
                        <Text style={{ textAlign: 'left', marginLeft: 30, fontSize: latitudo(3), color: Colors.g3 }}>
                            From: { new Date(service?.date.start).toLocaleString() }
                        </Text>
                        <Text style={{ textAlign: 'left', marginLeft: 30, fontSize: latitudo(3), color: Colors.g3 }}>
                            To: { new Date(service?.date.end).toLocaleString() }
                        </Text>

                        <Text style={{ textAlign: 'left', marginLeft: 30, fontSize: latitudo(3), color: Colors.g3 }}>
                            { service?.description }
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
        backgroundColor: Colors.bg,
        borderRadius: latitudo(5),
        marginHorizontal: latitudo(2.5),
        marginBottom: altitudo(.5),
        elevation: altitudo(0.5),
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
        width: altitudo(12),
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
        fontSize: altitudo(2.5)
    },

})



export default ServiceFlatList;