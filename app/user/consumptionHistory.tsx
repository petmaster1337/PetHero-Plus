import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { getBuyerConsumptionById, getProductById } from '@/services/product.service';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Constants';


const ConsumptionHistory = () => {
    const [consumptions, setConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const history = await getBuyerConsumptionById(user._id);
        setConsumptions(history);
        setLoading(false);
    };

    const buyAgain = async (list: any) => {
      const newList = [];
      let current;
      for (const item of list) {
        current = await getProductById(item._id);
        newList.push({...current, quantity: item.quantity});
      }
        router.push(`/user/cart?cartItems=${ JSON.stringify(newList) }`);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>

            {item.products.map((item: any, index: number) => (
                <View key={`${item._id}${index}`} style={{flexDirection: 'row', width: '100%', height: 50}} >
                    <Image
                        style={styles.prodImage}
                        source={{uri: item.image}}
                    />
                    <View style={{flexDirection: 'column'}}>
                        <Text style={[styles.prodText]}>{ item.name }</Text>
                        <Text style={[styles.prodText]}>{item.quantity}x    ${ Number(item.price).toFixed(2) }</Text>
                    </View>
                </View>                
            ))}
            <View style={{flexDirection: 'row'}}>
              <Text>Items: {item.numberItems}</Text>
              <Text style={{marginLeft: 20}}>Total: ${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => buyAgain(item.products)}
            >
              <Text style={styles.button}>Buy Again</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#666" />;
    }

    return (
        <View style={styles.container}>
        <Text style={styles.header}>Your Purchase History</Text>
        <FlatList
            data={consumptions}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.empty}>No history found.</Text>}
        />
        </View>
    );
};

export default ConsumptionHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  date: {
    fontSize: 15,
    color: '#888',
    marginTop: 6,
    textAlign: 'right'
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  prodImage: {
    borderRadius: 6,
    width: 60,
    height: 45,
  },
  prodText: {
    marginLeft: 10,
  },
  button: {
    borderRadius: 6,
    backgroundColor: Colors.primary,
    width: 90,
    height: 25,
    color: 'white',
    fontWeight: 'bold',
    verticalAlign: 'middle',
    textAlign: 'center',
    elevation: 4
  }
});
