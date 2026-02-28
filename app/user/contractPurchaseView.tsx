import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { Colors } from '@/constants/Constants';
import PetStamp from '@/components/PetStamp';
import UserStamp from '@/components/UserStamp';
import { useAuth } from '@/providers/AuthProvider';
import { getUserById, getUserByUid } from '@/services/user.service';
import { storeDispute } from '@/services/event.service';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { addAttention } from '@/services/attention.service';
import { Data, DataPropsIndex } from '@/constants/Services';

type ContractType = {
  _id: string;
  uid: string;
  contractor: string;
  contractee: string;
  price: number;
  service: string;
  status: string;
  step: string;
  description: string;
  pet: any;
  date: {
    start: string;
    end: string;
  };
  contractedAt: string;
};

const ContractView = () => {
    const { contractString, payString, petString, heroString } = useLocalSearchParams();
    const initialTime = new Date();
    initialTime.setHours(12, 0, 0);
    const today = new Date();
    const { user, token, methods } = useAuth();
    const [contract, setContract] = useState<ContractType | null>(null);
    const [ pay, setPay ] = useState<any>(null);
    const [ pet, setPet ] = useState<any>(null);
    const [ hero, setHero ] = useState<any>(null);
    const [ profile, setProfile ] = useState<any>();
    const [ superUser, setSuperUser ] = useState<boolean>(false);
    const [ disputeDisplay, setDisputeDisplay ] = useState<boolean>(false);
    const [ disputeText, setDisputeText ] = useState<string>('');
    const [ afterMessage, setAfterMessage ] = useState<string>('');
    const [ hireAgain, setHireAgain ] = useState<boolean>(false);
    const [ dateTime, setDateTime ] = useState<any>(initialTime);
    const [ mode, setMode ] = useState<"date" | "time">('date');
    const [ show, setShow ] = useState(false);


    useEffect(() => {
        (async () => {

        if (contractString && !hero && !contract) {
            const _ctr = JSON.parse(String(contractString));
            const _pay = JSON.parse(String(payString));
            const _pet = JSON.parse(String(petString));
            const _hero = JSON.parse(String(heroString));
            setContract(_ctr);
            setPay(_pay);
            setPet(_pet);
            setHero(_hero);
        }
        if (hero.user._id === user._id && contract) {
            const contractor = await getUserById(contract.contractor)
            setProfile(contractor);
            setSuperUser(false);    
        } else if (contract) {
            setProfile(hero.user);
            setSuperUser(hero.super);
        }
        })();

    }, [hero, contract]);


  if (!contract) return <Text>Loading...</Text>;

  const onHireAgain = async () => {
    setHireAgain(!hireAgain);
    await sendRequest();
    
  }
    const generateUid = () => {
        const time = Number(new Date().getTime());
        return `C0${(Math.floor((Math.random() * Math.pow(32, 6)) + (Math.random() * Math.pow(32, 6) + time))).toString(32)}`;
    };

    const timerDifference = () => {
        return (new Date(contract.date.end).getTime() - new Date(contract.date.start).getTime());
    }

    const index: DataPropsIndex = contract.service as DataPropsIndex;
    const times = Math.floor(timerDifference() / Number(Data[index].billing));
    const sendRequest = async () => {
        try {
            const data = {
                uid: generateUid(),
                service: contract.service,
                contractor: user,
                pet: pet,
                contractee: hero,
                date: {
                    start: dateTime,
                    end: new Date((dateTime.getTime() + timerDifference())),
                },
                contractedAt: new Date(),
                description: contract.description,
                price: hero.price[0][`${pet.type}s`][`${contract.service}`] * times
            }

            const heroUser = await getUserByUid(hero.uid);
            await addAttention(token, heroUser._id, 'request', 'hero/accept', {
                contract: JSON.stringify(data),
                contractor: JSON.stringify(user),
                sendTime: String(new Date().getTime())
                });
                await methods.sendContractRequest(heroUser?._id, JSON.stringify(data));
                await methods.sendReminder(heroUser?._id, {contract: data, subject: 'reminder'});

            if (heroUser.notification)
            await methods.sendPushNotification(heroUser.notification, 'Pet Hero', 'Confirm service');

            router.replace(`/message?message='Successfully Filed!\n Waiting hero confirmation'`);
        } catch (e) {
            console.log('error', e)
            router.replace(`/message?message='ERROR! Please try again later'`);
        }
    }
  
  const onDispute = () => {
    setDisputeDisplay(!disputeDisplay);
  }  

    const handleDispute = async () => {
        if (contract && pay) {
        const item = await storeDispute({
            product: '',
            contract: String(contract._id),
            paymentId: String(pay._id),
            description: disputeText,
            price: contract.price
        });  
        if (item.error) {
            console.log(`Error: ${item.error}`);
        }
        setDisputeDisplay(false);
        setAfterMessage('Dispute sent!');
        setDisputeText('');
        setTimeout(() => {
            setAfterMessage('');
        }, 5000);
        }
    }

    const confirm = () => {
        setShow(false);
        setHireAgain(false);
        onHireAgain();
    }

    const showMode = (currentMode: "date" | "time") => {
        setShow(true);
        setMode(currentMode);
    };
    const onChangeTime = ( e: DateTimePickerEvent) => {
        const selectedDate: Date = new Date(e.nativeEvent.timestamp);
        setShow(Platform.OS === 'ios');
        setDateTime(selectedDate);
        if (mode === 'date') {
            showMode('time');
        }
        return true;
    };
  return (
    <ScrollView style={{ backgroundColor: '#fff' }}>
      <Text style={styles.date}>Contracted on: {new Date(pay.paidAt).toLocaleString()}</Text>

      <Card style={styles.card}>
        <Card.Content>
        <Text style={[styles.label, {fontSize: 26, margin: 10, fontFamily: 'mon-b'}]}>
            {contract.service.substring(0,1).toUpperCase()}{contract.service.substring(1)}
        </Text>
        {pet && profile && (
        <View style={{flexDirection: 'row'}}>
            <PetStamp pet={pet}  />
            <UserStamp user={ profile } superUser={ superUser } />
        </View>
        )}
          <Text style={[styles.label, {fontSize: 14, fontFamily: 'mon-b'}]}>Price: ${contract.price.toFixed(2)}</Text>
          <Text style={[styles.label,{fontSize: 14, color: Colors.g3, marginVertical: 5}]}>{contract.description}</Text>
          <Text style={[styles.label,{fontSize: 13, color: Colors.g3}]}>
            Start: {new Date(contract.date.start).toLocaleString()}
          </Text>          
          <Text style={[styles.label,{fontSize: 13, color: Colors.g3}]}>
            End: {new Date(contract.date.end).toLocaleString()}
          </Text>
          <Text style={[styles.label,{fontSize: 13, color: Colors.g3}]}>Status: {contract.status}</Text>

        </Card.Content>
      </Card>
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.dispute]} onPress={() => onDispute()}>
            <Text style={styles.buttonText}>Dispute</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buyAgain]} onPress={() => onHireAgain()}>
            <Text style={styles.buttonText}>Hire Again</Text>
            </TouchableOpacity>
        </View>
            {disputeDisplay && (
            <View style={{ width: '100%'}}>
                <View style={{borderWidth: 1, borderRadius: 12, borderColor: Colors.g5, margin: 'auto', width: '90%', padding: 10, marginTop: 20, marginBottom: 450}}>
                    <Text style={{
                        textAlign: 'center', 
                        marginBottom: 10, 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        flexDirection: 'row', 
                        fontSize: 20}}>What happened?</Text>
                        <TextInput
                        value={disputeText}
                        multiline={true}
                        style={{borderWidth: 1, width: '95%', margin: 'auto', borderRadius: 6,borderColor: Colors.g5}}
                        onChangeText={setDisputeText}
                        placeholder="Please tell us what happened"
                    />
                <TouchableOpacity style={[styles.button, styles.dispute, {marginRight: 5, marginTop: 10}]} onPress={() => handleDispute()}>
                    <Text style={[styles.buttonText]}>File Complaint</Text>
                </TouchableOpacity>
                </View>
            </View>
            )}
            {hireAgain && (
                <View style={{ height: 'auto', borderWidth: 1, width: '90%', margin: 'auto', marginTop: 20, borderRadius: 10}}>
                    <Text style={[{marginHorizontal: 40, marginVertical: 10}]}>Select new Date and Confirm</Text>
                    <TouchableOpacity
                        onPress={() =>setShow(!show)}
                        style={[styles.button, {width: 200, backgroundColor: Colors.primary, marginTop: 20}]}
                    >
                        <Text style={[styles.buttonText, { fontSize: 12, color: 'white', width: '100%'}]} >
                            {(dateTime > today) ? new Date(dateTime).toLocaleString() : 'Set New Date'}
                        </Text>
                    </TouchableOpacity>
                {show && (
                    <View>

                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dateTime}
                            minimumDate={today}
                            mode={mode}
                            is24Hour={true}
                            onChange={(e) => onChangeTime(e)}
                            negativeButton={{label: 'Cancel', textColor: 'red'}}
                            display="spinner"
                            minuteInterval={30}
                        />
                  </View>
                )}
                {(dateTime > today) && (
                    <TouchableOpacity
                    onPress={() =>confirm()}
                    style={[{width: 100, backgroundColor: Colors.secondary, margin: 10, marginTop: 40, marginLeft: 'auto', borderRadius: 8}]}
                >
                    <Text style={[styles.buttonText, { fontSize: 12, color: 'white', width: '100%'}]} >
                        Confirm
                    </Text>
                </TouchableOpacity>

                )}
                </View>
            )}
            <Text style={{width: '100%', textAlign: 'center'}}>{ afterMessage }</Text>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  date: {
    marginHorizontal: '5%',
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    marginBottom: 16,
  },
  dispute: {
    backgroundColor: Colors.redish,
  },
  buyAgain: {
    backgroundColor: Colors.primary,
  },
  button: {
    borderRadius: 8,
    marginHorizontal: 'auto',
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    width: 100,
    height: 40,
    verticalAlign: 'middle',
    textAlign: 'center',
    fontFamily: 'mon',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
  },
});

export default ContractView;
