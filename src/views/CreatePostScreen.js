import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import axios from "axios";
import apiClient from "../api/apiClient";
import { getImageUrl } from "../api/utils";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#1b8283";

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem("userDetails");
        if (userDetails) {
          setUser(JSON.parse(userDetails));
        }
      } catch (error) {
        console.error("Failed to load user details:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserDetails();
  }, []);

  const handleSelectMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia((prevMedia) => [...prevMedia, ...result.assets].slice(0, 10));
    }
  };

  const removeMedia = (index) => {
    setMedia((prevMedia) => prevMedia.filter((_, i) => i !== index));
  };

  const handleSubmitPost = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("content", content);
      media.forEach((item, index) => {
        let localUri = item.uri;
        let filename = localUri.split("/").pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : "image";

        formData.append("media", {
          uri: localUri,
          name: filename,
          type,
        });
      });

      const response = await apiClient.post(
        `/user/${user._id}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Toast.show("Post created successfully!", {
          duration: Toast.durations.SHORT,
        });
        navigation.goBack();
      } else {
        Toast.show("Failed to create post. Please try again.", {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      Toast.show("Network Error. Please try again.", {
        duration: Toast.durations.SHORT,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handleSubmitPost}>
          <Text style={[styles.headerText, styles.postText]}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userInfo}>
          {user && (
            <>
              <Image
                source={{
                  uri:
                    getImageUrl(user.profileImage) ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.userImage}
              />
              <Text style={styles.userName}>{user.name}</Text>
            </>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#aaa"
            multiline
            value={content}
            onChangeText={setContent}
          />
        </View>

        {media.length > 0 && (
          <View style={styles.mediaPreviewContainer}>
            {media.map((item, index) => (
              <View key={index} style={styles.mediaContainer}>
                <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMedia(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addMediaButton}
          onPress={handleSelectMedia}
        >
          <Text style={styles.addMediaButtonText}>Add Photos/Videos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backText: {
    color: PRIMARY_COLOR,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  postText: {
    color: PRIMARY_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginBottom: 15,
  },
  contentInput: {
    fontSize: 18,
    color: "#333",
    textAlignVertical: "top",
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  mediaContainer: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  mediaPreview: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff3b30",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  addMediaButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  addMediaButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreatePostScreen;
