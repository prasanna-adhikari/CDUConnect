import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../api/apiClient";
import { getImageUrl } from "../api/utils";

const PRIMARY_COLOR = "#1b8283";
const ACCENT_COLOR = "#fff";

const ClubList = () => {
  const [followedClubs, setFollowedClubs] = useState([]);
  const [unfollowedClubs, setUnfollowedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // State to handle action loading
  const navigation = useNavigation();

  useEffect(() => {
    fetchClubsData();
  }, []);

  const fetchClubsData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }

      const response = await apiClient.get("/followed-following-clubs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "Success") {
        setFollowedClubs(response.data.result.followedClubs);
        setUnfollowedClubs(response.data.result.unfollowedClubs);
      }
    } catch (error) {
      console.error("Failed to fetch clubs data:", error);
      Alert.alert("Error", "Failed to load clubs data.");
    } finally {
      setLoading(false);
    }
  };

  const handleClubAction = async (clubId, action) => {
    setActionLoading(clubId); // Set loading state for action
    try {
      const token = await AsyncStorage.getItem("authToken");
      const endpoint =
        action === "follow" ? `/follow/${clubId}` : `/unfollow/${clubId}`;
      const response = await apiClient.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.user)
        );
        fetchClubsData();
      } else {
        Alert.alert("Error", `Failed to ${action} club.`);
      }
    } catch (error) {
      console.error(`Failed to ${action} club:`, error);
      Alert.alert("Error", `Failed to ${action} club.`);
    } finally {
      setActionLoading(null); // Reset action loading
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClubsData();
    setRefreshing(false);
  };

  const ClubItem = ({ club, isFollowed }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ClubProfile", { clubId: club._id })}
    >
      <View style={styles.clubCard}>
        <View style={styles.clubInfo}>
          <Image
            source={{
              uri: club.clubImage
                ? getImageUrl(club.clubImage)
                : "https://via.placeholder.com/150",
            }}
            style={styles.clubImage}
          />
          <View style={styles.clubDetails}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubDescription} numberOfLines={2}>
              {club.description || "No description available."}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isFollowed ? "#ff4d4f" : PRIMARY_COLOR },
          ]}
          onPress={() =>
            handleClubAction(club._id, isFollowed ? "unfollow" : "follow")
          }
          disabled={actionLoading === club._id} // Disable button when loading
        >
          {actionLoading === club._id ? (
            <ActivityIndicator size="small" color={ACCENT_COLOR} />
          ) : (
            <Text style={styles.buttonText}>
              {isFollowed ? "Unfollow" : "Follow"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          data={[
            { section: "Followed Clubs" },
            { section: "Unfollowed Clubs" },
          ]}
          keyExtractor={(item) => item.section}
          renderItem={({ item }) => (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{item.section}</Text>
              <FlatList
                data={
                  item.section === "Followed Clubs"
                    ? followedClubs
                    : unfollowedClubs
                }
                keyExtractor={(club) => club._id}
                renderItem={({ item: club }) => (
                  <ClubItem
                    club={club}
                    isFollowed={item.section === "Followed Clubs"}
                  />
                )}
                ListEmptyComponent={
                  <Text style={styles.noClubsText}>No clubs available.</Text>
                }
              />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: "#f0f4f7",
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionContainer: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginBottom: 15,
  },
  clubCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },
  clubInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  clubImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  clubDetails: { flex: 1 },
  clubName: { fontSize: 20, fontWeight: "600", color: "#333" },
  clubDescription: { fontSize: 14, color: "#666", marginTop: 5 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 25 },
  buttonText: { fontSize: 16, fontWeight: "600", color: ACCENT_COLOR },
  noClubsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginVertical: 10,
  },
});

export default ClubList;
