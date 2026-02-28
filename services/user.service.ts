import axios from 'axios';
import { login, logout} from "@/services/auth";
import { API_ROOT_URL } from "@/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = `${API_ROOT_URL}users`;

export const getLoggedUser = async () => {
    let user = await getUser();
    return user;
}

export const setLogin = async (email: string, password:string) => {
    let user = await login(email, password);
    return user;
}

export const setLogout = async () => {
    logout();
    return true;
}

export const getAllUsers = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.log('Error fetching all users:', error);
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

export const getUserNotification = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/notification/${id}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching notification ${id}:`, error);
    console.log(`${BASE_URL}/notification/${id}`);
    throw error;
  }
};

export const getUserByUid = async (uid: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/uid/${uid}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log(`Error fetching user with UID ${uid}:`, error);
    throw error;
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await axios.post(BASE_URL, userData);
    return response.data;
  } catch (error:any) {
    console.log('Error creating user:', error);
    console.log(error.message)
    throw error;
  }
};


export const storeHero = async (heroData: any) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}heroes`, heroData);
    return response.data;
  } catch (error:any) {
    console.log('Error creating user:', error);
    console.log(error.message)
    throw error;
  }
};


// Update an existing user
export const updateUser = async (id: string, userData: any) => {
  try {
    if (!id) return; 
    const response = await axios.put(`${BASE_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.log(`${BASE_URL}/${id}`);
    console.log(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

// Update an existing user
export const updateUserPassword = async (id: string, userData: string) => {
  try {
    if (!id) return; 
    const response = await axios.put(`${BASE_URL}/${id}/updatePassword`, {password: userData});
    console.log('RESPONSE UPDATE USER PASSWORD', response.data);
    return response.data;
  } catch (error) {
    console.log(`${BASE_URL}/${id}`);
    console.log(`Error PASSWORD user with ID ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.log(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

export const getNearestUsers = async (latitude: number, longitude: number, page: number = 1, limit: number = 20) => {
  try {
    const response = await axios.get(`${BASE_URL}/nearest?ts=${Date.now()}`, {
      params: { latitude, longitude, page, limit },
    });
    return response.data;
  } catch (error) {
    console.log('Error fetching nearest users:', error);
    throw error;
  }
};

export const isHero = async (user: any) => {
  try {
    if (typeof user === 'string') {
      user = JSON.parse(user);
    }
    if (!user.hasOwnProperty('uid')) {
        return false;
    }
    const uid = user.uid;

        const response = await axios.get(`${ API_ROOT_URL }heroes/${ uid }?ts=${Date.now()}`);
        return (response.data?.length > 0);
    } catch (error) {
        console.log('Error is hero:', error);
        throw error;
    }
}

export const getUserByHeroId = async (heroId: any) => {
  try {
    const response = await axios.get(`${ API_ROOT_URL }heroes/${ heroId }/user?ts=${Date.now()}`);
    return (response.data);
  } catch (error) {
      console.log('Error is:', error);
      throw error;
  }

}
export const isUsedEmail = async (email: string) => {
  try {
    const response = await axios.get(`${ BASE_URL }/check/email/${ email }?ts=${Date.now()}`);
    return (response.data);
  } catch (error) {
      console.log('Error is:', error, `${ BASE_URL }/check/email/${ email }?ts=${Date.now()}`);
      throw error;
  }

}
export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    const userData = JSON.parse(String(userString));
    if(userData?._id) {
      const user =  await getUserById(userData._id);
      return user;  
    } else {
      return null;
    }
  } catch (error) {
    console.log('Error fetching user:', error);
    throw error;
  }
};
