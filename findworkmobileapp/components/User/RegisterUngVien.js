import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const BASE_URL = "https://DuyDal12.pythonanywhere.com";

export default function RegisterUngVien({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const [hoTen, setHoTen] = useState("");
    const [ngaySinh, setNgaySinh] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [gioiTinh, setGioiTinh] = useState("nam");
    const [trinhDo, setTrinhDo] = useState("");
    const [kinhNghiem, setKinhNghiem] = useState("");

    const [avatar, setAvatar] = useState(null);
    const [cv, setCv] = useState(null);

    useEffect(() => {
        ImagePicker.requestMediaLibraryPermissionsAsync();
    }, []);

    const pickAvatar = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7
        });
        if (!res.canceled) setAvatar(res.assets[0]);
    };

    const pickCV = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7
        });
        if (!res.canceled) setCv(res.assets[0]);
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setNgaySinh(selectedDate);
    };

    const register = async () => {
        if (!username || !password || !hoTen || !ngaySinh || !trinhDo || !kinhNghiem) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            const userForm = new FormData();
            userForm.append("username", username);
            userForm.append("password", password);
            userForm.append("email", email);
            userForm.append("vai_tro", "ung_vien");

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

            const uvForm = new FormData();
            uvForm.append("ho_ten", hoTen);
            uvForm.append("ngay_sinh", ngaySinh.toISOString().split("T")[0]); // YYYY-MM-DD
            uvForm.append("gioi_tinh", gioiTinh);
            uvForm.append("trinh_do", trinhDo);
            uvForm.append("kinh_nghiem", kinhNghiem);

            if (cv) {
                uvForm.append("cv_file", {
                    uri: cv.uri,
                    name: "cv.jpg",
                    type: "image/jpeg"
                });
            }

            await axios.post(`${BASE_URL}/ungvien/`, uvForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            Alert.alert("Thành công", "Đăng ký ứng viên thành công");
            navigation.replace("Login");

        } catch (err) {
            console.log(err.response?.data);
            Alert.alert("Lỗi", "Không đăng ký được");
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 10 }}>Đăng ký Ứng viên</Text>

            <TextInput placeholder="Username" onChangeText={setUsername} style={styles.input} />
            <TextInput placeholder="Email" onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={styles.input} />

            <TextInput placeholder="Họ tên" onChangeText={setHoTen} style={styles.input} />

            {/* Ngày sinh */}
            <Text style={{ marginTop: 10 }}>Ngày sinh</Text>
            <Button
                title={ngaySinh.toDateString()}
                onPress={() => setShowDatePicker(true)}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={ngaySinh}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* GIỚI TÍNH */}
            <Text style={{ marginTop: 10 }}>Giới tính</Text>
            <View style={{ flexDirection: "row", marginVertical: 5 }}>
                <TouchableOpacity
                    onPress={() => setGioiTinh("nam")}
                    style={[styles.genderBtn, { backgroundColor: gioiTinh === "nam" ? "#4CAF50" : "#ccc" }]}
                >
                    <Text style={{ color: "#fff" }}>Nam</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setGioiTinh("nu")}
                    style={[styles.genderBtn, { backgroundColor: gioiTinh === "nu" ? "#4CAF50" : "#ccc" }]}
                >
                    <Text style={{ color: "#fff" }}>Nữ</Text>
                </TouchableOpacity>
            </View>

            <TextInput placeholder="Trình độ" onChangeText={setTrinhDo} style={styles.input} />
            <TextInput placeholder="Kinh nghiệm" onChangeText={setKinhNghiem} style={styles.input} />

            {/* Upload avatar & CV */}
            <Button title="Chọn avatar" onPress={pickAvatar} />
            {avatar && <Image source={{ uri: avatar.uri }} style={{ width: 80, height: 80, marginVertical: 5 }} />}

            <Button title="Chọn CV (ảnh)" onPress={pickCV} />
            {cv && <Image source={{ uri: cv.uri }} style={{ width: 80, height: 80, marginVertical: 5 }} />}

            <Button title="Đăng ký" onPress={register} style={{ marginTop: 10 }} />
        </ScrollView>
    );
}

const styles = {
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 8,
        marginVertical: 5
    },
    genderBtn: {
        flex: 1,
        padding: 10,
        marginRight: 5,
        alignItems: "center",
        borderRadius: 5
    }
};
