import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROOT_URL } from '@/config';
import * as Location from 'expo-location';
const BASE_URL = `${API_ROOT_URL}auth/`;


const getPrimaryToken = async () => {
  const response = await axios.get(`${BASE_URL}new?ts=${Date.now()}`);
  return response.data;
}

export const getToken = async (): Promise<string | null> => {
  try {
    let token = await AsyncStorage.getItem('token');
    if (!token) {
      token = await getPrimaryToken();
      if (token) {
        AsyncStorage.setItem('token', token)
      }
    }
    return token;
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.log('Error removing token:', error);
  }
};

export const login = async (email: string, password: string) => {
  const token  = await getToken();

  try {
    const response = await axios.post(`${BASE_URL}login`, { 'email': email, 'password': password },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }}
  );

    if ((response.status === 200 || response.status === 201)) {
      return response.data;
    } else {
      throw new Error('Login failed: Invalid response');
    }
  } catch (error) {
    console.log('Error during login:', error);
    throw error;
  }
};

export const logout = async () => {
  await removeToken();
  console.log('User logged out');
};

export const getLocation: any= async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            let newLocation = await Location.getCurrentPositionAsync({});
                return { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
        } else {
            console.warn('Location permission denied');
        }    
  }


export const isAuthenticated = async () => {
    try {
      const token = await getToken();
      return Boolean(token);
    } catch (error) {
      console.log('Error checking authentication:', error);
      return false;
    }
  };

export const sendUpdatePassword = async (email: string, sessionToken: string, token: string, password: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}mail/updating/password`, { email, token, password },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ sessionToken }`
    }}
  );

    if ((response.status === 200 || response.status === 201)) {
      return response.data;
    } else {
      throw new Error('Send Upd Failed: Invalid response');
    }
  } catch (error) {
    console.log('Error during email:', error);
    throw error;
  }

}

export const getUpdatePassToken = async (email: string, token: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}mail/reset/password`, { 'email': email },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }}
  );
    if ((response.status === 200 || response.status === 201)) {
      return response.data;
    } else {
      throw new Error('Login failed: Invalid response');
    }
  } catch (error) {
    console.log('Error during login:', error);
    throw error;
  }
}
