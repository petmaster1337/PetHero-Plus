import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { getUser } from '@/services/user.service';
import { getUserPets } from '@/services/pet.service';

export const useSession = () => {
  const [session, setSession] = useState({ user: {}, data: { pets: [], messages: { sender: [], receiver: [] }, services: { contractor: [], contractee: [] } } });
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const user1 = await getUser();
        const storedToken = await AsyncStorage.getItem('token') || null;
        const storedPets = await AsyncStorage.getItem('pets') || null;
        if (user1) {
          const prev = {...session}
          prev.user = user1;
          setSession(prev);
          setUser(user1);
        }
        let pets1;
        if (storedPets) {
          pets1 = JSON.parse(storedPets);
        } else {
          pets1 = await getUserPets(user);
          AsyncStorage.setItem('pets', JSON.stringify(pets1));
        }
          
        const prev = JSON.parse(JSON.stringify(session));
        prev.data.pets = pets1;
        setSession(prev);
        setPets(pets1);
        if (storedToken) setToken(storedToken);
      } catch (error) {
        console.log('Error loading session:', JSON.stringify(error));
      }
    };
    loadSession();
  }, [token]);

  useEffect(() =>{
    const findPets = async() => {
      if(pets.length === 0) {
        const pets1 = await getUserPets(user)
        AsyncStorage.setItem('pets', JSON.stringify(pets1));
      }
    }
    findPets();
  }, [user, token, session])

  const updateSession = (userData: any) => {
    setSession(prev => ({ ...prev, user: userData }));
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  return { session, token, setToken, user, setUser, pets, setPets, updateSession };
};
