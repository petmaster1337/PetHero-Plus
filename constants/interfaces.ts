export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, token: string) => Promise<void>
  clearToken?: (key: string) => void
}

// export type HeroType = {
//   id: string;
//   super: boolean;
//   walk: boolean;
//   visit: boolean;
//   shelter: boolean;
//   name: string;
//   city: string;
//   avatar_url: string;
// };

// export type ItemProps = {
//   item: HeroType;
//   onPress: () => void;
//   height: any;
//   textColor: string;
// };

export interface AttentionProps {
  _id?: string;
  user: string;
  importance: string;
  parameters: any;
  page: any;
}

export interface SessionProps {
  user: any, 
  data: {
    messages: {
      sender: any, 
      receiver: any
    }, 
    services: {
      contractee: any, 
      contractor: any
    }
  }
}

export interface ServiceProps {
  _id?: string;
  uid: string;
  service: string;
  pet: any;
  contractor: any;
  contractee: any;
  date: { _id?: string; start: Date; end: Date };
  status: string;
  price: number;
  step: string;
  contract?: any;
  serviceStart?: Date;
  serviceEnd?: Date;
  contractedAt?: Date;
  rating?: number;
  description?: string;
  feedback?: string;
  deletedAt?: Date;

}

export interface ContractProps {
  _id?: string;
  uid: string;
  service: string;
  pet: string;
  contractor: string;
  contractee: string;
  date: { _id?: string; start: Date | null; end: Date | null};
  status: string | null;
  contractedAt: Date | null;
  price: number;
  step?: string;
  description?: string;
  deletedAt?: Date;
}

export interface PetProps {
  _id?: string;
  uid: string;
  name: string;
  type: string;
  size: string;
  sex: string;
  image: string;
  description: string;
  owner: string;
  history: any;
}

export interface UserProps {
  _id?: string,
  token: string,
  uid: string,
  name: string,
  lat: number,
  long: number,
  image: string,
  description: string,
  email: string,
  password: string,
  phone: string,
  preferred_contact: string,
  city: string,
  address: string,
  notification: string,
  createdAt: Date,
  background?: string,
  state?: string,
}