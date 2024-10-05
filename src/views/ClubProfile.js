import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import ClubProfileCard from "../components/ClubProfileCard";
import PostCard from "../components/PostCard";
import { useFocusEffect } from "@react-navigation/native";
import { getImageUrl } from "../api/utils";
import Ionicons from "react-native-vector-icons/Ionicons";

const PRIMARY_COLOR = "#1b8283";

const ClubProfile = ({ route, navigation }) => {
  const { clubId } = route.params;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      fetchClubDetails();
    }, [clubId])
  );

  const fetchClubDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.get(`/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const fetchedClub = response.data.result;
        setClub(fetchedClub);
        setPosts(fetchedClub.posts || []);

        // Check if the user is following the club
        const currentUserDetail = await AsyncStorage.getItem("userDetails");
        const parsedUser = JSON.parse(currentUserDetail);
        const isUserFollowing = parsedUser.followingClubs.some(
          (club) => club._id === clubId
        );
        setIsFollowing(isUserFollowing); // Set `isFollowing` based on fetched data
      }
    } catch (error) {
      console.error("Failed to fetch club details:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchClubDetails();
    } catch (error) {
      console.error("Failed to refresh club details:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollowClub = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.post(
        `/follow/${clubId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsFollowing(true);
        const updatedUser = response.data.user;
        await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to follow club:", error);
    }
  };

  const handleUnfollowClub = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.post(
        `/unfollow/${clubId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsFollowing(false);
        const updatedUser = response.data.user;
        await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to unfollow club:", error);
    }
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
        <Text style={styles.headerTitle}>{club.name}</Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {club ? (
          <>
            <ClubProfileCard
              club={club}
              isFollowing={isFollowing}
              onFollowClub={handleFollowClub}
              onUnfollowClub={handleUnfollowClub}
            />

            {/* Render Club Posts */}
            <View style={{ marginTop: 20 }}>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={{
                      postId: post._id,
                      authorId: club._id,
                      authorName: club.name,
                      authorProfile: getImageUrl(club.clubImage),
                      postTime: post.createdAt,
                      content: post.content,
                      images: post.media.map((imagePath) =>
                        getImageUrl(imagePath)
                      ),
                      isUser: false,
                    }}
                    currentUser={null}
                  />
                ))
              ) : (
                <Text style={styles.noPostsText}>No posts available.</Text>
              )}
            </View>
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text>Club not found.</Text>
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

export default ClubProfile;
