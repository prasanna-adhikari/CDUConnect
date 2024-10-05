import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { getImageUrl } from "../api/utils";

const PRIMARY_COLOR = "#1b8283";

const UserProfileCard = ({
  user,
  relationshipStatus,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onCancelFriendRequest,
  onRemoveFriend,
  onMessage,
}) => {
  return (
    <View style={styles.container}>
      <Avatar.Image
        size={100}
        source={{
          uri: user.profileImage ? getImageUrl(user.profileImage) : null,
        }}
        style={styles.avatar}
      />
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>

      {/* Display total number of posts and friends */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.posts?.length || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.friends?.length || 0}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>

      {/* Action buttons based on relationship status */}
      {relationshipStatus === "friend" && (
        <>
          <Button
            mode="contained"
            onPress={onMessage}
            style={styles.actionButton}
            buttonColor={PRIMARY_COLOR}
          >
            Message
          </Button>
          <Button
            mode="outlined"
            onPress={onRemoveFriend}
            style={styles.actionButton}
            textColor={PRIMARY_COLOR}
          >
            Remove Friend
          </Button>
        </>
      )}
      {relationshipStatus === "request_received" && (
        <>
          <Button
            mode="contained"
            onPress={onAcceptFriendRequest}
            style={styles.actionButton}
            buttonColor={PRIMARY_COLOR}
          >
            Accept Request
          </Button>
          <Button
            mode="outlined"
            onPress={onRejectFriendRequest}
            style={styles.actionButton}
            textColor={PRIMARY_COLOR}
          >
            Reject Request
          </Button>
        </>
      )}
      {relationshipStatus === "request_sent" && (
        <Button
          mode="contained"
          onPress={onCancelFriendRequest}
          style={styles.actionButton}
          buttonColor={PRIMARY_COLOR}
        >
          Cancel Request
        </Button>
      )}
      {relationshipStatus === "not_friend" && (
        <Button
          mode="contained"
          onPress={onSendFriendRequest}
          style={styles.actionButton}
          buttonColor={PRIMARY_COLOR}
        >
          Send Friend Request
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
  },
  avatar: {
    backgroundColor: PRIMARY_COLOR,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
    paddingHorizontal: 30,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  actionButton: {
    marginTop: 15,
    borderRadius: 20,
    width: 200,
  },
});

export default UserProfileCard;
