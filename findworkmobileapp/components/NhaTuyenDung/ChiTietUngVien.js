import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
} from "react-native";

export default function ChiTietUngVien({ route }) {
    const { ungVien } = route.params;

    if (!ungVien) {
        return <Text>Không có dữ liệu ứng viên</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.name}>{ungVien.ho_ten}</Text>

                <Text>🎂 Ngày sinh: {ungVien.ngay_sinh}</Text>
                <Text>⚧ Giới tính: {ungVien.gioi_tinh}</Text>
                <Text>🎓 Trình độ: {ungVien.trinh_do}</Text>
                <Text>💼 Kinh nghiệm: {ungVien.kinh_nghiem}</Text>

                <Text style={styles.heading}>Kỹ năng</Text>
                <Text>{ungVien.ky_nang || "Chưa cập nhật"}</Text>

                <Text style={styles.heading}>Giới thiệu</Text>
                <Text>{ungVien.mo_ta_ban_than || "Chưa có"}</Text>

                {/* CV */}
                <Text style={styles.heading}>CV đính kèm</Text>

                {ungVien.cv_file ? (
                    <Image
                        source={{ uri: ungVien.cv_file }}
                        style={styles.cvImage}
                        resizeMode="contain"
                    />
                ) : (
                    <Text>Ứng viên chưa tải CV</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        padding: 15,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    heading: {
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 5,
        color: "#2980b9",
    },
    cvImage: {
        width: "100%",
        height: 500,
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: "#eee",
    },
});
