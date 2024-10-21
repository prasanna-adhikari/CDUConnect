import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { Avatar, Button, Modal } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageViewer from "react-native-image-zoom-viewer";
import { Portal } from "react-native-paper";
import PostMenu from "./PostMenu";
import { getTimeAgo } from "../utils/formatTimeAgo";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const PostCard = ({ post, currentUser, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [isGoing, setIsGoing] = useState(false);

  useEffect(() => {
    if (post.eventDetails && currentUser) {
      // Convert IDs to strings
      const interestedIds = post.eventDetails.interested?.map(String);
      const currentUserId = String(currentUser?._id);

      const isUserInterested = interestedIds?.some(
        (id) => id === currentUserId
      );

      setIsInterested(isUserInterested);
      setIsGoing(
        post.eventDetails.going?.map(String)?.some((id) => id === currentUserId)
      );
    }
  }, [post.eventDetails, currentUser]);

  const onImagePress = (images, index) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleInterested = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }
      console.log(post);
      console.log("postid: ", post.postId);
      const response = await apiClient.post(
        `/posts/${post.postId}/event/interested`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsInterested(true);
      }
    } catch (error) {
      console.error("Failed to mark interest:", error);
    }
  };

  const handleGoing = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }
      const response = await apiClient.post(
        `/posts/${post.postId}/event/going`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);

      if (response.data.success) {
        setIsGoing(true);
      }
    } catch (error) {
      console.error("Failed to mark going:", error);
    }
  };

  const renderContent = () => {
    if (!post.content) return null;

    const content = post.content;
    const contentLength = 93; // Set a fixed length for content to be displayed initially

    if (expanded) {
      return (
        <Text style={styles.postContent}>
          {content}{" "}
          {content.length > contentLength && (
            <Text style={styles.moreText} onPress={() => setExpanded(false)}>
              ...less
            </Text>
          )}
        </Text>
      );
    } else {
      return (
        <Text style={styles.postContent}>
          {content.length > contentLength ? (
            <>
              {content.slice(0, contentLength)}{" "}
              <Text style={styles.moreText} onPress={() => setExpanded(true)}>
                ...more
              </Text>
            </>
          ) : (
            content
          )}
        </Text>
      );
    }
  };

  const renderImageGrid = () => {
    const imageCount = post.images.length;

    if (imageCount === 1) {
      return (
        <TouchableOpacity onPress={() => onImagePress(post.images, 0)}>
          <Image source={{ uri: post.images[0] }} style={styles.singleImage} />
        </TouchableOpacity>
      );
    } else if (imageCount === 2) {
      return (
        <View style={styles.imageRow}>
          {post.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onImagePress(post.images, index)}
            >
              <Image source={{ uri: image }} style={styles.doubleImage} />
            </TouchableOpacity>
          ))}
        </View>
      );
    } else if (imageCount === 3) {
      return (
        <View>
          <TouchableOpacity
            onPress={() => onImagePress(post.images, 0)}
            style={styles.topImageContainer}
          >
            <Image source={{ uri: post.images[0] }} style={styles.topImage} />
          </TouchableOpacity>
          <View style={styles.imageRow}>
            {post.images.slice(1).map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onImagePress(post.images, index + 1)}
              >
                <Image source={{ uri: image }} style={styles.bottomImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else {
      return (
        <View>
          <View style={styles.imageRow}>
            {post.images.slice(0, 2).map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onImagePress(post.images, index)}
              >
                <Image source={{ uri: image }} style={styles.doubleImage} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.imageRow}>
            {post.images.slice(2, 4).map((image, index) => (
              <TouchableOpacity
                key={index + 2}
                onPress={() => onImagePress(post.images, index + 2)}
              >
                <View style={styles.overlayContainer}>
                  <Image source={{ uri: image }} style={styles.doubleImage} />
                  {index === 1 && imageCount > 4 && (
                    <View style={[styles.overlay, styles.doubleImage]}>
                      <Text style={styles.overlayText}>+{imageCount - 4}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
  };

  const postTime = getTimeAgo(post.postTime);
  return (
    <View>
      {/* Modal for Viewing Images */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onClose}
          contentContainerStyle={styles.modal}
        >
          <ImageViewer
            imageUrls={post.images.map((image) => ({ url: image }))}
            index={currentIndex}
            enableSwipeDown
            onCancel={onClose}
          />
        </Modal>
      </Portal>

      <View style={styles.cardContainer}>
        {/* Author Information */}
        <View style={styles.userInfo}>
          {post.authorProfile ? (
            <Avatar.Image size={40} source={{ uri: post.authorProfile }} />
          ) : (
            <Avatar.Text
              size={40}
              label={post.authorName.slice(0, 2).toUpperCase()}
            />
          )}
          <View style={styles.userInfoText}>
            <Text style={styles.userName}>{post.authorName}</Text>
            <Text style={styles.postTime}>{postTime}</Text>
          </View>
        </View>

        <PostMenu
          isUserPost={post.isUser && post.authorId === currentUser?.id}
          onEdit={() => console.log("Edit post")}
          onDelete={() => onDelete(post.postId)} // Use onDelete prop to delete post
        />

        {/* Post Content */}
        {renderContent()}

        {/* Post Images */}
        {post.images && post.images.length > 0 && renderImageGrid()}

        {/* Event Interaction Buttons */}
        {post.isEvent && (
          <View style={styles.eventActionsContainer}>
            <Button
              mode="contained"
              compact
              icon={() => <Icon name="account-heart" size={20} color="#fff" />} // Changed icon and color
              onPress={handleInterested}
              disabled={isInterested}
              style={[
                styles.interestedButton,
                isInterested && styles.disabledButton,
              ]}
              labelStyle={{ color: "#fff", fontWeight: "bold" }}
            >
              {isInterested ? "Interested" : "Mark Interested"}
            </Button>
            <Button
              mode="outlined" // Use 'outlined' mode to make it different
              compact
              icon={() => (
                <Icon name="account-check" size={20} color="#1b8283" />
              )}
              onPress={handleGoing}
              disabled={isGoing}
              style={styles.goingButton}
              labelStyle={
                isGoing
                  ? { color: "#6e6e6e", fontWeight: "bold" }
                  : { color: "#1b8283", fontWeight: "bold" }
              }
            >
              {isGoing ? "Going" : "Mark Going"}
            </Button>
          </View>
        )}

        {/* Common Interaction Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            mode="text"
            compact
            icon={() => <Icon name="thumb-up-outline" size={20} />}
          >
            Like
          </Button>
          <Button
            mode="text"
            compact
            icon={() => <Icon name="comment-outline" size={20} />}
          >
            Comment
          </Button>
          <Button
            mode="text"
            compact
            icon={() => <Icon name="share-outline" size={20} />}
          >
            Share
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: 0,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfoText: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postTime: {
    color: "#6e6e6e",
    fontSize: 12,
  },
  postContent: {
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },
  moreText: {
    color: "#1b8283",
    fontWeight: "bold",
  },
  imageRow: {
    flexDirection: "row",
  },
  singleImage: {
    width: width - 30,
    height: 300,
    borderRadius: 10,
  },
  doubleImage: {
    width: (width - 40) / 2,
    height: 150,
    margin: 5,
    borderRadius: 10,
  },
  topImageContainer: {
    marginBottom: 5,
  },
  topImage: {
    width: width - 30,
    height: 200,
    borderRadius: 10,
  },
  bottomImage: {
    width: (width - 40) / 2,
    height: 150,
    margin: 5,
    borderRadius: 10,
  },
  overlayContainer: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  overlayText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  eventActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  interestedButton: {
    backgroundColor: "#1b8283",
    marginRight: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  goingButton: {
    borderColor: "#1b8283",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#6e6e6e",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
  },
});

export default PostCard;
