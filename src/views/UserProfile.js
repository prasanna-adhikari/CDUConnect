import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import UserProfileCard from "../components/UserProfileCard";
import PostCard from "../components/PostCard";
import { useFocusEffect } from "@react-navigation/native";
import { getImageUrl } from "../api/utils";
import Ionicons from "react-native-vector-icons/Ionicons";

const PRIMARY_COLOR = "#1b8283";

const UserProfile = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [relationshipStatus, setRelationshipStatus] = useState("not_friend");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [userId])
  );

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.get(`/user/view/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const fetchedUser = response.data.result;
        setUser(fetchedUser);
        setPosts(fetchedUser.posts || []); // Ensure `posts` is an array

        // Determine relationship status based on friend requests
        const currentUserDetail = await AsyncStorage.getItem("userDetails");
        const parsedUser = JSON.parse(currentUserDetail);
        const currentUserId = parsedUser._id;

        if (
          fetchedUser.friends &&
          fetchedUser.friends.some((friend) => friend._id === currentUserId)
        ) {
          setRelationshipStatus("friend");
        } else {
          // Fetch friend requests to determine if there's a pending request
          const friendRequestsResponse = await apiClient.get(
            `/friend-requests`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (friendRequestsResponse.data.success) {
            const incomingRequests =
              friendRequestsResponse.data.result.incomingRequests || [];
            const outgoingRequests =
              friendRequestsResponse.data.result.outgoingRequests || [];

            if (incomingRequests.some((req) => req.requester._id === userId)) {
              setRelationshipStatus("request_received");
            } else if (
              outgoingRequests.some((req) => req.recipient._id === userId)
            ) {
              setRelationshipStatus("request_sent");
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserDetails();
    } catch (error) {
      console.error("Failed to refresh posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.post(
        `/friend-request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRelationshipStatus("request_sent");
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.post(
        `/friend-request/${userId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRelationshipStatus("friend");
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleRejectFriendRequest = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.post(
        `/friend-request/${userId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRelationshipStatus("not_friend");
      }
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  const handleCancelFriendRequest = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.delete(
        `/friend-request/cancel/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRelationshipStatus("not_friend");
      }
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.delete(`/friend/${userId}/remove`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setRelationshipStatus("not_friend");
      }
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  const handleMessage = () => {
    navigation.navigate("ChatScreen", { userId });
  };

  if (loading) {
    return <ActivityIndicator size="large" color={PRIMARY_COLOR} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}</Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {user ? (
          <>
            <UserProfileCard
              user={user}
              relationshipStatus={relationshipStatus}
              onSendFriendRequest={handleSendFriendRequest}
              onAcceptFriendRequest={handleAcceptFriendRequest}
              onRejectFriendRequest={handleRejectFriendRequest}
              onCancelFriendRequest={handleCancelFriendRequest}
              onRemoveFriend={handleRemoveFriend}
              onMessage={handleMessage}
            />

            {/* Render User Posts */}
            <View style={{ marginTop: 20 }}>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={{
                      postId: post._id,
                      authorId: user._id,
                      authorName: user.name,
                      authorProfile: getImageUrl(user.profileImage),
                      postTime: post.createdAt,
                      content: post.content,
                      images: post.media.map((imagePath) =>
                        getImageUrl(imagePath)
                      ),
                      isUser: true,
                    }}
                    currentUser={{ id: user._id }}
                  />
                ))
              ) : (
                <Text style={styles.noPostsText}>No posts available.</Text>
              )}
            </View>
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text>User not found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
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
  noPostsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default UserProfile;
