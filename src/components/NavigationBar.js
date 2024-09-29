import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
        <Text
          style={
            activePage === "Home" ? styles.activeText : styles.inactiveText
          }
        >
          Home
        </Text>
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
        <Text
          style={
            activePage === "Friends" ? styles.activeText : styles.inactiveText
          }
        >
          Friends
        </Text>
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
        <Text
          style={
            activePage === "Notifications"
              ? styles.activeText
              : styles.inactiveText
          }
        >
          Notifications
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate("Menu")}
      >
        <Icon
          name="menu" // Use "menu" for both active and inactive, but change color
          size={30}
          color={activePage === "Menu" ? "#1b8283" : "#0d2e3f"}
        />
        <Text
          style={
            activePage === "Menu" ? styles.activeText : styles.inactiveText
          }
        >
          Menu
        </Text>
      </TouchableOpacity>
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
  activeText: {
    color: "#1b8283",
  },
  inactiveText: {
    color: "#0d2e3f",
  },
});

export default NavigationBar;
