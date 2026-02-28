import { altitudo, Colors } from "@/constants/Constants";
import { storeDispute } from "@/services/event.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,  TextInput } from "react-native";
import { Card } from "react-native-paper";

type Product = {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  status: string;
  createdAt: Date;
  stock: number;
  classification: string; 
  quantity: number;
  seller: string; 
  type: string;
  uid: string;
  updatedAt: string;
};

interface CartItem extends Product {
  quantity: number;
}

type Props = {
  product: Product;
  onReview: (product: Product) => void;
  onDispute: (product: Product) => void;
  onBuyAgain: (product: Product) => void;
};

const ProductPurchaseView: React.FC<Props> = () => {
  const [ product, setProduct ] = useState<Product>();
  const [ pay, setPay ] = useState<Product>();
  const { productString, payString } = useLocalSearchParams();
  const [ quantity, setQuantity ] = useState<string>('1');
  const [ cart, setCart ] = useState<Map<string, CartItem>>(new Map());
  const [ disputeDisplay, setDisputeDisplay ] = useState<boolean>(false);
  const [ disputeText, setDisputeText ] = useState<string>('');
  const [ afterMessage, setAfterMessage ] = useState<string>('');

  const router = useRouter();

    const manageQuantity = (value: string) => {
        let number = parseInt(value) || '';
        if (product?.stock && parseInt(value) > product?.stock) {
          number = product?.stock;
        }
        setQuantity(String(number));
    };

  useEffect(() => {
    setProduct(JSON.parse(String(productString)));
    setPay(JSON.parse(String(payString)));
  }, []);

  const formattedDate = () => {
    if (product) {
     return new Date(product.createdAt).toLocaleString();
    } else {
      return;
    }
  }

  const onReview = (product: Product | undefined) => {
    console.log(product);
  }  
  
  const onDispute = () => {
    setDisputeDisplay(!disputeDisplay);
  }  

  const handleDispute = async () => {
    if (product && pay) {
      const item = await storeDispute({
        product: String(product._id),
        contract: '',
        paymentId: String(pay._id),
        description: disputeText,
        price: product.price
      });  
      if (item.error) {
        console.log(`Error: ${item.error}`);
      }
      setDisputeDisplay(false);
      setAfterMessage('Dispute sent!');
      setDisputeText('');
      setTimeout(() => {
        setAfterMessage('');
      }, 5000);
    }
  }
  
  const onBuyAgain = async () => {
    const newList = [];
    newList.push({ ...product, quantity: quantity });
    router.push(`/user/cart?cartItems=${ JSON.stringify(newList) }`);
  };

  const handleAddToCart = ( quantity: number) => {
    setCart(prevCart => {
        const updatedCart = new Map(prevCart);
        if (product)
          updatedCart.set(product._id, { ...product, quantity });
        return updatedCart;
    });
  };

  const handleRemoveFromCart = (product: any) => {
      setCart(prevCart => {
          const updatedCart = new Map(prevCart);
          updatedCart.delete(product._id);
          return updatedCart;
      });
  };
  const isInCart = cart.has(product?._id!);

  return (
    <View style={{ height: altitudo(100), backgroundColor: 'white' }}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{marginLeft: '15%', width: '100%', fontSize: 12, color: Colors.g3}}>Purchased on: { formattedDate() }</Text>
        <Card style={styles.card}>
            <Card.Content>
                <Image source={{ uri: product?.image }} style={styles.productImage} />
                <Text style={styles.title}>{product?.name}</Text>
                <Text style={styles.description}>{product?.description}</Text>
                <Text style={styles.price}>Price: ${Number(product?.price).toFixed(2)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.label, { marginRight: 5 }]}>Qty:</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={manageQuantity}
                        value={quantity}
                        placeholder="Product quantity "
                    />
                </View>
                {isInCart ? (
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: Colors.redish }]} 
                        onPress={() => handleRemoveFromCart(product)}
                    >
                        <Text style={styles.buttonText}>Remove From Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => handleAddToCart( parseInt(quantity))}
                    >
                        <Text style={styles.buttonText}>Add To Cart</Text>
                    </TouchableOpacity>
                )}
            </Card.Content>
        </Card>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.dispute]} onPress={() => onDispute()}>
          <Text style={styles.buttonText}>Dispute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buyAgain]} onPress={() => onBuyAgain()}>
          <Text style={styles.buttonText}>Buy Again</Text>
        </TouchableOpacity>
      </View>
      {disputeDisplay && (
        <View style={{borderWidth: 1, borderRadius: 12, borderColor: Colors.g5, width: '90%', padding: 10, marginTop: 20, marginBottom: 450}}>
          <Text style={{
            textAlign: 'center', 
            marginBottom: 10, 
            fontWeight: 'bold', 
            display: 'flex', 
            flexDirection: 'row', 
            fontSize: 20}}>What happened?</Text>
          <TextInput
            value={disputeText}
            multiline={true}
            style={{borderWidth: 1, width: '95%', margin: 'auto', borderRadius: 6,borderColor: Colors.g5}}
            onChangeText={setDisputeText}
            placeholder="Please tell us what happened"
          />
          <TouchableOpacity style={[styles.button, styles.dispute, {marginRight: 5, marginTop: 10}]} onPress={() => handleDispute()}>
          <Text style={[styles.buttonText]}>File Complaint</Text>
        </TouchableOpacity>

        </View>
      )}
      <Text style={{width: '100%', textAlign: 'center'}}>{ afterMessage }</Text>
    </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    textAlign: "center",
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
  },
  button: {
    borderRadius: 8,
    marginHorizontal: 'auto',
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    width: 100,
    height: 40,
    verticalAlign: 'middle',
    textAlign: 'center',
    fontFamily: 'mon',
    fontWeight: 'bold',
  },
  review: {
    backgroundColor: Colors.secondary,
  },
  dispute: {
    backgroundColor: Colors.redish,
  },
  buyAgain: {
    backgroundColor: Colors.primary,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 4,
    overflow: 'hidden',
},
productImage: {
  width: 300,
  height: 225,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
},    
price: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
  marginBottom: 10,
},    label: {
  fontSize: 14,
  fontWeight: 'bold',
},
input: {
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 5,
  paddingHorizontal: 10,
  paddingVertical: 8,
  fontSize: 14,
  backgroundColor: '#FFF',
  flex: 1,
},
});

export default ProductPurchaseView;
