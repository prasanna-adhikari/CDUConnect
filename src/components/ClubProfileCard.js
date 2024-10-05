import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { getImageUrl } from "../api/utils";

const PRIMARY_COLOR = "#1b8283";

const ClubProfileCard = ({
  club,
  isFollowing,
  onFollowClub,
  onUnfollowClub,
}) => {
  return (
    <View style={styles.container}>
      <Avatar.Image
        size={100}
        source={{
          uri: club.clubImage ? getImageUrl(club.clubImage) : null,
        }}
        style={styles.avatar}
      />
      <Text style={styles.clubName}>{club.name}</Text>
      <Text style={styles.clubDescription}>{club.description}</Text>

      {/* Action button to follow/unfollow club */}
      {isFollowing ? (
        <Button
          mode="contained"
          onPress={onUnfollowClub}
          style={styles.actionButton}
          buttonColor={PRIMARY_COLOR}
        >
          Unfollow Club
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={onFollowClub}
          style={styles.actionButton}
          buttonColor={PRIMARY_COLOR}
        >
          Follow Club
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: PRIMARY_COLOR,
  },
  clubName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  clubDescription: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  actionButton: {
    marginTop: 15,
    borderRadius: 20,
    width: 200,
  },
});

export default ClubProfileCard;
