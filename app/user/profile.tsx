import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {  interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider'
import { altitudo, dstyles, dtexts, latitudo, Colors, Constants } from '@/constants/Constants';
import {  updateUser } from '@/services/user.service';
import { ServiceProps } from '@/constants/interfaces';
import { getHeroByUser } from '@/services/hero.service';
import Icon from '@/components/CustomIcon';
import FloatingHire from '@/components/HiringHero';
import { ScrollView } from 'react-native-gesture-handler';
import ReviewList from '@/components/reviewList';
import { getDistance } from '@/constants/Services';

const ModalProfile = () => {
  const { userProfile  } = useLocalSearchParams()
  
  const router = useRouter();
  const { pets, user, attention, services,} = useAuth();    
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [ show, setShow] = useState<boolean>(false);
  const [ profile, setProfile] = useState<any>(null);
  const [ description, setDescription] = useState<string>('');
  const [ isSuper, setIsSuper] = useState<boolean>(false);
  const [ heroUser, setHeroUser] = useState<any>({});
  const [ itsMe, setItsMe ] = useState<boolean>(false);
    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-Constants.sizes.IMG_modals, 0, Constants.sizes.IMG_modals, Constants.sizes.IMG_modals],
                        [-Constants.sizes.IMG_modals / 2, 0, Constants.sizes.IMG_modals * 0.75]
                    ),
                },
                {
                    scale: interpolate(scrollOffset.value, [-Constants.sizes.IMG_modals, 0, Constants.sizes.IMG_modals], [2, 1, 1]),
                },
            ],
        };
    });
  useEffect(() => {
    if (!userProfile) {
      return router.push('/(auth)/loginScreen');
    }
    if (profile) {
      setDescription(profile?.description);
    } else {
      fetchProfile();
    }
  }, []);

  async function fetchProfile() {
      if (userProfile) {
        const prof = JSON.parse(`${userProfile}`);
        setProfile(prof);  
        if (user?.uid === prof?.uid) {
          setItsMe(true);

        }
          setDescription(prof.description);
        let hero = await getHeroByUser(prof);
        if (hero) {
          setIsSuper(hero.super || false);
          setHeroUser({...hero, user: prof});
        }

      } else {
        setProfile(user);  
      }
  }

    const distance = () => {
        return getDistance(profile, user)
    }

  const petCounter = (type: string) => {
    let counter = 0;
    for (const pet of pets) {
      if (pet.type === type) {
        counter++;
      }
    }
    return counter;
  }
  const openService = async (service: ServiceProps) => {
    router.push({
      pathname: "/user/service",
      params: {
        service: JSON.stringify(service.contract),
        hero: JSON.stringify(service.contractee),
        contractor: JSON.stringify(service.contractor),
      },
    });
  }

  const changeUserDescription = async(newValue: string) => {
    setDescription(newValue);
    profile.description = newValue;
    await updateUser(profile._id, profile);
  }

  const displayServices = () => {

    return ( 
      <View  style={{ height: 150, width: '100%', borderWidth: 1, borderColor: Colors.g5, borderRadius: 8}}>
        <ScrollView nestedScrollEnabled={true}>
          {services?.contractor?.length > 0  && (
          <View>
            <Text style={[{ marginLeft: 10, fontFamily: 'mon-b', fontSize: altitudo(1.5) }]}>contractor</Text>
              {services.contractor.map((service: any) => (
                <TouchableOpacity key={service?._id}
                  onPress={ () => openService(service) }
                >
                  <View key={service?.uid} style={{ flexDirection: 'row', marginLeft: 20}}>
                    <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.5) }]}>{ service?.contract?.service } - </Text>
                    <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.5) }]}>{ new Date(service?.contract?.date?.start).toLocaleString() }</Text>
                  </View>
                </TouchableOpacity>

              ))}
          </View>
          )}   
          {services?.contractee.length > 0 && (
          <View>
            <Text style={[{ marginLeft: 10, fontFamily: 'mon-b', fontSize: altitudo(1.5) }]}>contractee</Text>
          {services?.contractee?.map((service: any) =>
              <TouchableOpacity key={service?._id}
                onPress={ () => openService(service) }
              >
              <View key={service?.uid} style={{ flexDirection: 'row', marginLeft: 20}}>
                <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.5) }]}>{ service?.contract?.service } - </Text>
                <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.5) }]}>{ new Date(service?.contract?.date?.start).toLocaleString() }</Text>
              </View>
              </TouchableOpacity>
              )}
            </View>
          )}       
        </ScrollView>
      </View>
    )
  }

  const hireAgain = async (params:any) => {
      setShow(true);
  }

  const closeHireAgain = () => {
    setShow(false)
  }

  const retrieveServicesAndCounter = () => {
    if (services) {

      return (
        <SafeAreaView>
              
        {itsMe && (
          <View key="services"><Text style={[{ fontFamily: 'mon-b', fontSize: altitudo(1.75) }]}>Services</Text>
            { displayServices() }
          </View> 
        )}
        <View key="reviews"
        style={{marginBottom: 50}}
        >
          <Text 
          style={[{ fontFamily: 'mon-b', fontSize: altitudo(1.75), marginTop: 10, marginBottom: 5 }]}>Reviews</Text>
          <ReviewList target={String(userProfile)}></ReviewList>
        </View>

      </SafeAreaView>
      )
  
    }
  }


  return (
    <View style={{flex: 1, backgroundColor: Colors.primary}}>

      <View style={[styles.container, { width: "100%"}]}>
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 125, marginBottom: 0 }}
          scrollEventThrottle={16} >

          {/* AVATAR */}
            <Animated.View style={[ imageAnimatedStyle,{  marginTop: 0, marginBottom: 10, width: '100%'}]}>
              <View style={{ top: 0, width: '100%', zIndex: 11,  backgroundColor: Colors.primary, }} >
                <View
                    style={{ width: "100%", marginTop: 0, height:175 ,alignContent:'center', alignItems:'center'}}
                >
                  <Image
                    source={{ uri: `${ profile?.image }` }}
                    style={[profile?.super ? {borderColor: Colors.golden }: {borderColor: 'white'}, { borderRadius: altitudo(11.75), borderWidth: 10, width: altitudo(21.5), height:altitudo(21.5)}]}
                  ></Image>
                  {isSuper ? (
                    <View style={{height: 300, width: 300, position: 'absolute'}}>
                      <View style={{ alignItems: 'center', position: 'absolute', right: latitudo(17.5), top: latitudo(27.5), backgroundColor: 'rgba(255,255,255,0.75)', borderColor: Colors.bg, borderRadius: altitudo(5), borderWidth: 5, width: altitudo(7), aspectRatio: 1 }}>
                          <Icon provider='AntDesign' name='star' size={altitudo(4)} color={Colors.primary} style={styles.iconSuperHero} />
                          <Text style={[{ fontFamily: 'mon-sb', fontSize: 8, color: Colors.primary, marginTop: -3 }]}>super</Text>
                      </View>
                    </View>
                ): null}
                </View>
              </View>
            </Animated.View>

          {/* INFO AREA */}
          <View style={{ position: "relative", zIndex: 2, backgroundColor: Colors.bg, height: altitudo(75), paddingHorizontal: latitudo(5), paddingTop: altitudo(4) }}>

            {/* PERSONAL INFO */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: latitudo(2), width: '100%' }}>
              <Text style={[dtexts.textMain1]}>{profile?.name}</Text>
              {heroUser?.user && !itsMe &&
                <View style={{position: 'absolute', right: 0, top: 0 }}>
                  <TouchableOpacity
                  style={{marginVertical: 0}}
                  onPress={hireAgain}
                  >
                      <Image
                          source={require('@/assets/images/hire-again1.png')}
                          style={{height: 40, width: 40, marginTop: 10}}
                          />
                  </TouchableOpacity>
                </View>

              }
            </View>
            <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.75), fontWeight: "bold", color: Colors.g4, zIndex: 5, marginLeft:0 }]}>{ profile?.city } </Text>
            <Text style={{ fontSize: 11, fontFamily: 'mon', width: 100, color: Colors.g3}}>{distance().toFixed(2)} miles</Text>

            {/* MAIN INFOS */}
            <>
            <View style={dstyles.divider} />
            
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '65%' }}>
                  <Text style={[{ fontFamily: 'mon-b', fontSize: altitudo(1.5) }]}>About</Text>
                  {itsMe ?
                      <TextInput 
                          style={styles.textName}
                          value={description}
                          onChangeText={(newValue) => { changeUserDescription(newValue) }}
                          placeholder="Introduce yourself"
                          placeholderTextColor={Colors.g3}
                          autoCorrect={false}
                          multiline
                      ></TextInput>
                      :                            
                      <Text style={styles.textName}>{profile?.description}</Text>
                  }
                 
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontFamily: 'mon-b', fontSize: altitudo(1.5) }]}>pets</Text>
                  <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.618) }]}><Text style={{ fontSize: altitudo(4) }}>{ petCounter('dog') }</Text> dogs</Text>
                  <Text style={[{ fontFamily: 'mon', fontSize: altitudo(1.618) }]}><Text style={{ fontSize: altitudo(4) }}>{ petCounter('cat') }</Text> cats</Text>
                </View>
              </View>

              { retrieveServicesAndCounter() }
            </>

          </View>          

        </Animated.ScrollView>  
        {heroUser?.user &&
        <View style={{position: 'absolute', width: '100%', height: '100%', top: altitudo(25)}}>
          <View style={{position: 'relative', width: '100%', height: '100%'}}>
            <FloatingHire
              visible={show}
              onClose={closeHireAgain}
              initialService={null}
              initialPet={null}
              initialDate={null}
              targetHero={heroUser}
            />  
            </View>      
          </View>      
        }
      </View>
    </View >
  )
}




const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: altitudo(92.5),
    marginBottom: altitudo(7.5),
  },

  cont1: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: latitudo(2.5),
    gap: latitudo(5),
    justifyContent: 'center',
  },

  ButtonAtTheBottom: {
    backgroundColor: 'white',
    borderRadius: latitudo(5),
    paddingHorizontal: latitudo(5),
    paddingVertical: altitudo(2),
    alignItems: 'center',
    gap: altitudo(1),
    borderWidth: 1,
    elevation: 5,
  },

  pressable1: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressable2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: latitudo(5),
    paddingHorizontal: latitudo(3),
    paddingVertical: altitudo(0.5),
    gap: latitudo(1),
    elevation: 3,
  },

  avatarCheck: {
    position: 'absolute',
    bottom: altitudo(2),
    flexDirection: 'row',
    paddingVertical: altitudo(2),
    justifyContent: 'center',
    // justifyContent: 'space-evenly',
    width: latitudo(100),
    alignItems: 'center',
    gap: latitudo(2),
  },

  buttonInfos: {
    width: latitudo(20),
    alignItems: 'center',
    gap: altitudo(0.5),
  },

  textName: {
    textAlign: 'center',
    color: 'black',
    fontSize: altitudo(1.75),
    fontFamily: 'mon',
    flex: 1,
    textAlignVertical: "top",
    verticalAlign: "top",
    marginTop: 10,
    height: altitudo(25)
  },

  rotonda: {
      position: 'relative',
      zIndex: 10,
      bottom: -20,
      alignSelf: 'center',
      aspectRatio: 1,
      borderRadius: '100%',
      borderColor: Colors.bg,
      backgroundColor: Colors.g4
  },

  urgent: {
    backgroundColor: Colors.redish,
    fontSize: 14,
    color: 'white'
  },

  average: {
    backgroundColor: Colors.primary,
    fontSize: 12,
    color: 'white'
  },

  iconSuperHero: {
    margin: 5,
    marginBottom: 0,
    aspectRatio: 1,
    borderRadius: latitudo(5),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  },
});

export default ModalProfile
