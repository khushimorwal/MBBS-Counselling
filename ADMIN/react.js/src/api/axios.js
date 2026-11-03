import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:3000",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
     console.log("Token in API:", !!token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

