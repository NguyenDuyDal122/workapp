import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const endpoints = {
    nganhnghe: "/nganhnghe/",
    currentUser: "/nguoidung/me"
};

const API = axios.create({
    baseURL: "https://DuyDal12.pythonanywhere.com"
});

API.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
