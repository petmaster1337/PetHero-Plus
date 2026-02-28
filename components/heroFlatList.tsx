import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Icon from "@/components/CustomIcon";
import { altitudo, Colors, latitudo } from "@/constants/Constants";
import React from "react";
import { Data, getDistance } from '@/constants/Services';
import { useAuth } from "@/providers/AuthProvider";

interface HeroFlatListProps {
  hero: any;
  buyIt: (item: any, petType: string, serviceSelected: string) => void;
  petType: string;
  serviceSelected: string;
  isOnline: boolean;
  methods: any;
  user: any;
}

const HeroFlatList: React.FC<HeroFlatListProps> = ({ hero, buyIt, petType, serviceSelected, isOnline, methods, user }) => {
  const key = serviceSelected.trim() as keyof typeof Data;

  const selectProvider = () => {
    buyIt(hero, petType, serviceSelected.trim());
  };

  const distance = () => {
    return getDistance(hero?.user, user);
  };

  const price = hero?.price[0][petType][serviceSelected.trim()];

  return (
    <View style={[
      styles.heroRender,
      hero?.super && { borderColor: Colors.golden, borderWidth: latitudo(2.5) },
    ]}>
      <Text style={styles.textBig} numberOfLines={2}>{hero.name}</Text>

      <TouchableOpacity onPress={selectProvider}>
        {/* AVATAR + SUPER */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image style={[styles.imgHeroes]} source={`${hero?.user?.image}`} />
          {hero?.super && (
            <View style={{
              position: 'absolute',
              right: -altitudo(5.5 / 2),
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: Colors.bg,
              borderRadius: altitudo(5),
              borderWidth: altitudo(0.5),
              width: altitudo(5.5),
              aspectRatio: 1
            }}>
              <View style={{
                alignItems: 'center',
                backgroundColor: Colors.bg,
                borderColor: Colors.g1,
                borderRadius: altitudo(5),
                borderWidth: 1,
                width: altitudo(5),
                aspectRatio: 1
              }}>
                <Icon provider='AntDesign' name='star' size={altitudo(3)} color={Colors.primary} />
                <Text style={{ fontFamily: 'mon', fontSize: altitudo(1), color: Colors.g1 }}>super</Text>
              </View>
            </View>
          )}
        </View>

        {/* CARDS */}
        <View style={styles.heroCard}>
          <View style={{ position: 'absolute', right: 0, bottom: 0, height: altitudo(10), width: 150 }}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={[isOnline ? { color: Colors.primary } : { color: Colors.g3 }, {textAlign: 'right'}]}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: 'mon', width: 150, textAlign: 'right' }}>
                {distance().toFixed(2)} miles
              </Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ lineHeight: altitudo(2), fontFamily: 'mon', fontSize: altitudo(1.5), color: Colors.primary, textAlign: 'right' }}>
                {Data[key].payCycle}
              </Text>
              <Text style={{ lineHeight: altitudo(2), fontFamily: 'mon', fontSize: altitudo(1.5), color: Colors.primary, textAlign: 'right' }}>
                {serviceSelected.trim()}: ${price}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  heroRender: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: Colors.g1,
    padding: latitudo(2.5),
    backgroundColor: Colors.bg,
    borderRadius: latitudo(5),
    marginHorizontal: latitudo(2.5),
    marginBottom: altitudo(3),
  },
  heroCard: {
    flex: 1,
    paddingHorizontal: latitudo(2.5),
    borderRadius: latitudo(5),
  },
  imgHeroes: {
    borderWidth: 1,
    borderColor: Colors.g1,
    width: altitudo(15),
    height: "100%",
    aspectRatio: 1,
    borderRadius: altitudo(2),
  },
  textBig: {
    fontFamily: 'mon-b',
    fontSize: altitudo(2.5),
    width: '100%',
    textAlign: 'center'
  },
});

export default HeroFlatList;
