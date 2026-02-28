import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { useAuth } from '@/providers/AuthProvider';
import { Image } from 'expo-image';
import { API_ROOT_URL } from '@/config';
import { uploadImage } from '@/services/event.service';
import { updateUser, updateUserPassword } from '@/services/user.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import SetHeader from '@/components/default.menu';
import { Checkbox } from 'react-native-paper';
import { updateHero } from '@/services/hero.service';


const menu = () => {
    const router = useRouter();
    const { user, token, methods, hero } = useAuth();

    const [ name, setName] = useState<string>(user?.name);
    const [ city, setCity] = useState<string>(user?.city);
    const [ address, setAddress] = useState<string>(user?.address);
    const [ available, setAvailable ] = useState<boolean>(hero?.available || false);

    const [ showPasswordForm, setShowPasswordForm] = useState(false);
    const [ newPassword, setNewPassword] = useState('');

    const startChangePassword = () => {
        setShowPasswordForm(true);
    };

    const closePasswordForm = () => {
        setShowPasswordForm(false);
    };

    const handlePasswordChange = async () => {
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        await upPassword(newPassword);
        setShowPasswordForm(false);
        alert('Password updated successfully!');
    };

    useEffect(() => {
        methods.setImune(true);
        return () => {
            methods.setImune(false);
        };        
    }, []);

    useEffect(() => {
        console.log('availability', available);
        if (hero) {
            const newHero = JSON.parse(JSON.stringify(hero));
            newHero.available = available;
            if (newHero) {
                updateHero(hero._id, newHero);
            }
        }
    }, [available]);
    
    const updateImage = async () => {
        if (user) {
            const uid: string = `${user.uid}`;
            const img: any = await uploadImage("user", uid, token);

            if (img) {
                const newUser = {...user};
                newUser.image = `${img}?ts=${Date.now()}`;
                const test = await updateUser(`${newUser._id}`, newUser);
                methods.setUser(test);    
            }
        } else {
            logout();
        }
    }

    const removeAccount = async () => {
        Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
        {
            text: "Cancel",
            style: "cancel",
        },
        {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
            try {
                const response = await fetch(`${API_ROOT_URL}users/${user?._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                });
                if (response.ok) {
                console.log('Account deleted successfully');
                logout();
                } else {
                console.log('Failed to delete account');
                }
            } catch (err) {
                console.log('Error deleting account:', err);
            }
            },
        },
        ]);
    };

    const updateName = async(newName: string) => {
        setName(newName);
        const newUser = {...user};
        newUser.name = newName;
        const test = await updateUser(`${newUser._id}`, newUser);
        methods.setUser(test);
    }

    const updateCity = async(newCity: string) => {
        setCity(newCity);
        const newUser = {...user};
        newUser.city = newCity;
        const test = await updateUser(`${newUser._id}`, newUser);
        methods.setUser(test);
    }

    const updateAddress = async(newAdd: string) => {
        setAddress(newAdd);
        if (newAdd.length > 3) {
            const newUser = {...user};
            newUser.address = newAdd;
            const test = await updateUser(`${newUser._id}`, newUser);
            methods.setUser(test);
        }
    }

    const upPassword = async(newPassword: string) => {
        const newUser = {...user};
        await updateUserPassword(`${newUser._id}`, newPassword);
    }

    const logout = () => {
        methods.logOut();
        router.replace('/(auth)/loginScreen');
    }

    const setPrices = () => {
        router.replace('/(modals)/setPrices');
    }

    const beaHero = () => {
        router.push('/(modals)/beHero');
    }

    
    return (
        <SafeAreaView style={{ flex: 1,  flexDirection: 'column', backgroundColor: 'white'}}>
            {/* absolute HEADER */}
            <SetHeader title="Settings" style={{marginTop: 0}}/>

            <View style={{flexDirection: 'row'}}>
                <View style={styles.topUserLeft}>
                    <TouchableOpacity
                        onPress={() => updateImage()}
                    >
                        <Image source={`${user?.image}?ts=${Date.now()}`} style={[styles.img, {margin: 'auto'}]} />
                    </TouchableOpacity>

                </View>
                <View  style={styles.topUserRight}>
                    <Text style={styles.label}>Name: </Text>
                <TextInput
                            value={name}
                            onChangeText={updateName}
                            placeholder="Name"
                            style={{
                                marginBottom: 10,
                                borderWidth: 1,
                                padding: 8,
                                borderRadius: 5,
                                borderColor: '#ccc',
                                marginHorizontal: 15,
                            }}
                            keyboardType="default"
                            autoCapitalize="none"
                        />
                        <Text style={styles.label}>City: </Text>
                        <TextInput
                            value={city}
                            onChangeText={updateCity}
                            placeholder="City"
                            style={{
                                marginBottom: 10,
                                borderWidth: 1,
                                padding: 8,
                                borderRadius: 5,
                                borderColor: '#ccc',
                                marginHorizontal: 15,
                            }}
                            keyboardType="default"
                            autoCapitalize="none"
                        />
                        <Text style={styles.label}>Address: </Text>
                        <TextInput
                            value={address}
                            onChangeText={updateAddress}
                            placeholder="Address"
                            style={{
                                marginBottom: 10,
                                borderWidth: 1,
                                padding: 8,
                                borderRadius: 5,
                                borderColor: '#ccc',
                                marginHorizontal: 15,
                            }}
                            keyboardType="default"
                            autoCapitalize="none"
                        />
                </View>

            </View>

            <ScrollView style={{ width: '100%', height: 700 }} contentContainerStyle={{ paddingBottom: altitudo(20), marginTop: 50}} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                onPress={startChangePassword}
                >
                    <View style={styles.itemLine}>
                        <Text style={styles.itemText}>Change Password</Text>
                    </View>    
                </TouchableOpacity>

                {hero?.bgAcceptedAt ?
                <View>
                    <TouchableOpacity
                        onPress={setPrices}
                    >
                        <View style={styles.itemLine}>
                            <Text style={styles.itemText}>Set Prices</Text>
                        </View>   
                    </TouchableOpacity>
                        <View style={{width: '100%', borderBottomWidth: 1, borderBottomColor: '#AAA'}}>
                            <View style={[{height: 50, paddingTop: 10, flexDirection: 'row', marginHorizontal: 'auto', alignSelf: 'center'}]}>
                                <Checkbox status={available ? "checked" : "unchecked"} onPress={() => setAvailable(!available)} />
                                <Text style={styles.itemText}>Available</Text>
                            </View>
                        </View>
                </View>
                :
                (!hero &&
                    <View>
                        <TouchableOpacity
                            onPress={beaHero}
                        >
                            <View style={styles.itemLine}>
                                <Text style={[styles.itemText, {color: Colors.primary}]}>Become a Hero</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) ||
                (hero && 
                    <View>
                            <View style={styles.itemLine}>
                                <Text style={[styles.itemText, {color: Colors.primary}]}>Analizing Profile</Text>
                            </View>
                    </View>
                )
                }
                <TouchableOpacity
                    onPress={logout}
                >
                    <View style={styles.itemLine}>
                        <Text style={[styles.itemText]}>Log Out</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={removeAccount}
                >
                    <View style={styles.itemLine}>
                        <Text style={[styles.itemText, {color: Colors.red}]}>Remove Account</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
            {showPasswordForm && (
                <View style={styles.passwordModal}>
                    <Text style={styles.label}>Enter New Password:</Text>
                    <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New Password"
                        secureTextEntry
                        style={styles.input}
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={handlePasswordChange} style={styles.confirmButton}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closePasswordForm} style={styles.cancelButton}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    topUserLeft: {
        backgroundColor: 'white',
        width: latitudo(40),
        marginTop: 20,
    },
    topUserRight: {
        backgroundColor: 'white',
        width: latitudo(60),
        marginTop: 20,
    },
    label:{
        fontFamily: 'mon',
        fontSize: altitudo(1.25),
        color: Colors.g1,
    },
    text: {
        fontFamily: 'mon',
        fontSize: altitudo(2),
        color: Colors.g1,
    },

    textBig: {
        fontFamily: 'mon-b',
        fontSize: altitudo(3)
    },

    tagSquare: {
        flexDirection:"row", 
        backgroundColor: Colors.primary, 
        borderRadius: 5, 
        width: '80%',
        textAlign: 'center',
        margin: 5
    },

    textTag: {
        fontFamily: 'mon',
        fontSize: altitudo(1.618),
        color: 'white',
        marginVertical: 'auto',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 'auto', 
        width: '100%',
    },

    img: {
        aspectRatio: 1,
        width: altitudo(14),
        borderRadius: altitudo(10),
        borderWidth: latitudo(1.5),
        borderColor: Colors.primary,
        elevation: 10,
        marginHorizontal: 'auto',
        marginTop: 10,
    },
    contHeader: {
        width: '100%',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        // height: altitudo(15) - SIZE_STATUSBAR!,
        height: altitudo(5),
        paddingHorizontal: latitudo(5),
    },
    itemLine: {
        width: '100%',
        height: 50,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#AAA',
    },
    itemText: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: Colors.g3,
    },
    passwordModal: {
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
    input: {
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    confirmButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    }
    
})

export default menu;