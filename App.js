import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomePage from "./screens/HomePage";
import SearchResultsPage from "./screens/SearchResultsPage";
import ProfilePage from "./screens/ProfilePage";
import CartPage from "./screens/CartPage";
import SignInPage from "./screens/SignInPage";
import SignUpPage from "./screens/SignUpPage";
import PaymentPage from "./screens/PaymentPage";
import RoomsPage from "./screens/RoomsPage";
import ForgetPasswordPage from "./screens/ForgetPasswordPage";
import FeaturedDeals from "./screens/FeaturedDeals";
import ScrollView from "react-native";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="SearchResults" component={SearchResultsPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="Cart" component={CartPage} />
        <Stack.Screen name="SignIn" component={SignInPage} />
        <Stack.Screen name="SignUp" component={SignUpPage} />
        <Stack.Screen name="Payment" component={PaymentPage} />
        <Stack.Screen name="Rooms" component={RoomsPage} />
        <Stack.Screen name="ForgetPassword" component={ForgetPasswordPage} />
        <Stack.Screen name="FeaturedDeals" component={FeaturedDeals} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
