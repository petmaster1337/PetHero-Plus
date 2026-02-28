import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router';
import { altitudo, latitudo, Colors, TRANSACTION_FEE } from '@/constants/Constants';
import { API_ROOT_URL, STRIPE_KEY } from '@/config';

// @ts-ignore
import {
  useStripe,
  CardField,
  StripeProvider,
  CardFieldProps,
  isPlatformPaySupported,
  createPaymentMethod,
} from "@stripe/stripe-react-native";
import { Data } from '@/constants/Services';
import { removeAttention } from '@/services/attention.service';
import { useAuth } from '@/providers/AuthProvider';
import { getUserByUid } from '@/services/user.service';
import { getHeroById } from '@/services/hero.service';
import { updateContract } from '@/services/event.service';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const OpenBill = () => {
  const [ cardInfo, setCardInfo] = useState<CardFieldProps | null>(null);
  const [ price, setPrice ] = useState<number>(0);
  const [ serviceName, setServiceName ] = useState<string>('');
  const [ accept, setAccept ] = useState<boolean>(true);
  const [ contract, setContract] = useState<any>();
  const [ platformAvailable, setPlatformAvailable] = useState<boolean>(false);
  const { user, methods, token } = useAuth();
  const { service, hero, pet, contractor, confirm, justify } = useLocalSearchParams();
  
  const router = useRouter();
  const { confirmSetupIntent, confirmPlatformPaySetupIntent } = useStripe();
  // const { confirmPayment } = useStripe();
  const [ conf, setConf ] = useState<boolean>(Boolean(`${confirm}`) || false);
  let serviceObj: any = {};

  useEffect(() => {

    serviceObj = JSON.parse(`${ service }`);

    setContract(serviceObj);
    setPrice(serviceObj.price);
    setServiceName(serviceObj.service);

  }, [service, hero, pet, contractor]);

  const confirmIntent = (intent: boolean) => {
    setAccept(intent);
  }
      
  const getSize = () => {
    const end = contract?.date.end;
    const start = contract?.date.start;
    const service = contract?.service;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const serv = service as keyof typeof Data;
    const answer = Math.floor(ms / Data[serv].billing);
    return answer;
  }

  useEffect(() => {
    const checkPayment = async () => {
      const available = await isPlatformPaySupported();
      setPlatformAvailable(available);
    };
    checkPayment();
  }, []);

  const handleCardChange = (cardDetails: any) => {
    if (cardDetails.complete) {
      setCardInfo(cardDetails.complete);
    } else {
      setCardInfo(null);
    }
  };

  const handlePayment = async (type: "card" | "apple" | "google") => {
  if (price < 0.5) {
    Alert.alert("Error", "Price too low to process payment.");
    return;
  }
  try {
    const hero = await getHeroById(contract?.contractee?._id);
    const heroUser = await getUserByUid(hero?.uid);
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
    });
    if (error) {
      console.error('Error', error);
    }

    const response = await fetch(`${API_ROOT_URL}payment/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: `${Math.floor(Math.random() * Math.pow(16, 6)).toString(16)}${Math.floor(Math.random() * Math.pow(16, 6)).toString(16)}`,
        price,
        currency: "usd",
        payer: user._id,
        receiver: heroUser._id,
        contract: contract,
        products: undefined,
        contractor: contract.contractor._id,
        contractee: contract.contractee._id,
        service: contract.service,
        pet: contract.pet._id,
        items: 1,
        date: {start: contract.date.start, end: contract.date.end},
        type,
        paymentMethodId: paymentMethod?.id,
      }),
    });

    const answer = await response.json();
    const client_secret = answer.client_secret;
    const setupIntent = answer.id;
    const filed = answer.filed;
    
    const finalizePayment = async () => {
    if (error) {
      Alert.alert(`Payment Failed \n ${error}`);
      return;
    } else {
      Alert.alert("Payment Successful");
      try { 
        if (user?._id && contract?.uid) {
          await removeAttention(token, String(user._id), String(contract.uid));
          console.log(137, 'att removed')
        }
        if (heroUser?._id && contract?.uid) {
          await removeAttention(token, String(heroUser._id), String(contract.uid));
          console.log(141, 'att removed')
        }
        if (heroUser?.notification)
          await methods.sendPushNotification(heroUser.notification, "Pet Hero", "Price Accepted");
        if (user?.notification)
          await methods.sendPushNotification(user.notification, "Pet Hero", "Price Accepted");
        contract.status = "requested";
        contract.step = "requested";
        if (contract._id)
          await updateContract(contract._id, contract, token);
        router.replace(`/message?message:'Successfully Filed!'`);
      } catch (e) {
        console.log("Error finalizing payment:", e);
      }
    }
  };

    finalizePayment();

  } catch (err: any) {
    Alert.alert("Payment Error", err.message || "An unexpected error occurred");
    console.log("Payment Error:", err);
  }
};

  const confirming = async () =>{
    if (!accept) {
      await canceling();
    }
    setConf(false);
  }

  const canceling = async () => {
    try {
      const params = { 
        date: contract?.date.start, 
        pet,
        service: contract?.service, 
        size: String(getSize()), 
        additional: contract?.description, 
        avoid: JSON.stringify([contract?.contractee?._id])
      };
      const hero = await getHeroById(contract?.contractee?._id);
      const heroUser = await getUserByUid(hero?.uid);
      await removeAttention(token, String(user._id), String(contract.uid));
      await removeAttention(token, String(heroUser?._id), contract.uid);
      if (heroUser.notification)
        await methods.sendPushNotification(heroUser.notification, 'Pet Hero',  'Price Rejected');
      if (user.notification)
        await methods.sendPushNotification(user.notification, 'Pet Hero', 'Price Rejected');
  
      router.push({
        pathname: "/hero/selecting",
        params
      });
  
    } catch(e) {
      console.log('ERROR CANCELING', e);
    }
  }

  const manageConfirm = () => {
      Alert.alert(
        accept? `You are accepting`: 'You are rejecting', 
        `Are you sure you want to proceed?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress:  () => {
                console.log("Action canceled");
                 canceling();
            }
          },
          {
            text: "Confirm",
            onPress:  () => {
                 confirming();
            }
          }
        ],
        { cancelable: true }
    );
  }

 
  return (
    <StripeProvider 
    publishableKey= { STRIPE_KEY }
    merchantIdentifier="merchant.com.pethero"
    urlScheme="pethero"
    >

      {conf ? (
        <View>
          <Text style={{fontSize: latitudo(6), color:Colors.g2, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', marginTop: altitudo(5)}}>{ `This service price is $${ price.toFixed(2) },\n do you agree with it?` }</Text>
          <Text style={{fontSize: latitudo(5), fontWeight: 'bold', textAlign: 'center', margin: 10}}>{ justify }</Text>
          <View style={{flexDirection: "row", width: '100%', alignContent: 'center'}}>
            <TouchableOpacity
              onPress={() => confirmIntent(false)}
            >
              <Text style={[!accept ? { backgroundColor: Colors.primary, color: 'white' }:{ backgroundColor: '#EEE', color: '#AAA' }, styles.buttons, {marginLeft: latitudo(5), marginRight: latitudo(5)} ]}>
                Reject
              </Text>
            </TouchableOpacity>          
            <TouchableOpacity
              onPress={() => confirmIntent(true)}
            >
              <Text style={[accept ? { backgroundColor: Colors.primary, color: 'white' }:{ backgroundColor: '#EEE', color: '#AAA' }, styles.buttons, {marginLeft: latitudo(5), marginRight: latitudo(5)}]}>
                Accept
              </Text>
              </TouchableOpacity>
          </View>
          <TouchableOpacity
              onPress={() => {manageConfirm()}}
            >
              <Text style={[styles.buttons, {width: latitudo(90), backgroundColor: Colors.primary, marginTop: 30, color: 'white' }]}>
                Confirm
              </Text>
            </TouchableOpacity>          

        </View>
      ) :
      (
        <SafeAreaProvider style={[styles.container1, {paddingTop: 50, top: -altitudo(5), width: "100%"}]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={[styles.scrollViewBill, {backgroundColor: '#FAFAFA' }]}>
          <Text style={styles.title}> Authorize Service </Text>
          <Text style={styles.textTotal} >{ `${serviceName.substring(0, 1).toUpperCase()}${serviceName.substring(1).toLowerCase()}` }</Text>
          <View style={[styles.receiptLine, {marginTop: 20}]}>
            <Text>Service: </Text>
            <Text>${ price.toFixed(2) }</Text> 
          </View>
          <View style={styles.receiptLine}>
            <Text>Transaction Fee:</Text> 
            <Text>${(price * TRANSACTION_FEE).toFixed(2)}</Text>
          </View>
          <View style={styles.receiptLine}>
            <Text>Total:</Text> 
            <Text>${(price * (1 + TRANSACTION_FEE)).toFixed(2)}</Text>
          </View>
          <View style={{ padding: 20}}>
            <CardField
              postalCodeEnabled={ false }
              autofocus
              placeholders={{ number: "1234 5678 9012 3456" }}
              onCardChange={handleCardChange}
              style={styles.cardField}
            />
        <View style={styles.buttonContainer}>
            <View style={styles.buttonOption}>
              <TouchableOpacity style={[styles.button,{backgroundColor: 'gray'}]}  onPress={canceling}>
                <Text style={styles.text}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonOption}>
              <TouchableOpacity style={[styles.button,{backgroundColor: 'blue'}]}  onPress={() => handlePayment("card")}>
                <Text style={styles.text}>Pay With Card</Text>
              </TouchableOpacity>
            </View>
                {platformAvailable && Platform.OS === "ios" && (
                  <View style={styles.buttonOption}>
                    <TouchableOpacity style={[styles.button,{backgroundColor: 'black'}]}  onPress={() => handlePayment("apple")}>
                      <Image
                        source={require("@/assets/images/apay.jpg")}
                        style={styles.icon}
                        />
                      </TouchableOpacity>
                  </View>
                )}
                {platformAvailable && Platform.OS === "android" && (
                  <View style={styles.buttonOption}>
                    <TouchableOpacity style={[styles.button,{backgroundColor: 'black'}]} onPress={() => handlePayment("google")}>
                      <Image
                        source={require("@/assets/images/gpay.jpg")}
                        style={styles.icon}
                        />
                      </TouchableOpacity>
                  </View>
                )}
        </View>


            </View>
        </ScrollView>  
  
        </SafeAreaProvider>  
      )}
    </StripeProvider>
  )
}


const styles = StyleSheet.create({
    container1: { padding: 20, flex: 1, color: '#000000', backgroundColor: Colors.g4 },
  cardField: { height: 50, marginVertical: 20, backgroundColor: Colors.g4 },

  messageHeader: {
    fontSize: latitudo(4),
    fontWeight: 'bold',
    fontFamily: 'mon',
  },
  scrollViewBill: {
    display: 'flex',
  },
  receiptLine:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: '10%', 
    width: '80%', 
    marginTop: 5, 
    borderBottomWidth: 1,
    borderColor: Colors.g5
  },
  title: {
    marginTop: 100,
    fontSize: altitudo(2.5),
    color: Colors.g3,
    fontFamily: 'mon',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  textTotal: {
    marginTop: 25,
    fontSize: altitudo(4),
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

  startButton: {
    borderRadius: 10,
    textAlign: 'center',
    verticalAlign: 'middle',
    fontWeight: 'bold',
    width: latitudo(40),
    fontSize: latitudo(4),
    height: 30,
    backgroundColor: Colors.primary,
    color: 'white',
    margin: 'auto',
    marginTop: 5,
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
  buttons: {
    fontSize: latitudo(6), 
    fontWeight: 'bold', 
    height: 50, 
    width: latitudo(40), 
    elevation: 2, 
    borderRadius: 10, 
    textAlign: 'center', 
    paddingTop: 8,
    margin: 'auto'
  },

  buttonContainer: { flexDirection: "column", justifyContent: "space-between", marginTop: 20 },
  buttonOption: {marginTop: 6, flexDirection: "row", width: '100%'},
  button: {width: '100%', height: 45, marginTop: 10, paddingTop: 5, flexDirection: 'row', elevation:4, borderRadius: 8, fontSize: 32},
  text: {fontSize: 18, textShadowColor: 'black', textAlign: 'center', width: '100%', fontWeight: 'bold', color: 'white', paddingTop: 5},
  icon: {width: 80, height: 35, borderRadius: 6, backgroundColor: 'black',}
})

export default OpenBill;