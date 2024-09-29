import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import Post from "../components/Post";

const Home = () => {
  const [activePage, setActivePage] = useState("Home");

  const handleNavigate = (page) => {
    setActivePage(page);
    // Navigate to the selected page (assuming you add navigation logic)
    // For now, we are just updating the activePage state to change the UI
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Navigation Bar */}
      <NavigationBar activePage={activePage} onNavigate={handleNavigate} />

      {/* Posts Section */}
      {activePage === "Home" && (
        <ScrollView style={styles.postsContainer}>
          {[...Array(5)].map((_, index) => (
            <Post
              key={index}
              userName="User Name"
              postTime="2 hours ago"
              postContent="This is a post content. You can see posts here."
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  postsContainer: {
    paddingHorizontal: 10,
  },
});

export default Home;
