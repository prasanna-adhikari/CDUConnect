import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import { getImageUrl } from "../api/utils";
import { RefreshControl } from "react-native-gesture-handler";

const PRIMARY_COLOR = "#1b8283";
const SECONDARY_COLOR = "#4e9b9e";

const FriendsScreen = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      // Fetch available users
      const usersResponse = await apiClient.get("/view-available-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (usersResponse.data.success) {
        setAvailableUsers(usersResponse.data.result || []); // Use empty array if no users found
      }

      // Fetch incoming and outgoing friend requests
      const requestsResponse = await apiClient.get("/friend-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (requestsResponse.data.success) {
        setIncomingRequests(
          requestsResponse.data.result.incomingRequests || []
        );
        setOutgoingRequests(
          requestsResponse.data.result.outgoingRequests || []
        );
      }
    } catch (error) {
      console.error("Failed to load friends data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await apiClient.post(
        `/friend-request/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIncomingRequests((prev) =>
          prev.filter((request) => request._id !== requestId)
        );
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await apiClient.post(
        `/friend-request/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIncomingRequests((prev) =>
          prev.filter((request) => request._id !== requestId)
        );
      }
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (recipientId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await apiClient.post(
        `/friend-request/${recipientId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Find the user in the availableUsers list to get their profile image
        const user = availableUsers.find((u) => u._id === recipientId);

        // Add to outgoing requests
        setOutgoingRequests((prev) => [
          ...prev,
          {
            recipient: {
              _id: recipientId,
              name: user?.name,
              profileImage: user?.profileImage,
            },
            status: "pending",
          },
        ]);

        // Remove from available users list
        setAvailableUsers((prev) =>
          prev.filter((user) => user._id !== recipientId)
        );
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  // Cancel friend request
  const handleCancelRequest = async (recipientId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await apiClient.delete(
        `/friend-request/cancel/${recipientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Find the canceled request's user in outgoingRequests
        const canceledUser = outgoingRequests.find(
          (request) => request.recipient._id === recipientId
        );

        // Remove the request from outgoingRequests
        setOutgoingRequests((prev) =>
          prev.filter((request) => request.recipient._id !== recipientId)
        );

        // Add the user back to availableUsers
        if (canceledUser) {
          setAvailableUsers((prev) => [
            ...prev,
            {
              _id: canceledUser.recipient._id,
              name: canceledUser.recipient.name,
              profileImage: canceledUser.recipient.profileImage,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchFriendsData();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Friend Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Requests</Text>
          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) =>
              request?.requester ? (
                <View key={request._id} style={styles.friendContainer}>
                  <Avatar.Image
                    size={50}
                    source={{
                      uri: request.requester.profileImage
                        ? getImageUrl(request.requester.profileImage)
                        : "https://via.placeholder.com/150",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {request.requester.name || "Unknown"}
                    </Text>
                    <Text>{request.requester.email || "Unknown"}</Text>
                    <View style={styles.buttonGroup}>
                      <Button
                        mode="contained"
                        onPress={() => handleAcceptRequest(request._id)}
                        style={styles.acceptButton}
                      >
                        Accept
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleRejectRequest(request._id)}
                        style={styles.rejectButton}
                        textColor={PRIMARY_COLOR}
                      >
                        Reject
                      </Button>
                    </View>
                  </View>
                </View>
              ) : null
            )
          ) : (
            <Text style={styles.noRequestsText}>No connection requests</Text>
          )}
        </View>

        {/* Outgoing Connection Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outgoing Connection Requests</Text>
          {outgoingRequests.length > 0 ? (
            outgoingRequests.map((request) =>
              request?.recipient ? (
                <View key={request._id} style={styles.friendContainer}>
                  <Avatar.Image
                    size={50}
                    source={{
                      uri: request.recipient.profileImage
                        ? getImageUrl(request.recipient.profileImage)
                        : "https://via.placeholder.com/150",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {request.recipient.name || "Unknown"}
                    </Text>
                    <Text>{request.recipient.email || "Unknown"}</Text>

                    <View style={styles.buttonGroup}>
                      <Text style={styles.pendingText}>Pending</Text>
                      <Button
                        mode="outlined"
                        onPress={() =>
                          handleCancelRequest(request.recipient._id)
                        }
                        style={styles.cancelButton}
                        textColor={PRIMARY_COLOR}
                      >
                        Cancel
                      </Button>
                    </View>
                  </View>
                </View>
              ) : null
            )
          ) : (
            <Text style={styles.noRequestsText}>No outgoing requests</Text>
          )}
        </View>

        {/* Available Users Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Users</Text>
          {availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <View key={user._id} style={styles.friendContainer}>
                <Avatar.Image
                  size={60}
                  source={{
                    uri: user.profileImage
                      ? getImageUrl(user.profileImage)
                      : "https://via.placeholder.com/150",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name || "Unknown"}</Text>
                  <Text>{user.email || "Unknown"}</Text>

                  <Button
                    mode="contained"
                    onPress={() => handleSendFriendRequest(user._id)}
                    style={styles.addButton}
                  >
                    Connect
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noRequestsText}>No users found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginBottom: 15,
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  avatar: {
    backgroundColor: SECONDARY_COLOR,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: PRIMARY_COLOR,
    marginRight: 10,
    borderRadius: 10,
  },
  rejectButton: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    marginTop: 10,
    borderRadius: 10,
  },
  cancelButton: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 10,
  },
  pendingText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 5,
  },
  noRequestsText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FriendsScreen;
