import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { getLoggedUser } from "@/services/user.service";
import { Colors } from "@/constants/Constants";
import { useAuth } from "@/providers/AuthProvider";

export default function Initial() {
  const router = useRouter();
  const { methods, user } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {

      try {
        const loggedUser = await getLoggedUser();
        if (!loggedUser?._id || !user?._id) {
          router.replace('/(auth)/loginScreen');
        } else {
          methods.setUser(loggedUser ?? user);
          router.replace('/(tabs)');
        }
      } catch (error) {
        router.replace('/(auth)/loginScreen');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  contTitle: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
  },
  textTitle: {
    fontFamily: 'mon-b',
    fontSize: 20,
    letterSpacing: -1.618,
    lineHeight: 10,
    color: Colors.primary,
  },
  subtitle: {
    color: Colors.g1,
    fontFamily: 'mon',
    fontSize: 10,
    paddingHorizontal: 5,
  },
});
