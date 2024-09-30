import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Avatar } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ImagePickerComponent = ({ onImageSelect }) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImages([...selectedImages, ...result.selected]);
      onImageSelect([...selectedImages, ...result.selected]);
    }
  };

  return (
    <View style={styles.imagePickerContainer}>
      {selectedImages.length > 0 ? (
        selectedImages.map((image, index) => (
          <Avatar.Image
            key={index}
            size={50}
            source={{ uri: image.uri }}
            style={styles.selectedImage}
          />
        ))
      ) : (
        <TouchableOpacity onPress={pickImage} style={styles.addButton}>
          <Icon name="camera-plus" size={30} color="#1b8283" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imagePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#1b8283",
    borderRadius: 10,
  },
  selectedImage: {
    marginRight: 10,
  },
});

export default ImagePickerComponent;
