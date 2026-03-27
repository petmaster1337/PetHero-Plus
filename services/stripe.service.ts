import { API_ROOT_URL, STRIPE_KEY } from "@/config";
import axios from 'axios';

import {
  useStripe,
  CardField,
  initStripe,
  StripeProvider,
  CardFieldProps,
  isPlatformPaySupported,
  confirmPlatformPayPayment,
  PlatformPay,
  StripeError,
  ConfirmPaymentError,
  PlatformPayError
} from "@stripe/stripe-react-native";
import { Platform } from "react-native";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentIntent";

const BASE_URL = `${ API_ROOT_URL}payment`
    
initStripe({ 
  publishableKey: STRIPE_KEY,
  merchantIdentifier: "merchant.com.petheroplus.pethero",
  urlScheme: "pethero"
}); 


export const getLoginLink = async (token: string, userId: string) => {
  const res = await fetch(`${ BASE_URL }/stripe/dashboard`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  return await res.json();
};

export const getBalance = async (token: string, accountId: string) => {
  const res = await fetch(`${ BASE_URL }/stripe/balance/${accountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const getPayouts = async (token: string, accountId: string) => {
  const res = await fetch(`${ BASE_URL }/stripe/payouts/${accountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const chargeService = async (contract_id: string, token: string) => {
    try {
      const response = await fetch(`${ BASE_URL }/charge`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contractId: contract_id })
      });
      return response.json();
    } catch (error) {
      console.log(`${ BASE_URL }/charge`, error);
      throw error;
    }
}

export const confirmPayment = async (type: string, price: number, service: string, client_secret: string) => {
    const { confirmPayment } = useStripe();

  let paymentResult: any;
    if (type === "card") {
      paymentResult = await confirmPayment(client_secret, { paymentMethodType: "Card" });
    } else {

        if (Platform.OS === 'ios')  {
            const { error, paymentIntent } = await confirmPlatformPayPayment(client_secret, {
                applePay: {cartItems: [{ paymentType: "Immediate" as PlatformPay.PaymentType.Immediate, label: `Pet Hero ${ service }`, amount: String(price) }], merchantCountryCode: 'US', currencyCode: 'USD' },
            });

        } else {
            const { error, paymentIntent } = await confirmPlatformPayPayment(client_secret, {
                googlePay: {amount: Math.round(100 * Number(price)), testEnv: false, merchantCountryCode: 'US', currencyCode: 'USD' },
            });
        }

      ////
    }


}
