import { API_ROOT_URL } from "@/config";
import { altitudo, Colors, latitudo } from "@/constants/Constants";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from "react-native";
import { Data } from "@/constants/Services";
import { Checkbox } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type listType = "walk" | "water" | "food" | "custom";

const HeroCustoms = () => {
    const { date, pet, service, size } = useLocalSearchParams();
    const router = useRouter();
    const [questions, setQuestions] = useState<any[] | null>(null);
    const [list, setList] = useState<listType[]>([]);
    const [checked, setChecked] = useState<"checked" | "unchecked">("unchecked");
    const [index, setIndex] = useState<number>(0);
    const [additional, setAdditional] = useState<string>("");
    const [display, setDisplay] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [holder, setHolder] = useState<string>("");

    const messages = {
        water: "Please provide instructions like:\nThe water is near the entrance, please add some more...",
        food: "Please provide instructions like:\nThe food disposer is the one near door...",
        walk: "Please avoid running \n walking at street X \n The dog is not friendly with cats",
        custom: "You can use this field to provide more details on your requests",
    };

    useEffect(() => {
        const index = service as keyof typeof Data;
        const ask = Data[index]?.custom?.askFor ?? null;

        if (!ask) {
            router.replace(`/hero/selecting?date=${ JSON.stringify(date) }
            &pet=${ JSON.stringify(pet) }
            &service=${ JSON.stringify(service) }
            &size=${ size }
            &additional=''&avoid=[]`);
        } else if (!questions) {
            setQuestions(ask);
        }
    }, [service]);

    useEffect(() => {
        if (questions) {
            const quest: listType[] = Object.entries(questions)
                .filter(([_, value]) => value)
                .map(([item]) => item as listType);
            setList(quest);
        }
    }, [questions]);

    useEffect(() => {
        if (list) {
            setHolder(messages[list[index]]);
        }
    }, [list])

    const handleCheckValue = () => {
        setChecked(checked === "checked" ? "unchecked" : "checked");
        setDisplay(checked === "unchecked");
    };

    const leaveQuestions = () => {

        router.replace(`/hero/selecting?date=${ JSON.stringify(date) }
        &pet=${JSON.stringify(pet)}
        &service=${JSON.stringify(service)}
        &size=${JSON.stringify(size)}
        &additional=${additional.substring(1).replace(/;/g, '\n')}
        &avoid=[]`);

    }

    const handleNext = () => {
        setInput("");
        if (index === list.length -1) {
            leaveQuestions();
        }
        if (checked) {
            setAdditional((prev) => `${prev};${ list[index] }: ${input}`);
            setIndex((prevIndex) => prevIndex + 1);    
        }

        if (index + 1 < list.length) {
            setHolder(messages[list[index + 1]]);
            setDisplay(list[index + 1] === "custom");
        }
        setChecked("unchecked");
    };


    return (
        <View style={{ flex: 1, justifyContent: "flex-start", marginTop: latitudo(5), gap: altitudo(2) }}>
            <SafeAreaView style={{ marginTop: -latitudo(5), paddingTop: 0 }}>
                <Text style={styles.header}> Do you need the hero to check: </Text>
                {list[index] !== "custom" && (
                    <View style={{ flexDirection: "row", marginTop: 20, marginLeft: 20 }}>
                        <Text style={styles.directions}>{list[index]} ?</Text>
                        <Checkbox status={checked} onPress={handleCheckValue} />
                    </View>
                )}
                {display && (
                    <View>
                        <TextInput
                            keyboardType="default"
                            multiline={true}
                            numberOfLines={3}
                            placeholder={holder}
                            onChangeText={setInput}
                            style={styles.textInput}
                        />
                    </View>
                )}
                <View style={{ flexDirection: "row", width: "100%" }}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextText}>{index === list.length - 1 ? 'Choose Hero': 'Next'}</Text>
                        <FontAwesome name="check" size={altitudo(3.5)} color={"white"} style={{ margin: 10 }} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.primary,
        width: "100%",
        height: 100,
        fontSize: latitudo(6),
        color: "white",
        textAlign: "center",
        paddingTop: 20,
        fontWeight: "bold",
    },
    nextButton: {
        flexDirection: "row",
        backgroundColor: Colors.primary,
        marginLeft: "auto",
        marginTop: 20,
        marginRight: 20,
        borderRadius: 6,
        elevation: 2,
    },
    nextText: {
        fontSize: latitudo(5),
        textAlign: "center",
        margin: "auto",
        fontWeight: "bold",
        color: "white",
        marginLeft: 10,
    },
    directions: {
        fontFamily: "mon-b",
        textAlign: "center",
        fontSize: latitudo(6),
        marginBottom: -20,
    },
    textInput: {
        borderWidth: 1,
        height: altitudo(10),
        width: latitudo(90),
        margin: "auto",
        borderRadius: 10,
        borderColor: "#DDD",
        textAlign: "justify",
        marginTop: latitudo(10),
        verticalAlign: "top",
    },
});

export default HeroCustoms;
