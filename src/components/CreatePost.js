import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, TextInput, Button } from "react-native-paper";

const CreatePost = () => {
  return (
    <View style={styles.createPostContainer}>
      <Avatar.Image
        size={40}
        source={{ uri: "https://placekitten.com/200/200" }}
      />
      <TextInput
        style={styles.createPostInput}
        placeholder="What's on your mind?"
        mode="outlined"
        theme={{ colors: { primary: "#1b8283" } }}
      />
      <Button mode="contained" style={styles.postButton} onPress={() => {}}>
        Post
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  createPostContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  createPostInput: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#f8f9fa",
  },
  postButton: {
    borderRadius: 20,
    backgroundColor: "#1b8283",
  },
});

export default CreatePost;
