import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import getUri from "../getUrl";

const FeaturedDeals = () => {
  const [deals, setDeals] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFeaturedDeals = async () => {
      try {
        const response = await fetch(
          `https://${getUri()}/api/room/featuredDeal`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const dealsData = await response.json();
          setDeals(dealsData);
        } else {
          console.error("Failed to fetch featured deals");
        }
      } catch (error) {
        console.error("Error fetching featured deals:", error);
      }
    };

    fetchFeaturedDeals();
  }, []);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const roomsData = await Promise.all(
          deals.map(async (deal) => {
            const response = await fetch(
              `https://${getUri()}/api/room?roomId=${deal.roomId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const roomData = await response.json();
              const room = roomData.rooms[0];

              const roomTypeResponse = await fetch(
                `https://${getUri()}${
                  room.links.find((link) => link.rel === "room type").href
                }`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              if (roomTypeResponse.ok) {
                const roomTypeData = await roomTypeResponse.json();
                room.roomType = roomTypeData.type;
              }

              const roomImages = await fetchRoomImages(room.roomId);
              room.images = roomImages;

              const hotelResponse = await fetch(
                `https://${getUri()}/api/hotel?hotelId=${room.hotelId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              if (hotelResponse.ok) {
                const hotelData = await hotelResponse.json();
                room.hotelName = hotelData.hotels[0].hotelName;
              }

              return { ...deal, ...room };
            } else {
              console.error(`Failed to fetch details for room ${deal.roomId}`);
              return null;
            }
          })
        );

        setRooms(roomsData.filter((room) => room !== null));
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    if (deals.length > 0) {
      fetchRoomDetails();
    }
  }, [deals]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const newIndex = { ...prevIndex };
        rooms.forEach((room) => {
          if (!newIndex[room.roomId]) newIndex[room.roomId] = 0;
          newIndex[room.roomId] =
            (newIndex[room.roomId] + 1) % room.images.length;
        });
        return newIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [rooms]);

  const handleAddToCart = async (room) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const handleConfirmDates = async () => {
    const cartItem = {
      roomId: selectedRoom.roomId,
      startDate,
      endDate,
      numberOfResidents: 0, // Adjust as needed
    };

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("No auth token found");
      }

      const response = await fetch(
        `https://${getUri()}/api/user/${userId}/Cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(cartItem),
        }
      );

      if (response.ok) {
        setModalVisible(false);
        Alert.alert("Success", "Room added to cart successfully!");
      } else {
        console.error("Failed to add room to cart");
        Alert.alert("Error", "Failed to add room to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Alert.alert("Error", "Failed to add room to cart");
    }
  };

  const renderRoom = ({ item }) => {
    const discountedPrice = item.price - (item.price * item.discount) / 100;

    return (
      <View style={styles.roomCard}>
        <Image
          source={{ uri: item.images[currentImageIndex[item.roomId] || 0] }}
          style={styles.roomImage}
        />
        <Text style={styles.hotelName}>{item.hotelName}</Text>
        <Text style={styles.roomNumber}>Room Number: {item.roomNumber}</Text>
        <Text style={styles.roomType}>Type: {item.roomType}</Text>
        <Text style={styles.capacity}>Capacity: {item.capacity}</Text>
        <Text style={styles.price}>Price: ${item.price.toFixed(2)}</Text>
        <Text style={styles.discount}>Discount: {item.discount}%</Text>
        <Text style={styles.finalPrice}>
          Price after Discount: ${discountedPrice.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.featuredDealId}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Dates</Text>
            {Platform.OS === "web" ? (
              <>
                <View style={styles.webDatePicker}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <input
                    type="date"
                    value={startDate.toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    style={styles.dateInput}
                  />
                </View>
                <View style={styles.webDatePicker}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <input
                    type="date"
                    value={endDate.toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    style={styles.dateInput}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.datePicker}>
                  <Button
                    onPress={() => setShowStartDatePicker(true)}
                    title="Select Start Date"
                  />
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={handleStartDateChange}
                    />
                  )}
                </View>
                <View style={styles.datePicker}>
                  <Button
                    onPress={() => setShowEndDatePicker(true)}
                    title="Select End Date"
                  />
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      onChange={handleEndDateChange}
                    />
                  )}
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleConfirmDates}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  roomCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  roomImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 16,
    marginBottom: 4,
  },
  roomType: {
    fontSize: 16,
    marginBottom: 4,
  },
  capacity: {
    fontSize: 16,
    marginBottom: 4,
  },
  discount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: "#004051",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  datePicker: {
    width: "100%",
    marginBottom: 20,
  },
  webDatePicker: {
    width: "100%",
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  dateInput: {
    width: "90%",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#004051",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#c44",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
  },
  discount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  finalPrice: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default FeaturedDeals;
