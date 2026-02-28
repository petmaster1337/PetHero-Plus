import { useState, useEffect } from 'react';
import * as Location from 'expo-location';



export const useLocation = () => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let newLocation = await Location.getCurrentPositionAsync({  
          accuracy: Location.Accuracy.Highest
        });
        setLocation({ latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude });
      } else {
        console.warn('Location permission denied');
      }
    };
    getCurrentLocation();
  }, []);

  return location;
};


