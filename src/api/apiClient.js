import axios from "axios";
import Config from "react-native-config";

// Fetch the base URL from the environment variables or set a default
const baseURL = Config.API_BASE_URL || "http://192.168.86.68:7000/api";

// Log the base URL for debugging purposes
console.log(`API Base URL: ${baseURL}`);

// Create an Axios instance for JSON requests
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a separate Axios instance for form data requests
const apiClientFormData = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export { apiClient, apiClientFormData };
