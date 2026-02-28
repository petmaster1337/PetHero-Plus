import React, { useState } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput 
} from 'react-native';
import { Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Constants';

interface CartItem {
    _id: string;
    uid: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    quantity: number;
}

const CartScreen = () => {
    const router = useRouter();
    const { cartItems } = useLocalSearchParams();
    
    const initialCart: CartItem[] = cartItems ? JSON.parse(cartItems as string) : [];
    const [cart, setCart] = useState<CartItem[]>(initialCart);

    const updateQuantity = (id: string, newQuantity: string) => {
        const quantity = Math.min(Math.max(parseInt(newQuantity) || 1, 1), cart.find(item => item._id === id)?.stock || 1);
        setCart(cart.map(item => (item._id === id ? { ...item, quantity } : item)));
    };

    const removeItem = (id: string) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const calculateSubtotal = (item: CartItem) => (item.quantity * Number(item.price)).toFixed(2);
    const calculateTotal = () => cart.reduce((sum, item) => sum + item.quantity * Number(item.price), 0).toFixed(2);

    const handleCheckout = () => {
        router.push(`/user/checkout?list= ${JSON.stringify(cart)}&total=${calculateTotal()}`);
    };

    return (
        <View style={styles.container}>
            {cart.length === 0 ? (
                <Text style={styles.emptyText}>Your cart is empty</Text>
            ) : (
                <FlatList
                    data={cart}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.title}>{item.name}</Text>
                                <Text style={styles.price}>Price: ${Number(item.price).toFixed(2)}</Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Qty:</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={String(item.quantity)}
                                        onChangeText={(text) => updateQuantity(item._id, text)}
                                    />
                                    <TouchableOpacity 
                                        style={styles.removeButton} 
                                        onPress={() => removeItem(item._id)}
                                    >
                                        <Text style={styles.removeText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.subtotal}>Subtotal: ${calculateSubtotal(item)}</Text>
                            </Card.Content>
                        </Card>
                    )}
                />
            )}
            {cart.length > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
                    <TouchableOpacity style={styles.payButton} onPress={handleCheckout}>
                        <Text style={styles.payText}>Finalize</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
    card: {
        backgroundColor: 'white',
        padding: 10,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    price: {
        fontSize: 16,
        color: '#000',
    },
    subtotal: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5,
        padding: 8,
        marginLeft: 10,
        width: 60,
        textAlign: 'center',
    },
    removeButton: {
        backgroundColor: Colors.redish,
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    removeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    footer: {
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: '#DDD',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        marginLeft: '5%',
        textAlign: 'center',
        bottom: 75
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    payButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    payText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CartScreen;
