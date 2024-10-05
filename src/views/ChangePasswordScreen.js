import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import { Button } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import * as yup from "yup";

const PRIMARY_COLOR = "#1b8283";

// Define the validation schema using yup
const validationSchema = yup.object().shape({
  currentPassword: yup.string().required("Current Password is required"),
  newPassword: yup
    .string()
    .required("New Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm New Password is required"),
});

const ChangePasswordScreen = ({ navigation }) => {
  const handleChangePassword = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.post(
        "/user/change-password",
        {
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password changed successfully.",
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Change Password",
          text2:
            response.data.message || "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>
      <View style={styles.formContainer}>
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          }}
          validationSchema={validationSchema}
          validateOnChange={true} // Validate as user types
          validateOnBlur={true} // Validate when user leaves input
          onSubmit={(values, { setSubmitting }) =>
            handleChangePassword(values, { setSubmitting })
          }
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldTouched,
            isSubmitting,
          }) => (
            <>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.currentPassword && errors.currentPassword
                    ? styles.inputError
                    : null,
                ]}
                secureTextEntry
                value={values.currentPassword}
                onChangeText={(text) => {
                  handleChange("currentPassword")(text);
                  setFieldTouched("currentPassword", true, false);
                }}
                onBlur={handleBlur("currentPassword")}
              />
              {touched.currentPassword && errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.newPassword && errors.newPassword
                    ? styles.inputError
                    : null,
                ]}
                secureTextEntry
                value={values.newPassword}
                onChangeText={(text) => {
                  handleChange("newPassword")(text);
                  setFieldTouched("newPassword", true, false);
                }}
                onBlur={handleBlur("newPassword")}
              />
              {touched.newPassword && errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={[
                  styles.input,
                  touched.confirmNewPassword && errors.confirmNewPassword
                    ? styles.inputError
                    : null,
                ]}
                secureTextEntry
                value={values.confirmNewPassword}
                onChangeText={(text) => {
                  handleChange("confirmNewPassword")(text);
                  setFieldTouched("confirmNewPassword", true, false);
                }}
                onBlur={handleBlur("confirmNewPassword")}
              />
              {touched.confirmNewPassword && errors.confirmNewPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmNewPassword}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={styles.button}
                buttonColor={PRIMARY_COLOR}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  "Change Password"
                )}
              </Button>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    elevation: 3,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginLeft: 10,
    flex: 1,
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  },
});

export default ChangePasswordScreen;
