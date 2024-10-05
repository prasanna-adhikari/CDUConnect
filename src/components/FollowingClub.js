import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getImageUrl } from "../api/utils";

const FollowingClubs = ({ clubs, navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Following Clubs</Text>
    {clubs.length > 0 ? (
      clubs.map((club) => (
        <TouchableOpacity
          key={club._id}
          style={styles.clubItem}
          onPress={() =>
            navigation.navigate("ClubDetail", { clubId: club._id })
          }
        >
          <Image
            source={{ uri: getImageUrl(club.clubImage) }}
            style={styles.clubImage}
          />
          <Text style={styles.clubName}>{club.name}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <Text>No clubs followed.</Text>
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
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  clubImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  clubName: {
    fontSize: 16,
    color: "#333",
  },
});

export default FollowingClubs;
