import { API_ROOT_URL, STRIPE_KEY } from "@/config";
import axios from 'axios';

import {
  useStripe,
  CardField,
  initStripe,
  StripeProvider,
  CardFieldProps,
  isPlatformPaySupported,
  confirmPlatformPayPayment
} from "@stripe/stripe-react-native";

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
      paymentResult = await confirmPlatformPayPayment(client_secret, {
        applePay: {
          cartItems: [
            { label: `Pet Hero ${ service }`, amount: price.toFixed(2), paymentType: "Immediate" as any },
          ],
          merchantCountryCode: "US",
          currencyCode: "USD",
        },
        googlePay: {
          amount: Math.round(price * 100),
          currencyCode: "USD",
          testEnv: false,
          merchantCountryCode: "US",
        },
      });
    }
}
