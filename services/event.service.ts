import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_ROOT_URL } from '@/config';


export const getMessages = async (token: string, type: string, user: any) => {
  if (!user) return [];
  try {
    const response = await axios.get(`${API_ROOT_URL}messages/${type}/${user._id}?ts=${Date.now()}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,              
        },
    });
    return response.data;
  } catch (error) {
    return '';
  }
};
 
export const getServices= async (token: string, type: string, user: any, future: boolean) => {
  if (!user) return [];
  try {
    const response = await axios.get(`${API_ROOT_URL}contracts/${type}/${user._id}/${future}?ts=${Date.now()}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,              
        },
    });
    return response.data;

  } catch (error) {
    console.log('error', `${API_ROOT_URL}contracts/${type}/${user._id}/${future}`);
    console.log('SERVICES failed:', error);
    return '';
  }
};

export const getServiceById= async (token: string, id: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}contracts/${id}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,              
        },
    });
    return response.data;
  } catch (error) {
    console.log(`${API_ROOT_URL}contracts/${id}`);
    console.log('POST SERVICES failed:', error);
    return '';
  }
};


const getPermissions = async () => {
  await ImagePicker.requestCameraPermissionsAsync();
  await ImagePicker.requestMediaLibraryPermissionsAsync();
};

export const uploadImage = async (type: string, id: string, token: string) => {
  await getPermissions();
  let imageUrl: string = await pickImage();
  if (type === "user") {
    return await uploadUserFile(id, token, imageUrl)
  } else if (type === "pet") {
    return await uploadPetFile(id, token, imageUrl)
  } else {
    return await uploadFile(token, imageUrl)

  }
}

const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.2
  })
  if (!result.canceled) {
    const uri = result.assets[0].uri;
    return uri;
  } else {
    return '';
  }
}

export const recordPhoto: any = async () => {
  let result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.2
  })
  if (!result.canceled) {
    return result.assets[0].uri;
  } else {
    return '';
  }
}

const uploadFile = async (token: string, imageUrl: string) => {
  const data = new FormData();
  const now = new Date();
  const id = Math.floor((Math.random() * 9999) + (now.getTime())).toString(32);
  data.append('petId', id);
  data.append('file', {
    uri: imageUrl,
    type: 'image/jpeg',
    name: `${id}.jpg`,
  });
  try {
      const response = await axios.post(`${API_ROOT_URL}upload/image/pet`, data, {
      headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,              
          },
      });
      const address = response.data;
      return address.url;
  } catch (error) {
    console.log(`${API_ROOT_URL}upload/image/pet`);
    console.log('Upload failed:', error);
    return '';
  }
};

const uploadPetFile = async (id: string, token: string, imageUrl: string) => {
  const data = new FormData();
  data.append('petId', id);
  data.append('file', {
    uri: imageUrl,
    type: 'image/jpeg',
    name: `${id}.jpg`,
  });
  console.log(JSON.stringify(data))
  try {
      const response = await axios.post(`${API_ROOT_URL}upload/image/pet`, data, {
      headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,              
          },
      });
      const address = response.data;
      return address.url;
  } catch (error) {
    console.log(`${API_ROOT_URL}upload/image/pet`);
    console.log('Upload failed:', error);
    return '';
  }
};

const uploadUserFile = async (id: string, token: string, imageUrl: string) => {
  const data = new FormData();
  data.append('userId', id);
  data.append('file', {
    uri: imageUrl,
    type: 'image/jpeg',
    name: `${id}.jpg`,
  });
  console.log(JSON.stringify(data))
  try {
      const response = await axios.post(`${API_ROOT_URL}upload/image/user`, data, {
      headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,              
          },
      });
      const address = response.data;
      return address.url;
  } catch (error) {
    console.log(`${API_ROOT_URL}upload/image/user`);
    console.log('Upload failed:', JSON.stringify(error));
    return '';
  }
};

export const getPriceTypes = async (token: string) => {
  try {
      const response = await axios.get(`${API_ROOT_URL}prices?ts=${Date.now()}`, {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      });
      return response.data;
  } catch (error) {
    console.log('TYPES failed:', error);
    return '';
  }
};

export const storeMessage = async (msgData: any) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}messages`, msgData);
    return response.data;
  } catch (error) {
    console.log('Error creating message:', error);
    throw error;
  }
};

export const getContractById = async (id: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}contracts/${id}`);
    return response.data;
  } catch (error) {
    console.log('Error getting contract:', error);
    throw error;
  }
};
export const getContractByUid = async (uid: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}contracts/uis/${uid}`);
    return response.data;
  } catch (error) {
    console.log('Error getting contract:', error);
    throw error;
  }
};

export const storeContract = async (ctrData: any) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}contracts`, ctrData);
    return response.data;
  } catch (error) {
    console.log('Error creating contract:', error);
    throw error;
  }
};

export const updateContract = async (id: string, ctrData: any, token: string) => {
  console.log('update contract', JSON.stringify(ctrData));
  try {
    const response = await axios.put(`${API_ROOT_URL}contracts/${id}`, ctrData,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
    );
    return response.data;
  } catch (error) {
    console.log(`${API_ROOT_URL}contracts/${id}`, ctrData);
    console.log('Error updating contract:', error);
    throw error;
  }
};

export const cancelContract = async (ctrData: any, token: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}contracts/cancel`, ctrData,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
    );
    return response.data;
  } catch (error) {
    console.log('Error creating contract:', error);
    throw error;
  }
};

export const startTrack = async (trData: any, token: string) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}track`, trData,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
    );
    return response.data;
  } catch (error) {
    console.log('Error creating tracker:', error);
    throw error;
  }
}

export const updateTrack = async (id: string, trData: any, token: string) => {
  try {
    const response = await axios.put(`${ API_ROOT_URL }track/${ id }`, trData,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
    );
    return response.data;
  } catch (error) {
    console.log('Error updating track:', error);
    throw error;
  }
}

export const getTrackByContract = async (contract: any, token: string) => {
  try {
    const response = await axios.post(`${ API_ROOT_URL }track/contract`, contract,
      {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,              
          },
      }
     );
    return response.data;
  } catch (error) {
    console.log(`${ API_ROOT_URL }track/contract`);
    console.log('Error getting track:', error);
    throw error;
  }
}

export const getTrackById = async (id: string) => {
  try {
    const response = await axios.get(`${ API_ROOT_URL }track/${id}?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log('Error getting track by ID:', error);
    throw error;
  }
}

export const storeDispute = async (ctrData: any) => {
  try {
    const response = await axios.post(`${API_ROOT_URL}dispute`, ctrData);
    return response.data;
  } catch (error) {
    console.log('Error creating contract:', error);
    throw error;
  }
};

export const getAllDisputes = async () => {
  try {
    const response = await axios.get(`${API_ROOT_URL}dispute?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log('Error creating contract:', error);
    throw error;
  }
};

export const getDispute = async (paymentId: string) => {
  try {
    const response = await axios.get(`${API_ROOT_URL}dispute/payment/${ paymentId }?ts=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.log('Error creating contract:', error);
    throw error;
  }
};

