import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import API, { endpoints } from "../../configs/API";
import { useNavigation, useIsFocused } from "@react-navigation/native";

export default function QuanLyTin() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dsTin, setDsTin] = useState([]);

    const loadTin = async () => {
        try {
            const res = await API.get(endpoints.tintuyendung, {
                params: { mine: true }
            });
            setDsTin(res.data.results || res.data);
        } catch (err) {
            console.log(err.response?.data || err);
            Alert.alert("Lỗi", "Không tải được danh sách tin tuyển dụng");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            loadTin();
        }
    }, [isFocused]);

    const onRefresh = () => {
        setRefreshing(true);
        loadTin();
    };

    const xoaTin = (id) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn xóa tin tuyển dụng này?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Đồng ý",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`${endpoints.tintuyendung}${id}/`);
                            Alert.alert("Thành công", "Đã xóa tin tuyển dụng");
                            loadTin();
                        } catch (err) {
                            console.log(err.response?.data || err);
                            Alert.alert("Lỗi", "Không thể đóng tin");
                        }
                    },
                },
            ]
        );
    };

    const dongTin = (id) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn đóng tin tuyển dụng này?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Đồng ý",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.patch(
                                `${endpoints.tintuyendung}${id}/`,
                                { trang_thai: "dong" }
                            );
                            Alert.alert("Thành công", "Tin đã được đóng");
                            loadTin();
                        } catch (err) {
                            console.log(err.response?.data || err);
                            Alert.alert("Lỗi", "Không thể đóng tin");
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.tieu_de}</Text>

            <Text>📍 {item.dia_diem}</Text>
            <Text>
                💰 {item.muc_luong_tu} - {item.muc_luong_den} {item.don_vi_luong}
            </Text>
            <Text>👥 Số lượng: {item.so_luong_tuyen}</Text>
            <Text>⏳ Hạn nộp: {item.han_nop_ho_so}</Text>

            {item.trang_thai && (
                <Text style={styles.status}>
                    Trạng thái: {item.trang_thai}
                </Text>
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.view]}
                    onPress={() =>
                        navigation.navigate("TinTuyenDungDetail", { id: item.id })
                    }
                >
                    <Text style={styles.btnText}>Xem</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.edit]}
                    onPress={() =>
                        navigation.navigate("SuaTin", { tin: item })
                    }
                >
                    <Text style={styles.btnText}>Sửa</Text>
                </TouchableOpacity>

                {item.trang_thai !== "dong" && (
                    <TouchableOpacity
                        style={[styles.btn, styles.close]}
                        onPress={() => dongTin(item.id)}
                    >
                        <Text style={styles.btnText}>Đóng</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.btn, styles.delete]}
                    onPress={() => xoaTin(item.id)}
                >
                    <Text style={styles.btnText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#3498db"
                style={{ marginTop: 50 }}
            />
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Nút thêm tin */}
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate("DangTin")}
            >
                <Text style={styles.addText}>＋ Đăng tin mới</Text>
            </TouchableOpacity>

            <FlatList
                data={dsTin}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Bạn chưa đăng tin tuyển dụng nào
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
    },
    status: {
        marginTop: 6,
        fontStyle: "italic",
        color: "#555",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
        gap: 8,
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    view: {
        backgroundColor: "#2ecc71",
    },
    edit: {
        backgroundColor: "#3498db",
    },
    delete: {
        backgroundColor: "#e74c3c",
    },
    btnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
    },
    addBtn: {
        backgroundColor: "#0984e3",
        margin: 16,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    addText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        color: "#666",
    },
    close: {
        backgroundColor: "#f39c12",
    },
});
