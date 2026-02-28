import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import SetHeader from '@/components/default.menu';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import { useRouter } from 'expo-router';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { ScrollView } from 'react-native-gesture-handler';
import Feed from '@/components/Feed';

const FeedScreen = () => {
  const { user, services, messages, hero, token, methods } = useAuth();
  const memo = useRef<any>({attempts: 2})
  const router = useRouter();
  const { openDashboard, getLink, balance, payouts, link } = useStripeConnect(token, user);
  useEffect(() => {
    if (services.contractee.length === 0  && services.contractor.length === 0) {
      (async () => {
        if (memo.current.attempts > 0) {
          await methods.updateServices(false);
          await methods.updateServices(true);
          memo.current.attempts--;
        }
      })();
    }
    if (!link) {
      getLink();
    }
  }, [user, token]);

  const converter = (key: string): string => {
    const items: Record<string, string> = {
      usd: '$',
      brl: 'R$',
      cad: 'CA$',
    };
    return items[key.toLowerCase()] ?? '$';
  };

  const getBalance = () => {
    const available = balance?.available;
    const pending = balance?.pending;
    let availableTotal: any = {};
    let pendingTotal: any = {};
    for (const item of available || []) {
      if (!availableTotal.hasOwnProperty(item.currency)) {
        availableTotal[item.currency] = 0;
      }
      availableTotal[item.currency] += item.amount;
    }
    for (const item of pending || []) {
      if (!pendingTotal.hasOwnProperty(item.currency)) {
        pendingTotal[item.currency] = 0;
      }
      pendingTotal[item.currency] += item.amount;
    }
    let availableKeys: string[] = Object.keys(availableTotal);
    let pendingKeys: string[] = Object.keys(pendingTotal);

    const printValues = (item: { [x: string]: any; }, key: string) => {
      return (
        <View>
              <Text style={styles.valuesRow}>{`${converter(key)} ${ (Number(item[key]) / 100).toFixed(2) }`}</Text>
        </View>
      )
    }

    return (
      <View>
        <Text style={styles.balanceTitle}>Available</Text>
      {availableKeys.map((key) => (
        printValues(availableTotal, key)
      ))
      }
      <Text style={styles.balanceTitle}>Pending</Text>
      {pendingKeys.map((key) => (
        printValues(pendingTotal, key)
      ))
      }
    </View>)
  }
 
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SetHeader title="Feed" style={{marginTop: 0}} />
      <View>
      {hero?.bgAcceptedAt && (
        <View style={{ flexDirection: 'column'}}>
          <TouchableOpacity
              style={styles.stripeLink}
              onPress={ openDashboard }
          >
            <Text style={{ textAlign: 'center', fontSize: 20, fontFamily: 'mon-b', color: 'white' }}>
              Open Stripe Dashboard
            </Text>
          </TouchableOpacity>
            { getBalance() }
            <View style={styles.underline}></View>
        </View>
      )}
        <View style={{width: '100%', height: altitudo(60)}}>
          <Feed/>      
        </View>
      </View>
    </View>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  block: {
    height: 'auto',
    borderBottomWidth: 1,
    borderColor: Colors.g5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 20,
    color: Colors.g3,
  },
  totals: {
    width:'100%',
    height: '20%',
    borderWidth: 3,

  },
  stripeLink: {
    width:'80%',
    margin: 'auto',
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: Colors.primary,
    elevation: 10,
    borderRadius: 8,
    paddingTop: 10,
    height: 50,
    color: 'white'
  },

  balanceTitle: {
    marginRight: 40,
    marginTop: 10,
    marginLeft: 40,
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'mon'
  },
  valuesRow: {
    flexDirection: 'row',
    width: latitudo(100),
    marginTop: -10,
    textAlign: 'right',
    paddingRight: 40,
    fontFamily: 'mon'
  },
  underline: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
    opacity: 0.1
  }

});
