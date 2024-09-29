import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://192.168.86.59:7000/api", // Replace with your backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
