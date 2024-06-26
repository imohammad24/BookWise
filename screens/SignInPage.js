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
import { useNavigation } from "@react-navigation/native";
import getUri from "../getUrl";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
 
  const handleSignIn = async () => {
    Alert.alert("asd");
    console.log("asfs");
    try {
      const response = await fetch(`https://${getUri()}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept":"*/*"
        },
        body: JSON.stringify({ email, password }),
      });
      Alert.alert(response);
      console.log(response);

      if (response.ok) {
        const token = await response.text(); // Read the response as plain text
        await AsyncStorage.setItem("authToken", token);

        // Fetch all users
        const usersResponse = await fetch(`https://${getUri()}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const user = usersData.find((user) => user.email === email);
          if (user) {
            await AsyncStorage.setItem("userId", user.userId);
            navigation.navigate("Home");
          } else {
            Alert.alert("Error", "User not found");
          }
        } else {
          Alert.alert("Error", "Failed to retrieve user information");
        }
      } else {
        const errorText = await response.text();
        Alert.alert("Error", errorText || "Sign-in failed");
      }
    } catch (error) {
      console.error("Error during sign-in:", error.response.data);
      Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in to continue.</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.linkText}>
        Don't have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
          Sign up
        </Text>
      </Text>

      <Text style={styles.linkText}>
        Forget your password?{" "}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("ForgetPassword")}
        >
          Click here
        </Text>
      </Text>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
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
  linkText: {
    marginTop: 15,
    textAlign: "center",
    color: "#666",
  },
  link: {
    color: "#004051",
    fontWeight: "bold",
  },
});

export default SignInPage;
