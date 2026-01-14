import { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, ActivityIndicator,
    Image, ScrollView, TextInput, Button, Alert
} from "react-native";
import API, { endpoints } from "../../configs/API";
import * as ImagePicker from "expo-image-picker";

export default function HoSoCaNhan() {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const [user, setUser] = useState(null);
    const [ungVien, setUngVien] = useState(null);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const u = await API.get(endpoints.currentUser);
            const uv = await API.get(endpoints.ungVien);

            setUser(u.data);
            setUngVien(uv.data[0]);
        } catch (err) {
            console.log("LOAD:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const changeAvatar = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7
        });

        if (res.canceled) return;

        const img = res.assets[0];
        const form = new FormData();
        form.append("avatar", {
            uri: img.uri,
            name: "avatar.jpg",
            type: "image/jpeg"
        });

        try {
            await API.post(
                "/nguoidung/upload_avatar/",
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            loadProfile();
        } catch (err) {
            console.log("AVATAR:", err.response?.data);
            Alert.alert("Lỗi", "Không upload được avatar");
        }
    };

    const uploadCV = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7
        });

        if (res.canceled) return;

        const img = res.assets[0];
        const form = new FormData();
        form.append("cv_file", {
            uri: img.uri,
            name: "cv.jpg",
            type: "image/jpeg"
        });

        try {
            await API.patch(
                `/ungvien/${ungVien.id}/`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            loadProfile();
        } catch (err) {
            console.log("CV:", err.response?.data);
            Alert.alert("Lỗi", "Upload CV thất bại");
        }
    };

    const saveProfile = async () => {
        try {
            const payload = {
                ho_ten: ungVien.ho_ten,
                dia_chi: ungVien.dia_chi,
                trinh_do: ungVien.trinh_do,
                kinh_nghiem: ungVien.kinh_nghiem
            };

            await API.patch(`/ungvien/${ungVien.id}/`, payload);
            Alert.alert("✅ Thành công", "Đã cập nhật hồ sơ");
            setEditing(false);
        } catch (err) {
            console.log("UPDATE:", err.response?.data);
            Alert.alert("❌ Lỗi", "Không cập nhật được");
        }
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <ScrollView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Image
                    source={{
                        uri: user.avatar || "https://via.placeholder.com/120"
                    }}
                    style={styles.avatar}
                />
                <Button title="📷 Đổi avatar" onPress={changeAvatar} />
            </View>

            {/* INFO */}
            <View style={styles.card}>
                <Field label="Họ tên">
                    <Input editable={editing}
                        value={ungVien.ho_ten}
                        onChangeText={v => setUngVien({ ...ungVien, ho_ten: v })}
                    />
                </Field>

                <Field label="Địa chỉ">
                    <Input editable={editing}
                        value={ungVien.dia_chi}
                        onChangeText={v => setUngVien({ ...ungVien, dia_chi: v })}
                    />
                </Field>

                <Field label="Trình độ">
                    <Input editable={editing}
                        value={ungVien.trinh_do}
                        onChangeText={v => setUngVien({ ...ungVien, trinh_do: v })}
                    />
                </Field>

                <Field label="Kinh nghiệm">
                    <Input editable={editing}
                        value={ungVien.kinh_nghiem}
                        onChangeText={v => setUngVien({ ...ungVien, kinh_nghiem: v })}
                    />
                </Field>
            </View>

            {/* CV */}
            <View style={styles.card}>
                <Text>📄 CV: {ungVien.cv_file ? "Đã có" : "Chưa có"}</Text>
                <Button title="Upload CV (ảnh)" onPress={uploadCV} />
            </View>

            {/* ACTION */}
            <View style={{ margin: 20 }}>
                {editing ? (
                    <Button title="💾 Lưu" onPress={saveProfile} />
                ) : (
                    <Button title="✏️ Chỉnh sửa" onPress={() => setEditing(true)} />
                )}
            </View>
        </ScrollView>
    );
}

const Field = ({ label, children }) => (
    <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold" }}>{label}</Text>
        {children}
    </View>
);

const Input = (props) => (
    <TextInput {...props} style={styles.input} />
);

const styles = StyleSheet.create({
    container: { backgroundColor: "#f5f6fa" },
    header: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#3498db"
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10
    },
    card: {
        backgroundColor: "#fff",
        margin: 15,
        padding: 15,
        borderRadius: 10
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 8,
        marginTop: 4
    }
});
