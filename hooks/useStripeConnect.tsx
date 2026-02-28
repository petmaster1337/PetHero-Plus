import { useState, useEffect } from 'react';
import { getLoginLink, getBalance, getPayouts } from '@/services/stripe.service';
import * as WebBrowser from 'expo-web-browser';

export interface StripeBalance {
  available: any[];
  pending: any[];
}

export interface StripePayout {
  id: string;
  amount: number;
  arrival_date: number;
  status: string;
  currency: string;
}

export const useStripeConnect = (token: string, user: any) => {
  const [balance, setBalance] = useState<StripeBalance | null>(null);
  const [payouts, setPayouts] = useState<StripePayout[]>([]);
  const [link, setLink] = useState<string>('');

  const openDashboard = async () => {
    console.log('OPEN DASHBOARD');
    if (!token || !user?._id) return;
    const res = await getLoginLink(token, user?._id);
    console.log('DASHBOARD URL', JSON.stringify(res));
    if (res?.url) {
      await WebBrowser.openBrowserAsync(res.url);
    }
  };

  const getLink = async () => {
    if (!token || !user?._id) return;
    const res = await getLoginLink(token, user?._id);
    if (res?.url) {
      setLink(res.url);
    }
  };

  const fetchBalance = async () => {
    if (!token || !user?._id) return;
    const data = await getBalance(token, user?._id);
    if (data) setBalance(data);
  };

  const fetchPayouts = async () => {
    if (!token || !user?._id) return;
    const data = await getPayouts(token, user?._id);
    if (data?.data) setPayouts(data.data);
  };

  useEffect(() => {
    if (token && user?._id) {
      fetchBalance();
      fetchPayouts();
      getLink();
    }
  }, [token, user]);

  return {
    link,
    balance,
    payouts,
    openDashboard,
    fetchBalance,
    fetchPayouts,
    getLink,
  };
};
