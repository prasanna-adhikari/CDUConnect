import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

const ClubDetail = ({ route }) => {
  const { clubId } = route.params;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await apiClient.get(`/clubs/${clubId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setClub(response.data.club);
        }
      } catch (error) {
        console.error("Failed to fetch club details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {club ? (
        <>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.clubDescription}>{club.description}</Text>
        </>
      ) : (
        <Text>Club not found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  clubName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clubDescription: {
    fontSize: 18,
    color: "#666",
  },
});

export default ClubDetail;
