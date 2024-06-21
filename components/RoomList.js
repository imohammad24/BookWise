import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

const RoomList = ({ rooms, onAddToCart }) => {
  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.roomId}
      renderItem={({ item }) => (
        <RoomCard room={item} onAddToCart={onAddToCart} />
      )}
    />
  );
};

const RoomCard = ({ room, onAddToCart }) => {
  const { roomNumber, roomType, capacity, price, discount, images } = room;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(imageInterval);
  }, [images]);

  const discountedPrice =
    discount > 0 ? price - (price * discount) / 100 : price;

  return (
    <View style={styles.card}>
      {images && images.length > 0 && (
        <Image
          source={{ uri: images[currentImageIndex] }}
          style={styles.image}
        />
      )}
      <Text style={styles.title}>{roomType}</Text>
      <Text>Room Number: {roomNumber}</Text>
      <Text>Capacity: {capacity}</Text>
      <Text>Price: ${price.toFixed(2)} per night</Text>
      {discount > 0 && (
        <>
          <Text>Discount: {discount}%</Text>
          <Text>
            Price after discount: ${discountedPrice.toFixed(2)} per night
          </Text>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={() => onAddToCart(room)}>
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#004051",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default RoomList;
