import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

const FriendList = ({ friends, userId }) => {
  const navigation = useNavigation();

  return (
    <View>
      {friends.map((friend) => (
        <View key={friend.id}>
          <Text>{friend.name}</Text>
          <Button
            title="Chat"
            onPress={() =>
              navigation.navigate("Chat", { userId, friendId: friend.id })
            }
          />
        </View>
      ))}
    </View>
  );
};

export default FriendList;
