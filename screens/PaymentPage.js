import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CardForm = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  const handleSubmit = async () => {
    if (!cardNumber || !expirationDate || !cvv || !cardHolderName) {
      Alert.alert('Invalid Input', 'Please fill in all fields.');
      console.log('Invalid Input', 'Please fill in all fields.');
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
        `https://localhost:7183/api/booking/user/${userId}/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            cardDetailsToken:"cnon:card-nonce-ok",
            idempotencyKey:"a26b7cc8-6811-4182-bec4-48160c79eb8a"
          }
            
          ),
        }
      );
      

      if (response.ok) {
        
        Alert.alert("Success", "Room added to cart successfully!");
      } else {
        console.error("Failed to add room to cart");
        Alert.alert("Error", "Failed to add room to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Alert.alert("Error", "Failed to add room to cart");
    }

    Alert.alert(
      'Card Details',
      `Card Number: ${cardNumber}\nExpiration Date: ${expirationDate}\nCVV: ${cvv}\nCard Holder Name: ${cardHolderName}`
    );

    // Optionally, clear form fields after submission
    setCardNumber('');
    setExpirationDate('');
    setCvv('');
    setCardHolderName('');
  };

  return (
    <View style={styles.container}>
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
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 15,
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 5,
    paddingHorizontal: 10,
    fontSize: 18,
  },
});

export default CardForm;
