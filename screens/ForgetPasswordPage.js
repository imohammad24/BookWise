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

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  const handleSendCode = async () => {
    try {
      const response = await fetch(
        `https://${getUri()}/api/users/ForgetPasswordDto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Verification code sent to your email");
        setStep(2);
      } else {
        Alert.alert("Error", "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error sending code:", error);
      Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await fetch(
        `https://${getUri()}/api/users/checkCode/${code}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const token = await response.text();
        await AsyncStorage.setItem("authToken", token);

        const userResponse = await fetch(
          `https://${getUri()}/api/users?email=${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (userResponse.ok) {
          const users = await userResponse.json();
          if (users.length > 0) {
            setUserId(users[0].userId);
            setStep(3);
          } else {
            Alert.alert("Error", "User not found");
          }
        } else {
          Alert.alert("Error", "Failed to retrieve user information");
        }
      } else {
        Alert.alert("Error", "Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(`https://${getUri()}/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify([
          { op: "replace", path: "/password", value: newPassword },
        ]),
      });

      if (response.ok) {
        Alert.alert("Success", "Password reset successfully");
        navigation.navigate("SignIn");
      } else {
        Alert.alert("Error", "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Reset Your Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={handleSendCode}>
            <Text style={styles.buttonText}>Send Verification Code</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.title}>Enter Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
            <Text style={styles.buttonText}>Verify Code</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.title}>Reset Your Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
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

export default ForgetPasswordPage;
