import { StatusBar, Dimensions, StyleSheet } from 'react-native';


const { width, height } = Dimensions.get('window');


export const altitudo = (valuePercent: number) => { return Math.floor(valuePercent / 100 * height) }
export const latitudo = (valuePercent: number) => { return Math.floor(valuePercent / 100 * width) }
export const HOUR_EARLIER = 2;

export const getDistance = (ctr1: { lat: number; long: number; }, ctr2: { lat: number; long: number; }) => {
    const toRadians = (degree: number) => degree * (Math.PI / 180);
    const R = 3958.8;
    const lat1 = toRadians(ctr1.lat);
    const lon1 = toRadians(ctr1.long);
    const lat2 = toRadians(ctr2.lat);
    const lon2 = toRadians(ctr2.long);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(3);
};

export const SIZE_STATUSBAR = StatusBar.currentHeight;
const SIZE_HEADER_INITIAL = altitudo(15);

export const PRICE_PERCENTAGE = 0.8; // 80%
export const TRANSACTION_FEE = 0.04; // 4%

export const Constants = {
    sizes: {
        h: Math.floor(height),
        w: Math.floor(width),
        IMG_modals: altitudo(50),
        header: {
            statusbar: SIZE_STATUSBAR!,
            initial: altitudo(15),
            total: altitudo(15),
        },
    },
};

export const Colors = {
    primary: '#F7931A',
    secondary: '#DA6',
    cyan: '#088',
    bg: 'white',
    g1: '#4a4a4a',
    g2: '#5f5f5f',
    g3: '#9f9f9f',
    g4: '#c3c3c3',
    g5: '#dfdfdf',
    g6: '#F3F3F3',
    white: 'white',
    black: 'black',
    orange: '#FF886B',
    red: '#BF0303',
    blue0: '#11A8DE',
    blue: '#31c7f9',
    pink: '#fa3264',
    btc: '#F7931A',
    border1:"#FA2",
    golden: "#FD6",
    redish: '#FF5500',
    greener: '#005500',
    greenish: '#0055FF',
    gr1: '#880'
}


export const dstyles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'cyan',
        paddingHorizontal: latitudo(2.5),
        justifyContent: 'center',
    },

    contModalHeader: {
        backgroundColor: Colors.primary,
        height: altitudo(14),
        width: '100%',
        borderWidth: 2,
        // flex: 1,
    },

    contModalHeaderLeft: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: latitudo(2),
    },


    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'black',
        marginVertical: altitudo(1),
    },

    ButtonRound: {
        width: altitudo(6),
        borderRadius: altitudo(6),
        aspectRatio: 1,
        backgroundColor: '#669FDD',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,  
        elevation: 5,        
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLogin: {
        flex: 1,
        paddingVertical: altitudo(2),
        alignItems: 'center',
        borderRadius: latitudo(4 * 1.618),
    },

    imgProfiles: {
        height: latitudo(55),
        width: latitudo(55),
        borderRadius: latitudo(30),
        margin: "auto",
        marginTop: 35,
        position: 'relative'
    }
    
})

export const dtexts = StyleSheet.create({
    textModalTitle: {
        fontFamily: 'mon-b',
        fontSize: altitudo(1.618),
    },
    textModalBack: {
        fontFamily: 'mon',
        fontSize: altitudo(1.618),
    },
    textMain1: {
        fontFamily: 'mon-b',
        fontSize: altitudo(2.5),
    },
    textMain2: {
        fontFamily: 'mon-sb',
        fontSize: altitudo(3),
    },
    mong1lat3: {
        fontFamily: 'mon',
        color: Colors.g1,
        fontSize: latitudo(3),
    },


})