import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Constants';

const FloatingMessage = ({ message, setNews }: { message: string, setNews: any }) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (message) {
      setVisible(true);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 3000);
      setTimeout(() => {
        setNews('');
      }, 3500);
    }
  }, [message]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim }]}>
      <Text style={styles.text}>📩 {message.substring(0, 20)}...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    bottom: 50, // Adjust for placement
    left: '10%',
    width: '80%',
    backgroundColor: Colors.primary,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#DA8',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FloatingMessage;
