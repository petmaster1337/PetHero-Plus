import { API_ROOT_URL } from '@/config';
import axios from 'axios';

const BASE_URL = `${API_ROOT_URL}product`;


  export const getProductById = async (id: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}?ts=${Date.now()}`);
      return response.data;
    } catch (error) {
      console.log(`Error fetching review with ID ${id}:`, error);
      throw error;
    }
  };

  export const getBuyerConsumptionById = async (id: any) => {
    try {
      const response = await axios.get(`${ API_ROOT_URL }consumption/buyer/${ id }?ts=${Date.now()}`);
      return response.data;
    } catch (error) {
      console.log('Error Getting Buyer Consumption:', error);
      throw error;
    }
  };
  
  export const getSellerConsumptionById = async (id: any) => {
    try {
      const response = await axios.get(`${ API_ROOT_URL }consumption/seller/${ id }?ts=${Date.now()}`);
      return response.data;
    } catch (error) {
      console.log('Error Getting Seller Consumption:', error);
      throw error;
    }
  };
  
  export const storeConsumption = async (ctrData: any) => {
    try {
      const response = await axios.post(`${ API_ROOT_URL }consumption`, ctrData);
      return response.data;
    } catch (error) {
      console.log('Error creating consumption:', error);
      throw error;
    }
  };

  export const getAllProducts = async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.log('Error getting products ', error);
      throw error;
    }
  }

  export const getProductByUid = async (uid: string) => {
    try {
      const response = await axios.get(`${ BASE_URL }/${uid}`);
      return response.data;
    } catch (error) {
      console.log('Error getting product: '+ uid, error);
      throw error;
    }
  }
  
  export const getReceiverById = async (id: string) => {
    try {
        const response = await axios.get(`${ API_ROOT_URL }payment/receiver/${id}?ts=${Date.now()}`);
        return response.data;
      } catch (error) {
        console.log('Error receivers:', error);
        throw error;
      }
  
  }

  export const getPayerById = async (id: string) => {
    try {
        const response = await axios.get(`${ API_ROOT_URL }payment/payer/${id}?ts=${Date.now()}`);
        return response.data;
      } catch (error) {
        console.log('Error payers:', error);
        throw error;
      }
  
  }