import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const HotelDetails = ({ hotel, imagePath, amenities, location }) => {
  return (
    <View style={styles.hotelInfo}>
      {imagePath ? (
        <Image source={{ uri: imagePath }} style={styles.hotelImage} />
      ) : (
        <View style={styles.hotelImagePlaceholder}>
          <Text>No Image Available</Text>
        </View>
      )}
      <Text style={styles.hotelName}>{hotel.hotelName}</Text>
      <Text style={styles.hotelDescription}>{hotel.hotelDescription}</Text>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, index) => (
          <Text key={index} style={styles.star}>
            {index < hotel.rating ? "★" : "☆"}
          </Text>
        ))}
      </View>
      <View style={styles.detailsContainer}>
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
        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>Location:</Text>
            <Text style={styles.location}>
              {location.streetName}, {location.postalCode}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  hotelImagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
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
    justifyContent: "center",
  },
  star: {
    fontSize: 24,
    color: "#ffd700",
    //color: "#004051",
  },
  detailsContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
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
  locationContainer: {
    marginTop: 10,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: "#666",
  },
});

export default HotelDetails;
