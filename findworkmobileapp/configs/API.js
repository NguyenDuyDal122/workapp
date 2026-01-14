import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const endpoints = {
    nganhnghe: "/nganhnghe/",
    currentUser: "/nguoidung/me",
    login: "/o/token/",
    soSanhCongViec: "/sosanh/",
    tintuyendung: "/tintuyendung/",
    tintuyendungDetail: (id) => `/tintuyendung/${id}/`,
    nhaTuyenDung: "/nhatuyendung/",
    nhaTuyenDungDetail: (id) => `/nhatuyendung/${id}/`,
    duyetNhaTuyenDung: (id) => `/nhatuyendung/${id}/duyet/`,
    hoSoUngTuyen: "/hoso/",
    danhGiaHoSo: (id) => `/hoso/${id}/danh_gia/`,
    thongKeHoSo: "/hoso/thong_ke/",
    ungVien: "/ungvien/",
};

const API = axios.create({
    baseURL: "https://DuyDal12.pythonanywhere.com"
});

API.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
        }
        return config;
    },
    error => Promise.reject(error)
);


export default API;
