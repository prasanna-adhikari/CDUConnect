import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getImageUrl } from "../api/utils";
import FriendsScreen from "../components/FriendsScreen";
import CustomMenu from "./CustomMenu";
import ClubList from "../components/ClubList";
import NotificationsScreen from "../components/NotificationScreen";

const PRIMARY_COLOR = "#1b8283";

const Home = () => {
  const [activePage, setActivePage] = useState("Home");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initializeHomePage();
  }, []);

  // Initialize home page
  const initializeHomePage = async () => {
    await fetchCurrentUser();
    await fetchNewsfeedPosts(1);
  };

  // Fetch current user data from AsyncStorage
  const fetchCurrentUser = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      if (userDetails) {
        setCurrentUser(JSON.parse(userDetails));
      }
    } catch (error) {
      console.error("Failed to fetch current user details:", error);
    }
  };

  // Fetch newsfeed posts from API
  const fetchNewsfeedPosts = async (pageNumber = 1) => {
    setLoading(pageNumber === 1);
    setLoadingMore(pageNumber > 1);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found.");

      const response = await apiClient.get(
        `/newsfeed?page=${pageNumber}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTotalPosts(response.data.total);
        const newPosts = response.data.posts || [];
        setPosts(pageNumber === 1 ? newPosts : [...posts, ...newPosts]);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error("Failed to fetch newsfeed posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle loading more posts when scrolling
  const handleLoadMore = () => {
    if (!loadingMore && posts.length < totalPosts) {
      fetchNewsfeedPosts(page + 1);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNewsfeedPosts(1);
    setRefreshing(false);
  };

  // Handle page navigation
  const handleNavigate = (page) => {
    setActivePage(page);
  };

  // Render each post item
  const renderPost = ({ item }) => {
    const author = item.userId || item.clubId || {};
    const isUser = !!item.userId;

    return (
      <PostCard
        post={{
          postId: item._id,
          authorId: author._id || "",
          authorName:
            author.name ||
            `${author.firstName || ""} ${author.lastName || ""}`.trim(),
          authorProfile: getImageUrl(
            author.profileImage || author.clubImage || ""
          ),
          postTime: item.createdAt,
          content: item.content,
          images: item.media
            ? item.media.map((mediaItem) => getImageUrl(mediaItem))
            : [],
          isUser,
          isEvent: item.isEvent,
          eventDetails: item.eventDetails,
        }}
        currentUser={currentUser}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Navigation Bar */}
      <NavigationBar activePage={activePage} onNavigate={handleNavigate} />

      {currentUser ? (
        <>
          {/* Home Page */}
          {activePage === "Home" && (
            <View style={styles.postsContainer}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={PRIMARY_COLOR}
                  style={styles.loader}
                />
              ) : (
                <>
                  <CreatePost />
                  <FlatList
                    data={posts}
                    keyExtractor={(item) => item._id}
                    renderItem={renderPost}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[PRIMARY_COLOR]}
                      />
                    }
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      loadingMore ? (
                        <ActivityIndicator
                          size="small"
                          color={PRIMARY_COLOR}
                          style={styles.loader}
                        />
                      ) : null
                    }
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text>No posts available.</Text>
                      </View>
                    }
                  />
                </>
              )}
            </View>
          )}

          {/* Other Pages */}
          {activePage === "Friends" && <FriendsScreen />}
          {activePage === "Clubs" && <ClubList />}
          {activePage === "Notifications" && <NotificationsScreen />}
          {activePage === "Menu" && <CustomMenu />}
        </>
      ) : (
        <ActivityIndicator
          size="large"
          color={PRIMARY_COLOR}
          style={styles.loader}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  postsContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});

export default Home;
