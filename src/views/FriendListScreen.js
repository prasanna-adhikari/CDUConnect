import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIMARY_COLOR = "#1b8283"; // Consistent primary color for the app

const FriendListScreen = () => {
  const [friends, setFriends] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); // Store the current user ID
  const navigation = useNavigation();

  useEffect(() => {
    // Get current user ID from AsyncStorage
    const getCurrentUser = async () => {
      const userDetails = await AsyncStorage.getItem("userDetails");
      const currentUser = JSON.parse(userDetails); // Assuming userDetails is stored as JSON
      setCurrentUserId(currentUser._id); // Set the current user ID
    };

    getCurrentUser();
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken"); // Get the token from AsyncStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Add the token to the headers
      };
      const response = await apiClient.get("/view-friends", { headers });
      setFriends(response.data.result); // Set friends in state from "result" array
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friendContainer}>
      <Image
        source={{ uri: getImageUrl(item.profileImage) }}
        style={styles.profileImage}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            userId: currentUserId, // The current logged-in user's ID
            friendId: item._id, // The friend's ID
            friendName: item.name, // Send the friend's name to use in the header
          })
        }
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Consistent Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends List</Text>
      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderFriend}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

// Helper function to get the correct image URL
const getImageUrl = (path) => {
  if (!path) return null;
  const formattedPath = path.replace(/\\/g, "/").replace(/^src\//, "");
  return `http://192.168.86.68:7000/${formattedPath}`;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    elevation: 3,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginLeft: 10,
    flex: 1,
    textAlign: "center",
  },
  listContainer: {
    padding: 10,
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
  },
  chatButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default FriendListScreen;
