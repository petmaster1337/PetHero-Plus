import { API_ROOT_URL } from '@/config';
import axios from 'axios';

const BASE_URL = `${API_ROOT_URL}heroes`;

export const getAllHeroes = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.log('Error fetching all heroes:', error);
    throw error;
  }
};

export const getHeroById = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching hero with ID ${id}:`, error);
    throw error;
  }
};


export const getHeroNotification = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/notification/${id}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching notification ${id}:`, error);
    console.log(`${BASE_URL}/notification/${id}`);
    throw error;
  }
};

export const getHeroByUser = async (user: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/uid/${user.uid}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching hero with user ${user.name}:`, error);
    throw error;
  }
};

export const createHero = async (heroData: any) => {
  try {
    const response = await axios.post(BASE_URL, heroData);
    console.log('RESPONSE', response.data);
    
    return response.data;
  } catch (error) {
    console.log('Error creating hero:', error);
    throw error;
  }
};

export const updateHero = async (id: string, heroData: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, heroData);
    console.log('UPDATE HERO', response)
    return response.data;
  } catch (error) {
    console.log(`Error updating hero with ID ${id}:`, error);
    throw error;
  }
};

export const deleteHero = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.log(`Error deleting hero with ID ${id}:`, error);
    throw error;
  }
};

export const getNearestHeroes = async (user: any, radius: number = 25, limit: number = 20) => {
  try {
    if (user) {
      const userId = user?._id ;
      const response = await axios.get(`${BASE_URL}/nearest?ts=${Date.now()}`, {
        params: { userId: userId, radius: radius },
      });
      
      return response.data; 
    } else {
      return []
    }
  } catch (error) {
    console.log('Error fetching nearest heroes:', error);
    throw error;
  }
};

// export const heroAvailability = async (uid: string) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/availability`, {
//       params: {uid},
//     });
//     return response.data
//   } catch (error) {
//     console.log('Error fetching nearest heroes:', error);
//     throw error;
//   }
// }