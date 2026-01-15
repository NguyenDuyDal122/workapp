import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import API, { endpoints } from "../../configs/API";

export default function DangKyDichVu() {
    const [goiDichVu, setGoiDichVu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGoi, setSelectedGoi] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [goiDaMua, setGoiDaMua] = useState([]);

    useEffect(() => {
        loadGoi();
        loadGoiDaMua();
    }, []);

    const daMua = (id) => goiDaMua.includes(id);

    const loadGoiDaMua = async () => {
        try {
            const res = await API.get(endpoints.goiDichVuDaMua);
            setGoiDaMua(res.data); // mảng id
        } catch (err) {
            console.log(err);
        }
    };

    const loadGoi = async () => {
        try {
            const res = await API.get(endpoints.goiDichVu);
            setGoiDichVu(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const thanhToanTienMat = async () => {
        if (!selectedGoi) {
            Alert.alert("Lỗi", "Vui lòng chọn gói dịch vụ");
            return;
        }

        if (goiDaMua.includes(selectedGoi.id)) {
            Alert.alert("Thông báo", "Bạn đã mua gói dịch vụ này rồi");
            return;
        }

        try {
            setSubmitting(true);

            await API.post(endpoints.giaoDich, {
                goi_dich_vu: selectedGoi.id,
                so_tien: selectedGoi.gia,
                phuong_thuc: "tien_mat",
                ma_giao_dich: `GD${Date.now()}`,
            });

            Alert.alert(
                "Thanh toán thành công ✅",
                "Gói dịch vụ đã được kích hoạt"
            );

            // 🔥 CẬP NHẬT DANH SÁCH ĐÃ MUA
            setGoiDaMua([...goiDaMua, selectedGoi.id]);
            setSelectedGoi(null);

        } catch (err) {
            const msg =
                err.response?.data?.detail || "Thanh toán thất bại";
            Alert.alert("Lỗi", msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng ký gói dịch vụ</Text>

            <FlatList
                data={goiDichVu}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isDaMua = daMua(item.id);

                    return (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                selectedGoi?.id === item.id && styles.selected,
                                isDaMua && styles.disabledCard,
                            ]}
                            disabled={isDaMua}
                            onPress={() => setSelectedGoi(item)}
                        >
                            <Text style={styles.name}>{item.ten_goi}</Text>
                            <Text>💼 Loại: {item.loai_goi}</Text>
                            <Text>⏳ Thời hạn: {item.thoi_han_ngay} ngày</Text>
                            <Text style={styles.price}>
                                💰 {item.gia.toLocaleString()} VNĐ
                            </Text>

                            {isDaMua && (
                                <Text style={styles.badge}>✔ Đã đăng ký</Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            {selectedGoi && (
                <View style={styles.totalBox}>
                    <Text style={styles.totalText}>
                        {selectedGoi
                            ? `Tổng tiền: ${selectedGoi.gia.toLocaleString()} VNĐ`
                            : "Vui lòng chọn gói dịch vụ"}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.payBtn,
                            !selectedGoi && { backgroundColor: "#aaa" },
                        ]}
                        onPress={thanhToanTienMat}
                        disabled={!selectedGoi || submitting}
                    >
                        <Text style={styles.payText}>
                            {submitting
                                ? "Đang thanh toán..."
                                : "Thanh toán & đăng ký gói"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    selected: {
        borderColor: "#27ae60",
        borderWidth: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
    },
    price: {
        marginTop: 6,
        fontWeight: "bold",
        color: "#e67e22",
    },
    totalBox: {
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginTop: 10,
    },
    totalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    payBtn: {
        backgroundColor: "#27ae60",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    payText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    disabledCard: {
    opacity: 0.5,
    backgroundColor: "#eee",
},
badge: {
    marginTop: 8,
    color: "#27ae60",
    fontWeight: "bold",
    textAlign: "right",
},
});
