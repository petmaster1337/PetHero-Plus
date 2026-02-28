import PetDaycare from "@/services/pet.daycare";
import PetHotel from "@/services/pet.hotel";
import PetVisit from "@/services/pet.visit";
import PetWalker from "@/services/pet.walker";

export type ProviderProp = "MaterialCommunityIcons" | "FontAwesome6" | "Foundation" | "Feather" | "AntDesign" | "Ionicons";
export type PayType = "half hour" | "hour" | "job" | "day" | "night" | "custom";
export interface DataProps {
    hotel: { icon: string, billing: number, provider: ProviderProp, class: any, description: string, payCycle: PayType, custom?:any},
    daycare: { icon: string, billing: number, provider: ProviderProp, class: any, description: string, payCycle: PayType, custom?:any},
    walk: { icon: string, billing: number, provider: ProviderProp, class: any, description: string, payCycle: PayType, custom?:any},
    visit: { icon: string, billing: number, provider: ProviderProp, class: any, description: string, payCycle: PayType, custom?:any},
}

export type DataPropsIndex = "walk" | "daycare" | "hotel" | "visit";
export const ServicesList: string[] =  ['PetHotel', 'petDayCare', 'petWalk', 'petVisit'];


export const getDistance = (user1: any, user2: any) => {
    if (!user1 || !user2) return 0.00;
    const R = 3958.8;
    const lat1 = user1.lat * Math.PI / 180;
    const lat2 = user2.lat * Math.PI / 180;
    const dLat = (user2.lat - user1.lat) * Math.PI / 180;
    const dLon = (user2.long - user1.long) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
}
    
export const Data: DataProps = {
    hotel: {
        icon: 'home-outline', 
        provider: 'MaterialCommunityIcons',
        class: PetHotel,
        description: "Overnight at hero's house",
        payCycle: "night",
        billing: hours(12),
        custom: {
            allowMultiple: true
        },
    },
    daycare: {
        icon: 'sun', 
        provider: 'FontAwesome6',
        class: PetDaycare,
        description: "Spend the day at hero's house",
        payCycle: "day",
        billing: hours(8),
        custom: {
            allowMultiple: true
        }
    },
    walk: {
        icon: 'guide-dog', 
        provider: 'Foundation',
        class: PetWalker,
        description: "Walk the pet in the neighborhood",
        payCycle: "half hour",
        billing: hours(0.5),
        custom: {
            allowMultiple: false,
            askFor: {
                water: true,
                food: true,
                custom: true
            }

        }

    },
    visit: {
        icon: 'home-roof',
        provider: 'MaterialCommunityIcons',
        class: PetVisit,
        description: "Custom Services",
        payCycle: "half hour",
        billing: hours(0.5),
        custom: {
            allowMultiple: false,
            askFor: {
                walk: true,
                water: true,
                food: true,
                custom: true
            }
        }
    },
}

function hours(time: number) {
    return time * 60 * 60 * 1000;
}

export const priceTypes: {dogs: string[], cats: string[]} = {
    'dogs': ['visit', 'daycare', 'hotel', 'walk'],
    'cats': ['visit', 'daycare', 'hotel']
}