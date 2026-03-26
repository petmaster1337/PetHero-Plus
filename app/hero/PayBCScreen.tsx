import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, Image } from "react-native";
import {
  useStripe,
  CardField,
  initStripe,
  isPlatformPaySupported,
  confirmPlatformPayPayment,
  ConfirmPaymentError,
  PlatformPayError,
  StripeError,
  StripeProvider
} from "@stripe/stripe-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { API_ROOT_URL, BC_FEE, CHECKR_INTEGRATION_URL, STRIPE_KEY } from "@/config";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, TRANSACTION_FEE } from "@/constants/Constants";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentIntent";
import axios from "axios";
import { getHeroById } from "@/services/hero.service";

const PaybackBackgroundCheckScreen = ({setPaid, data, setHero, setAccepted}:{setPaid: any, data: any, setHero: any, setAccepted: any}) => {
  const [ cardInfo, setCardInfo ] = useState(null);
  const [ platformAvailable, setPlatformAvailable] = useState<boolean>(false);
  const { user, token } = useAuth();
  const router = useRouter();
  const { confirmPayment } = useStripe();
  const uidString = `${Math.floor(Math.random() * Math.pow(32, 6)).toString(32)}r${Math.floor(Math.random() * Math.pow(32, 6)).toString(32)}k${Math.floor(Math.random() * Math.pow(32, 6)).toString(32)}x`;

  const handleCardChange = (cardDetails: any) => {
    console.log(cardDetails);
    console.log("CARD DETAILS:", cardDetails);
  //   setCardInfo(cardDetails.complete ? cardDetails : null);
  };

  const cancelPayment = () => {
        Alert.alert("Payment Cancelled", `Status: Cancelled by user`);
        router.push('/(tabs)')
  }

    useEffect(() => {
      const checkPayment = async () => {
        const available = await isPlatformPaySupported();
        setPlatformAvailable(available);
      };
      checkPayment();
    }, []);

    const finalizePayment = async (error: StripeError<ConfirmPaymentError> | StripeError<PlatformPayError> | undefined, paymentIntent: Result | undefined) => {
      if (error) {
        Alert.alert("Payment Failed", error.message);
      } else {
        Alert.alert("Payment Successful", `Status: ${paymentIntent?.status}`);
        await startCheck();
        //setPaid(true);
        //router.push('/(modals)/beHero')
      }
    }

  const handlePayment = async (type: string) => {
    const amount =  BC_FEE;
    try {
      const response = await fetch(`${API_ROOT_URL}payment/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: uidString,
          price: amount,
          classification: 'fee',
          currency: "usd",
          payer: user._id,
          receiver: "pethero-store",
          contract: undefined,
          products: ['fee'],
          type: 'background-check',
        }),
      });
      const item = await response.json();
      const { client_secret, filed } = item;    

console.log(item)

      if (type === "Card") {
        const { error, paymentIntent } = await confirmPayment(client_secret, {
          paymentMethodType: "Card",
        });
        await finalizePayment(error, paymentIntent);
      } else {
        const { error, paymentIntent } = await confirmPlatformPayPayment(client_secret, {
        googlePay: {amount: 100 * amount, testEnv: false, merchantCountryCode: 'US', currencyCode: 'USD' },
        applePay: {cartItems: [{ paymentType: "Immediate" as any, label: `Pet Hero Products`, amount: amount.toFixed(2) }], merchantCountryCode: 'US', currencyCode: 'USD' },
      });
              
      await finalizePayment(error, paymentIntent);
    }

    } catch (error: any) {
      Alert.alert("Payment Error", `${error?.message}` || JSON.stringify(error));
    }
  };

    const startCheck = async () => {
      try {
        const res = await axios.post(
            CHECKR_INTEGRATION_URL,       
            data,
        {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,              
            }});
  
        if (!(res.status === 200 || res.status === 201)) throw new Error('Error on Background Check');
            const hero = await getHeroById(res.data.heroId)
            setHero({...hero});
        Alert.alert(
          "Starting soon!",
          "A screening company will email you for the next steps."
        );
        setAccepted(true);
      } catch (e) {
        Alert.alert("Error", "Could not start background check. Try again later.");
      }
    };
  return (
    <StripeProvider 
    publishableKey= { STRIPE_KEY }
    merchantIdentifier="merchant.com.petheroplus.pethero"
    urlScheme="pethero"
    >
      <View style={styles.container1}>
        <Text style={styles.title}>Finalize Payment</Text>
        <View style={{flexDirection: 'row', width: '100%', height: 30, borderBottomWidth: 1, borderColor: '#CCC'}}>
                <Text style={[{width: '60%'}]}>
                  Background Check Fee
                </Text>
                <Text style={{width: '20%'}}>
                ${Number(BC_FEE).toFixed(2)}
                </Text>
              </View>
          <View style={{ padding: 20, backgroundColor: Colors.g5}}>
            <CardField
              postalCodeEnabled={false}
              autofocus
              onCardChange={handleCardChange}
              style={styles.cardField}
            />
          </View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonOption}>
            <TouchableOpacity style={[styles.button,{backgroundColor: 'gray'}]}  onPress={cancelPayment}>
              <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonOption}>
            <TouchableOpacity style={[styles.button,{backgroundColor: 'blue'}]}  onPress={() => handlePayment("Card")}>
              <Text style={styles.text}>Pay With Card</Text>
            </TouchableOpacity>
          </View>
            {platformAvailable && Platform.OS === "ios" && (
              <View style={styles.buttonOption}>
                <TouchableOpacity style={[styles.button,{backgroundColor: 'black', paddingLeft: 10, paddingTop: 2.5}]}  onPress={() => handlePayment("apple")}>
                  <Image
                    source={require("@/assets/images/apay.jpg")}
                    style={styles.icon}
                    />
                  </TouchableOpacity>
              </View>
            )}
            {platformAvailable && Platform.OS === "android" && (
              <View style={styles.buttonOption}>
                <TouchableOpacity style={[styles.button,{backgroundColor: 'black', paddingLeft: 10, paddingTop: 2.5}]} onPress={() => handlePayment("google")}>
                  <Image
                    source={require("@/assets/images/gpay.jpg")}
                    style={styles.icon}
                    />
                  </TouchableOpacity>
              </View>  
            )}
        </View>
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container1: { padding: 20, margin: -10 -10, flex: 1, color: '#000000', backgroundColor: Colors.g5 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  textTotal: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  cardField: { height: 50, marginVertical: 20, backgroundColor: Colors.g5 },
  buttonContainer: { flexDirection: "column", justifyContent: "space-between", marginTop: 10 },
  buttonOption: {marginTop: 6, flexDirection: "row", width: '100%'},
  button: {width: '100%', height: 40, marginTop: 4, flexDirection: 'row', borderRadius: 8},
  text: {fontSize: 15, textAlign: 'center', width: '100%', fontWeight: 'bold', color: 'white', marginTop: 10},
  icon: {width: 80, height: 35, borderRadius: 6, backgroundColor: 'black',}
});

export default PaybackBackgroundCheckScreen;
