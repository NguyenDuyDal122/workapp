import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import API, { endpoints } from "../../configs/API";

const TRANG_THAI_MAP = {
    moi_nop: "Mới nộp",
    da_xem: "Đã xem",
    phu_hop: "Phù hợp",
    khong_phu_hop: "Không phù hợp",
    phong_van: "Mời phỏng vấn",
    trung_tuyen: "Trúng tuyển",
    tu_choi: "Từ chối"
};

const LichSuUngTuyen = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHoSo = async () => {
        try {
            const res = await API.get(endpoints.hoSoUngTuyen);
            setData(res.data);
        } catch (err) {
            console.log("Lỗi load hồ sơ:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadHoSo();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadHoSo();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>
                {item.tin_tuyen_dung?.tieu_de}
            </Text>

            <Text style={styles.company}>
                🏢 {item.tin_tuyen_dung?.nha_tuyen_dung?.ten_cong_ty}
            </Text>

            <Text style={styles.text}>
                📅 Ngày nộp: {new Date(item.ngay_nop).toLocaleDateString()}
            </Text>

            <Text style={styles.status}>
                📌 Trạng thái: {TRANG_THAI_MAP[item.trang_thai]}
            </Text>

            {item.danh_gia && (
                <Text style={styles.rating}>
                    ⭐ Đánh giá: {item.danh_gia}/5
                </Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0A84FF" />
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#666" }}>
                    Bạn chưa ứng tuyển công việc nào
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        />
    );
};

export default LichSuUngTuyen;

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
        marginBottom: 12,
        elevation: 2
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4
    },
    company: {
        fontSize: 14,
        color: "#444",
        marginBottom: 6
    },
    text: {
        fontSize: 13,
        color: "#555"
    },
    status: {
        marginTop: 6,
        fontWeight: "600",
        color: "#0A84FF"
    },
    rating: {
        marginTop: 4,
        color: "#FF9500"
    }
});
