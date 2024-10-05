import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const UserPosts = ({ posts }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Posts</Text>
    {posts.length > 0 ? (
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    ) : (
      <Text>No posts available.</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  postItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default UserPosts;
