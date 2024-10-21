import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Avatar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getImageUrl } from "../api/utils";
import { useNavigation } from "@react-navigation/native";

const PRIMARY_COLOR = "#1b8283";

const CreatePost = () => {
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const getUserDetails = async () => {
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
        }
      } catch (error) {
        console.error("Failed to load user details:", error);
      }
    };

    getUserDetails();
  }, []);

  return (
    <View style={styles.createPostContainer}>
      {user?.profileImage ? (
        <Avatar.Image
          size={40}
          source={{ uri: getImageUrl(user.profileImage) }}
        />
      ) : (
        <Avatar.Text size={40} label={initials} style={styles.avatar} />
      )}

      <TouchableOpacity
        style={styles.createPostInputContainer}
        onPress={() => navigation.navigate("CreatePostScreen")}
      >
        <Text style={styles.createPostInputText}>What's on your mind?</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        style={styles.postButton}
        onPress={() => navigation.navigate("CreatePostScreen")}
      >
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
  avatar: {
    backgroundColor: PRIMARY_COLOR,
  },
  createPostInputContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "center",
  },
  createPostInputText: {
    color: "#aaa",
    fontSize: 16,
  },
  postButton: {
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
  },
});

export default CreatePost;
