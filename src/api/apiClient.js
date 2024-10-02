import axios from "axios";

// const ipaddress =
const apiClient = axios.create({
  baseURL: "http://192.168.0.22:7000/api", // Replace with backend API URL
  // baseURL: "http://192.168.86.59:7000/api", // Replace with backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

const apiClientFormData = axios.create({
  baseURL: "http://192.168.0.22:7000/api", // Replace with backend API URL
  // baseURL: "http://192.168.86.59:7000/api", // Replace with backend API URL
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default apiClient;
