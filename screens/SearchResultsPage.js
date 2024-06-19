import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Assuming you are using Expo

import getUri from "../getUrl";

const SearchResultsPage = () => {
  const [hotelName, setHotelName] = useState("");
  const [rating, setRating] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState(new Date());

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [endDate, setEndDate] = useState(tomorrow);

  const [city, setCity] = useState("");
  const [hotels, setHotels] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(true); // New state
  const navigation = useNavigation();

  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (hotelName) queryParams.append("hotelName", hotelName);
      if (rating) queryParams.append("rating", parseFloat(rating));
      if (minPrice) queryParams.append("minPrice", parseFloat(minPrice));
      if (maxPrice) queryParams.append("maxPrice", parseFloat(maxPrice));
      queryParams.append("startDate", startDate.toISOString().split("T")[0]);
      queryParams.append("endDate", endDate.toISOString().split("T")[0]);
      if (city) queryParams.append("city", city);

      const baseUrl = `https://${getUri()}/api/hotel`;
      const url = queryParams.toString()
        ? `${baseUrl}?${queryParams.toString()}`
        : baseUrl;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHotels(data.hotels);
        setShowSearchForm(false); // Hide search form on search
      } else {
        Alert.alert("Error", "Failed to retrieve hotels");
      }
    } catch (error) {
      console.error("Error during search:", error);
      Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
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
        return data.imagePath;
      } else {
        console.error(`Failed to retrieve image for hotel ${hotelId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching image for hotel ${hotelId}:`, error);
      return null;
    }
  };

  const renderHotelCard = ({ item }) => {
    const [imagePath, setImagePath] = useState(null);

    useEffect(() => {
      const getImagePath = async () => {
        const path = await fetchHotelImagePath(item.hotelId);
        setImagePath(path);
      };

      getImagePath();
    }, [item.hotelId]);

    return (
      <View style={styles.card}>
        {imagePath ? (
          <Image source={{ uri: imagePath }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text>No Image Available</Text>
          </View>
        )}
        <Text style={styles.cardTitle}>{item.hotelName}</Text>
        <Text style={styles.cardDescription}>{item.hotelDescription}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Text key={index} style={styles.star}>
              {index < item.rating ? "★" : "☆"}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Rooms", { hotel: item })}
        >
          <Text style={styles.buttonText}>View Rooms</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarButton}
        onPress={() => setShowSearchForm(!showSearchForm)}
      >
        <Ionicons name="search" size={24} color="#004051" />
      </TouchableOpacity>
      {showSearchForm && (
        <View>
          <Text style={styles.title}>Search Hotels</Text>
          <TextInput
            style={styles.input}
            placeholder="Hotel Name"
            value={hotelName}
            onChangeText={setHotelName}
          />
          <TextInput
            style={styles.input}
            placeholder="Rating"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Min Price"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Max Price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.datePickerText}>
              Start Date: {startDate.toISOString().split("T")[0]}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.datePickerText}>
              End Date: {endDate.toISOString().split("T")[0]}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.hotelId}
        renderItem={renderHotelCard}
        ListEmptyComponent={
          <Text style={styles.noHotelsText}>No hotels found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  avatarButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004051",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#004051",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  datePickerText: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    textAlign: "center",
    lineHeight: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 30,
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  star: {
    fontSize: 18,
    color: "#ffd700",
  },
  noHotelsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default SearchResultsPage;
