import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

const RoomList = ({ rooms, onAddToCart }) => {
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImagePress = (images, index) => {
    setImageUrls(images.map((url) => ({ url })));
    setCurrentImageIndex(index);
    setImageViewerVisible(true);
  };

  const RoomCard = ({ room, onAddToCart, onImagePress }) => {
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
          <TouchableOpacity
            onPress={() => onImagePress(images, currentImageIndex)}
          >
            <Image
              source={{ uri: images[currentImageIndex] }}
              style={styles.image}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{roomType}</Text>
        <View style={styles.row}>
          <Text style={styles.info}>Room Number: {roomNumber}</Text>
          {discount > 0 && (
            <Text style={styles.discount}>({discount}% discount)</Text>
          )}
        </View>
        <Text style={styles.info}>
          Capacity: {capacity} {capacity > 1 ? "persons" : "person"}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.info, styles.crossedOut]}>
            ${price.toFixed(2)}
          </Text>
          {discount > 0 && (
            <Text style={[styles.info, styles.underlined]}>
              {" "}
              ${discountedPrice.toFixed(2)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onAddToCart(room)}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.roomId}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onAddToCart={onAddToCart}
            onImagePress={handleImagePress}
          />
        )}
      />
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#004051",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004051",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  discount: {
    fontSize: 16,
    color: "red",
    marginLeft: 5,
  },
  crossedOut: {
    textDecorationLine: "line-through",
    color: "#555",
  },
  underlined: {
    textDecorationLine: "underline",
    color: "#004051",
    fontWeight: "bold",
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
