import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getImageUrl } from "../api/utils";

const FriendsList = ({ friends, navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Friends</Text>
    {friends.length > 0 ? (
      friends.map((friend) => (
        <TouchableOpacity
          key={friend._id}
          style={styles.friendItem}
          onPress={() =>
            navigation.navigate("UserProfile", { userId: friend._id })
          }
        >
          <Image
            source={{ uri: getImageUrl(friend.profileImage) }}
            style={styles.friendImage}
          />
          <Text style={styles.friendName}>{friend.name}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <Text>No friends added yet.</Text>
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
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    color: "#333",
  },
});

export default FriendsList;
