import { Colors } from '@/constants/Constants';
import { Text, Linking, TouchableOpacity, Platform } from 'react-native';

const AddressLink = ({ address }: { address: string }) => {
  const openMap = async () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });

    try {
      const supported = await Linking.canOpenURL(url!);
      if (supported) {
        await Linking.openURL(url!);
      } else {
        // fallback to browser Google Maps
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        await Linking.openURL(browserUrl);
      }
    } catch (e) {
      console.warn('Cannot open maps', e);
    }
  };

  return (
    <TouchableOpacity onPress={openMap}>
      <Text style={{ color: Colors.g2, fontFamily: 'mon-sb', fontSize: 14 }}>
        Address: {address}
      </Text>
    </TouchableOpacity>
  );
};

export default AddressLink;
