import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Colors, latitudo } from "@/constants/Constants";
import UserStamp from "./UserStamp";
import styles from "@/constants/feedStyles";
import { useRouter } from "expo-router";

const FeedMessage = ({ params, isImage, exists, error, setError, imageUri }: any) => {
  const router = useRouter();

  if (!exists) return null;
  if (!isImage && params.message.message.length ===0) return null;
  const selectMessage = () => {
    router.push(`/user/message?sender=${JSON.stringify(params?.sender)}&receiver=${JSON.stringify(
        params?.receiver
      )}&message=${JSON.stringify(params?.message)}`
    );
  };

  const runMessage = (message: string) => {
    if (isImage) {
      return (
        <View style={{ width: "100%" }}>
            <Image
              style={styles.miniImage}
              source={{ uri: imageUri }}
              onError={() => setError(true)}
            />
        </View>
      );
    }
    return (
      <Text style={styles.miniTxt}>
        {message.substring(0, 255)}
      </Text>
    );
  };

  return (
    <TouchableOpacity
    key={params.key}
      style={[
        styles.heroRender,
        { borderWidth: 0, borderRadius: 0 },
        { position: "relative" },
        params.contractee?.super && { borderColor: Colors.golden, borderWidth: 1 },
      ]}
      onPress={selectMessage}
    >
      {params.iam === "sender" ? (
        <UserStamp user={params.receiver} superUser={params.receiver?.super} />
      ) : (
        <UserStamp user={params.sender} superUser={params.sender?.super || false} />
      )}

      <View style={{ flexDirection: "column", width: 175, marginLeft: 20 }}>
        <Text
          style={[styles.textBig, { width: latitudo(35), color: "#999" }]}
          numberOfLines={1}
        >
          Message
        </Text>
        <Text
          numberOfLines={6}
          style={{ fontSize: 12, textAlign: "right", marginRight: 10, color: Colors.g2 }}
        >
          {new Date(params.date).toLocaleString()}
        </Text>
        {runMessage(params?.message?.message)}
      </View>
    </TouchableOpacity>
  );
};

export default FeedMessage;
