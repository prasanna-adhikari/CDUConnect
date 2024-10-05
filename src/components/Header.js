import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const Header = () => {
  const navigation = useNavigation();

  return (
    <Appbar.Header style={styles.header}>
      <Avatar.Image
        size={40}
        source={require("../assets/logo1.png")}
        style={styles.logo}
      />
      <View style={styles.headerIcons}>
        <Icon
          name="magnify"
          size={26}
          color="#0d2e3f"
          style={styles.icon}
          onPress={() => navigation.navigate("SearchScreen")}
        />
        <Icon name="chat" size={26} color="#0d2e3f" style={styles.icon} />
      </View>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  logo: {
    backgroundColor: "transparent",
  },
  headerIcons: {
    flexDirection: "row",
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default Header;
