import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const NavigationBar = ({ activePage, onNavigate }) => {
  return (
    <View style={styles.navigationBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Home")}
      >
        <Icon
          name={activePage === "Home" ? "home" : "home-outline"}
          size={30}
          color={activePage === "Home" ? "#1b8283" : "#0d2e3f"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Friends")}
      >
        <Icon
          name={
            activePage === "Friends" ? "account-group" : "account-group-outline"
          }
          size={30}
          color={activePage === "Friends" ? "#1b8283" : "#0d2e3f"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Clubs")}
      >
        <Icon
          name={activePage === "Clubs" ? "flag" : "flag-outline"}
          size={30}
          color={activePage === "Clubs" ? "#1b8283" : "#0d2e3f"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Notifications")}
      >
        <Icon
          name={activePage === "Notifications" ? "bell" : "bell-outline"}
          size={30}
          color={activePage === "Notifications" ? "#1b8283" : "#0d2e3f"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Menu")}
      >
        <Icon
          name={activePage === "Menu" ? "menu" : "menu"}
          size={30}
          color={activePage === "Menu" ? "#1b8283" : "#0d2e3f"}
        />
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Chat", { userId, friendId })}
      >
        <Icon
          name={activePage === "Chat" ? "chat" : "chat-outline"}
          size={30}
          color={activePage === "Chat" ? "#1b8283" : "#0d2e3f"}
        />
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  navItem: {
    alignItems: "center",
  },
});

export default NavigationBar;
