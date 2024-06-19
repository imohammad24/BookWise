import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import getUri from "../getUrl";

const destinations = [
  { name: "Nablus", image: require("../assets/Nablus.png") },
  { name: "Acre", image: require("../assets/Acre.png") },
  { name: "Jerusalem", image: require("../assets/Jerusalem.png") },
  { name: "Gaza", image: require("../assets/Gaza.png") },
  { name: "Ramallah", image: require("../assets/Ramallah.png") },
];

const latestVisitedHotel = {
  name: "Hotel ABC",
  image: require("../assets/HotelABC.png"),
  description: "A luxurious stay with a stunning view.",
};

const HomePage = () => {
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const clearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestinationIndex(
        (prevIndex) => (prevIndex + 1) % destinations.length
      );
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkUserSignedIn = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      if (authToken && userId) {
        try {
          const response = await fetch(
            `https://${getUri()}/api/users?userId=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          const data = await response.json();
          if (data.length > 0) {
            setUserData(data[0]); // assuming the response is an array with a single user object
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Failed to load user data");
        }
      }
    };

    checkUserSignedIn();
  }, []);

  const currentDestination = destinations[currentDestinationIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>BookWise</Text>
        {userData ? (
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.profileInitial}>
              {userData.firstName.charAt(0)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() =>
              navigation.navigate("SearchResults", { city: searchQuery })
            }
          >
            <Ionicons name="search" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Trending Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending destinations</Text>
          <Text style={styles.sectionSubtitle}>
            Most popular choices for travelers from Palestine
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SearchResults", {
                city: currentDestination.name,
              })
            }
          >
            <Image
              source={currentDestination.image}
              style={styles.destinationImage}
            />
            <Text style={styles.destinationText}>
              {currentDestination.name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Featured Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Deals</Text>
          <Text style={styles.sectionSubtitle}>Special offers for you</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("FeaturedDeals")}
          >
            <Image
              source={require("../assets/Offer.png")}
              style={styles.dealImage}
            />
          </TouchableOpacity>
        </View>

        {/* Latest Visited Hotel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Visited Hotel</Text>
          <Text style={styles.sectionSubtitle}>Recently visited by you</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SearchResults", {
                hotel: latestVisitedHotel.name,
              })
            }
          >
            <Image
              source={latestVisitedHotel.image}
              style={styles.destinationImage}
            />
            <Text style={styles.destinationText}>
              {latestVisitedHotel.name}
            </Text>
            <Text style={styles.hotelDescription}>
              {latestVisitedHotel.description}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.footerText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SearchResults")}>
          <Text style={styles.footerText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004051",
  },
  loginButton: {
    padding: 5,
  },
  loginButtonText: {
    fontSize: 16,
    color: "#004051",
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#004051",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    height: 40,
    padding: 10,
  },
  clearButton: {
    marginRight: 10,
  },
  searchButton: {
    padding: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004051",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  destinationImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  destinationText: {
    position: "absolute",
    top: 10,
    left: 10,
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    borderRadius: 5,
    fontWeight: "bold",
  },
  dealImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  hotelDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  footerText: {
    fontSize: 16,
    color: "#004051",
  },
});

export default HomePage;
