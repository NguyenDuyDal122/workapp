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

export default function HoSoUngTuyen() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHoSo = async () => {
        try {
            setLoading(true);
            const res = await API.get(endpoints.hoSoUngTuyen);
            setData(res.data.results || res.data);
        } catch (err) {
            console.log(err.response?.data || err.message);
            Alert.alert("Lỗi", "Không tải được hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHoSo();
    }, []);

    const doiTrangThai = async (id, trangThai) => {
        try {
            await API.patch(endpoints.danhGiaHoSo(id), {
                trang_thai: trangThai
            });

            Alert.alert("Thành công", "Đã cập nhật trạng thái");
            loadHoSo();
        } catch (err) {
            console.log(err.response?.data || err.message);
            Alert.alert("Lỗi", "Không cập nhật được trạng thái");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.job}>
                {item.tin_tuyen_dung?.tieu_de}
            </Text>

            <Text style={styles.company}>
                {item.tin_tuyen_dung?.nha_tuyen_dung?.ten_cong_ty}
            </Text>

            <View style={styles.row}>
                <Text style={styles.label}>Ứng viên:</Text>
                <Text>{item.ung_vien?.ho_ten}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Ngày nộp:</Text>
                <Text>
                    {new Date(item.ngay_nop).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Trạng thái:</Text>
                <Text style={styles.status}>
                    {item.trang_thai}
                </Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#3498db" }]}
                    onPress={() => doiTrangThai(item.id, "da_xem")}
                >
                    <Text style={styles.btnText}>Đã xem</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#f39c12" }]}
                    onPress={() => doiTrangThai(item.id, "phong_van")}
                >
                    <Text style={styles.btnText}>Mời PV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#2ecc71" }]}
                    onPress={() => doiTrangThai(item.id, "trung_tuyen")}
                >
                    <Text style={styles.btnText}>Trúng tuyển</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
                    onPress={() => doiTrangThai(item.id, "tu_choi")}
                >
                    <Text style={styles.btnText}>Từ chối</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.center}>
                <Text>Chưa có hồ sơ ứng tuyển</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3
    },
    job: {
        fontSize: 16,
        fontWeight: "bold"
    },
    company: {
        color: "#3498db",
        marginBottom: 8
    },
    row: {
        flexDirection: "row",
        marginTop: 5
    },
    label: {
        fontWeight: "bold",
        marginRight: 5
    },
    status: {
        color: "#e67e22",
        fontWeight: "bold"
    },
    actionRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 12
    },
    actionBtn: {
        width: "48%",
        padding: 8,
        borderRadius: 6,
        marginTop: 6,
        alignItems: "center"
    },
    btnText: {
        color: "#fff",
        fontWeight: "bold"
    }
});
