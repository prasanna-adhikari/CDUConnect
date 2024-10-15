import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../api/apiClient";

const PRIMARY_COLOR = "#1b8283"; // Consistent color for the header and buttons
const url = "192.168.86.68"; // Your IP address

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, friendId, friendName, friendImage } = route.params;
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await apiClient.get(`/chat/${friendId}`, { headers });
        setChatHistory(response.data.messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();

    const newSocket = io(`http://${url}:7000`, { query: { userId } });
    setSocket(newSocket);
    newSocket.emit("joinRoom", { userId, friendId });

    newSocket.on("newMessage", (newMessage) => {
      setChatHistory((prevMessages) => [...prevMessages, newMessage]);
    });

    newSocket.on("typing", () => {
      setTyping(true);
    });

    newSocket.on("stopTyping", () => {
      setTyping(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, friendId]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit("sendMessage", {
        sender: userId,
        recipient: friendId,
        message,
      });
      setMessage("");
      socket.emit("stopTyping", { userId, friendId });
    }
  };

  const handleTyping = (text) => {
    setMessage(text);
    if (socket) {
      socket.emit("typing", { userId, friendId });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("stopTyping", { userId, friendId });
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#0d2e3f" />
        </TouchableOpacity>
        <Image source={{ uri: friendImage }} style={styles.friendImage} />
        <Text style={styles.headerTitle}>{friendName}</Text>
      </View>

      {/* Chat messages */}
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={
              item.sender === userId
                ? styles.myMessageContainer
                : styles.friendMessageContainer
            }
          >
            <View
              style={
                item.sender === userId ? styles.myMessage : styles.friendMessage
              }
            >
              <Text
                style={
                  item.sender === userId
                    ? styles.sentMessageText
                    : styles.receivedMessageText
                }
              >
                {item.message}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Typing Indicator */}
      {typing && (
        <Text style={styles.typingIndicator}>Your friend is typing...</Text>
      )}

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={handleTyping}
          placeholder="Type a message"
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet for ChatScreen
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
    elevation: 3,
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0d2e3f",
    marginLeft: 10,
    flex: 1,
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    marginVertical: 5,
    flexDirection: "row-reverse",
  },
  friendMessageContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    marginVertical: 5,
    flexDirection: "row",
  },
  myMessage: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 20,
    maxWidth: "75%",
  },
  friendMessage: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 20,
    maxWidth: "75%",
  },
  sentMessageText: {
    color: "#fff",
  },
  receivedMessageText: {
    color: "#333",
  },
  typingIndicator: {
    color: "#999",
    fontStyle: "italic",
    marginVertical: 5,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  sendButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 50,
  },
});

export default ChatScreen;
