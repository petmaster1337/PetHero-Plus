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
import { API_ROOT_URL, STRIPE_KEY } from "@/config";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, TRANSACTION_FEE } from "@/constants/Constants";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentIntent";

const CheckoutScreen = () => {
  const [ cardInfo, setCardInfo ] = useState(null);
  const [ platformAvailable, setPlatformAvailable] = useState<boolean>(false);
  const [ productList, setProductList ] = useState<any>(null);
  const { user, methods } = useAuth();
  const router = useRouter();
  const { confirmPayment } = useStripe();
  const { list, total } = useLocalSearchParams();
  const uidString = `${Math.floor(Math.random() * Math.pow(32, 6)).toString(32)}j${Math.floor(Math.random() * Math.pow(32, 6)).toString(32)}l${Math.floor(Math.random() * Math.pow(32, 6)).toString(32)}s`;
  useEffect(() => {
    setProductList(JSON.parse(String(list)));
    methods.registerForPushNotificationsAsync();
 }, []);

  const handleCardChange = (cardDetails: any) => {
    console.log(cardDetails);
    console.log("CARD DETAILS:", cardDetails);
  //   setCardInfo(cardDetails.complete ? cardDetails : null);
  };

  const cancelPayment = () => {
        Alert.alert("Payment Cancelled", `Status: Cancelled by user`);
        router.push('/(tabs)');
  }

  
    useEffect(() => {
      const checkPayment = async () => {
        const available = Platform.OS === 'ios' ? true: await isPlatformPaySupported();
        setPlatformAvailable(available);
      };
      checkPayment();
    }, []);

    const finalizePayment = (error: StripeError<ConfirmPaymentError> | StripeError<PlatformPayError> | undefined, paymentIntent: Result | undefined) => {
      if (error) {
        Alert.alert("Payment Failed", error.message);
      } else {
        Alert.alert("Payment Successful", `Status: ${paymentIntent?.status}`);
        router.push('/(tabs)')
      }
    }

  const handlePayment = async (type: string) => {
    const amount =  (Number(total) * (1 + TRANSACTION_FEE));
    try {
      const response = await fetch(`${API_ROOT_URL}payment/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: uidString,
          price: amount,
          classification: 'food',
          currency: "usd",
          payer: user._id,
          receiver: "pethero-store",
          contract: undefined,
          products: productList,
          type: 'pet-store',
        }),
      });
      const { client_secret, filed } = await response.json();      

      if (type === "Card") {
        const { error, paymentIntent } = await confirmPayment(client_secret, {
          paymentMethodType: "Card",
        });
        finalizePayment(error, paymentIntent);
      } else {
        const { error, paymentIntent } = await confirmPlatformPayPayment(client_secret, {
        googlePay: {amount: 100 * amount, testEnv: false, merchantCountryCode: 'US', currencyCode: 'USD' },
        applePay: {cartItems: [{ paymentType: "Immediate" as any, label: `Pet Hero Products`, amount: amount.toFixed(2) }], merchantCountryCode: 'US', currencyCode: 'USD' },
      });
              
      finalizePayment(error, paymentIntent);
    }

    } catch (error: any) {
      Alert.alert("Payment Error", `${error?.message}` || JSON.stringify(error));
    }
  };

  return (
    <StripeProvider 
    publishableKey= { STRIPE_KEY }
    merchantIdentifier="merchant.com.pethero"
    urlScheme="pethero"
    >
      <View style={styles.container1}>
        <Text style={styles.title}>Finalize Payment</Text>
        {productList ? (
          <View>
              <View style={{flexDirection: 'row', width: '100%', height: 35, borderBottomWidth: 1, borderColor: Colors.g2}}>
                <Text style={[{width: '60%', fontWeight: 'bold'}]}> Product </Text>
                <Text style={{width: '20%', fontWeight: 'bold'}}> Price </Text>
                <Text style={{width: '20%', fontWeight: 'bold'}}> Subtotal </Text>
              </View>
            {productList.map((item: { uid: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; price: any; quantity: any; }, _index: any) => (
              <View key={`${item.uid}-${Math.floor(Math.random() * (32 ** 4)).toString(32)}`} style={{flexDirection: 'row', width: '100%', height: 30, borderBottomWidth: 1, borderColor: '#CCC'}}>
                <Text style={[{width: '60%'}]}>
                  {item.name}
                </Text>
                <Text style={{width: '20%'}}>
                ${Number(item.price).toFixed(2)}
                </Text>
                <Text style={{width: '20%'}}>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</Text>
              </View>
            ))}
            <View style={{flexDirection: 'row', width: '100%'}}>
              <Text style={[{width: '80%'}]}>
                Transaction Fee
              </Text>
              <Text style={{width: '20%'}}>${(Number(total) * TRANSACTION_FEE).toFixed(2)}</Text>
            </View>      
            <View style={{flexDirection: 'row', width: '100%'}}>
              <Text style={[{width: '80%'}]}>
                Total
              </Text>
              <Text style={{width: '20%'}}>${(Number(total) * (1 + TRANSACTION_FEE)).toFixed(2)}</Text>
            </View>      
          </View>
        ) : (
          <Text>Loading product details...</Text>
        )}
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

export default CheckoutScreen;
