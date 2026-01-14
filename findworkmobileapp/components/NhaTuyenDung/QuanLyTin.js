import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";
import API, { endpoints } from "../../configs/API";
import { useNavigation, useIsFocused } from "@react-navigation/native";

export default function QuanLyTin() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [loading, setLoading] = useState(true);
    const [dsTin, setDsTin] = useState([]);

    const loadTin = async () => {
        setLoading(true);
        try {
            const res = await API.get(endpoints.tintuyendung);
            setDsTin(res.data.results || res.data);
        } catch (err) {
            console.log(err.response?.data || err);
            Alert.alert("Lỗi", "Không tải được danh sách tin");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) loadTin();
    }, [isFocused]);

    const xoaTin = (id) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn đóng tin này?",
            [
                { text: "Huỷ" },
                {
                    text: "Đồng ý",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`${endpoints.tintuyendung}${id}/`);
                            Alert.alert("Thành công", "Đã đóng tin tuyển dụng");
                            loadTin();
                        } catch (err) {
                            console.log(err.response?.data || err);
                            Alert.alert("Lỗi", "Không thể xoá tin");
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

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.edit]}
                    onPress={() =>
                        navigation.navigate("SuaTin", { tin: item })
                    }
                >
                    <Text style={styles.btnText}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.delete]}
                    onPress={() => xoaTin(item.id)}
                >
                    <Text style={styles.btnText}>Xoá</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <FlatList
            data={dsTin}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
                <Text style={{ textAlign: "center", marginTop: 50 }}>
                    Bạn chưa đăng tin tuyển dụng nào
                </Text>
            }
        />
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
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
        gap: 10,
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
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
    },
});
