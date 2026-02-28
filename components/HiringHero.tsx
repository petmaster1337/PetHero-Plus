// FloatingHire.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "@/providers/AuthProvider";
import { altitudo, latitudo, Colors } from "@/constants/Constants";
import { Data } from "@/constants/Services";
import { storeContract } from "@/services/event.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  visible?: boolean;
  onClose?: () => void;
  initialService?: string | null;
  initialPet?: any | null;
  initialDate?: any;
  targetHero?: any | null;
};

const FloatingHire: React.FC<Props> = ({
  visible = true,
  onClose,
  initialService = null,
  initialPet = null,
  initialDate = null,
  targetHero = null
}) => {
    const { user, pets } = useAuth();
    const [service, setService] = useState<string | null>(initialService);
    const [pet, setPet] = useState<any | null>(initialPet);
    const [date, setDate] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState<"date" | "time">("date");
    const [loading, setLoading] = useState(false);
    const [expandServices, setExpandServices] = useState(false);
    const [expandPets, setExpandPets] = useState(false);
    const [ displayType, setDisplayType ] = useState<"spinner" | "calendar" | "compact" | "default" | "inline" | "clock">('spinner');
    const router = useRouter();

  useEffect(() => {
    if (initialDate) setDate(new Date(initialDate));
    if (initialService) setService(initialService);
    if (initialPet) setPet(initialPet) 
    else {
  }


    if (Platform.OS === "ios" || Platform.OS === "macos") {
        setDisplayType("compact");
    }
  }, [initialDate, initialService, initialPet]);

  const preClose = () => {
    setDate(new Date(initialDate));
    setService(initialService);
    setPet(initialPet);
    return () => onClose?.();
  };

  const openDatePicker = (m: "date" | "time") => {
    setMode(m);
    setShowPicker(true);
  };

  const onPickerChange = (event: any, selected?: Date | undefined) => {
    if (Platform.OS === "android") {
      if (!selected) {
        setShowPicker(false);
        return;
      }

      if (mode === "date") {
        setDate(selected);
        setMode("time");
        setTimeout(() => setShowPicker(true), 5);
        return;
      } else {
        const current = date ? new Date(date) : new Date();
        current.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        setDate(current);
        setShowPicker(false);
        return;
      }
    } else {
      if (!selected) return;
      if (mode === "date") {
        setMode("time");
        const current = new Date(selected);
        setDate((prev) => {
          const d = prev ? new Date(prev) : new Date();
          d.setFullYear(current.getFullYear(), current.getMonth(), current.getDate());
          return d;
        });
      } else {
        const current = new Date(selected);
        setDate((prev) => {
          const d = prev ? new Date(prev) : new Date();
          d.setHours(current.getHours(), current.getMinutes(), 0, 0);
          return d;
        });
      }
    }
  };

  const validateAndConfirm = async () => {
    if (!service) {
      Alert.alert("Select Service", "Choose the service needed");
      return;
    }
    if (!date) {
      Alert.alert("Select Date", "For the requested service");
      return;
    }
    if (!pet) {
      if (!pets || pets.length === 0) {
        Alert.alert("No filed pet", "Please file one first.");
        return;
      }
      Alert.alert("Select pet", "What pet needs a help.");
      return;
    }

    const pretty = date.toLocaleString();
    const targetName = targetHero?.user?.name || targetHero?.name || "hero";

      await buyIt(targetHero, pet?.type, String(service))

  };

    const buyIt = async (item: any, petType: string, serviceSelected: string) => {
        router.push(`/hero/schedule?item=${JSON.stringify(item)}&petType=${ String(petType).trim() }&serviceSelected=${ String(serviceSelected).trim() }&petInfo=${ JSON.stringify(pet)}&date=${ date?.getTime() }&size=${ 1 }`);
    }

  if (!visible) return null;

  const servicesList = [...Object.keys(Data)]; 
  const userPets = pets || [];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Hiring {targetHero?.user?.name}</Text>
          <Text style={styles.title}>to {service ? service: '___'} {pet ? pet.name : '___'}</Text>
          <TouchableOpacity onPress={() => preClose()}>
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>
        </View>
        { (targetHero && pet?.type && service) && (
          <View>
            <Text style={{fontSize: 12, color: Colors.primary, textAlign: 'center', marginTop: -25, marginBottom: 30}}>
              Price: ${ targetHero?.price[0][`${pet?.type}s`][service] }
            </Text>
          </View>
        )}


        {/* Pet */}
        {!pet && (
        <View style={styles.row}>
          <Text style={styles.label}>Pet</Text>
            <TouchableOpacity onPress={() => setExpandPets(true)} style={styles.selectBtn}>
              <Text style={styles.selectText}>Choose pet</Text>
            </TouchableOpacity>

        </View>
          )}
        {expandPets && (
          <View style={styles.list}>
            {userPets.length === 0 ? (
              <Text style={styles.emptyText}>Please file a pet first</Text>
            ) : (
              <FlatList
                data={userPets}
                horizontal
                keyExtractor={(p: any) => p.uid || p._id}
                renderItem={({ item }: any) => (
                  <TouchableOpacity
                    style={[styles.petItem, pet?.uid === item.uid && styles.petSelected]}
                    onPress={() => { setPet(item); setExpandPets(false); }}
                  >
                    <Text style={[styles.petName, pet?.uid === item.uid && styles.petNameSel]}>{item?.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}


          </View>
        )}


                {/* Service */}
          {!service && (        
        <View style={styles.row}>
          <Text style={styles.label}>Service</Text>

            <TouchableOpacity onPress={() => setExpandServices(true)} style={styles.selectBtn}>
              <Text style={styles.selectText}>Choose Service</Text>
            </TouchableOpacity>

        </View>
          )}
        {expandServices && (
          <View style={styles.list}>
            <FlatList
              data={servicesList}
              horizontal
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
              <View>

                {pet && Object.keys(targetHero?.price[0][`${pet?.type}s`]).includes(item) &&
                <TouchableOpacity
                  style={[styles.serviceItem, service === item && styles.serviceSelected]}
                  onPress={() => { setService(item); setExpandServices(false); }}
                >
                  <Text style={[styles.serviceItemText, service === item && styles.serviceItemTextSel]}>{item}</Text>
                </TouchableOpacity>
              }
              </View>
              )}
            />
          </View>
        )}


        <View style={styles.row}>
            <Text style={styles.label}>When?</Text>
            {(Platform.OS !== 'ios' && Platform.OS !== 'macos') && 
            
              <TouchableOpacity onPress={() => openDatePicker("date")} style={styles.chip}>
                  <Text style={styles.chipText}>{date ? date.toLocaleString() : "Choose "}</Text>
              </TouchableOpacity>
            
            }
            {(showPicker || Platform.OS === 'ios' || Platform.OS === 'macos') &&  (
            <DateTimePicker
                value={date || new Date()}
                style={{backgroundColor: Colors.primary, opacity: 1, flex: 1, alignSelf: 'auto', alignContent: 'center', alignItems:'center', margin: 'auto', borderRadius: 8, marginLeft: 20}}
                mode={mode}
                display={ displayType }
                onChange={onPickerChange}
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                textColor= {Colors.primary}
                accentColor={Colors.primary}
                themeVariant="light"
                minuteInterval={30}
            />
          )}
        </View>
        {showPicker && Platform.OS !== 'ios' && Platform.OS !== 'macos' &&  (
            <DateTimePicker
                value={date || new Date()}
                style={{backgroundColor: Colors.primary, opacity: 1, flex: 1, alignSelf: 'auto', alignContent: 'center', alignItems:'center', margin: 'auto'}}
                mode={mode}
                display={ displayType }
                onChange={onPickerChange}
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                textColor= {Colors.primary}
                accentColor={Colors.primary}
                themeVariant="light"
                minuteInterval={30}
            />
          )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.hireBtn, (loading || (!pet && userPets.length === 0)) && styles.disabled]}
            onPress={validateAndConfirm}
            disabled={loading || (!pet && userPets.length === 0)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.hireText}>Hire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onClose?.()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DatePicker */}

    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 18,
    left: 12,
    right: 12,
    zIndex: 9999,
    alignItems: "center",
    opacity: 0.95
  },
  card: {
    width: "95%",
    backgroundColor: Colors.bg,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.g3,
  },
  header: { flexDirection: "column", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { color: Colors.primary, fontSize: altitudo(2.5), fontWeight: "700" },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  label: { fontSize: latitudo(5), fontFamily: 'mon-b', color: Colors.primary },
  chip: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  chipText: { color: "#fff", fontWeight: "600" },
  selectBtn: { borderWidth: 1, borderColor: Colors.g3, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  selectText: { color: Colors.g3 },

  list: { marginTop: 6, marginBottom: 6 },
  serviceItem: { padding: 8, marginRight: 8, borderRadius: 8, backgroundColor: Colors.g4 },
  serviceSelected: { backgroundColor: Colors.primary },
  serviceItemText: { color: "#333" },
  serviceItemTextSel: { color: "#fff", fontWeight: "700" },

  petItem: { padding: 8, marginRight: 8, borderRadius: 8, backgroundColor: Colors.g4 },
  petSelected: { backgroundColor: Colors.primary },
  petName: { color: "#333" },
  petNameSel: { color: "#fff", fontWeight: "700" },

  emptyText: { color: Colors.g3, padding: 8 },

  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  hireBtn: { flex: 1, backgroundColor: Colors.primary, padding: 12, borderRadius: 10, alignItems: "center", marginRight: 8 },
  hireText: { color: "#fff", fontWeight: "700" },
  cancelBtn: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.g3 },
  cancelText: { color: Colors.g3 },
  disabled: { opacity: 0.6 },
    dp__theme_light: { /* or .dp__theme_dark */
        backgroundColor: Colors.primary,
    }
});

export default FloatingHire;
