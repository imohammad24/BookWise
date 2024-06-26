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

const HomePage = () => {
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [latestVisitedHotel, setLatestVisitedHotel] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const navigation = useNavigation();

  const clearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchMostVisitedCities = async () => {
      try {
        const response = await fetch(
          `https://${getUri()}/api/location/cities/mostVisited`
        );
        if (response.ok) {
          const data = await response.json();
          const formattedDestinations = data.map((city) => {
            const filename = city.cityImagePath.split("/").pop();
            return {
              name: city.cityName,
              image: { uri: `https://localhost:3000/images/${filename}` },
            };
          });
          setDestinations(formattedDestinations);
        } else {
          Alert.alert("Failed to fetch most visited cities");
          console.error("Failed to fetch most visited cities");
        }
      } catch (error) {

        console.error("Error fetching most visited cities:", error);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchMostVisitedCities();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestinationIndex(
        (prevIndex) => (prevIndex + 1) % destinations.length
      );
    }, 7000);
    return () => clearInterval(interval);
  }, [destinations]);

  useEffect(() => {
    const fetchLatestVisitedHotel = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const response = await fetch(
            `https://${getUri()}/api/hotel/user/${userId}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const latestHotel = data[0]; // assuming the latest hotel is the first in the list
              const imagePath = await fetchHotelImagePath(latestHotel.hotelId);
              setLatestVisitedHotel({
                hotelId: latestHotel.hotelId,
                name: latestHotel.hotelName,
                image: { uri: imagePath },
                description: latestHotel.hotelDescription,
              });
            } else {
              setLatestVisitedHotel("No hotels visited");
            }
          } else {
            console.error("Failed to fetch latest visited hotel");
          }
        }
      } catch (error) {
        console.error("Error fetching latest visited hotel:", error);
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
            fetchLatestVisitedHotel();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Failed to load user data");
        }
      }
    };

    checkUserSignedIn();
  }, []);

  const fetchFeaturedDeals = async () => {
    try {
      const response = await fetch(`https://${getUri()}/api/room/featuredDeal`);
      if (response.ok) {
        const featuredDeals = await response.json();
        const roomDetails = await Promise.all(
          featuredDeals.map(async (deal) => {
            const roomResponse = await fetch(
              `https://${getUri()}/api/room?roomId=${deal.roomId}`
            );
            if (roomResponse.ok) {
              const roomData = await roomResponse.json();
              return {
                ...deal,
                room: roomData.rooms[0],
              };
            }
            return deal;
          })
        );
        return roomDetails;
      } else {
        console.error("Failed to fetch featured deals");
        return [];
      }
    } catch (error) {
      console.error("Error fetching featured deals:", error);
      return [];
    }
  };

  const handleFeaturedDealsPress = async () => {
    const featuredDeals = await fetchFeaturedDeals();
    navigation.navigate("FeaturedDeals", { featuredDeals });
  };

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

        {/* Trending Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending destinations</Text>
          <Text style={styles.sectionSubtitle}>
            Most popular choices for travelers from Palestine
          </Text>
          {loadingDestinations ? (
            <Text>Loading...</Text>
          ) : (
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
          )}
        </View>

        {/* Featured Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Deals</Text>
          <Text style={styles.sectionSubtitle}>Special offers for you</Text>
          <TouchableOpacity onPress={handleFeaturedDealsPress}>
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
          {latestVisitedHotel ? (
            latestVisitedHotel === "No hotels visited" ? (
              <Text style={styles.noHotelText}>
                You have not visited any hotel before, make your first visit.
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Rooms", { hotel: latestVisitedHotel })
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
            )
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Ionicons name="home-outline" size={24} color="#004051" />
          
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
        <Ionicons name="cart-outline" size={24} color="#004051" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Ionicons name="person-outline" size={24} color="#004051" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SearchResults")}>
        <Ionicons name="search-outline" size={24} color="#004051" />
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
  noHotelText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
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
