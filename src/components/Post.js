import React from "react";
import { StyleSheet } from "react-native";
import { Card, Avatar, Button, Text } from "react-native-paper";

const Post = ({ userName, postTime, postContent }) => {
  return (
    <Card style={styles.postCard}>
      <Card.Title
        title={userName}
        subtitle={postTime}
        left={(props) => (
          <Avatar.Image
            {...props}
            size={40}
            source={{ uri: "https://placekitten.com/200/200" }}
          />
        )}
      />
      <Card.Content>
        <Text>{postContent}</Text>
      </Card.Content>
      <Card.Actions>
        <Button icon="thumb-up-outline" onPress={() => {}}>
          Like
        </Button>
        <Button icon="comment-outline" onPress={() => {}}>
          Comment
        </Button>
        <Button icon="share-outline" onPress={() => {}}>
          Share
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  postCard: {
    marginBottom: 10,
  },
});

export default Post;
