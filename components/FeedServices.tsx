import React from "react";
import { TouchableOpacity, View, Text, Image, Platform } from "react-native";
import { Colors, HOUR_EARLIER, latitudo } from "@/constants/Constants";
import UserStamp from "./UserStamp";
import styles from "@/constants/feedStyles";
import { useRouter } from "expo-router";

const FeedService = ({ params, hireAgain, isAvailable }: any) => {
  const router = useRouter();
  const selectService = () => {
    router.push({
      pathname: "/user/service",
      params: {
        service: JSON.stringify(params.contract),
        hero: JSON.stringify(params.contractee),
        contractor: JSON.stringify(params.contractor),
      },
    });
  };

  const isPast = () =>
    new Date(params.contract.date.start).getTime() < new Date().getTime();

  const isNearStart = () => {
    let serviceDate = new Date(params.contract.date.start).getTime();
    let now = new Date().getTime() + HOUR_EARLIER * 60 * 60 * 1000;
    let afterWork = new Date(params.contract.date.end).getTime() + 24 * 60 * 60 * 1000;
    return now >= serviceDate && now < afterWork;
  };

  return (
    <View     
    key={params.key}>
      <TouchableOpacity
        style={[
          styles.heroRender,
          { borderWidth: 0, borderRadius: 0 },
          params.contractee?.super && { borderColor: Colors.golden, borderWidth: 1 },
          isPast() && { opacity: 0.66 },
        ]}
        onPress={selectService}
      >
        {params.iam === "contractor" ? (
          <UserStamp user={params.contractee.user} superUser={params.contractee?.super} />
        ) : (
          <UserStamp user={params.contractor} superUser={false} />
        )}

        <View style={[styles.heroCard]}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={[styles.textBig, { width: latitudo(30), color: "#999" }]}
              numberOfLines={1}
            >
              {params.contract?.service.substring(0, 1).toUpperCase() +
                params.contract?.service.substring(1)}
            </Text>
            {params.iam === "contractee" && (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 5,
                  width: latitudo(20),
                  verticalAlign: "top",
                  color: Colors.primary,
                  fontSize: latitudo(4),
                }}
              >
                ${String(params.contract?.price.toFixed(2))}
              </Text>
            )}
          </View>
          <Text
            style={{
              textAlign: "left",
              marginLeft: 30,
              fontSize: latitudo(3),
              color: Colors.g3,
            }}
          >
            From: {new Date(params.contract?.date.start).toLocaleString()}
          </Text>
          <Text
            style={{
              textAlign: "left",
              marginLeft: 30,
              fontSize: latitudo(3),
              color: Colors.g3,
            }}
          >
            To: {new Date(params.contract?.date.end).toLocaleString()}
          </Text>

          <Text
            style={{
              marginLeft: 30,
              marginTop: 10,
              textAlign: "justify",
              fontSize: latitudo(3),
              color: Colors.g3,
            }}
          >
            {params.contract?.description.substring(0, 100)}
          </Text>

          {(params.contract?.step === "ended" ||
            params.contract?.step === "paid" ||
            params.contract?.step === "finalized") &&
            isAvailable &&
            !isNearStart() && (
              <TouchableOpacity
                style={{ alignSelf: "flex-end" }}
                onPress={hireAgain}
              >
                <Image
                  source={require("@/assets/images/hire-again1.png")}
                  style={{ height: 40, width: 40, marginTop: 25 }}
                />
              </TouchableOpacity>
            )}

          {isNearStart() && (
            <Image
              style={{ width: 50, height: 50, alignSelf: "flex-end" }}
              source={require("@/assets/images/calendar.png")}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FeedService;
