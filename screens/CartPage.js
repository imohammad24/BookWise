import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUri from "../getUrl";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const authToken = await AsyncStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("No auth token found");
        }

        const response = await fetch(
          `https://${getUri()}/api/user/${userId}/Cart`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const detailedCartItems = await Promise.all(
            data.map(async (item) => {
              // Fetch room details
              const roomResponse = await fetch(
                `https://${getUri()}${
                  item.links.find((link) => link.rel === "rooms").href
                }`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              if (!roomResponse.ok) {
                return item;
              }

              const roomData = await roomResponse.json();
              const room = roomData.rooms[0];

              // Fetch hotel details
              const hotelResponse = await fetch(
                `https://${getUri()}${
                  room.links.find((link) => link.rel === "hotel").href
                }`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              if (!hotelResponse.ok) {
                return item;
              }

              const hotelData = await hotelResponse.json();
              const hotel = hotelData.hotels[0];

              const startDate = new Date(item.startDate);
              const endDate = new Date(item.endDate);
              const numberOfDays =
                (endDate - startDate) / (1000 * 60 * 60 * 24);

              return {
                ...item,
                hotelName: hotel.hotelName,
                roomNumber: room.roomNumber,
                numberOfDays,
                totalPrice: item.price * numberOfDays,
              };
            })
          );

          setCartItems(detailedCartItems);
          calculateTotalPrice(detailedCartItems);
        } else {
          console.error("Failed to fetch cart items");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + item.totalPrice;
    }, 0);
    setTotalPrice(total);
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const authToken = await AsyncStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("No auth token found");
      }

      const response = await fetch(
        `https://${getUri()}/api/user/${userId}/Cart/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        // Remove item from local state
        const updatedCartItems = cartItems.filter(
          (item) => item.cartItemId !== cartItemId
        );
        setCartItems(updatedCartItems);
        calculateTotalPrice(updatedCartItems);
      } else {
        console.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handlePayItem = (item) => {
    navigation.navigate("Payment", { roomDetails: item });
  };

  const handlePayAll = () => {
    navigation.navigate("Payment", { cartItems });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartItemTitle}>
        Hotel: {item.hotelName} - Room {item.roomNumber}
      </Text>
      <Text>Start Date: {new Date(item.startDate).toLocaleDateString()}</Text>
      <Text>End Date: {new Date(item.endDate).toLocaleDateString()}</Text>
      <Text>Price: ${item.price} per night</Text>
      <Text>Number of nights: {item.numberOfDays}</Text>
      <Text>Total Price: ${item.totalPrice.toFixed(2)}</Text>
      {item.discount > 0 && <Text>Discount: {item.discount}%</Text>}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayItem(item)}
        >
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.cartItemId)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        <View style={styles.cartContainer}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.cartItemId.toString()}
            renderItem={renderCartItem}
          />
          <Text style={styles.totalPrice}>
            Total Price: ${totalPrice.toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handlePayAll}>
            <Text style={styles.buttonText}>Pay All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  cartContainer: {
    flex: 1,
    width: "100%",
  },
  cartItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cartItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  payButton: {
    backgroundColor: "#004051",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#004051",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default CartPage;
