import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PaymentPage = () => {
  return (
    <View style={styles.container}>
      <Text>Payment Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PaymentPage;
