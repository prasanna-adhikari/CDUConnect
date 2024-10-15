import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Avatar, Divider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { getImageUrl } from "../api/utils"; // Assuming you have a utility to generate the full image URL

const CustomMenu = () => {
  const [userImage, setUserImage] = useState(null); // Store the current user's profile image
  const [initials, setInitials] = useState(""); // Store user initials
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch user details from AsyncStorage
    const fetchUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem("userDetails");
        if (userDetails) {
          const parsedUser = JSON.parse(userDetails);
          const profileImageUrl = getImageUrl(parsedUser.profileImage);
          setUserImage(profileImageUrl); // Set the user's profile image

          // Extract initials from the user's name
          if (parsedUser.name) {
            const nameParts = parsedUser.name.trim().split(" ");
            if (nameParts.length > 1) {
              setInitials(`${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase());
            } else {
              setInitials(nameParts[0][0].toUpperCase()); // If only one name part, use just the first letter
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userDetails");
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have been successfully logged out.",
      });
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "An error occurred while logging out. Please try again.",
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <View style={styles.profileCard}>
          {userImage ? (
            <Avatar.Image size={50} source={{ uri: userImage }} />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.profileText}>Your Profile</Text>
        </View>
      </TouchableOpacity>

      {/* Shortcuts Section */}
      <Text style={styles.sectionTitle}>Your Shortcuts</Text>
      <View style={styles.shortcutsContainer}>
        {/* Clubs Shortcut */}
        <TouchableOpacity style={styles.shortcutItem}>
          <Icon name="flag" size={30} color="#1b8283" />
          <Text style={styles.shortcutText}>Clubs</Text>
        </TouchableOpacity>

        {/* Friends Shortcut */}
        <TouchableOpacity style={styles.shortcutItem}>
          <Icon name="account-group-outline" size={30} color="#1b8283" />
          <Text style={styles.shortcutText}>Friends</Text>
        </TouchableOpacity>

        {/* Feeds Shortcut */}
        <TouchableOpacity style={styles.shortcutItem}>
          <Icon name="rss" size={30} color="#1b8283" />
          <Text style={styles.shortcutText}>Feeds</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Divider style={styles.divider} />

      {/* Other Options */}
      <TouchableOpacity style={styles.optionItem}>
        <Icon name="lock-outline" size={26} color="#0d2e3f" />
        <Text style={styles.optionText}>Privacy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
        <Icon name="logout" size={26} color="#0d2e3f" />
        <Text style={styles.optionText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// StyleSheet for CustomMenu
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f0f4f7",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 20,
    elevation: 3,
  },
  profileText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d2e3f",
  },
  initialsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1b8283",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d2e3f",
    marginBottom: 10,
  },
  shortcutsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shortcutItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  shortcutText: {
    marginTop: 5,
    color: "#0d2e3f",
    fontWeight: "600",
  },
  divider: {
    marginVertical: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#0d2e3f",
  },
});

export default CustomMenu;
