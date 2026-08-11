import axios from "axios";
import { Platform } from "react-native";

// Web uses localhost (instant & 100% reliable on web browser)
// Mobile native devices (iOS/Android) use LAN IP 172.20.10.7
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3008"
    : "http://172.20.10.7:3008";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;