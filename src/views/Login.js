import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Dimensions, BackHandler } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import apiClient from "../api/apiClient";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Loader from "../components/Loader";

const { width, height } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Validation schema for the form
  const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Check if the user is already logged in
  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("authToken");
          if (token) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            }); // Navigate to Home and reset stack
          }
        } catch (error) {
          console.error("Failed to fetch token:", error);
        } finally {
          setLoading(false);
        }
      };

      checkToken();
    }, [])
  );

  useEffect(() => {
    const backAction = () => {
      // If loading or user is logged in, exit the app
      if (loading) {
        return true; // Prevent back action during loading
      }

      AsyncStorage.getItem("authToken").then((token) => {
        if (token) {
          BackHandler.exitApp(); // Close the app if token exists
        }
      });

      return false; // Allow back action for login page if not logged in
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [loading]);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/user/login", {
        email: values.email,
        password: values.password,
      });
      if (response.status === 200) {
        // Save token and user details to AsyncStorage
        const { token, result } = response.data;

        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userDetails", JSON.stringify(result));

        // Show success message
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Welcome back!",
        });

        // Navigate to Home screen after successful login
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        }); // Navigate to Home and reset stack
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error.response?.data?.message ||
          "Something went wrong, please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Loader */}
      <Loader visible={loading} />

      {!loading && (
        <>
          {/* Curved Background */}
          <View style={styles.curvedBackground}></View>

          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <TextInput
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  theme={{ colors: { primary: "#1b8283" } }} // Use primary color
                  error={touched.email && errors.email}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  label="Password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  mode="outlined"
                  theme={{ colors: { primary: "#1b8283" } }} // Use primary color
                  error={touched.password && errors.password}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  contentStyle={{ paddingVertical: 8 }}
                  buttonColor="#1b8283" // Use primary color for consistency
                >
                  Sign In
                </Button>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Text
                    style={styles.signupLink}
                    onPress={() => navigation.navigate("Register")}
                  >
                    Sign Up
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7", // Soft background color
  },
  curvedBackground: {
    position: "absolute",
    top: 0,
    width: width,
    height: height * 0.4,
    backgroundColor: "#1b8283", // Use primary color for curved background
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  logoBackground: {
    backgroundColor: "#ffffff",
    borderRadius: 100,
    padding: 20,
    elevation: 5, // Add shadow for logo background
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    paddingHorizontal: 20,
    paddingVertical: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#ffffff",
    elevation: 10, // Shadow for form container
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#f8f9fa", // Light background for input fields
  },
  button: {
    marginTop: 16,
    borderRadius: 30, // Rounded button style
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: "#35404c", // Use dark color for "Don't have an account?" text
  },
  signupLink: {
    fontSize: 14,
    color: "#1b8283", // Highlighted color for "Sign Up"
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff4c4c", // Use a clear error color for validation messages
    fontSize: 12,
    marginBottom: 8,
  },
});

export default Login;
