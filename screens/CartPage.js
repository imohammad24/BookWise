import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUri from "../getUrl";
import { Image } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

              const roomTypeResponse = await fetch(
                `https://${getUri()}/api/room/roomType/${room.roomId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              if (!roomTypeResponse.ok) {
                return item;
              }

              const roomTypeData = await roomTypeResponse.json();

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

              const roomImages = await fetchRoomImages(room.roomId);
              const roomImage = roomImages.length > 0 ? roomImages[0] : null;

              const startDate = new Date(item.startDate);
              const endDate = new Date(item.endDate);
              const numberOfDays =
                (endDate - startDate) / (1000 * 60 * 60 * 24);

              const discountedPrice = item.discount
                ? item.price * (1 - item.discount / 100)
                : item.price;

              return {
                ...item,
                hotelName: hotel.hotelName,
                roomNumber: room.roomNumber,
                roomType: roomTypeData.type,
                numberOfDays,
                totalPrice: discountedPrice * numberOfDays,
                discountedPrice,
                roomImages,
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

  const fetchRoomImages = async (roomId) => {
    try {
      const response = await fetch(
        `https://${getUri()}/api/room/${roomId}/roomImage`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.roomImages.map((image) => {
          const filename = image.imageBath.split("/").pop();
          return `http://localhost:3000/images/${filename}`;
        });
      } else {
        console.error(`Failed to retrieve images for room ${roomId}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching images for room ${roomId}:`, error);
      return [];
    }
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

  const handlePayAll = () => {
    navigation.navigate("Payment", { cartItems });
  };

  const handleImagePress = (images, index) => {
    setImageUrls(images.map((url) => ({ url })));
    setCurrentImageIndex(index);
    setImageViewerVisible(true);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.roomImages && item.roomImages.length > 0 && (
        <TouchableOpacity onPress={() => handleImagePress(item.roomImages, 0)}>
          <Image
            source={{ uri: item.roomImages[0] }}
            style={styles.roomImage}
          />
        </TouchableOpacity>
      )}
      <Text style={styles.cartItemTitle}>
        Hotel: {item.hotelName} - Room {item.roomNumber} - {item.roomType}{" "}
        {item.discount > 0 && (
          <Text style={styles.discountText}>({item.discount}% off)</Text>
        )}
      </Text>
      <Text>
        From: {new Date(item.startDate).toLocaleDateString()} to{" "}
        {new Date(item.endDate).toLocaleDateString()}
      </Text>
      <Text>
        Price:{" "}
        <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>{" "}
        <Text style={styles.discountedPrice}>
          ${item.discountedPrice.toFixed(2)}
        </Text>{" "}
        per night
      </Text>
      <Text>Number of nights: {item.numberOfDays}</Text>
      <View style={styles.footer}>
        <Text style={styles.itemTotalPrice}>
          Total Price: ${item.totalPrice.toFixed(2)}
        </Text>
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
      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={imageUrls}
          index={currentImageIndex}
          onSwipeDown={() => setImageViewerVisible(false)}
          enableSwipeDown={true}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  cartContainer: {
    flex: 1,
  },
  cartItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#004051",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#004051",
  },
  cartItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#004051",
  },
  discountText: {
    fontSize: 16,
    color: "red",
  },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#555",
  },
  discountedPrice: {
    textDecorationLine: "underline",
    color: "#004051",
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#004051",
    textAlign: "right",
  },
  button: {
    backgroundColor: "#004051",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  roomImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004051",
  },
});

export default CartPage;
