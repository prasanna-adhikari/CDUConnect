import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import apiClient from "../api/apiClient";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

const Register = ({ navigation }) => {
  // Validation schema for the form
  const registerValidationSchema = Yup.object().shape({
    studentId: Yup.string().required("Student ID is required"),
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Please enter a valid email")
      .matches(
        /@students\.cdu\.edu\.au$|@cdu\.edu\.au$/,
        "Email must be a CDU email address (e.g., @students.cdu.edu.au or @cdu.edu.au)"
      )
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    role: Yup.string().required("Role is required"),
  });

  const handleRegister = async (values) => {
    const formData = {
      studentId: values.studentId,
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
      verified: "true",
    };

    try {
      const response = await apiClient.post("/user/register", formData);

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: "You can now log in",
        });

        // Navigate to Login screen after successful registration
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Registration failed:", error.response?.data);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2:
          error.response?.data?.message ||
          "Something went wrong, please try again.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.curvedBackground}></View>

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
        initialValues={{
          studentId: "",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student",
        }}
        validationSchema={registerValidationSchema}
        onSubmit={handleRegister}
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
              label="Student ID"
              value={values.studentId}
              onChangeText={handleChange("studentId")}
              onBlur={handleBlur("studentId")}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: "#1b8283" } }}
              error={touched.studentId && errors.studentId}
            />
            {touched.studentId && errors.studentId && (
              <Text style={styles.errorText}>{errors.studentId}</Text>
            )}

            <TextInput
              label="Name"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: "#1b8283" } }}
              error={touched.name && errors.name}
            />
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <TextInput
              label="Email"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              theme={{ colors: { primary: "#1b8283" } }}
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
              theme={{ colors: { primary: "#1b8283" } }}
              error={touched.password && errors.password}
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TextInput
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              mode="outlined"
              theme={{ colors: { primary: "#1b8283" } }}
              error={touched.confirmPassword && errors.confirmPassword}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              contentStyle={{ paddingVertical: 8 }}
              buttonColor="#1b8283"
            >
              Sign Up
            </Button>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                Log In
              </Text>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  curvedBackground: {
    position: "absolute",
    top: 0,
    width: width,
    height: height * 0.4,
    backgroundColor: "#1b8283",
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
    elevation: 5,
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
    paddingVertical: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#ffffff",
    elevation: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
  },
  button: {
    marginTop: 16,
    borderRadius: 30,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#35404c",
  },
  loginLink: {
    fontSize: 14,
    color: "#1b8283",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff4c4c",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default Register;
