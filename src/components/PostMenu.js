import React, { useState } from "react";
import { Menu, IconButton } from "react-native-paper";
import { View } from "react-native";

const PostMenu = ({ onEdit, onDelete, isUserPost }) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={{ position: "absolute", top: 10, right: 10 }}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton icon="dots-horizontal" size={24} onPress={openMenu} />
        }
      >
        {isUserPost && (
          <>
            <Menu.Item onPress={onEdit} title="Edit" />
            <Menu.Item onPress={onDelete} title="Delete" />
          </>
        )}
      </Menu>
    </View>
  );
};

export default PostMenu;
