import { Colors } from "@/constants/Constants";
import { FontAwesome } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image, Animated } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function ReviewLine({data}: {data:any}) {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(25)).current;

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 25 : 100, 
      duration: 500, 
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };    const fullStars = Math.round(data.grade / 2);

    const reviewComponent =() => {
        const percentage = data.grade / 10;
        return (
            <View style={{width: 120, alignItems: 'flex-start', alignSelf: 'flex-start'}}>

                <View style={{ width: (100 * percentage), overflow: 'hidden', height: 25, position: 'relative', alignSelf: 'flex-start'}}>
                    <Image
                        source={require('@/assets/images/star-bar.png')}
                        style={{position: 'absolute', top: 0, left: 0, width: 100, height: 20}}
                    />
                </View>
            </View>
        )
    }


    return (
        <View style={styles.stars}>
            <Animated.View style={{flexDirection: 'column', width: '100%', height: animation, overflow: 'hidden'}}>
                <View  style={{flexDirection: 'row', width: '100%'}}>
                    <TouchableOpacity onPress={toggleExpand} style={{width: '100%', flexDirection:'row'}}>
                        {reviewComponent()}
                        <Text style={{ color: Colors.g3, marginLeft: 'auto', marginRight: 10}}>{ new Date(data.createdAt).toLocaleString()}


                        </Text>

                    </TouchableOpacity>
                </View>                    

                <ScrollView nestedScrollEnabled={true} style={{marginHorizontal: 25, marginTop: 5}}>
                    <Text style={{textAlign: 'justify', color: Colors.g2}}>{data.description}</Text>
                </ScrollView>
            </Animated.View>
        </View>
    );
  };


const styles = StyleSheet.create({
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC'
  },
  star: {
    marginHorizontal: 4,
  }
});