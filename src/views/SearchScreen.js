import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Avatar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import { getImageUrl } from "../api/utils";
import Ionicons from "react-native-vector-icons/Ionicons";

const PRIMARY_COLOR = "#1b8283";

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState({
    users: [],
    clubs: [],
    posts: [],
  });

  const handleSearchChange = async (text) => {
    setQuery(text);

    if (text.trim().length === 0) {
      setResults({ users: [], clubs: [], posts: [] });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.get(`/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query: text,
        },
      });

      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error("Failed to search:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handleSearchChange(query);
    } catch (error) {
      console.error("Failed to refresh search results:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderSectionHeader = (title) => (
    <Text key={`${title}-header`} style={styles.sectionHeader}>
      {title}
    </Text>
  );

  const renderUserItem = (user) => (
    <TouchableOpacity
      key={user._id}
      style={styles.resultItem}
      onPress={() => navigation.navigate("UserProfile", { userId: user._id })}
    >
      <Avatar.Image
        size={50}
        source={{
          uri: user.profileImage ? getImageUrl(user.profileImage) : null,
        }}
      />
      <Text style={styles.resultText}>{user.name}</Text>
    </TouchableOpacity>
  );

  const renderClubItem = (club) => (
    <TouchableOpacity
      key={club._id}
      style={styles.resultItem}
      onPress={() => navigation.navigate("ClubProfile", { clubId: club._id })}
    >
      <Avatar.Image
        size={50}
        source={{ uri: club.clubImage ? getImageUrl(club.clubImage) : null }}
      />
      <Text style={styles.resultText}>{club.name}</Text>
    </TouchableOpacity>
  );

  const renderPostItem = (post) => (
    <TouchableOpacity
      key={post._id}
      style={styles.resultItem}
      onPress={() => navigation.navigate("PostDetail", { postId: post._id })}
    >
      <Avatar.Icon size={50} icon="post" />
      <Text style={styles.resultText}>{post.content.slice(0, 50)}...</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for users or clubs..."
          value={query}
          onChangeText={handleSearchChange}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
            />
          }
        >
          {results.users.length > 0 && (
            <>
              {renderSectionHeader("Users")}
              {results.users.map((user) => renderUserItem(user))}
            </>
          )}
          {results.clubs.length > 0 && (
            <>
              {renderSectionHeader("Clubs")}
              {results.clubs.map((club) => renderClubItem(club))}
            </>
          )}

          {results.users.length === 0 && results.clubs.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 15,
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  resultText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});

export default SearchScreen;
