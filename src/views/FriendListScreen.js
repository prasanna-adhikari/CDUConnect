import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

// Constants
const PRIMARY_COLOR = "#1b8283";
const IMAGE_PLACEHOLDER = "https://via.placeholder.com/150";

// Helper function to get the correct image URL
const getImageUrl = (path) => {
  if (!path) return IMAGE_PLACEHOLDER;
  const formattedPath = path.replace(/\\/g, "/").replace(/^src\//, "");
  return `http://192.168.86.68:7000/${formattedPath}`;
};

const FriendListScreen = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCurrentUser();
    fetchFriends();
  }, []);

  // Fetch current user ID from AsyncStorage
  const fetchCurrentUser = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      const currentUser = JSON.parse(userDetails);
      setCurrentUserId(currentUser?._id);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch friends list from API
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.get("/view-friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFriends(response.data.result || []);
      } else {
        Alert.alert("Error", "Failed to fetch friends.");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to load friends list.");
    } finally {
      setLoading(false);
    }
  };

  // Render each friend item
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
            userId: currentUserId,
            friendId: item._id,
            friendName: item.name,
          })
        }
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  // Display loading spinner
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

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
        ListEmptyComponent={
          <Text style={styles.noFriendsText}>No friends found.</Text>
        }
      />
    </SafeAreaView>
  );
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
});

export default FriendListScreen;
