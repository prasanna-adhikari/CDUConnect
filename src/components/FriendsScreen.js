import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
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
  const [actionLoading, setActionLoading] = useState(null); // State for handling loading in actions

  const navigation = useNavigation();

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }

      // Fetch available users
      const usersResponse = await apiClient.get("/view-available-user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.data.success) {
        setAvailableUsers(usersResponse.data.result || []);
      }

      // Fetch incoming and outgoing friend requests
      const requestsResponse = await apiClient.get("/friend-requests", {
        headers: { Authorization: `Bearer ${token}` },
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
      Alert.alert("Error", "Failed to load friends data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (action, requestId, recipientId) => {
    setActionLoading(requestId || recipientId);
    try {
      const token = await AsyncStorage.getItem("authToken");
      let endpoint, method;

      switch (action) {
        case "accept":
          endpoint = `/friend-request/${requestId}/accept`;
          method = "post";
          break;
        case "reject":
          endpoint = `/friend-request/${requestId}/reject`;
          method = "post";
          break;
        case "send":
          endpoint = `/friend-request/${recipientId}`;
          method = "post";
          break;
        case "cancel":
          endpoint = `/friend-request/cancel/${recipientId}`;
          method = "delete";
          break;
        default:
          return;
      }

      const response = await apiClient[method](
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        updateListsAfterAction(action, requestId, recipientId);
      } else {
        Alert.alert("Error", `Failed to ${action} friend request.`);
      }
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
      Alert.alert("Error", `Failed to ${action} friend request.`);
    } finally {
      setActionLoading(null);
    }
  };

  const updateListsAfterAction = (action, requestId, recipientId) => {
    if (action === "accept" || action === "reject") {
      setIncomingRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } else if (action === "send") {
      const user = availableUsers.find((u) => u._id === recipientId);
      setOutgoingRequests((prev) => [
        ...prev,
        { recipient: user, status: "pending" },
      ]);
      setAvailableUsers((prev) => prev.filter((u) => u._id !== recipientId));
    } else if (action === "cancel") {
      const canceledUser = outgoingRequests.find(
        (req) => req.recipient._id === recipientId
      );
      setOutgoingRequests((prev) =>
        prev.filter((req) => req.recipient._id !== recipientId)
      );
      if (canceledUser) {
        setAvailableUsers((prev) => [...prev, canceledUser.recipient]);
      }
    }
  };

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
        <FriendRequests
          title="Connection Requests"
          requests={incomingRequests}
          handleAction={handleAction}
          actionLoading={actionLoading}
          navigation={navigation}
        />
        <FriendRequests
          title="Outgoing Connection Requests"
          requests={outgoingRequests}
          handleAction={handleAction}
          actionLoading={actionLoading}
          outgoing
          navigation={navigation}
        />
        <AvailableUsers
          users={availableUsers}
          handleAction={handleAction}
          actionLoading={actionLoading}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const FriendRequests = ({
  title,
  requests,
  handleAction,
  actionLoading,
  outgoing,
  navigation,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {requests.length > 0 ? (
      requests.map((request) => (
        <TouchableOpacity
          key={request._id}
          onPress={() =>
            navigation.navigate("UserProfile", {
              userId: request.requester?._id,
            })
          }
        >
          <View style={styles.friendContainer}>
            <Avatar.Image
              size={50}
              source={{ uri: getImageUrl(request.requester?.profileImage) }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {request.requester?.name || "Unknown"}
              </Text>
              <Text>{request.requester?.email || "Unknown"}</Text>
              {outgoing ? (
                <View style={styles.buttonGroup}>
                  <Text style={styles.pendingText}>Pending</Text>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      handleAction("cancel", null, request.recipient._id)
                    }
                    style={styles.cancelButton}
                    disabled={actionLoading === request.recipient._id}
                  >
                    Cancel
                  </Button>
                </View>
              ) : (
                <View style={styles.buttonGroup}>
                  <Button
                    mode="contained"
                    onPress={() => handleAction("accept", request._id)}
                    style={styles.acceptButton}
                    disabled={actionLoading === request._id}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleAction("reject", request._id)}
                    style={styles.rejectButton}
                    disabled={actionLoading === request._id}
                  >
                    Reject
                  </Button>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))
    ) : (
      <Text style={styles.noRequestsText}>No {title.toLowerCase()}</Text>
    )}
  </View>
);

const AvailableUsers = ({ users, handleAction, actionLoading, navigation }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Available Users</Text>
    {users.length > 0 ? (
      users.map((user) => (
        <TouchableOpacity
          key={user._id}
          onPress={() =>
            navigation.navigate("UserProfile", { userId: user._id })
          }
        >
          <View style={styles.friendContainer}>
            <Avatar.Image
              size={50}
              source={{ uri: getImageUrl(user.profileImage) }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || "Unknown"}</Text>
              <Text>{user.email || "Unknown"}</Text>
              <Button
                mode="contained"
                onPress={() => handleAction("send", null, user._id)}
                style={styles.addButton}
                disabled={actionLoading === user._id}
              >
                Connect
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      ))
    ) : (
      <Text style={styles.noRequestsText}>No users found</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContainer: { padding: 20 },
  section: { marginBottom: 30 },
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
  avatar: { backgroundColor: SECONDARY_COLOR },
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 18, fontWeight: "600", color: "#333" },
  buttonGroup: { flexDirection: "row", marginTop: 10 },
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
  pendingText: { color: "#888", fontSize: 16, fontWeight: "500", marginTop: 5 },
  noRequestsText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 10,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default FriendsScreen;
