import React from 'react'
import { AntDesign, Feather, FontAwesome6, Foundation, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleProp, View, ViewStyle } from 'react-native';

const iconProviderMap = {
    FontAwesome6,
    Feather,
    AntDesign,
    Ionicons,
    MaterialCommunityIcons,
    Foundation
};

interface IconProps {
    provider: keyof typeof iconProviderMap;
    name: string;
    size?: number; // or string, based on your use case
    color?: string; // or a more specific type if needed
    style?: StyleProp<ViewStyle>;
}

const Icon: React.FC<IconProps> = ({ provider, name, size, color, style }) => {
    const NewComponent = iconProviderMap[provider];

    if (!NewComponent) return null;
    return (
        <View style={style}>
            <NewComponent name={name} size={size} color={color} />
        </View>
    )
};

export default Icon