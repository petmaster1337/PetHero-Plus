import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ListRenderItemInfo,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import FeedList from '@/components/FeedList';
import { ScrollView } from 'react-native-gesture-handler';

const ServiceList: React.FC = () => {
  const { services, user, hero } = useAuth();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    const listing = new Map();
    let add = 0;

    for (const item of services?.contractee || []) {
      if (isNearStart(item)) {
        listing.set( item._id, {
          ...item,
          iam: 'contractee',
          date: item.contract?.date?.start,
          key: (Math.floor( listing.size + add)).toString(32),
          subtype: 'service',
        });
        add++;
      }
    }
    for (const item of services?.contractor || []) {
      if (isNearStart(item)) {
        listing.set(item._id, {
          ...item,
          iam: 'contractor',
          date: item.contract?.date?.start,
          key: (Math.floor( listing.size + add)).toString(32),
          subtype: 'service',
        });       
        add++;
      }
    }

    const ordered = [...listing.values()].sort((a: any, b: any) => {
      if (a.suybtype === "service" && b.subtype === "message") {
        return -1;
      } else if (a.subtype === b.subtype) {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
      } else {
        return 1;
      }
    });

    setList(ordered);
  }, [services.contractee, services.contractor]);

  function isNearStart(params: any) {
    let week = 7 * 24 * 60 * 60* 1000;
    let serviceDate = new Date(params.contract.date.start).getTime();
    let now = new Date().getTime() + week; // a week earlier

    return now >= serviceDate;
  }
    
  return (
  <View style={{width: '100%', height: 280, marginBottom: 100}}>
    <ScrollView nestedScrollEnabled={true} style={[{ marginTop: 2, width: '100%'}]}>
      {list.length === 0 ? (
        <Text style={styles.noService}>
          Sadly, there is nothing happening now!
        </Text>
      ) : (
        list.map((item, index) => (
          <FeedList params={item} hireAgain={false} key={item.key} />
        ))
      )}
    </ScrollView>
</View>
  );
};

const styles = StyleSheet.create({
  noService: {
    textAlign: 'center',
    fontSize: latitudo(5),
    fontWeight: 'bold',
    marginTop: altitudo(15),
    color: Colors.g2,
  },
});

export default ServiceList;
