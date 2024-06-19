import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

const RoomList = ({ rooms, handleAddToCart }) => {
  const renderRoomItem = ({ item }) => (
    <View style={styles.roomCard}>
      <Text style={styles.roomTitle}>
        {item.roomNumber} - {item.roomType}
      </Text>
      <Text>Capacity: {item.capacity}</Text>
      <Text>Price: ${item.price}</Text>
      {item.discount > 0 && <Text>Discount: {item.discount}%</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.roomId}
      renderItem={renderRoomItem}
    />
  );
};

const styles = StyleSheet.create({
  roomCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  roomTitle: {
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
    fontSize: 16,
  },
});

export default RoomList;
