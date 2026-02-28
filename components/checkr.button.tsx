// components/StartBackgroundCheck.tsx
import { StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { altitudo, Colors, latitudo } from '@/constants/Constants';
import PaybackBackgroundCheckScreen from '@/app/hero/PayBCScreen';

export default function BackgroundCheckButton({ data, setAccepted, setHero, token }: { data: any, setAccepted: any, setHero: any, token:string }) {
  const [paid, setPaid] = useState(false);
  const [phase, setPhase] = useState(0);

  const phasePlus = () => {
    console.log('here')
    setPhase(phase + 1);
  }

  return (
    <>
    {phase === 0 && 
        <TouchableOpacity style={styles.bcButton} onPress={phasePlus} >
          <Text style={styles.bcText} >{"Authorize Background Check"}</Text>    
        </TouchableOpacity>    
    }

    {phase === 1 &&
    <PaybackBackgroundCheckScreen setPaid={setPaid} data={data} setHero={setHero} setAccepted={setAccepted}/>
    }
    </>
  );
}

const styles = StyleSheet.create({
  bcButton: {
    textAlign: 'center',
    margin: 'auto',
    width: '100%',
    fontSize: latitudo(5),
    fontWeight: 'bold',
    marginTop: altitudo(15),
    borderRadius: 30,
    height: 50,
    backgroundColor: Colors.primary
  },
  bcText: {
    marginTop: 15,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'mon-b'
  }
});

