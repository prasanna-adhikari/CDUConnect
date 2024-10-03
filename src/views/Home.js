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

const PRIMARY_COLOR = "#1b8283";
const Home = () => {
  const [activePage, setActivePage] = useState("Home");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
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

      {/* Posts Section */}
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
                renderItem={({ item }) => (
                  <>
                    <PostCard
                      post={{
                        userId: item.userId._id, // Assuming userId is an object containing the user's _id
                        userName:
                          item.userId.name ||
                          `${item.userId.firstName} ${item.userId.lastName}`, // Assuming userId contains the user's name or first and last names
                        userProfile: item.userId.profileImage
                          ? getImageUrl(item.userId.profileImage)
                          : null, // Assuming userId contains a profileImage
                        postTime: item.createdAt,
                        content: item.content,
                        images: item.media.map((mediaItem) =>
                          getImageUrl(mediaItem)
                        ),
                      }}
                      currentUser={{ id: item.userId._id }}
                    />
                  </>
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
            </>
          )}
        </>
      )}

      {/* {activePage === "Profile" && <Profile />} */}
      {activePage === "Friends" && (
        <>
          <FriendsScreen />
        </>
      )}
      {activePage === "Clubs" && (
        <>
          <ClubList />
        </>
      )}
      {activePage === "Menu" && (
        <>
          <CustomMenu />
        </>
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
});

export default Home;
