import { useState, useEffect } from "react";
import {
    View, Text, TextInput, Button, Alert, Image, ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const BASE_URL = "https://DuyDal12.pythonanywhere.com";

export default function RegisterNhaTuyenDung({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState(null);

    const [tenCongTy, setTenCongTy] = useState("");
    const [maSoThue, setMaSoThue] = useState("");
    const [linhVuc, setLinhVuc] = useState("");
    const [quyMo, setQuyMo] = useState("");
    const [moTa, setMoTa] = useState("");
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        ImagePicker.requestMediaLibraryPermissionsAsync();
    }, []);

    const pickImage = async (setFunc) => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7
        });
        if (!res.canceled) setFunc(res.assets[0]);
    };

    const register = async () => {
        try {
            const userForm = new FormData();
            userForm.append("username", username);
            userForm.append("password", password);
            userForm.append("email", email);
            userForm.append("vai_tro", "nha_tuyen_dung");

            if (avatar) {
                userForm.append("avatar", {
                    uri: avatar.uri,
                    name: "avatar.jpg",
                    type: "image/jpeg"
                });
            }

            await axios.post(`${BASE_URL}/register/`, userForm, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const tokenRes = await axios.post(
                `${BASE_URL}/o/token/`,
                new URLSearchParams({
                    grant_type: "password",
                    username,
                    password,
                    client_id: "rG2C5ux3E2KMjWtF6J0M9EfUX0UzrNEXYjlNG1fV",
                    client_secret: "pstZuzlEEr50f3qYQk3gE2CpPnEI1ekPmIiqBMmN6nLnEd3jzR2cg5lsasWthvS5kiNt54pXwV7rhu3N7hAFffws7KvbBNB336qxTEi5tkcpuo9M5YIjyQQVevLGzFvD"
                }).toString(),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const token = tokenRes.data.access_token;

            const ntForm = new FormData();
            ntForm.append("ten_cong_ty", tenCongTy);
            ntForm.append("ma_so_thue", maSoThue);
            ntForm.append("linh_vuc", linhVuc);
            ntForm.append("quy_mo", quyMo);
            ntForm.append("mo_ta", moTa);

            if (logo) {
                ntForm.append("logo", {
                    uri: logo.uri,
                    name: "logo.jpg",
                    type: "image/jpeg"
                });
            }

            await axios.post(`${BASE_URL}/nhatuyendung/`, ntForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            Alert.alert("Thành công", "Chờ admin duyệt");
            navigation.replace("Login");

        } catch (err) {
            console.log(err.response?.data);
            Alert.alert("Lỗi", "Không đăng ký được");
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 22 }}>Đăng ký Nhà tuyển dụng</Text>

            <TextInput placeholder="Username" onChangeText={setUsername} />
            <TextInput placeholder="Email" onChangeText={setEmail} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

            <Button title="Chọn avatar" onPress={() => pickImage(setAvatar)} />
            {avatar && <Image source={{ uri: avatar.uri }} style={{ width: 80, height: 80 }} />}

            <TextInput placeholder="Tên công ty" onChangeText={setTenCongTy} />
            <TextInput placeholder="Mã số thuế" onChangeText={setMaSoThue} />
            <TextInput placeholder="Lĩnh vực" onChangeText={setLinhVuc} />
            <TextInput placeholder="Quy mô" onChangeText={setQuyMo} />
            <TextInput placeholder="Mô tả" multiline onChangeText={setMoTa} />

            <Button title="Chọn logo công ty" onPress={() => pickImage(setLogo)} />
            {logo && <Image source={{ uri: logo.uri }} style={{ width: 120, height: 120 }} />}

            <Button title="Đăng ký" onPress={register} />
        </ScrollView>
    );
}
