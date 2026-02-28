import axios from 'axios';
import { API_ROOT_URL } from '@/config';

export const getAttention = async (token: string, user: string) => {
    let response;
    try {
      response = await axios.get(`${ API_ROOT_URL }attention/${user}?ts=${Date.now()}`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      });

      if (!response?.data) {
        const newAttention = {
            user: user,
            page: '/(tabs)',
            importance: 'regular',
            parameters: '{}'
        }
        response = await axios.post(`${ API_ROOT_URL }attention`, newAttention);
      }
      const att = response.data;
      att.parameters = JSON.parse(att.parameters);
      return att;
    } catch (error) {
      console.log('ATTENTION failed:', error);
      return '';
    }
  };

  export const removeAttention = async (token: string, user: string, contractId: string) => {
    let response;
    try {
      response = await axios.delete(`${ API_ROOT_URL }attention/${user}/${contractId}`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      });

      const att = response.data;
      return att;
    } catch (error) {
        console.log('ATTENTION failed:', error);
      return '';
    }
  };

  export const addAttention = async (
        token: string, 
        user: string, 
        importance: string, 
        page: string, 
        parameters: any
    ) => {
    const newAttention = {
        user,
        importance,
        page,
        parameters: JSON.stringify(parameters)
    }
    const response = await axios.post(`${ API_ROOT_URL }attention`, newAttention, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          }});
    return response.data;
}