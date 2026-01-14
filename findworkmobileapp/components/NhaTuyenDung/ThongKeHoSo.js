import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Dimensions
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import API, { endpoints } from "../../configs/API";

const screenWidth = Dimensions.get("window").width;

export default function ThongKeHoSo() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const loadThongKe = async () => {
        try {
            setLoading(true);
            const res = await API.get(endpoints.thongKeHoSo);
            setData(res.data);
        } catch (err) {
            console.log(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadThongKe();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    const statusLabels = data.theo_trang_thai.map(
        i => mapTrangThai(i.trang_thai)
    );

    const statusValues = data.theo_trang_thai.map(
        i => i.total
    );

    return (
        <ScrollView style={styles.container}>
            {/* TỔNG */}
            <View style={styles.card}>
                <Text style={styles.title}>📊 Tổng quan</Text>
                <Text style={styles.bigNumber}>{data.tong_hoso}</Text>
                <Text>Tổng hồ sơ ứng tuyển</Text>
            </View>

            {/* BIỂU ĐỒ */}
            <View style={styles.card}>
                <Text style={styles.title}>📈 Biểu đồ trạng thái hồ sơ</Text>

                <BarChart
                    data={{
                        labels: statusLabels,
                        datasets: [{ data: statusValues }]
                    }}
                    width={screenWidth - 40}
                    height={260}
                    yAxisLabel=""
                    chartConfig={{
                        backgroundColor: "#fff",
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        decimalPlaces: 0,
                        color: () => "#3498db",
                        labelColor: () => "#333",
                        barPercentage: 0.6
                    }}
                    style={{
                        marginVertical: 10,
                        borderRadius: 10
                    }}
                />
            </View>

            {/* THEO TRẠNG THÁI (TEXT) */}
            <View style={styles.card}>
                <Text style={styles.title}>📌 Theo trạng thái</Text>

                {data.theo_trang_thai.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <Text>{mapTrangThai(item.trang_thai)}</Text>
                        <Text style={styles.bold}>{item.total}</Text>
                    </View>
                ))}
            </View>

            {/* THEO TIN */}
            <View style={styles.card}>
                <Text style={styles.title}>📝 Theo tin tuyển dụng</Text>

                {data.theo_tin.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={{ flex: 1 }}>
                            {item.tin_tuyen_dung__tieu_de}
                        </Text>
                        <Text style={styles.bold}>{item.total}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const mapTrangThai = (key) => {
    const map = {
        moi_nop: "Mới nộp",
        da_xem: "Đã xem",
        phu_hop: "Phù hợp",
        khong_phu_hop: "Không phù hợp",
        phong_van: "Phỏng vấn",
        trung_tuyen: "Trúng tuyển",
        tu_choi: "Từ chối"
    };
    return map[key] || key;
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: "#f5f6fa"
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
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10
    },
    bigNumber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#3498db"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 6
    },
    bold: {
        fontWeight: "bold"
    }
});
