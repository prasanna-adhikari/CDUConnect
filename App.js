import React, { useEffect, useRef } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { Platform } from "react-native"; // Import Platform here
import AppNavigation from "./src/navigation/AppNavigation";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./src/api/apiClient"; // Import the API client to make requests

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener for when a notification is received while the app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);
        const { type } = notification.request.content.data;

        if (type === "FRIEND_REQUEST") {
          Toast.show({
            type: "info",
            text1: "New Friend Request",
            text2: "You have received a new friend request.",
          });
        }
      });

    // Listener for when the user interacts with the notification (clicks it)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked:", response);
        const { type, requesterId } =
          response.notification.request.content.data;

        if (type === "FRIEND_REQUEST") {
          // Redirect to the friend requests screen or a specific user's profile
          // Assuming you have a navigation prop or a navigation setup context
          navigation.navigate("FriendRequestsScreen");
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Push Token:", token);

      // Send the token to your backend
      await sendPushTokenToServer(token);
    } else {
      // alert("Must use a physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  const sendPushTokenToServer = async (token) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("No user ID found in storage");
        return;
      }

      console.log("notificaiton: ", response);
      const response = await apiClient.post("/save-push-token", {
        userId,
        token,
      });

      if (response.status === 200) {
        console.log("Push token saved successfully.");
      } else {
        console.error("Failed to save push token:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving push token to server:", error);
    }
  };

  return (
    <PaperProvider>
      <AppNavigation />
      <Toast />
    </PaperProvider>
  );
}
