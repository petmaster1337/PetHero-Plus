import React, { useEffect, useState } from 'react';
import { altitudo, dstyles, latitudo, Colors } from '@/constants/Constants';
import { useAuth } from '@/providers/AuthProvider';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';

const HeroIndex = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { methods } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://${process.env.API_ROOT_URL}/heroes`);
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: altitudo(2) }}>
      <StatusBar style="light" animated />
      <Text style={{ fontFamily: 'mon-b', fontSize: altitudo(6) }}>Hero Center</Text>

      {loading && <ActivityIndicator size="large" color={Colors.g3} />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {data && (
        <FlatList
          data={data.pets} // Assuming the API returns a "pets" array
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ borderWidth: 1, borderRadius: 8, paddingHorizontal: latitudo(2), paddingVertical: altitudo(1), marginBottom: latitudo(2) }}>
              <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(1.5) }}>{item.name}</Text>
              <Text style={{ fontFamily: 'mon', fontSize: altitudo(1.25) }}>{item.description}</Text>
            </View>
          )}
        />
      )}

      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          style={styles.buttonUser}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={{ fontFamily: 'mon-sb', fontSize: altitudo(3), color: Colors.g2 }}>BACK</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'mon', fontSize: altitudo(1) }}>Back to USER interface</Text>
      </View>

      <TouchableOpacity
        style={[
          {
            marginHorizontal: latitudo(20),
            marginVertical: altitudo(2.5),
            paddingVertical: altitudo(0.5),
            elevation: 3,
            backgroundColor: 'white',
            alignItems: 'center',
            borderRadius: 100,
          },
          { margin: 0, padding: altitudo(1), justifyContent: 'center' },
        ]}
        onPress={() => methods.logOut()}
      >
        <Text style={{ fontFamily: 'mon', fontSize: altitudo(2), color: 'red' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeroIndex;

const styles = StyleSheet.create({
  buttonUser: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    backgroundColor: 'white',
    paddingVertical: altitudo(1),
    paddingHorizontal: latitudo(2),
    margin: altitudo(1),
    elevation: 3,
  },
});
