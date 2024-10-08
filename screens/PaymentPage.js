import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUri from "../getUrl";

const CardForm = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");

  const handleSubmit = async () => {
    if (!cardNumber || !expirationDate || !cvv || !cardHolderName) {
      Alert.alert("Invalid Input", "Please fill in all fields.");
      return;
    }

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
        `http://${getUri()}/api/booking/user/${userId}/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            cardDetailsToken: "cnon:card-nonce-ok",
            idempotencyKey: "a26b7cc8-6811-4182-bec4-48160c79eb8a",
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Room booked successfully!");
      } else {
        //..console.error("Failed to add room to cart");
        console.error("Failed to book the room");
        Alert.alert("Error", "Failed to book the room");
      }
    } catch (error) {
      //..console.error("Error adding item to cart:", error);
      console.error("Failed to book the room", error);
      Alert.alert("Error", "Failed to book the room");
    }

    setCardNumber("");
    setExpirationDate("");
    setCvv("");
    setCardHolderName("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Information</Text>

      <Text style={styles.label}>Card Number</Text>
      <TextInput
        style={styles.input}
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        placeholder="1234 5678 9012 3456"
      />

      <Text style={styles.label}>Expiration Date</Text>
      <TextInput
        style={styles.input}
        value={expirationDate}
        onChangeText={setExpirationDate}
        placeholder="MM/YY"
        keyboardType="numeric"
      />

      <Text style={styles.label}>CVV</Text>
      <TextInput
        style={styles.input}
        value={cvv}
        onChangeText={setCvv}
        keyboardType="numeric"
        placeholder="123"
        secureTextEntry={true}
      />

      <Text style={styles.label}>Card Holder Name</Text>
      <TextInput
        style={styles.input}
        value={cardHolderName}
        onChangeText={setCardHolderName}
        placeholder="John Doe"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004051",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#004051",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#004051",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default CardForm;
