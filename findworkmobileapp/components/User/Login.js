import { useState } from "react";
import {
    View,
    Text,
    Button,
    TextInput,
    Alert,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://DuyDal12.pythonanywhere.com";

export default function Login({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {
        if (!username || !password) {
            Alert.alert("Lỗi", "Nhập đầy đủ username và password");
            return;
        }

        setLoading(true);

        try {
            const form = new URLSearchParams();
            form.append("grant_type", "password");
            form.append("username", username);
            form.append("password", password);
            form.append("client_id", "rG2C5ux3E2KMjWtF6J0M9EfUX0UzrNEXYjlNG1fV");
            form.append("client_secret", "pstZuzlEEr50f3qYQk3gE2CpPnEI1ekPmIiqBMmN6nLnEd3jzR2cg5lsasWthvS5kiNt54pXwV7rhu3N7hAFffws7KvbBNB336qxTEi5tkcpuo9M5YIjyQQVevLGzFvD");

            const res = await axios.post(
                `${BASE_URL}/o/token/`,
                form.toString(),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const token = res.data.access_token;
            await AsyncStorage.setItem("access_token", token);

            const userRes = await axios.get(`${BASE_URL}/nguoidung/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("User info:", userRes.data);
            const role = userRes.data.vai_tro?.toLowerCase();

            if (role === "admin") {
                navigation.replace("AdminHome");
            } else {
                navigation.replace("Home");
            }

        } catch (err) {
            console.log("Login error:", err.response?.data || err.message);

            const data = err.response?.data;

            if (data?.error === "invalid_grant") {
                Alert.alert("Đăng nhập thất bại", "Sai username hoặc password");
            } else if (data?.error === "invalid_client") {
                Alert.alert("Lỗi hệ thống", "Client OAuth không hợp lệ");
            } else {
                Alert.alert("Lỗi", "Không kết nối được server");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 20 }}>ĐĂNG NHẬP</Text>

            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={{ borderWidth: 1, marginBottom: 12, padding: 10 }}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
            />

            <Button
                title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
                onPress={login}
                disabled={loading}
            />

            {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 10 }} />}

            <TouchableOpacity
                style={{ marginTop: 20, alignItems: "center" }}
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={{ color: "blue" }}>Chưa có tài khoản? Đăng ký</Text>
            </TouchableOpacity>
        </View>
    );
}