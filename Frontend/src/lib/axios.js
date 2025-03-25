import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "https://ecommerce-app-production-45fd.up.railway.app/api",
  withCredentials: true,
});