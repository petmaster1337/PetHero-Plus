import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView, Linking, Platform,  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button, Text } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { altitudo, Colors, latitudo } from "@/constants/Constants";
import { Data, priceTypes } from "@/constants/Services";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from 'expo-router';
import { API_ROOT_URL } from "@/config";
import BackgroundCheckButton from "@/components/checkr.button";
import { updateHero } from "@/services/hero.service";

const HeroForm = () => {
  const { control, handleSubmit, setValue, watch, getValues } = useForm();
  const [ petType, setPetType ] = useState<string>("dogs");
  const [ hero, setHero ] = useState<any>(undefined);
  const [ description, setDescription ] = useState('');
  const [ accepted, setAccepted ] = useState(false);

  const { user, methods, token } = useAuth();

  const selectedPetType: string = watch("petType", "dogs");
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const priceData = [{
      cats: {
        hotel: Number(data.cats_hotel) || 0,
        daycare: Number(data.cats_daycare) || 0,
        visit: Number(data.cats_visit) || 0,
      },
      dogs: {
        hotel: Number(data.dogs_hotel) || 0,
        daycare: Number(data.dogs_daycare) || 0,
        visit: Number(data.dogs_visit) || 0,
        walk: Number(data.dogs_walk) || 0,
      }
    }];

    const item = {
      super: false,    
      price: priceData,
      description: data.description,
    }
    // Stripe Integration
    const answer = await handleBecomeServiceProvider();
    const newHero = await updateHero(hero._id, item);
    methods.setHero(newHero);
    router.replace(`/message?message=Successfully Filed!`);
  };


  async function handleBecomeServiceProvider() {
      try {
        const response = await fetch(`${ API_ROOT_URL }payment/stripe/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }),
        });        
        const data = await response.json();      
        return new Promise((resolve, reject) => {
          if (data.url) {
            Linking.openURL(data.url);
            resolve(true);
          } else {
            Alert.alert('Error', 'Unable to initiate Stripe onboarding.');
            reject(false);
          }
        });
    } catch (error) {
        console.log('error', JSON.stringify(error));
        Alert.alert('Error', 'An error occurred.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
    {!accepted ? 
      <BackgroundCheckButton 
        data={{name: user.name, uid: user.uid, email: user.email, state: user.state}} 
        setAccepted={setAccepted} 
        setHero={setHero} 
        token={String(token)}
      />
    :
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 300, paddingTop: 100 }}
        >

      <Text style={styles.label}>Pet Type:</Text>
      <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
                onPress={()=>setPetType('dogs')}
                style={{margin: 'auto'}}
            >
                <Text style={[styles.buttonText, petType !== 'dogs' && {backgroundColor: Colors.secondary}]} >Dog</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={()=>setPetType('cats')}
                style={{margin: 'auto'}}
            >
                <Text style={[styles.buttonText, petType !== 'cats' && {backgroundColor: Colors.secondary}]} >Cat</Text>
            </TouchableOpacity>

      </View>

      <Text style={styles.label}>Price:</Text>
      <View>
        {petType === 'dogs' ? (
            <View>
                {priceTypes[`dogs`].map((value2: string, index: number) => (
                    <Controller key={`${petType}${index}`} name={`dogs_${value2}`} control={control} defaultValue="" render={({ field: { onChange, value } }) => (
                    <TextInput label={`${petType} ${value2} (per ${Data[value2 as keyof typeof Data].payCycle})`} keyboardType="numeric" placeholder={ `Set ${ value } price` } value={value} onChangeText={onChange} style={styles.input} />
                    )} />
                ))}
            </View>)
            :(

            <View>
                {priceTypes[`cats`].map((value1: string, index: number) => (
                    <Controller key={`${petType}${index}`} name={`cats_${value1}`} control={control} defaultValue="" render={({ field: { onChange, value } }) => (
                    <TextInput label={`${petType} ${value1} (per ${Data[value1 as keyof typeof Data].payCycle})`} keyboardType="numeric" placeholder={ `Set ${ value } price` }  value={value} onChangeText={onChange} style={styles.input} />
                    )} />
                ))}
            </View>
        )}

    </View>
      <Text style={styles.label}>Description:</Text>
      <Controller name="description" control={control} defaultValue="" render={({ field: { onChange, value } }) => (
        <TextInput label="Describe your service" multiline numberOfLines={3} value={value} onChangeText={onChange} style={styles.input} />
      )} />

      <View>
      </View>
        <Button mode="contained" onPress={() => {
          return accepted? handleSubmit(onSubmit)(): Alert.alert('You need to accept background check first!')}
          } style={styles.button}>Submit
        </Button>
      </ScrollView>
    }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20,  marginTop: 45, flex: 1, minHeight: altitudo(100) },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "bold", marginVertical: 5 },
  input: { marginBottom: 10, backgroundColor: "white" },
  button: { marginTop: 10, backgroundColor: Colors.primary },
  buttonText: {width: latitudo(30), textAlign: 'center', height: latitudo(8), fontSize: 20, fontWeight: 'bold',color:'white', verticalAlign: 'middle', backgroundColor: Colors.primary, borderRadius: 14, margin: 'auto'},
  defaultStyle: {
    height: 40,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
    marginVertical: 8,
  }
});

export default HeroForm;
