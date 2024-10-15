import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../views/Login";
import Register from "../views/Register";
import Home from "../views/Home"; // Import Home screen
import { useTheme } from "react-native-paper";
import Profile from "../views/Profile";
import CreatePostScreen from "../views/CreatePostScreen";
import ChangePasswordScreen from "../views/ChangePasswordScreen";
import SearchScreen from "../views/SearchScreen";
import UserProfile from "../views/UserProfile";
import ClubDetail from "../views/ClubDetail";
import PostDetail from "../views/PostDetail";
import ClubProfile from "../views/ClubProfile";
import ChatScreen from "../views/ChatScreen";
import FriendListScreen from "../views/FriendListScreen";

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
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="ClubProfile" component={ClubProfile} />
        <Stack.Screen name="ClubDetail" component={ClubDetail} />
        <Stack.Screen name="PostDetail" component={PostDetail} />
        <Stack.Screen name="FriendListScreen" component={FriendListScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen
          name="ChangePasswordScreen"
          component={ChangePasswordScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
