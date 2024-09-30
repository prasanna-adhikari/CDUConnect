import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../views/Login";
import Register from "../views/Register";
import Home from "../views/Home"; // Import Home screen
import { useTheme } from "react-native-paper";
import Profile from "../views/Profile";
import CreatePostScreen from "../views/CreatePostScreen";

const Stack = createStackNavigator();

const AppNavigation = () => {
  const theme = useTheme(); // Use theme for consistent styling

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Hide the header
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
