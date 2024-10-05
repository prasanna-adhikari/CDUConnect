import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import { getTimeAgo } from "../utils/formatTimeAgo";
import { getImageUrl } from "../api/utils";
import { Avatar } from "react-native-paper";

const PRIMARY_COLOR = "#1b8283";

const NotificationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications for the user
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.get("/user/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Render each notification item
  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.userInfo}>
        {/* Display avatar based on the type of notification */}
        {item.type === "CLUB_POST" && item.club?.clubImage ? (
          <Avatar.Image
            source={{ uri: getImageUrl(item.club.clubImage) }}
            size={50}
            style={styles.userIcon}
          />
        ) : item.type === "FRIEND_REQUEST" && item.requester?.profileImage ? (
          <Avatar.Image
            source={{ uri: getImageUrl(item.requester.profileImage) }}
            size={50}
            style={styles.userIcon}
          />
        ) : (
          <Avatar.Text
            label={item.type === "FRIEND_REQUEST" ? "FR" : "CL"}
            size={50}
            style={styles.userIcon}
          />
        )}
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotificationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    padding: 15,
  },
  notificationItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    marginRight: 15,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});

export default NotificationScreen;
