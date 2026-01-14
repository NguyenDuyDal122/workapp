import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    Alert,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API, { endpoints } from "../../configs/API";

export default function QuanLyThongTin() {
    const [user, setUser] = useState(null);
    const [ntd, setNtd] = useState(null);
    const [loading, setLoading] = useState(true);

    const [tenCongTy, setTenCongTy] = useState("");
    const [linhVuc, setLinhVuc] = useState("");
    const [quyMo, setQuyMo] = useState("");
    const [moTa, setMoTa] = useState("");

    const [avatar, setAvatar] = useState(null);
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert("Thiếu quyền", "Cần cấp quyền truy cập ảnh");
                return;
            }

            loadData();
        })();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const u = await API.get(endpoints.currentUser);
            setUser(u.data);

            const res = await API.get(endpoints.nhaTuyenDung);
            const info = res.data.results
                ? res.data.results.find(i => i.user?.id === u.data.id)
                : res.data.find(i => i.user?.id === u.data.id);

            if (!info) {
                Alert.alert("Lỗi", "Không tìm thấy nhà tuyển dụng");
                return;
            }

            setNtd(info);
            setTenCongTy(info.ten_cong_ty || "");
            setLinhVuc(info.linh_vuc || "");
            setQuyMo(info.quy_mo || "");
            setMoTa(info.mo_ta || "");
        } catch (err) {
            console.log(err.response?.data || err.message);
            Alert.alert("Lỗi", "Không tải được dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (setFunc) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            });

            if (!result.canceled && result.assets?.length > 0) {
                setFunc(result.assets[0]);
            }
        } catch (err) {
            console.log("Pick image error:", err);
            Alert.alert("Lỗi", "Không chọn được ảnh");
        }
    };

    const updateInfo = async () => {
        try {
            setLoading(true);

            if (avatar) {
                const f = new FormData();
                f.append("avatar", {
                    uri: avatar.uri,
                    name: "avatar.jpg",
                    type: "image/jpeg"
                });

                await API.post(
                    "/nguoidung/upload_avatar/",
                    f,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            }

            const ntForm = new FormData();
            ntForm.append("ten_cong_ty", tenCongTy);
            ntForm.append("linh_vuc", linhVuc);
            ntForm.append("quy_mo", quyMo);
            ntForm.append("mo_ta", moTa);

            await API.patch(
                `/nhatuyendung/${ntd.id}/`,
                ntForm,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (logo) {
                const f = new FormData();
                f.append("logo", {
                    uri: logo.uri,
                    name: "logo.jpg",
                    type: "image/jpeg"
                });

                await API.post(
                    `/nhatuyendung/${ntd.id}/upload_logo/`,
                    f,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            }

            Alert.alert("Thành công", "Cập nhật thông tin thành công");
            setAvatar(null);
            setLogo(null);
            loadData();
        } catch (err) {
            console.log(err.response?.data || err.message);
            Alert.alert("Lỗi", "Không cập nhật được");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Quản lý thông tin doanh nghiệp</Text>

            {/* AVATAR */}
            <Text style={styles.label}>Avatar</Text>
            <Image
                source={{
                    uri: avatar?.uri || user?.avatar || "https://via.placeholder.com/80"
                }}
                style={styles.avatar}
            />
            <TouchableOpacity
                style={styles.btn}
                onPress={() => pickImage(setAvatar)}
            >
                <Text style={styles.btnText}>Đổi avatar</Text>
            </TouchableOpacity>

            {/* LOGO */}
            <Text style={styles.label}>Logo công ty</Text>
            <Image
                source={{
                    uri: logo?.uri || ntd?.logo || "https://via.placeholder.com/120"
                }}
                style={styles.logo}
            />
            <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#27ae60" }]}
                onPress={() => pickImage(setLogo)}
            >
                <Text style={styles.btnText}>Đổi logo</Text>
            </TouchableOpacity>

            {/* INFO */}
            <TextInput
                style={styles.input}
                value={tenCongTy}
                onChangeText={setTenCongTy}
                placeholder="Tên công ty"
            />
            <TextInput
                style={styles.input}
                value={linhVuc}
                onChangeText={setLinhVuc}
                placeholder="Lĩnh vực"
            />
            <TextInput
                style={styles.input}
                value={quyMo}
                onChangeText={setQuyMo}
                placeholder="Quy mô"
            />
            <TextInput
                style={[styles.input, { height: 100 }]}
                value={moTa}
                onChangeText={setMoTa}
                placeholder="Mô tả"
                multiline
            />

            <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#e67e22" }]}
                onPress={updateInfo}
            >
                <Text style={styles.btnText}>Lưu thay đổi</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        padding: 20
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20
    },
    label: {
        fontWeight: "bold",
        marginTop: 15
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginVertical: 10
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginVertical: 10
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginTop: 10
    },
    btn: {
        backgroundColor: "#3498db",
        padding: 12,
        borderRadius: 6,
        marginVertical: 10
    },
    btnText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold"
    }
});
