import { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from "react-native";
import API, { endpoints } from "../../configs/API";

export default function TinTuyenDungDetail({ route }) {
    const { id } = route.params;

    const [tin, setTin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tinRes, userRes] = await Promise.all([
                    API.get(endpoints.tintuyendungDetail(id)),
                    API.get(endpoints.currentUser),
                ]);
                setTin(tinRes.data);
                setUser(userRes.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const TRANG_THAI_TIN = {
        dang_tuyen: { text: "Đang tuyển", color: "#27ae60" },
        het_han: { text: "Hết hạn", color: "#e67e22" },
        dong: { text: "Đã đóng", color: "#e74c3c" },
    };

    const ungTuyen = async () => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn ứng tuyển công việc này?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Ứng tuyển",
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await API.post(endpoints.hoSoUngTuyen, {
                                tin_tuyen_dung_id: id,
                            });
                            Alert.alert("Thành công", "Ứng tuyển thành công!");
                        } catch (err) {
                            console.log(err.response?.data || err);
                            Alert.alert(
                                "Lỗi",
                                err.response?.data?.detail ||
                                    "Bạn đã ứng tuyển công việc này rồi"
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading)
        return (
            <ActivityIndicator
                size="large"
                color="#3498db"
                style={{ marginTop: 50 }}
            />
        );

    if (!tin)
        return (
            <Text style={{ textAlign: "center", marginTop: 50 }}>
                Không tìm thấy tin tuyển dụng
            </Text>
        );

    const isUngVien = user?.vai_tro === "ung_vien";


    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                {tin.nha_tuyen_dung?.logo && (
                    <Image
                        source={{ uri: tin.nha_tuyen_dung.logo }}
                        style={styles.logo}
                    />
                )}

                <Text style={styles.title}>{tin.tieu_de}</Text>

                <Text>🏢 {tin.nha_tuyen_dung?.ten_cong_ty}</Text>
                <Text>📍 {tin.dia_diem}</Text>
                <Text>
                    💰 {tin.muc_luong_tu} - {tin.muc_luong_den}{" "}
                    {tin.don_vi_luong}
                </Text>
                <Text>👥 Số lượng: {tin.so_luong_tuyen}</Text>

                <Text style={styles.heading}>Mô tả công việc</Text>
                <Text style={styles.content}>{tin.mo_ta_cong_viec}</Text>

                <Text style={styles.heading}>Yêu cầu</Text>
                <Text style={styles.content}>{tin.yeu_cau}</Text>

                <Text style={styles.heading}>Chế độ đãi ngộ</Text>
                <Text style={styles.content}>{tin.dai_ngo}</Text>

                <Text
                    style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: TRANG_THAI_TIN[tin.trang_thai]?.color,
                        marginBottom: 10,
                    }}
                >
                    {TRANG_THAI_TIN[tin.trang_thai]?.text}
                </Text>

                {/* ===== NÚT ỨNG TUYỂN – CHỈ ỨNG VIÊN ===== */}
                {isUngVien && tin.trang_thai === "dang_tuyen" && (
                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={ungTuyen}
                        disabled={submitting}
                    >
                        <Text style={styles.applyText}>
                            {submitting ? "Đang gửi..." : "Ứng tuyển ngay"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        elevation: 3,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    heading: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 16,
        marginBottom: 6,
        color: "#2980b9",
    },
    content: {
        fontSize: 14,
        lineHeight: 20,
    },
    applyBtn: {
        marginTop: 20,
        backgroundColor: "#27ae60",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    applyText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
