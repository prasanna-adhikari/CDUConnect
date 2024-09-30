import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Button, Avatar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getImageUrl } from "../api/utils";
import apiClient from "../api/apiClient";
import PostCard from "../components/PostCard";
import { useFocusEffect } from "@react-navigation/native";

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  // Function to fetch user details and posts
  const getUserDetails = async () => {
    setLoading(true);
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      if (userDetails) {
        const parsedUser = JSON.parse(userDetails);
        setUser(parsedUser);

        if (parsedUser?.name) {
          const nameParts = parsedUser.name.trim().split(" ");
          if (nameParts.length > 1) {
            setInitials(`${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase());
          } else {
            setInitials(nameParts[0].slice(0, 2).toUpperCase());
          }
        }

        await fetchUserPosts(parsedUser._id, 1);
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user posts with pagination
  const fetchUserPosts = async (userId, pageNumber = 1) => {
    if (pageNumber > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await apiClient.get(
        `/user/${userId}/posts?page=${pageNumber}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTotalPosts(response.data.total);
        if (pageNumber === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
        }
        setPage(pageNumber);
      }
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Use useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getUserDetails();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleCreatePost = () => {
    navigation.navigate("CreatePostScreen");
  };

  // Function to refresh user posts manually
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user) {
        await fetchUserPosts(user._id, 1);
      }
    } catch (error) {
      console.error("Failed to refresh posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to handle loading more posts when scrolling
  const handleLoadMore = () => {
    if (!loadingMore && posts.length < totalPosts) {
      fetchUserPosts(user._id, page + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1b8283" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Back
        </Button>
        <Text style={styles.headerTitle}>{user.name}</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1b8283"]}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.profileSection}>
            {user.profileImage ? (
              <Avatar.Image
                size={100}
                source={{ uri: getImageUrl(user.profileImage) }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text size={100} label={initials} style={styles.avatar} />
            )}
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>
                {user.friends.length} Friends
              </Text>
              <Text style={styles.detailText}>{totalPosts} Posts</Text>
            </View>

            {/* Buttons for Edit Profile and Create Post */}
            <View style={styles.buttonsContainer}>
              <Button
                mode="outlined"
                style={styles.editProfileButton}
                onPress={handleEditProfile}
                textColor="#1b8283"
              >
                Edit Profile
              </Button>
              <Button
                mode="contained"
                style={styles.createPostButton}
                onPress={handleCreatePost}
                buttonColor="#1b8283"
              >
                Create Post
              </Button>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <PostCard
            post={{
              userId: user._id,
              userName: user.name,
              userProfile: getImageUrl(user.profileImage),
              postTime: item.createdAt,
              content: item.content,
              images: item.media.map((imagePath) => getImageUrl(imagePath)),
            }}
            currentUser={{ id: user._id }}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>
              No posts of yours. Create a post.
            </Text>
            <Button
              mode="contained"
              style={styles.editProfileButton}
              onPress={handleCreatePost}
            >
              Create Post
            </Button>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#1b8283" />
            </View>
          ) : null
        }
      />
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
    padding: 10,
    paddingTop: 35,
    backgroundColor: "#ffffff",
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    backgroundColor: "#1b8283",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
  detailText: {
    fontSize: 16,
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  editProfileButton: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#1b8283",
    marginHorizontal: 10,
  },
  createPostButton: {
    borderRadius: 30,
    marginHorizontal: 10,
  },
  noPostsContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  noPostsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Profile;
