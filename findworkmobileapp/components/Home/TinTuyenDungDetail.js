import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import API, { endpoints } from "../../configs/API";

export default function TinTuyenDungDetail({ route }) {
    const { id } = route.params;
    const [tin, setTin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await API.get(endpoints.tintuyendungDetail(id));
                setTin(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <ActivityIndicator size="large" color="#3498db" style={{ flex: 1, marginTop: 50 }} />;

    if (!tin) return <Text style={{ textAlign: "center", marginTop: 50 }}>Không tìm thấy tin tuyển dụng</Text>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                {tin.nha_tuyen_dung.logo && (
                    <Image source={{ uri: tin.nha_tuyen_dung.logo }} style={styles.logo} />
                )}
                <Text style={styles.title}>{tin.tieu_de}</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Ngành nghề:</Text>
                    <Text style={styles.value}>{tin.nganh_nghe?.ten || "Chưa có"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Địa điểm:</Text>
                    <Text style={styles.value}>{tin.dia_diem}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Lương:</Text>
                    <Text style={styles.value}>{tin.muc_luong_tu} - {tin.muc_luong_den} {tin.don_vi_luong}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Số lượng tuyển:</Text>
                    <Text style={styles.value}>{tin.so_luong_tuyen}</Text>
                </View>

                {/* Mô tả công việc */}
                <Text style={styles.heading}>Mô tả công việc</Text>
                <Text style={styles.content}>{tin.mo_ta_cong_viec}</Text>

                {/* Yêu cầu */}
                <Text style={styles.heading}>Yêu cầu</Text>
                <Text style={styles.content}>{tin.yeu_cau}</Text>

                {/* Chế độ đãi ngộ */}
                <Text style={styles.heading}>Chế độ đãi ngộ</Text>
                <Text style={styles.content}>{tin.dai_ngo}</Text>
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2c3e50",
        textAlign: "center",
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    label: {
        fontWeight: "bold",
        color: "#34495e",
        width: 120,
    },
    value: {
        flex: 1,
        color: "#2c3e50",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#2980b9",
        marginTop: 16,
        marginBottom: 6,
    },
    content: {
        fontSize: 14,
        color: "#2c3e50",
        lineHeight: 20,
    },
});
