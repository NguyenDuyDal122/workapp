import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Alert
} from "react-native";
import API, { endpoints } from "../../configs/API";
import { useNavigation } from "@react-navigation/native";
export default function HoSoUngTuyen() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState({}); // ⭐ lưu đánh giá theo hồ sơ
    const navigation = useNavigation();

    const loadHoSo = async () => {
        try {
            setLoading(true);
            const res = await API.get(endpoints.hoSoUngTuyen);
            setData(res.data.results || res.data);
        } catch (err) {
            Alert.alert("Lỗi", "Không tải được hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHoSo();
    }, []);

    const capNhatHoSo = async (id, trangThai) => {
        try {
            await API.patch(endpoints.danhGiaHoSo(id), {
                trang_thai: trangThai,
                danh_gia: rating[id] || null
            });

            Alert.alert("Thành công", "Đã cập nhật hồ sơ");
            loadHoSo();
        } catch (err) {
            Alert.alert("Lỗi", "Không cập nhật được hồ sơ");
        }
    };

    const renderStars = (id) => {
        const current = rating[id] || 0;

        return (
            <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() =>
                            setRating({ ...rating, [id]: star })
                        }
                    >
                        <Text
                            style={[
                                styles.star,
                                star <= current && styles.starActive
                            ]}
                        >
                            ★
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.job}>
                {item.tin_tuyen_dung?.tieu_de}
            </Text>

            <Text style={styles.company}>
                {item.tin_tuyen_dung?.nha_tuyen_dung?.ten_cong_ty}
            </Text>

            <Text>👤 {item.ung_vien?.ho_ten}</Text>
            <Text>
                📅 {new Date(item.ngay_nop).toLocaleDateString()}
            </Text>

            <Text style={styles.status}>
                Trạng thái: {item.trang_thai}
            </Text>

            {/* ⭐ ĐÁNH GIÁ */}
            <Text style={styles.ratingLabel}>Đánh giá hồ sơ:</Text>
            {renderStars(item.id)}

            <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#2980b9", width: "100%" }]}
                onPress={() =>
                    navigation.navigate("ChiTietUngVien", {
                        ungVien: item.ung_vien,
                    })
                }
            >
                <Text style={styles.btnText}>Xem hồ sơ ứng viên</Text>
            </TouchableOpacity>

            {/* ACTION */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#27ae60" }]}
                    onPress={() => capNhatHoSo(item.id, "phu_hop")}
                >
                    <Text style={styles.btnText}>Phù hợp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
                    onPress={() => capNhatHoSo(item.id, "khong_phu_hop")}
                >
                    <Text style={styles.btnText}>Không phù hợp</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3
    },
    job: {
        fontSize: 16,
        fontWeight: "bold"
    },
    company: {
        color: "#3498db",
        marginBottom: 5
    },
    status: {
        marginTop: 5,
        fontWeight: "bold",
        color: "#e67e22"
    },
    ratingLabel: {
        marginTop: 10,
        fontWeight: "bold"
    },
    starRow: {
        flexDirection: "row",
        marginVertical: 5
    },
    star: {
        fontSize: 26,
        color: "#ccc",
        marginRight: 4
    },
    starActive: {
        color: "#f1c40f"
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    actionBtn: {
        width: "48%",
        padding: 10,
        borderRadius: 6,
        alignItems: "center"
    },
    btnText: {
        color: "#fff",
        fontWeight: "bold"
    }
});
