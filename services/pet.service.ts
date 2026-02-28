import axios from 'axios';
import { API_ROOT_URL } from "@/config";

const BASE_URL = `${API_ROOT_URL}pets`;

export const getUserPets = async (user: any) => {
  if (!user) return [];
    try {
        const response = await axios.get(`${BASE_URL}/user/${user.uid}?ts=${Date.now()}`);
        return response.data;
      } catch (error) {
        console.log('Error fetching all users:', error);
        throw error;
      }
}

export const getAllPets = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.log('Error fetching all pets:', error);
    throw error;
  }
};

export const getPetById = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}?ts=${Date.now()}`, );
    return response.data;
  } catch (error) {
    console.log(`Error fetching pet with ID ${id}:`, error);
    throw error;
  }
};
export const getPetByUid = async (uid: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/uid/${uid}?ts=${Date.now()}`, );
    return response.data;
  } catch (error) {
    console.log(`Error fetching pet with ID ${uid}:`, error);
    throw error;
  }
};

export const createPet = async (userData: any, token: string) => {
  try {
    const response = await axios.post(BASE_URL, userData,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
    );
    return response.data;
  } catch (error:any) {
    console.log('Error creating pet:', error);
    throw error;
  }
};

export const updatePet = async (id: string, userData: any, token: string) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, userData,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
    );
    return response.data;
  } catch (error) {
    console.log(`Error updating pet with ID ${id}:`, error);
    throw error;
  }
};

export const deletePet = async (id: string, token: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      });
    return response.data;
  } catch (error) {
    console.log(`Error deleting pet with ID ${id}:`, error);
    throw error;
  }
};