import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUri from "../getUrl";
import DateTimePicker from "@react-native-community/datetimepicker";
import ModalDateTimePicker from "react-native-modal-datetime-picker";
import HotelDetails from "../components/HotelDetails";
import RoomList from "../components/RoomList";

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
  const [imagePath, setImagePath] = useState(null);
  const [location, setLocation] = useState(null);
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
              const roomsWithTypes = await Promise.all(
                roomsData.rooms.map(async (room) => {
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
                    return { ...room, roomType: roomTypeData.type };
                  } else {
                    console.error("Failed to fetch room type");
                    return room;
                  }
                })
              );

              // Fetch room images
              const roomsWithImages = await Promise.all(
                roomsWithTypes.map(async (room) => {
                  const roomImages = await fetchRoomImages(room.roomId);
                  return { ...room, images: roomImages };
                })
              );

              setRooms(roomsWithImages);
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

            const imagePath = await fetchHotelImagePath(initialHotel.hotelId);
            setImagePath(imagePath);

            const locationData = await fetchHotelLocation(initialHotel.hotelId);
            setLocation(locationData);
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

  const fetchHotelImagePath = async (hotelId) => {
    try {
      const response = await fetch(
        `https://${getUri()}/api/hotel/${hotelId}/hotelImage`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const filename = data.imagePath.split("/").pop();
        return `http://localhost:3000/images/${filename}`;
      } else {
        console.error(`Failed to retrieve image for hotel ${hotelId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching image for hotel ${hotelId}:`, error);
      return null;
    }
  };

  const fetchHotelLocation = async (hotelId) => {
    try {
      const response = await fetch(
        `https://${getUri()}/api/hotel/${hotelId}/location`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const locationData = await response.json();
        return locationData;
      } else {
        console.error("Failed to fetch hotel location");
        return null;
      }
    } catch (error) {
      console.error("Error fetching hotel location:", error);
      return null;
    }
  };

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

  const handleStartDateChange = (date) => {
    // setShowStartDatePicker(false);
    // setStartDate(date);
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === "ios");
    setStartDate(currentDate);
  };

  const handleEndDateChange = (date) => {
    // setShowEndDatePicker(false);
    // setEndDate(date);
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === "ios");
    setStartDate(currentDate);
  };

  return (
    <View style={styles.container}>
      {hotel ? (
        <HotelDetails
          hotel={hotel}
          amenities={amenities}
          imagePath={imagePath}
          location={location}
        />
      ) : (
        <Text>Loading hotel details...</Text>
      )}

      {rooms.length > 0 ? (
        <RoomList rooms={rooms} onAddToCart={handleAddToCart} />
      ) : (
        <Text>Loading rooms...</Text>
      )}

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
});

export default RoomsPage;
