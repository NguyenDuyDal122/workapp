// components/Admin/AdminHome.js
import { useState, useEffect } from "react";
import {
    View,
    Text,
    Button,
    FlatList,
    Alert,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import API, { endpoints } from "../../configs/API";

export default function AdminHome() {
    const [nhaTuyenDungList, setNhaTuyenDungList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNhaTuyenDung = async () => {
        setLoading(true);
        try {
            const res = await API.get(endpoints.nhaTuyenDung, {
                params: { trang_thai: "cho_duyet" }
            });
            setNhaTuyenDungList(res.data);
        } catch (err) {
            console.log(err.response?.data || err);
            Alert.alert("Lỗi", "Không lấy được danh sách nhà tuyển dụng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNhaTuyenDung();
    }, []);

    const handleDuyet = async (id, trang_thai) => {
        try {
            await API.patch(
                endpoints.duyetNhaTuyenDung(id),
                { trang_thai }
            );
            Alert.alert(
                "Thành công",
                `Đã ${trang_thai === "da_duyet" ? "duyệt" : "từ chối"} nhà tuyển dụng`
            );
            fetchNhaTuyenDung();
        } catch (err) {
            console.log(err.response?.data || err);
            Alert.alert("Lỗi", "Không thể thực hiện hành động");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 20, fontWeight: 'bold' }}>
                Quản lý nhà tuyển dụng
            </Text>

            <FlatList
                data={nhaTuyenDungList}
                keyExtractor={(item) => item.id.toString()}
                refreshing={refreshing}
                onRefresh={fetchNhaTuyenDung}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.ten_cong_ty}</Text>
                        <Text>Lĩnh vực: {item.linh_vuc}</Text>
                        <Text>Quy mô: {item.quy_mo}</Text>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Duyệt"
                                onPress={() => handleDuyet(item.id, "da_duyet")}
                                color="green"
                            />
                            <Button
                                title="Từ chối"
                                onPress={() => handleDuyet(item.id, "tu_choi")}
                                color="red"
                            />
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#fff'
    },
    name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    }
});
