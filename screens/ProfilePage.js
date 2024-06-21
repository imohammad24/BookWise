import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import getUri from "../getUrl";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!authToken || !userId) {
        navigation.navigate("SignIn");
        return;
      }

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
        } else {
          Alert.alert("Error", "User data not found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userId");
    navigation.navigate("SignIn");
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004051" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User data not available</Text>
      </View>
    );
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileInitials}>
            {getInitials(userData.firstName, userData.lastName)}
          </Text>
        </View>
        <Text
          style={styles.name}
        >{`${userData.firstName} ${userData.lastName}`}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{userData.email}</Text>
        <Text style={styles.label}>Birth Date:</Text>
        <Text style={styles.info}>
          {new Date(userData.birthDate).toDateString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#004051",
    alignItems: "center",
    paddingVertical: 40,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileInitials: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#004051",
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  infoContainer: {
    padding: 40,
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004051",
    marginBottom: 10,
  },
  info: {
    fontSize: 20,
    color: "#333",
    marginBottom: 30,
  },
  errorText: {
    fontSize: 20,
    color: "#d9534f",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#004051",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfilePage;
