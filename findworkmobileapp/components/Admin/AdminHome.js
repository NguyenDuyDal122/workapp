import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import API, { endpoints } from "../../configs/API";

export default function AdminHome() {
    const navigation = useNavigation();
    const [tab, setTab] = useState("nhatuyendung");
    const [loading, setLoading] = useState(false);

    const [nhaTuyenDung, setNhaTuyenDung] = useState([]);
    const [thongKe, setThongKe] = useState(null);

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === "nhatuyendung") {
                const res = await API.get(endpoints.nhaTuyenDung, {
                    params: { trang_thai: "cho_duyet" },
                });
                setNhaTuyenDung(res.data);
            }

            if (tab === "thongke") {
                const [
                    uvRes,
                    ntdRes,
                    tinRes,
                    gdRes
                ] = await Promise.all([
                    API.get(endpoints.ungVien),
                    API.get(endpoints.nhaTuyenDung),
                    API.get(endpoints.tintuyendung),
                    API.get(endpoints.giaoDich),
                ]);

                const doanhThu = gdRes.data.reduce(
                    (sum, gd) => sum + (gd.so_tien || 0),
                    0
                );

                setThongKe({
                    so_ung_vien: uvRes.data.length,
                    so_nha_tuyen_dung: ntdRes.data.length,
                    so_tin: tinRes.data.length,
                    doanh_thu: doanhThu,
                });
            }
        } catch (err) {
            console.log(err.response?.data || err);
            Alert.alert("Lỗi", "Không tải được dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: () => {
                        navigation.replace("Login"); // 👈 quay về Login
                    },
                },
            ]
        );
    };

    const duyetNhaTuyenDung = async (id, trang_thai) => {
        try {
            await API.patch(endpoints.duyetNhaTuyenDung(id), { trang_thai });
            Alert.alert(
                "Thành công",
                trang_thai === "da_duyet" ? "Đã duyệt" : "Đã từ chối"
            );
            loadData();
        } catch {
            Alert.alert("Lỗi", "Không thể duyệt");
        }
    };

    const renderContent = () => {
        if (loading) return <ActivityIndicator size="large" />;

        // ===== NHÀ TUYỂN DỤNG =====
        if (tab === "nhatuyendung") {
            return (
                <FlatList
                    data={nhaTuyenDung}
                    keyExtractor={(i) => i.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.ten_cong_ty}</Text>
                            <Text>Lĩnh vực: {item.linh_vuc}</Text>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={styles.approve}
                                    onPress={() =>
                                        duyetNhaTuyenDung(item.id, "da_duyet")
                                    }
                                >
                                    <Text style={styles.btnText}>Duyệt</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.reject}
                                    onPress={() =>
                                        duyetNhaTuyenDung(item.id, "tu_choi")
                                    }
                                >
                                    <Text style={styles.btnText}>Từ chối</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            );
        }

        // ===== THỐNG KÊ =====
        if (tab === "thongke" && thongKe) {
            return (
                <View style={styles.card}>
                    <Text>👤 Ứng viên: {thongKe.so_ung_vien}</Text>
                    <Text>🏢 Nhà tuyển dụng: {thongKe.so_nha_tuyen_dung}</Text>
                    <Text>📄 Tin tuyển dụng: {thongKe.so_tin}</Text>
                    <Text>💰 Doanh thu: {thongKe.doanh_thu} VNĐ</Text>
                </View>
            );
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Xin chào, Admin</Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.logout}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            {/* ===== MENU ===== */}
            <View style={styles.menu}>
                <MenuItem
                    label="🏢 NTD"
                    onPress={() => setTab("nhatuyendung")}
                    active={tab === "nhatuyendung"}
                />
                <MenuItem
                    label="📊 Thống kê"
                    onPress={() => setTab("thongke")}
                    active={tab === "thongke"}
                />
            </View>

            <View style={{ flex: 1, padding: 15 }}>
                {renderContent()}
            </View>
        </View>
    );
}

const MenuItem = ({ label, onPress, active }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.menuItem, active && styles.menuActive]}
    >
        <Text style={{ color: active ? "#fff" : "#333" }}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    menu: {
        flexDirection: "row",
        backgroundColor: "#eee",
    },
    menuItem: {
        flex: 1,
        padding: 12,
        alignItems: "center",
    },
    menuActive: {
        backgroundColor: "#27ae60",
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    approve: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 6,
    },
    header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#27ae60",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    logout: {
        color: "#b92929",
        fontWeight: "bold",
    },
    reject: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 6,
    },
    btnText: { color: "#fff", fontWeight: "bold" },
});
