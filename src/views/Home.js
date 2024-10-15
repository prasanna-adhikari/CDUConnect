import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
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

    fetchCurrentUser();
    fetchNewsfeedPosts(1);
  }, []);

  const fetchNewsfeedPosts = async (pageNumber = 1) => {
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
        `/newsfeed?page=${pageNumber}&limit=10`,
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
      console.error("Failed to fetch newsfeed posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && posts.length < totalPosts) {
      fetchNewsfeedPosts(page + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNewsfeedPosts(1);
    } catch (error) {
      console.error("Failed to refresh posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Navigation Bar */}
      <NavigationBar activePage={activePage} onNavigate={handleNavigate} />

      {/* Ensure `currentUser` is loaded */}
      {currentUser ? (
        <>
          {activePage === "Home" && (
            <>
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                </View>
              ) : (
                <>
                  <CreatePost />

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
                    renderItem={({ item }) => {
                      // Determine whether the post is from a user or a club
                      const author = item.userId || item.clubId || {};
                      const isUser = !!item.userId;

                      return (
                        <PostCard
                          post={{
                            postId: item._id,
                            authorId: author._id || "",
                            authorName:
                              author.name ||
                              `${author.firstName || ""} ${
                                author.lastName || ""
                              }`.trim(),
                            authorProfile: author.profileImage
                              ? getImageUrl(author.profileImage)
                              : author.clubImage
                              ? getImageUrl(author.clubImage)
                              : "",
                            postTime: item.createdAt,
                            content: item.content,
                            images: item.media
                              ? item.media.map((mediaItem) =>
                                  getImageUrl(mediaItem)
                                )
                              : [],
                            isUser,
                            isEvent: item.isEvent,
                            eventDetails: item.eventDetails,
                          }}
                          currentUser={currentUser}
                        />
                      );
                    }}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      loadingMore ? (
                        <View style={styles.loaderContainer}>
                          <ActivityIndicator
                            size="small"
                            color={PRIMARY_COLOR}
                          />
                        </View>
                      ) : null
                    }
                  />
                </>
              )}
            </>
          )}

          {/* Other pages */}
          {activePage === "Friends" && <FriendsScreen />}
          {activePage === "Clubs" && <ClubList />}
          {activePage === "Notifications" && <NotificationsScreen />}
          {activePage === "Menu" && <CustomMenu />}
        </>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
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
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;
