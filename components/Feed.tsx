import React, { useEffect, useState, useCallback, use, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import FeedList from './FeedList';
import { getPetById } from '@/services/pet.service';
import FloatingHire from '@/components/HiringHero';

const PER_PAGE = 25;

const Feed: React.FC = () => {
    const { services, messages, hero, user, methods } = useAuth();
    const [ collection, setCollection ] = useState<any[]>([]);
    const [ list, setList ] = useState<any[]>([]);
    const [ page, setPage ] = useState<number>(1);
    const [ loadingMore, setLoadingMore ] = useState<boolean>(false);
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ show, setShow ] = useState<boolean>(false);
    const [ pet, setPet ] = useState<any>();
    const [ service, setService ] = useState<any>();
    const [ contractee, setContractee ] = useState<any>();


  // useEffect(() => {
  //   (async() => {
  //       await methods.updateServices()
  //   })();
  // }, [])
  useEffect(() => {
    console.log('ASK FOR MEMO CONTRACTS UPDATE')
  }), [services];

  useEffect(() => {
    const listing = new Map();
    let add = 0;

    for (const item of services?.contractee || []) {
      listing.set( item._id, {
        ...item,
        iam: 'contractee',
        date: item.contract?.date?.start,
        key: (Math.floor( listing.size + add++)).toString(32),
        subtype: 'service',
      });
    }
    for (const item of services?.contractor || []) {
      listing.set(item._id, {
        ...item,
        iam: 'contractor',
        date: item.contract?.date?.start,
        key: (Math.floor( listing.size + add++)).toString(32),
        subtype: 'service',
      });       
    }
    for (const item of messages?.receiver || []) {
      if (item.subject === 'reminder') continue; // skip reminders
      listing.set( item._id, {
        ...item,
        iam: 'receiver',
        subtype: item.subject === 'reminder' ? 'reminder' : 'message',
        key: (Math.floor( listing.size + add++)).toString(32),
        date: item.message?.createdAt,
      });
    }
    for (const item of messages?.sender || []) {
      if (item.subject === 'reminder') continue; // skip reminders
      listing.set(item._id, {
        ...item,
        iam: 'sender',
        subtype: item.subject === 'reminder' ? 'reminder' : 'message',
        key: (Math.floor( listing.size + add++)).toString(32),
        date: item.message?.createdAt,
      });
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

    console.log('LISTING', listing.size, ordered.length);

    setCollection(ordered);
    setPage(1);
    setList(ordered.slice(0, PER_PAGE));
  }, [services, messages]);

  const hireAgain = async (params:any) => {
      const cPet = await getPetById(params.contract.pet);
      setPet(cPet);
      setService(params.contract.service);
      setContractee(params.contractee)
      setShow(true);
  }
  const closeHireAgain = () => {
    setShow(false)
  }
  
  const loadMore = useCallback(() => {
    if (loadingMore) return;
    const start = page * PER_PAGE;
    if (start >= collection.length) return;

    setLoadingMore(true);
    const displayItems = collection.slice(0, page * PER_PAGE);

    setList(displayItems);
    setPage(page + 1);
    setLoadingMore(false);
  }, [collection, page, loadingMore]);

  const handleEndReached = () => {
    if (!loadingMore) loadMore();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const displayItems = collection.slice(0, page * PER_PAGE);
    setList(displayItems);
    setRefreshing(false);
  };


  const renderFooter = () =>
    loadingMore ? (
      <View style={{ padding: 12 }}>
        <ActivityIndicator size="small" />
        <Text style={{ textAlign: 'center', marginTop: 6 }}>Loading more…</Text>
      </View>
    ) : null;

  const keyExtractor = (item: any) => item.key;

  return (
    <View style={[{ marginTop: altitudo(1), width: '100%', flex: 1 }, hero?.bgAcceptedAt ? {height: altitudo(60)}: {height: altitudo(80)}]}>
      {list.length === 0 ? (
        <Text style={styles.noService}>
          Sadly, there is nothing happening now!
        </Text>
      ) : (
        <FlatList
          data={list}
          style={{ marginBottom: 0}}
          keyExtractor={keyExtractor}
          renderItem={({ item }: ListRenderItemInfo<any>) => (
            <FeedList params={item} hireAgain={() => hireAgain(item)} />
          )}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          scrollEventThrottle={300}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
              <FloatingHire
                visible={show}
                onClose={closeHireAgain}
                initialService={service}
                initialPet={pet}
                initialDate={null}
                targetHero={contractee}
            />
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

export default Feed;
