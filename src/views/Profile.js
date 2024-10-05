import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Button, Avatar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getImageUrl } from "../api/utils";
import apiClient from "../api/apiClient";
import PostCard from "../components/PostCard";
import WarningModal from "../components/WarningModal";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";

const PRIMARY_COLOR = "#1b8283";

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

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

  const handleEditAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        formData.append("profileImage", {
          uri: localUri,
          name: filename,
          type,
        });

        const token = await AsyncStorage.getItem("authToken");
        const response = await apiClient.put("/user/profile/image", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          const updatedUser = response.data.result.user;
          await AsyncStorage.setItem(
            "userDetails",
            JSON.stringify(updatedUser)
          );
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Failed to update profile image:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserDetails();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate("ChangePasswordScreen");
  };

  const handleCreatePost = () => {
    navigation.navigate("CreatePostScreen");
  };

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

  const handleLoadMore = () => {
    if (!loadingMore && posts.length < totalPosts) {
      fetchUserPosts(user._id, page + 1);
    }
  };

  const showDeleteWarning = (postId) => {
    setSelectedPostId(postId);
    setWarningVisible(true);
  };

  const handleDeletePost = async () => {
    setWarningVisible(false);
    const postId = selectedPostId;
    if (postId) {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const response = await apiClient.delete(`/user/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post._id !== postId)
          );
          setTotalPosts((prevTotal) => prevTotal - 1);
        }
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={130}
                source={
                  user.profileImage
                    ? { uri: getImageUrl(user.profileImage) }
                    : null
                }
                style={styles.avatar}
              />
              <TouchableOpacity
                onPress={handleEditAvatar}
                style={styles.editIconContainer}
              >
                <MaterialIcons
                  name="camera-alt"
                  size={24}
                  color="#fff"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>
                {user.friends.length} Friends
              </Text>
              <Text style={styles.detailText}>{totalPosts} Posts</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                mode="outlined"
                style={styles.editProfileButton}
                onPress={handleEditProfile}
                textColor={PRIMARY_COLOR}
              >
                Edit Profile
              </Button>
              <Button
                mode="contained"
                style={styles.createPostButton}
                onPress={handleCreatePost}
                buttonColor={PRIMARY_COLOR}
              >
                Create Post
              </Button>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <PostCard
            post={{
              postId: item._id,
              authorId: user._id,
              authorName: user.name,
              authorProfile: getImageUrl(user.profileImage),
              postTime: item.createdAt,
              content: item.content,
              images: item.media.map((imagePath) => getImageUrl(imagePath)),
              isUser: true,
            }}
            currentUser={{ id: user._id }}
            onDelete={() => showDeleteWarning(item._id)}
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
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            </View>
          ) : null
        }
      />

      <WarningModal
        visible={warningVisible}
        onConfirm={handleDeletePost}
        onCancel={() => setWarningVisible(false)}
        message="Are you sure you want to delete this post?"
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
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: PRIMARY_COLOR,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
    padding: 4,
    borderColor: "#fff",
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    alignSelf: "center",
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
    borderColor: PRIMARY_COLOR,
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
