import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { getProductById, getReceiverById, getPayerById } from '@/services/product.service';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Constants';
import { getContractById } from '@/services/event.service';
import { getHeroById } from '@/services/hero.service';
import { getPetById } from '@/services/pet.service';

const ServiceHistory = () => {
  const [ groupedPayments, setGroupedPayments ] = useState<{ [key: string]: any[] }>({});
  const [ loading, setLoading ] = useState(true);
  const [ map, setMap ] = useState(new Map());
  const { user } = useAuth();
  const router = useRouter();
  const contractMap = new Map();
  let temporary: any;
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (user) {
      const buyer = await getPayerById(String(user._id));
      const seller = await getReceiverById(String(user._id));
      const all = buyer.concat(seller);
      const grouped = await groupPaymentsByMonth(all);
      setGroupedPayments(grouped);
      setLoading(false);
    }
  };

  const groupPaymentsByMonth = async (payments: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    for (const payment of payments) {
      const date = new Date(payment.createdAt);
      if (payment.contract.length > 2) {
        temporary = await getContractById(payment.contract)
        if (temporary) {
          contractMap.set(payment.contract, temporary );
        }
        temporary = null;
      }
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(payment);
    }
    setMap(contractMap);
    return grouped;
  };

  const buyAgain = async (products: any[]) => {
    const newList = [];
    let current;
    for (const item of products) {
      current = await getProductById(item._id);
      newList.push({ ...current, quantity: item.quantity });
    }
    router.push(`/user/cart?cartItems=${ JSON.stringify(newList) }`);
  };

  const getContractData = (item: string) => {
    console.log('id', item, contractMap);
    const data = map.get(item);
    return data;
  }

  const seeDetails = async (contractId: string) => {
    const contract = map.get(contractId);
    const hero = await getHeroById(contract.contractee);
    const pet = await getPetById(contract.pet);

    router.push(`/user/serviceDetails?contract=${ JSON.stringify(contract) }&hero=${ JSON.stringify(hero) }&pet=${ JSON.stringify(pet) }`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#666" />;
  }

  return (
    <ScrollView style={styles.container}>
      {Object.entries(groupedPayments).map(([month, payments]) => (
        <View key={month} style={styles.monthSection}>
          <Text style={styles.monthHeader}>{month}</Text>
          {payments.map((item) => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>

              {item.products && item.products.length > 0 ? (
                <View>
                  {item.products.map((product: any, idx: number) => (
                    <View key={`${product._id}${idx}`} style={styles.productRow}>
                      <Image style={styles.prodImage} source={{ uri: product.image }} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.prodText}>{product.name}</Text>
                        <Text style={styles.prodText}>
                          {product.quantity}x ${Number(product.price).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>Items: {item.products.length}</Text>
                    <Text>Total: ${item.price.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => buyAgain(item.products)}>
                    <Text style={[styles.button, {marginLeft: 'auto', marginRight: 10}]}>Buy Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text>{ getContractData(item.contract).service.substring(0,1).toUpperCase() }{ getContractData(item.contract).service.substring(1) }: { new Date(getContractData(item.contract).date.start).toLocaleString() }</Text>
                  <Text style={{marginLeft: 'auto', marginRight: 10}}>Total: ${item.price.toFixed(2)}</Text>
                  <View style={{flexDirection: 'row', width: '100%'}} >
                      <TouchableOpacity
                        onPress={() => seeDetails(item.contract)}
                        >
                        <Text style={[styles.button, {marginLeft: 'auto', marginRight: 10}]}>Details</Text>
                      </TouchableOpacity>

                    </View>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default ServiceHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 12,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  date: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
    marginBottom: 6,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prodImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
  },
  prodText: {
    fontSize: 14,
  },
  button: {
    margin: 'auto',
    marginTop: 8,
    width: 100,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    overflow: 'hidden',
    elevation: 3,
  },
});
