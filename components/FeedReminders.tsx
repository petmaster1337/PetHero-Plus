import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Colors, latitudo } from "@/constants/Constants";
import UserStamp from "@/components/UserStamp";
import styles from "@/constants/feedStyles";
import { useRouter } from "expo-router";
import { getUserById } from "@/services/user.service";

const FeedReminder = ({ params }: any) => {
  const router = useRouter();

  const selectReminder = async () => {
    console.log('select reminder', params.message.contract);
    const contractObj = params?.message?.contract;
    const contractor = contractObj?.contractor;

    router.push({
      pathname: `/hero/accept`,
      params: {
        contract: JSON.stringify(contractObj),
        contractor: JSON.stringify(contractor),
      },
    });
  };

  const runContract = async (contract: any) => {
    return (
      <View>
        <Text>Click to check a {contract?.service} proposal</Text>
      </View>
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
      onPress={selectReminder}
    >
      {params.iam === "sender" ? (
        <UserStamp user={params.receiver} superUser={params.receiver?.super} />
      ) : (
        <UserStamp user={params.sender} superUser={params.sender.super} />
      )}

      <View style={{ flexDirection: "column", width: 175, marginLeft: 20 }}>
        <Text
          style={[styles.textBig, { width: latitudo(35), color: "#F33" }]}
          numberOfLines={1}
        >
          Attention!
        </Text>
        <Text
          numberOfLines={6}
          style={{ fontSize: 12, textAlign: "right", marginRight: 10, color: Colors.g2 }}
        >
          {new Date(params.date).toLocaleString()}
        </Text>
        {runContract(params?.message?.contract)}
      </View>
    </TouchableOpacity>
  );
};

export default FeedReminder;
