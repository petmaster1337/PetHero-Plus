import { API_ROOT_URL } from '@/config';
import axios from 'axios';

const BASE_URL = `${API_ROOT_URL}reviews`;

export const getAllReviews = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.log('Error fetching all reviews:', error);
    throw error;
  }
};

export const getReviews = async (uid: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${uid}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching review with UID ${uid}:`, error);
    throw error;
  }
};
/**
 * 
 * @param value 'Contract ID'
 * @returns 
 */
export const reviewExists = async (value: string, targetId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/exists/${ value }/${ targetId }?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error! checking Review with ID ${value}:`, error);
    throw error;
  }
}


export const storeReview = async (reviewData: any) => {
  try {
    const response = await axios.post(BASE_URL, reviewData);
    console.log('RESPONSE', response.data);
    
    return response.data;
  } catch (error) {
    console.log('Error storing review:', error);
    throw error;
  }
};

export const updateReview = async (id: string, data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.log(`Error updating review with ID ${id}:`, error);
    throw error;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.log(`Error deleting review with ID ${id}:`, error);
    throw error;
  }
};
