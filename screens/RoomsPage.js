import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUri from "../getUrl";
import defaultHotelImage from "../assets/Jerusalem.png";
import DateTimePicker from "@react-native-community/datetimepicker";
import ModalDateTimePicker from "react-native-modal-datetime-picker";

const RoomsPage = () => {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const route = useRoute();
  const { hotel: initialHotel } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (initialHotel.hotelId === "default") {
        setHotel({
          hotelId: "default",
          hotelName: "Default Hotel",
          hotelDescription: "This is a default hotel description.",
          rating: 4,
        });
        setRooms([
          {
            roomId: "1",
            roomNumber: "101",
            roomType: "Single",
            capacity: 1,
            price: 100,
            discount: 0,
          },
          {
            roomId: "2",
            roomNumber: "102",
            roomType: "Double",
            capacity: 2,
            price: 150,
            discount: 10,
          },
        ]);
      } else {
        try {
          const response = await fetch(
            `https://${getUri()}/api/hotel?hotelId=${initialHotel.hotelId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const hotelData = await response.json();
            setHotel(hotelData.hotels[0]);

            const roomsResponse = await fetch(
              `https://${getUri()}/api/room?hotelID=${initialHotel.hotelId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (roomsResponse.ok) {
              const roomsData = await roomsResponse.json();
              setRooms(roomsData.rooms);
            } else {
              console.error("Failed to fetch rooms");
            }

            const amenitiesResponse = await fetch(
              `https://${getUri()}/api/hotel/${initialHotel.hotelId}/amenities`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (amenitiesResponse.ok) {
              const amenitiesData = await amenitiesResponse.json();
              setAmenities(amenitiesData);
            } else {
              console.error("Failed to fetch amenities");
            }
          } else {
            console.error("Failed to fetch hotel details");
          }
        } catch (error) {
          console.error("Error fetching hotel details:", error);
        }
      }
    };

    fetchHotelDetails();
  }, [initialHotel.hotelId]);

  const handleAddToCart = (room) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const handleConfirmDates = async () => {
    setModalVisible(false);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const authToken = await AsyncStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("No auth token found");
      }

      const requestBody = {
        roomId: selectedRoom.roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        numberOfResidents: 0,
      };

      const response = await fetch(
        `https://${getUri()}/api/user/${userId}/Cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      console.log(`https://${getUri()}/api/user/${userId}/Cart`);
      console.log(requestBody);

      if (response.ok) {
        Alert.alert("Success", "Room added to cart");
      } else {
        const errorText = await response.text();
        Alert.alert("Error", errorText);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

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
    <View style={styles.container}>
      {hotel ? (
        <View style={styles.hotelInfo}>
          <Image source={defaultHotelImage} style={styles.hotelImage} />
          <Text style={styles.hotelName}>{hotel.hotelName}</Text>
          <Text style={styles.hotelDescription}>{hotel.hotelDescription}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Text key={index} style={styles.star}>
                {index < hotel.rating ? "★" : "☆"}
              </Text>
            ))}
          </View>
          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenitiesTitle}>Amenities:</Text>
            {amenities.length > 0 ? (
              amenities.map((amenity, index) => (
                <Text key={index} style={styles.amenity}>
                  {amenity.name}
                </Text>
              ))
            ) : (
              <Text style={styles.amenity}>No amenities available</Text>
            )}
          </View>
        </View>
      ) : (
        <Text>Loading hotel information...</Text>
      )}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.roomId}
        renderItem={renderRoomItem}
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
    padding: 20,
    backgroundColor: "#fff",
  },
  hotelInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  hotelImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  hotelDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  star: {
    fontSize: 24,
    color: "#ffd700",
  },
  amenitiesContainer: {
    marginBottom: 20,
  },
  amenitiesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  amenity: {
    fontSize: 16,
    color: "#666",
  },
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
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
    width: "100%",
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
});

export default RoomsPage;
