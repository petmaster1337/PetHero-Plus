import React, { useEffect, useState } from 'react';
import { 
    View, 
    Image, 
    Text, 
    FlatList, 
    ActivityIndicator, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput 
} from 'react-native';
import { Card } from 'react-native-paper';
import { Colors, latitudo } from '@/constants/Constants';
import { useRouter } from 'expo-router';
import SetHeader from '@/components/default.menu';
import { Ionicons } from '@expo/vector-icons';
import { getAllProducts } from '@/services/product.service';

interface Product {
    _id?: string;
    uid: string;
    name: string;
    description?: string;
    image: string;
    price: number;
    stock: number;
}

interface CartItem extends Product {
    quantity: number;
}

const StoreScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await getAllProducts();
            setProducts(response);
        } catch (error) {
            console.log('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item: Product, quantity: number) => {
        setCart(prevCart => {
            const updatedCart = new Map(prevCart);
            updatedCart.set(item._id!, { ...item, quantity });
            return updatedCart;
        });
    };

    const handleRemoveFromCart = (item: Product) => {
        setCart(prevCart => {
            const updatedCart = new Map(prevCart);
            updatedCart.delete(item._id!);
            return updatedCart;
        });
    };

    const handleCheckout = () => {
        const cartItems = Array.from(cart.values());
        router.push(`/user/cart?cartItems=${encodeURIComponent(JSON.stringify(cartItems))}`);
    };

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;

    return (
        <View style={styles.screen}>
            <SetHeader title="Pet Hero Store" style={{marginTop: 0}} />
            <FlatList
                data={products}
                keyExtractor={(item) => `${item.uid}${Math.floor(Math.random() * Math.pow(32,4))}`}
                renderItem={({ item }) => (
                    <ProductCard 
                        item={item} 
                        cart={cart}
                        onAddToCart={handleAddToCart} 
                        onRemoveFromCart={handleRemoveFromCart} 
                    />
                )}
                contentContainerStyle={styles.listContainer}
            />
            <View style={{width: '100%', height: 160}}></View>
            {cart.size > 0 && (
                <TouchableOpacity style={[styles.checkoutButton, {flexDirection: 'row'}]} onPress={handleCheckout}>
                  <Ionicons name="cart" size={latitudo(6)} style={{verticalAlign: 'middle', marginLeft: 'auto'}} color={ 'white'} />
                  <Text style={styles.checkoutText}> ({cart.size} items)</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const ProductCard = ({ item, cart, onAddToCart, onRemoveFromCart }: { 
    item: Product, 
    cart: Map<string, CartItem>, 
    onAddToCart: (item: Product, quantity: number) => void, 
    onRemoveFromCart: (item: Product) => void 
}) => {
    const [quantity, setQuantity] = useState<string>('1');

    const manageQuantity = (value: string) => {
        let number = parseInt(value) || '';
        if (parseInt(value) > item.stock) number = item.stock;
        setQuantity(String(number));
    };

    const isInCart = cart.has(item._id!);

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.price}>Price: ${Number(item.price).toFixed(2)}</Text>
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
                        onPress={() => onRemoveFromCart(item)}
                    >
                        <Text style={styles.buttonText}>Remove From Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => onAddToCart(item, parseInt(quantity))}
                    >
                        <Text style={styles.buttonText}>Add To Cart</Text>
                    </TouchableOpacity>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    listContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    loader: {
        marginTop: 50,
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginVertical: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
    },
    label: {
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
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        elevation: 3,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkoutButton: {
        position: 'absolute',
        top: 45,
        left: 0,
        width: '100%',
        height: 50,
        backgroundColor: Colors.primary,
        elevation: 5,
    },
    checkoutText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        verticalAlign: 'middle',
        width: 80,
        textAlign:'center',
    },

});

export default StoreScreen;
