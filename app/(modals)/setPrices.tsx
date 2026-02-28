import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { Colors, latitudo } from "@/constants/Constants";
import { Data, DataPropsIndex, priceTypes } from "@/constants/Services";
import { useAuth } from "@/providers/AuthProvider";
import { updateHero } from "@/services/hero.service";

const SetPrices = () => {
  const { control, handleSubmit, watch } = useForm();
  const { hero, user } = useAuth();
  const [petType, setPetType] = useState<string>("dogs");

  const selectedPetType = watch("petType", "dogs");

  useEffect(() => {
    if (typeof hero.price[0] === "string") hero.price[0] = JSON.parse(hero.price[0]);

    if (hero?.price?.length) {

      const currentPrices = hero.price[0];
        Object.keys(currentPrices.dogs).forEach((service) => {
          setValue(`dogs_${service}`, String(currentPrices.dogs[service] || '0'));
        });        
        Object.keys(currentPrices.cats).forEach((service) => {
          setValue(`cats_${service}`, String(currentPrices.cats[service] || '0'));
        });
    }
  }, []);

  const { setValue } = useForm();
    const updatePrice = (text: string) => {
        let managed = text.replace(/[^0-9.]/g, '');
        const parts = managed.split('.');
        if (parts.length > 2) {
            managed = parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
        }
        managed = Number(managed).toFixed(2);
        const match = managed.match(/^\d{0,3}(\.\d{0,2})?$/);
        if (match) {
            return (managed);
        }
    }
  const onSubmit = async (data: any) => {
    let priceData: {cats: any, dogs: any} = JSON.parse(JSON.stringify(hero.price[0])) || {cats:[], dogs:[]};

    for (const [key, value] of Object.entries(data)) {
          switch(key) {
            case "cats_hotel": 
              priceData["cats"].hotel = Number(updatePrice(String(value)))
              break;
            case "cats_daycare": 
              priceData["cats"].daycare = Number(updatePrice(String(value)))
              break;
            case "cats_visit": 
              priceData["cats"].visit = Number(updatePrice(String(value)))
              break;
            case "dogs_hotel": 
              priceData["dogs"].hotel = Number(updatePrice(String(value)))
              break;
            case "dogs_daycare": 
              priceData["dogs"].daycare = Number(updatePrice(String(value)))
              break;
            case "dogs_visit": 
              priceData["dogs"].visit = Number(updatePrice(String(value)))
              break;
            case "dogs_walk": 
              priceData["dogs"].walk = Number(updatePrice(String(value)))
            default:
              console.log('error', key)
          }
    }

    hero.price = [priceData];

    const answer = await updateHero(hero._id, hero);
    alert('Prices updated!');
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView>

        {/* Select Pet Type */}
        <Text style={styles.label}>Pet Type:</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setPetType('dogs')} style={{ margin: 'auto' }}>
            <Text style={[styles.buttonText, petType !== 'dogs' && { backgroundColor: Colors.secondary }]}>Dog</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPetType('cats')} style={{ margin: 'auto' }}>
            <Text style={[styles.buttonText, petType !== 'cats' && { backgroundColor: Colors.secondary }]}>Cat</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Pricing Fields */}
        <Text style={styles.label}>Prices:</Text>
        <View>
          {petType === 'dogs' ? (
            <View>
              {priceTypes[`dogs`].map((item: string, index: number) => (
                <Controller
                  key={`${petType}${index}`}
                  name={`dogs_${item}`}
                  control={control}
                  defaultValue={ String(hero.price[0]['dogs'][item]) || '0' }
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label={`${petType} ${item} (per ${Data[item as DataPropsIndex].payCycle})`}
                      keyboardType="numeric"
                      placeholder={ String(hero.price[0]['dogs'][item]) }
                      value={ value }
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  )}
                />
              ))}
            </View>
          ) : (
            <View>
              {priceTypes[`cats`].map((item: string, index: number) => (
                <Controller
                  key={`${petType}${index}`}
                  name={`cats_${item}`}
                  control={control}
                  defaultValue= { String(hero.price[0]['cats'][item]) || '0' }
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label={`${petType} ${item} (per ${Data[item as DataPropsIndex].payCycle})`}
                      placeholder={ String(hero.price[0]['cats'][item]) }
                      keyboardType="numeric"
                      value={ value }
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  )}
                />
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>Update Prices</Button>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "white", marginTop: 50, marginBottom: 100 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "bold", marginVertical: 5 },
  input: { marginBottom: 10, backgroundColor: "white" },
  button: { marginTop: 10, backgroundColor: Colors.primary },
  buttonText: { width: latitudo(30), textAlign: 'center', height: latitudo(8), fontSize: 20, fontWeight: 'bold', color: 'white', verticalAlign: 'middle', backgroundColor: Colors.primary, borderRadius: 14, margin: 'auto' }
});

export default SetPrices;
