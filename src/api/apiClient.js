import axios from "axios";
import Config from "react-native-config";
const url = "192.168.86.68";
const test = Config.API_BASE_URL;
console.log(test);

const apiClient = axios.create({
  baseURL: `http://${url}:7000/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiClientFormData = axios.create({
  baseURL: `http://${url}:7000/api`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default apiClient;
